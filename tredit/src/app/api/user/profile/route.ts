import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: "No session found" }, { status: 401 });
		}

		if (!session.user) {
			return NextResponse.json(
				{ error: "No user in session" },
				{ status: 401 }
			);
		}

		if (!session.user.email) {
			return NextResponse.json(
				{ error: "No email in user session" },
				{ status: 401 }
			);
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: {
				id: true,
				name: true,
				email: true,
				walletAddress: true,
				status: true,
				verificationStatus: true,
				createdAt: true,
				updatedAt: true,
				lastLogin: true,
				blockchainTxHash: true,
				ipfsUrl: true,
				ipfsMetadata: true,
				profileImage: true,
				gender: true,
				dob: true,
				phoneNumber: true,
				bio: true,
				preferences: true,
				metadata: true,
				unreadCount: true,
				lastNotificationAt: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(user);
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user profile" },
			{ status: 500 }
		);
	}
}

export async function PATCH(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const data = await request.json();

		// Update user profile
		const updatedUser = await prisma.user.update({
			where: { email: session.user.email },
			data: {
				name: data.name,
				gender: data.gender,
				dob: data.dob,
				phoneNumber: data.phoneNumber,
				bio: data.bio,
				preferences: data.preferences,
				metadata: data.metadata,
				profileImage: data.profileImage,
				ipfsUrl: data.ipfsUrl,
				ipfsMetadata: data.ipfsMetadata,
			},
		});

		return NextResponse.json(updatedUser);
	} catch (error) {
		console.error("Error updating user profile:", error);
		return NextResponse.json(
			{ error: "Failed to update user profile" },
			{ status: 500 }
		);
	}
}
