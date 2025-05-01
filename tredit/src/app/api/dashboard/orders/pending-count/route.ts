import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ count: 0 });
		}

		// Find all businesses where the user is a team member
		const memberships = await prisma.businessTeamMember.findMany({
			where: { userId: session.user.id },
			select: { businessId: true },
		});
		const businessIds = memberships.map((m) => m.businessId);
		if (businessIds.length === 0) {
			return NextResponse.json({ count: 0 });
		}

		// Get all orders for those businesses
		const orders = await prisma.order.findMany({
			where: {
				businessId: { in: businessIds },
			},
			select: {
				currentStatus: true,
				statusHistory: true,
			},
		});

		console.log("Total orders found:", orders.length);
		console.log("Sample order status:", orders[0]?.currentStatus);

		// Count orders with PENDING status
		const count = orders.filter(
			(order) => order.currentStatus === "PENDING"
		).length;

		return NextResponse.json({ count });
	} catch (error) {
		console.error("Failed to fetch pending orders count:", error);
		return NextResponse.json({ count: 0 });
	}
}
