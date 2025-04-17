import axios from "axios";

export class IPFSService {
	private pinataUrl: string;
	private pinataApiKey: string;
	private pinataApiSecret: string;

	constructor() {
		this.pinataUrl = process.env.PINATA_BASE_URL!;
		this.pinataApiKey = process.env.PINATA_API_KEY!;
		this.pinataApiSecret = process.env.PINATA_API_SECRET!;
	}

	async uploadUserData(data: any): Promise<string> {
		try {
			const response = await axios.post(
				`${this.pinataUrl}/pinning/pinJSONToIPFS`,
				{
					pinataContent: data,
					pinataMetadata: {
						name: `User_${data.walletAddress}`,
					},
				},
				{
					headers: {
						"Content-Type": "application/json",
						pinata_api_key: this.pinataApiKey,
						pinata_secret_api_key: this.pinataApiSecret,
					},
				}
			);

			return response.data.IpfsHash;
		} catch (error) {
			console.error("IPFS upload error:", error);
			throw new Error("Failed to upload data to IPFS");
		}
	}

	async getUserData(ipfsHash: string): Promise<any> {
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
