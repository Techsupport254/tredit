import { IPFSService } from "./ipfs.service";
import { BlockchainService } from "./blockchain.service";
import { DatabaseService } from "./database.service";

export class RegistrationService {
	private static instance: RegistrationService;
	private ipfsService: IPFSService;
	private blockchainService: BlockchainService;
	private databaseService: DatabaseService;

	private constructor() {
		this.ipfsService = IPFSService.getInstance();
		this.blockchainService = BlockchainService.getInstance();
		this.databaseService = DatabaseService.getInstance();
	}

	public static getInstance(): RegistrationService {
		if (!RegistrationService.instance) {
			RegistrationService.instance = new RegistrationService();
		}
		return RegistrationService.instance;
	}

	async registerUser(userData: {
		name: string;
		email: string;
		walletAddress: string;
		phoneNumber?: string;
		acceptBlockchainStorage: boolean;
	}) {
		try {
			// Check if user already exists
			const existingUser = await this.databaseService.getUserByWallet(
				userData.walletAddress
			);
			if (existingUser) {
				throw new Error("User with this wallet address already exists");
			}

			const existingEmail = await this.databaseService.getUserByEmail(
				userData.email
			);
			if (existingEmail) {
				throw new Error("User with this email already exists");
			}

			// Step 1: Upload user data to IPFS
			const ipfsData = {
				name: userData.name,
				email: userData.email,
				walletAddress: userData.walletAddress,
				phoneNumber: userData.phoneNumber,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			const ipfsHash = await this.ipfsService.uploadJSON(ipfsData);
			console.log("IPFS Upload successful. Hash:", ipfsHash);

			// Step 2: Create user profile on blockchain
			const blockchainTxHash = await this.blockchainService.createUserProfile(
				userData.walletAddress,
				ipfsHash
			);
			console.log("Blockchain transaction successful. Hash:", blockchainTxHash);

			// Step 3: Store user in database
			const dbUser = await this.databaseService.createUser({
				name: userData.name,
				email: userData.email,
				walletAddress: userData.walletAddress,
				phoneNumber: userData.phoneNumber,
				ipfsHash,
				blockchainTxHash,
			});
			console.log("Database storage successful. User:", dbUser);

			return {
				success: true,
				user: dbUser,
				ipfsHash,
				blockchainTxHash,
			};
		} catch (error) {
			console.error("Registration error:", error);
			throw error;
		}
	}

	// Add cleanup method
	async cleanup() {
		await this.databaseService.cleanup();
	}
}
