import axios from "axios";
import config from "@/config";

export class PinataService {
	private static instance: PinataService;
	private baseUrl: string;
	private jwt: string;

	private constructor() {
		this.baseUrl = config.ipfs.baseUrl;
		this.jwt = config.ipfs.jwt;
	}

	public static getInstance(): PinataService {
		if (!PinataService.instance) {
			PinataService.instance = new PinataService();
		}
		return PinataService.instance;
	}

	public async uploadImage(
		file: File,
		metadata: {
			name: string;
			productName: string;
			index: number;
		},
		onProgress?: (progress: number) => void
	): Promise<{
		hash: string;
		ipfsUrl: string;
		gatewayUrl: string;
	}> {
		try {
			const formData = new FormData();
			formData.append("file", file);

			formData.append(
				"pinataMetadata",
				JSON.stringify({
					name: `Product_${metadata.productName}_Image_${metadata.index + 1}`,
					keyvalues: {
						type: "product_image",
						productName: metadata.productName,
						timestamp: new Date().toISOString(),
					},
				})
			);

			const response = await axios.post(
				`${this.baseUrl}/pinning/pinFileToIPFS`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${this.jwt}`,
					},
					onUploadProgress: (progressEvent) => {
						if (onProgress) {
							const progress = Math.round(
								(progressEvent.loaded * 100) / (progressEvent.total || 100)
							);
							onProgress(progress);
						}
					},
				}
			);

			const ipfsHash = response.data.IpfsHash;
			const ipfsUrl = `ipfs://${ipfsHash}`;
			const gatewayUrl = `${config.ipfs.gatewayUrl}/${ipfsHash}`;

			return {
				hash: ipfsHash,
				ipfsUrl,
				gatewayUrl,
			};
		} catch (error: any) {
			console.error("Pinata upload error:", error);
			throw new Error(`Failed to upload image to Pinata: ${error.message}`);
		}
	}

	public async uploadImages(
		files: File[],
		productName: string,
		onProgress?: (data: {
			current: number;
			total: number;
			progress: number;
			message: string;
		}) => void
	): Promise<
		Array<{
			hash: string;
			ipfsUrl: string;
			gatewayUrl: string;
		}>
	> {
		const results = [];

		for (let i = 0; i < files.length; i++) {
			const file = files[i];

			if (onProgress) {
				onProgress({
					current: i + 1,
					total: files.length,
					progress: 0,
					message: `Uploading image ${i + 1}/${files.length}`,
				});
			}

			try {
				const result = await this.uploadImage(
					file,
					{
						name: file.name,
						productName,
						index: i,
					},
					(progress) => {
						if (onProgress) {
							onProgress({
								current: i + 1,
								total: files.length,
								progress,
								message: `Uploading image ${i + 1}/${files.length}`,
							});
						}
					}
				);

				results.push(result);

				if (onProgress) {
					onProgress({
						current: i + 1,
						total: files.length,
						progress: 100,
						message: `Image ${i + 1} uploaded successfully`,
					});
				}
			} catch (error: any) {
				console.error(`Failed to upload image ${i + 1}:`, error);
				throw error;
			}
		}

		return results;
	}
}
