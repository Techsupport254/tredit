import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const connections = await prisma.socialMediaConnection.findMany({
			where: {
				businessId: params.id,
			},
			select: {
				id: true,
				platform: true,
				connected: true,
				channelId: true,
				accessToken: true,
				refreshToken: true,
				expiresAt: true,
			},
		});

		console.log("Fetched social media connections:", connections);
		return NextResponse.json(connections);
	} catch (error) {
		console.error("Error fetching social media connections:", error);
		return NextResponse.json(
			{ error: "Failed to fetch social media connections" },
			{ status: 500 }
		);
	}
}
