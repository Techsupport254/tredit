import { User } from "../models/User";
import { BlockchainService } from "../services/BlockchainService";
import { IPFSService } from "../services/IPFSService";
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthController {
	private static blockchainService = new BlockchainService();
	private static ipfsService = new IPFSService();

	static async register(req: NextRequest) {
		try {
			const { name, email, password, walletAddress } = await req.json();

			// Check if user exists
			const existingUser = await User.findByEmail(email);
			if (existingUser) {
				return NextResponse.json(
					{ error: "User already exists" },
					{ status: 400 }
				);
			}

			// Create user in database
			const user = await User.create({
				name,
				email,
				password,
				walletAddress,
			});

			try {
				// Store user data in IPFS
				const ipfsHash = await this.ipfsService.uploadUserData({
					name: user.name,
					email: user.email,
					walletAddress: user.walletAddress,
				});

				// Store user profile on blockchain
				const txHash = await this.blockchainService.createUserProfile(
					user.walletAddress,
					ipfsHash
				);

				// Update user with blockchain and IPFS data
				await User.updateProfile(user.id, {
					blockchainTxHash: txHash,
					ipfsUrl: ipfsHash,
				});
			} catch (error) {
				console.error("Blockchain/IPFS error:", error);
				// Continue with registration even if blockchain/IPFS fails
			}

			return NextResponse.json(
				{ message: "Registration successful" },
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

	static async login(req: NextRequest) {
		try {
			const { email, password } = await req.json();

			const user = await User.findByEmail(email);
			if (!user) {
				return NextResponse.json(
					{ error: "Invalid credentials" },
					{ status: 401 }
				);
			}

			const isValidPassword = await compare(password, user.password);
			if (!isValidPassword) {
				return NextResponse.json(
					{ error: "Invalid credentials" },
					{ status: 401 }
				);
			}

			const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
				expiresIn: "1d",
			});

			return NextResponse.json({ token }, { status: 200 });
		} catch (error) {
			console.error("Login error:", error);
			return NextResponse.json(
				{
					error: "Login failed",
					details: error instanceof Error ? error.message : String(error),
				},
				{ status: 500 }
			);
		}
	}
}
