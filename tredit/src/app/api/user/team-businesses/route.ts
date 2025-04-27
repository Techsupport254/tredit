import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
	console.log("[/api/user/team-businesses] Received GET request");
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		console.error(
			"[/api/user/team-businesses] Unauthorized: No session found or user ID missing."
		);
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;
	console.log(
		`[/api/user/team-businesses] Session found for user ID: ${userId}`
	);

	try {
		console.log(
			`[/api/user/team-businesses] Querying businesses for userId: ${userId}`
		);
		const businesses = await prisma.business.findMany({
			where: {
				teamMembers: {
					some: {
						userId: userId,
					},
				},
			},
			select: {
				id: true,
				name: true,
			},
		});
		console.log(
			`[/api/user/team-businesses] Found ${businesses.length} businesses:`,
			businesses
		);
		return NextResponse.json(businesses);
	} catch (error) {
		console.error(
			"[/api/user/team-businesses] Failed to fetch businesses:",
			error
		);
		return NextResponse.json(
			{ error: "Failed to fetch businesses" },
			{ status: 500 }
		);
	}
}
