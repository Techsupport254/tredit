import { PrismaClient, User as PrismaUser } from "@prisma/client";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma";

export class User {
	static async create(data: {
		name: string;
		email: string;
		password: string;
		walletAddress: string;
	}): Promise<PrismaUser> {
		try {
			const hashedPassword = await hash(data.password, 10);

			return await prisma.user.create({
				data: {
					name: data.name,
					email: data.email,
					walletAddress: data.walletAddress,
					password: hashedPassword,
					status: "ACTIVE",
					verificationStatus: "PENDING",
					acceptBlockchainStorage: true,
					role: "USER",
				},
			});
		} catch (error) {
			console.error("Error creating user:", error);
			throw error;
		}
	}

	static async findByEmail(email: string): Promise<PrismaUser | null> {
		try {
			if (!email) {
				throw new Error("Email is required");
			}
			return await prisma.user.findUnique({
				where: { email },
			});
		} catch (error) {
			console.error("Error finding user by email:", error);
			throw error;
		}
	}

	static async findByWalletAddress(
		walletAddress: string
	): Promise<PrismaUser | null> {
		try {
			if (!walletAddress) {
				throw new Error("Wallet address is required");
			}
			return await prisma.user.findUnique({
				where: { walletAddress },
			});
		} catch (error) {
			console.error("Error finding user by wallet address:", error);
			throw error;
		}
	}

	static async updateProfile(
		userId: string,
		data: Partial<PrismaUser>
	): Promise<PrismaUser> {
		try {
			if (!userId) {
				throw new Error("User ID is required");
			}
			return await prisma.user.update({
				where: { id: userId },
				data,
			});
		} catch (error) {
			console.error("Error updating user profile:", error);
			throw error;
		}
	}
}

// Export these functions for backward compatibility
export async function findByEmail(email: string): Promise<PrismaUser | null> {
	return User.findByEmail(email);
}

export async function findByWalletAddress(
	walletAddress: string
): Promise<PrismaUser | null> {
	return User.findByWalletAddress(walletAddress);
}

export async function createUser(data: {
	email: string;
	password: string;
	name: string;
	walletAddress: string;
}): Promise<PrismaUser> {
	return User.create(data);
}
