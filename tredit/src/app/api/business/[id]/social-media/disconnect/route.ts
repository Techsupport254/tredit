import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { platform } = body;

		if (!platform) {
			return NextResponse.json(
				{ error: "Platform is required" },
				{ status: 400 }
			);
		}

		const connection = await prisma.socialMediaConnection.findFirst({
			where: {
				businessId: params.id,
				platform: platform.toUpperCase(),
			},
		});

		if (!connection) {
			return NextResponse.json(
				{ error: "Social media connection not found" },
				{ status: 404 }
			);
		}

		await prisma.socialMediaConnection.update({
			where: {
				id: connection.id,
			},
			data: {
				accessToken: null,
				refreshToken: null,
				expiresAt: null,
				channelId: null,
				connected: false,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error disconnecting social media:", error);
		return NextResponse.json(
			{ error: "Failed to disconnect social media" },
			{ status: 500 }
		);
	}
}
