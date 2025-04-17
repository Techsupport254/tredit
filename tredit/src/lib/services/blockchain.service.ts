import { ethers } from "ethers";
import config from "@/config";

export class BlockchainService {
	private static instance: BlockchainService;
	private provider: ethers.JsonRpcProvider;
	private userProfileContract: ethers.Contract;

	private constructor() {
		this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);

		// Initialize user profile contract
		this.userProfileContract = new ethers.Contract(
			config.blockchain.userProfileContract,
			config.blockchain.userProfileAbi,
			this.provider
		);
	}

	public static getInstance(): BlockchainService {
		if (!BlockchainService.instance) {
			BlockchainService.instance = new BlockchainService();
		}
		return BlockchainService.instance;
	}

	async createUserProfile(
		walletAddress: string,
		ipfsHash: string
	): Promise<string> {
		try {
			// Create a wallet instance
			const wallet = new ethers.Wallet(
				config.blockchain.privateKey,
				this.provider
			);

			// Connect the contract with the wallet
			const contractWithSigner = this.userProfileContract.connect(wallet);

			// Create the user profile
			const tx = await contractWithSigner.createOrUpdateProfile(ipfsHash);

			// Wait for the transaction to be mined
			const receipt = await tx.wait();

			// Get the transaction hash
			return receipt.hash;
		} catch (error) {
			console.error("Blockchain error:", error);
			throw new Error("Failed to create user profile on blockchain");
		}
	}

	async getUserProfile(walletAddress: string): Promise<any> {
		try {
			const profile = await this.userProfileContract.getProfile(walletAddress);
			return profile;
		} catch (error) {
			console.error("Blockchain error:", error);
			throw new Error("Failed to fetch user profile from blockchain");
		}
	}
}
