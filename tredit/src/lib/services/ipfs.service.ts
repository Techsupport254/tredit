import axios from "axios";
import config from "@/config";

export class IPFSService {
	private static instance: IPFSService;
	private baseURL: string;
	private headers: Record<string, string>;

	private constructor() {
		this.baseURL = config.ipfs.baseUrl;
		this.headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${config.ipfs.jwt}`,
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
			const response = await axios.post(
				`${this.baseURL}/pinning/pinJSONToIPFS`,
				data,
				{ headers: this.headers }
			);

			if (response.status !== 200) {
				throw new Error("Failed to upload to IPFS");
			}

			return response.data.IpfsHash;
		} catch (error) {
			console.error("IPFS upload error:", error);
			throw new Error("Failed to upload to IPFS");
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
}
