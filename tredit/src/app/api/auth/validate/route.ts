import { NextResponse } from "next/server";
import { findByEmail, findByWalletAddress } from "@/lib/models/User";

export async function POST(request: Request) {
	try {
		const { email, walletAddress } = await request.json();

		// Check if email exists
		const existingUserByEmail = await findByEmail(email);
		if (existingUserByEmail) {
			return NextResponse.json(
				{ error: "Email already registered" },
				{ status: 409 }
			);
		}

		// Check if wallet address exists
		const existingUserByWallet = await findByWalletAddress(walletAddress);
		if (existingUserByWallet) {
			return NextResponse.json(
				{ error: "Wallet address already registered" },
				{ status: 409 }
			);
		}

		// If no existing user found, return success
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Validation error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
