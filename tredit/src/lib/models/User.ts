import { PrismaClient, User as PrismaUser } from "@prisma/client";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";

const prismaClient = new PrismaClient();

export class User {
	static async create(data: {
		name: string;
		email: string;
		password: string;
		walletAddress: string;
	}): Promise<PrismaUser> {
		const hashedPassword = await hash(data.password, 10);

		return prismaClient.user.create({
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
	}

	static async findByEmail(email: string): Promise<PrismaUser | null> {
		return prisma.user.findUnique({
			where: { email },
		});
	}

	static async findByWalletAddress(
		walletAddress: string
	): Promise<PrismaUser | null> {
		return prisma.user.findUnique({
			where: { walletAddress },
		});
	}

	static async updateProfile(
		userId: string,
		data: Partial<PrismaUser>
	): Promise<PrismaUser> {
		return prismaClient.user.update({
			where: { id: userId },
			data,
		});
	}
}

export async function findByEmail(email: string) {
	return prisma.user.findUnique({
		where: {
			email,
		},
	});
}

export async function findByWalletAddress(walletAddress: string) {
	return prisma.user.findUnique({
		where: {
			walletAddress,
		},
	});
}

export async function createUser(data: {
	email: string;
	password: string;
	name: string;
	walletAddress: string;
}) {
	return prisma.user.create({
		data,
	});
}
