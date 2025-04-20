import axios from "axios";
import FormData from "form-data";

export class IPFSService {
	private pinataUrl: string;
	private pinataJwt: string;

	constructor() {
		this.pinataUrl = process.env.PINATA_BASE_URL!;
		this.pinataJwt = process.env.PINATA_JWT!;
	}

	async uploadUserData(data: any): Promise<string> {
		try {
			const response = await axios.post(
				`${this.pinataUrl}/pinning/pinJSONToIPFS`,
				{
					pinataContent: data,
					pinataMetadata: {
						name: `User_${data.name || data.walletAddress}`,
						keyvalues: {
							type: "user_data",
							timestamp: new Date().toISOString(),
						},
					},
				},
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${this.pinataJwt}`,
					},
				}
			);

			return response.data.IpfsHash;
		} catch (error) {
			console.error("IPFS upload error:", error);
			throw new Error("Failed to upload data to IPFS");
		}
	}

	async uploadFiles(
		files: { name: string; file: Blob }[],
		metadata?: any
	): Promise<string> {
		try {
			const formData = new FormData();

			// Add files
			for (const { name, file } of files) {
				const buffer = Buffer.from(await file.arrayBuffer());
				formData.append("file", buffer, {
					filename: name,
					contentType: file.type,
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
				`${this.pinataUrl}/pinning/pinFileToIPFS`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${this.pinataJwt}`,
						...formData.getHeaders(),
					},
					maxContentLength: Infinity,
				}
			);

			return response.data.IpfsHash;
		} catch (error) {
			console.error("IPFS file upload error:", error);
			throw new Error("Failed to upload files to IPFS");
		}
	}

	async getData(ipfsHash: string): Promise<any> {
		try {
			const response = await axios.get(
				`${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsHash}`
			);
			return response.data;
		} catch (error) {
			console.error("IPFS fetch error:", error);
			throw new Error("Failed to fetch data from IPFS");
		}
	}
}
