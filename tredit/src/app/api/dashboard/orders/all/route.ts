import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ orders: [] });
		}

		// Find all businesses where the user is a team member
		const memberships = await prisma.businessTeamMember.findMany({
			where: { userId: session.user.id },
			select: { businessId: true },
		});
		const businessIds = memberships.map((m) => m.businessId);
		if (businessIds.length === 0) {
			return NextResponse.json({ orders: [] });
		}

		// Get all orders for those businesses, include business relation
		const orders = await prisma.order.findMany({
			where: {
				businessId: { in: businessIds },
			},
			include: {
				business: { select: { name: true } },
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json({ orders });
	} catch (error) {
		console.error("Failed to fetch dashboard orders:", error);
		return NextResponse.json({ orders: [] });
	}
}
