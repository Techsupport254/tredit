import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const { email, code } = await req.json();

		if (!email || !code) {
			return NextResponse.json(
				{ error: "Email and verification code are required" },
				{ status: 400 }
			);
		}

		// Find the verification code
		const verificationCode = await prisma.verificationCode.findFirst({
			where: {
				email,
				code,
				used: false,
				expiresAt: {
					gt: new Date(), // Not expired
				},
			},
		});

		if (!verificationCode) {
			return NextResponse.json(
				{ error: "Invalid or expired verification code" },
				{ status: 400 }
			);
		}

		// Mark the code as used
		await prisma.verificationCode.update({
			where: { id: verificationCode.id },
			data: { used: true },
		});

		// Update user's verification status
		await prisma.user.update({
			where: { email },
			data: { verificationStatus: "VERIFIED" },
		});

		return NextResponse.json({
			message: "Email verified successfully",
		});
	} catch (error) {
		console.error("Verification error:", error);
		return NextResponse.json(
			{ error: "Failed to verify email" },
			{ status: 500 }
		);
	}
}
