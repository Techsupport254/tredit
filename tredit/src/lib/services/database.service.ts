import { PrismaClient } from "@prisma/client";

export class DatabaseService {
	private static instance: DatabaseService;
	private prisma: PrismaClient;

	private constructor() {
		this.prisma = new PrismaClient();
	}

	public static getInstance(): DatabaseService {
		if (!DatabaseService.instance) {
			DatabaseService.instance = new DatabaseService();
		}
		return DatabaseService.instance;
	}

	async createUser(userData: {
		name: string;
		email: string;
		walletAddress: string;
		ipfsHash: string;
		blockchainTxHash: string;
		phoneNumber?: string;
	}) {
		try {
			const user = await this.prisma.user.create({
				data: {
					name: userData.name,
					email: userData.email,
					walletAddress: userData.walletAddress,
					ipfsUrl: userData.ipfsHash,
					blockchainTxHash: userData.blockchainTxHash,
					phoneNumber: userData.phoneNumber,
					status: "ACTIVE",
					verificationStatus: "PENDING",
					role: "USER",
				},
			});

			return user;
		} catch (error) {
			console.error("Database error:", error);
			throw new Error("Failed to create user in database");
		}
	}

	async getUserByWallet(walletAddress: string) {
		try {
			const user = await this.prisma.user.findUnique({
				where: {
					walletAddress: walletAddress,
				},
			});

			return user;
		} catch (error) {
			console.error("Database error:", error);
			throw new Error("Failed to fetch user from database");
		}
	}

	async getUserByEmail(email: string) {
		try {
			const user = await this.prisma.user.findUnique({
				where: {
					email: email,
				},
			});

			return user;
		} catch (error) {
			console.error("Database error:", error);
			throw new Error("Failed to fetch user from database");
		}
	}

	// Add a cleanup method to close the Prisma client
	async cleanup() {
		await this.prisma.$disconnect();
	}
}
