import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BlockchainService } from "@/lib/services/blockchain.service";
import { IPFSService } from "@/lib/services/ipfs.service";
import { hash } from "bcrypt";

const blockchainService = BlockchainService.getInstance();
const ipfsService = IPFSService.getInstance();

export async function POST(req: Request) {
	try {
		const { name, email, password, walletAddress } = await req.json();

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: "User already exists" },
				{ status: 400 }
			);
		}

		// Hash password
		const hashedPassword = await hash(password, 10);

		// Create user in database
		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				walletAddress,
				status: "ACTIVE",
				verificationStatus: "PENDING",
				acceptBlockchainStorage: true,
				role: "USER",
			},
		});

		try {
			// Store user data in IPFS
			const ipfsHash = await ipfsService.uploadUserData({
				name: user.name,
				email: user.email,
				walletAddress: user.walletAddress,
			});

			// Store user profile on blockchain
			const txHash = await blockchainService.createUserProfile(
				user.walletAddress,
				ipfsHash
			);

			// Update user with blockchain and IPFS data
			await prisma.user.update({
				where: { id: user.id },
				data: {
					blockchainTxHash: txHash,
					ipfsUrl: ipfsHash,
				},
			});
		} catch (error) {
			console.error("Blockchain/IPFS error:", error);
			// Continue with registration even if blockchain/IPFS fails
		}

		const { password: _, ...userWithoutPassword } = user;
		return NextResponse.json(
			{
				message: "Registration successful",
				user: userWithoutPassword,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Registration error:", error);
		return NextResponse.json(
			{
				error: "Registration failed",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
