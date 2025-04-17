import { ethers } from "ethers";
import config from "@/config";

export class BlockchainService {
	private provider: ethers.JsonRpcProvider;
	private userProfileContract: ethers.Contract;

	constructor() {
		this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);

		const wallet = new ethers.Wallet(
			config.blockchain.privateKey,
			this.provider
		);

		this.userProfileContract = new ethers.Contract(
			config.blockchain.userProfileContract,
			config.blockchain.userProfileAbi,
			wallet
		);
	}

	async createUserProfile(
		walletAddress: string,
		ipfsHash: string
	): Promise<string> {
		try {
			const tx = await this.userProfileContract.createOrUpdateProfile(ipfsHash);
			const receipt = await tx.wait();
			return receipt.hash;
		} catch (error) {
			console.error("Blockchain error:", error);
			throw new Error("Failed to create user profile on blockchain");
		}
	}

	async getUserProfile(walletAddress: string) {
		try {
			return await this.userProfileContract.getProfile(walletAddress);
		} catch (error) {
			console.error("Blockchain error:", error);
			throw new Error("Failed to fetch user profile from blockchain");
		}
	}
}
