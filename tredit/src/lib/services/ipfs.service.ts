import axios from "axios";
import config from "@/config";
import FormData from "form-data";

export class IPFSService {
	private static instance: IPFSService;
	private baseURL: string;
	private headers: Record<string, string>;

	private constructor() {
		this.baseURL = config.ipfs.baseUrl;
		this.headers = {
			"Content-Type": "application/json",
			pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY || "",
			pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET || "",
		};
	}

	public static getInstance(): IPFSService {
		if (!IPFSService.instance) {
			IPFSService.instance = new IPFSService();
		}
		return IPFSService.instance;
	}

	async uploadJSON(data: any): Promise<string> {
		try {
			console.log("Uploading JSON to IPFS with headers:", this.headers);
			const response = await axios.post(
				`${this.baseURL}/pinning/pinJSONToIPFS`,
				{
					pinataMetadata: {
						name: data.name || "Product_Data",
						keyvalues: {
							type: "product_data",
							timestamp: new Date().toISOString(),
							businessId: data.businessId,
						},
					},
					pinataContent: data,
				},
				{
					headers: {
						...this.headers,
						"Content-Type": "application/json",
					},
				}
			);

			if (response.status !== 200) {
				console.error("IPFS upload failed with status:", response.status);
				throw new Error("Failed to upload to IPFS");
			}

			return response.data.IpfsHash;
		} catch (error) {
			console.error("IPFS upload error:", error);
			if (axios.isAxiosError(error)) {
				console.error("Response data:", error.response?.data);
				console.error("Response status:", error.response?.status);
			}
			throw new Error("Failed to upload to IPFS");
		}
	}

	async uploadFiles(
		files: { name: string; file: Blob }[],
		metadata?: {
			name?: string;
			type?: string;
			keyvalues?: Record<string, any>;
		}
	): Promise<string> {
		try {
			const formData = new FormData();

			// Add files
			for (const { name, file } of files) {
				const buffer = Buffer.from(await file.arrayBuffer());
				formData.append("file", buffer, {
					filename: name,
					contentType: file.type || "application/octet-stream",
				});
			}

			// Add metadata
			formData.append(
				"pinataMetadata",
				JSON.stringify({
					name: metadata?.name || "File_Upload",
					keyvalues: {
						type: metadata?.type || "file_upload",
						timestamp: new Date().toISOString(),
						...metadata?.keyvalues,
					},
				})
			);

			const response = await axios.post(
				`${this.baseURL}/pinning/pinFileToIPFS`,
				formData,
				{
					headers: {
						...this.headers,
						...formData.getHeaders(),
					},
					maxContentLength: Infinity,
				}
			);

			if (response.status !== 200) {
				throw new Error("Failed to upload files to IPFS");
			}

			return response.data.IpfsHash;
		} catch (error) {
			console.error("IPFS file upload error:", error);
			throw new Error("Failed to upload files to IPFS");
		}
	}

	async getJSON(hash: string): Promise<any> {
		try {
			const response = await axios.get(
				`${config.ipfs.gatewayUrl}/ipfs/${hash}`,
				{ headers: this.headers }
			);

			if (response.status !== 200) {
				throw new Error("Failed to fetch from IPFS");
			}

			return response.data;
		} catch (error) {
			console.error("IPFS fetch error:", error);
			throw new Error("Failed to fetch from IPFS");
		}
	}

	public async uploadToIPFS(data: any): Promise<string> {
		try {
			// Prepare the data structure for IPFS matching Prisma schema
			const ipfsData = {
				// Main product data
				name: data.name,
				description: data.description,
				price: data.variants?.[0]?.price || 0,
				stock:
					data.variants?.reduce(
						(total: number, variant: any) => total + (variant.stock || 0),
						0
					) || 0,
				status: data.status || "ACTIVE",
				businessId: data.businessId,

				// Variants
				variants: (data.variants || []).map((variant: any) => ({
					name: variant.name,
					value: variant.value,
					price: variant.price,
					stock: variant.stock,
				})),

				// SEO data
				seo: {
					title: data.seo?.title,
					description: data.seo?.description,
					keywords: data.seo?.keywords || [],
				},

				// Media
				media: (data.images || []).map((image: any, index: number) => ({
					type: "image",
					url: image.ipfsUrl,
					order: index,
				})),

				// YouTube data
				youtubeData: data.youtubeData
					? {
							videoId: data.youtubeData.videoId,
							videoUrl: data.youtubeData.videoUrl,
							title: data.youtubeTitle,
							description: data.youtubeDescription,
							tags:
								data.youtubeTags?.split(",").map((tag: string) => tag.trim()) ||
								[],
							category: data.youtubeCategory,
							visibility: data.youtubeVisibility,
							publishAt: data.youtubePublishAt,
					  }
					: null,

				// Metadata for IPFS
				metadata: {
					name: data.name,
					description: data.description,
					image: data.images?.[0]?.ipfsUrl || null,
					attributes: [
						{
							trait_type: "Status",
							value: data.status,
						},
						{
							trait_type: "Business ID",
							value: data.businessId,
						},
						{
							trait_type: "YouTube Video",
							value: data.youtubeData?.videoUrl || "Not available",
						},
					],
				},
				timestamp: new Date().toISOString(),
			};

			// Upload to IPFS using existing uploadJSON method
			const ipfsHash = await this.uploadJSON(ipfsData);
			console.log("Uploaded to IPFS:", {
				hash: ipfsHash,
				gatewayUrl: `${config.ipfs.gatewayUrl}/ipfs/${ipfsHash}`,
				data: ipfsData,
			});

			return ipfsHash;
		} catch (error) {
			console.error("Error uploading to IPFS:", error);
			throw error;
		}
	}
}
