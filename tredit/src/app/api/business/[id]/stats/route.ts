import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const businessId = params.id;

		// Get business membership
		const membership = await prisma.businessMember.findFirst({
			where: {
				businessId,
				userId: session.user.id,
			},
		});

		if (!membership) {
			return NextResponse.json(
				{ error: "Not a member of this business" },
				{ status: 403 }
			);
		}

		// Get business stats
		const [revenue, orders, members] = await Promise.all([
			// Get total revenue
			prisma.order.aggregate({
				where: {
					businessId,
					status: "COMPLETED",
				},
				_sum: {
					amount: true,
				},
			}),
			// Get total orders
			prisma.order.count({
				where: {
					businessId,
				},
			}),
			// Get total members
			prisma.businessMember.count({
				where: {
					businessId,
				},
			}),
		]);

		// Get revenue data for the last 6 months
		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

		const revenueData = await prisma.order.groupBy({
			by: ["createdAt"],
			where: {
				businessId,
				status: "COMPLETED",
				createdAt: {
					gte: sixMonthsAgo,
				},
			},
			_sum: {
				amount: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		// Get order data for the last 6 months
		const orderData = await prisma.order.groupBy({
			by: ["createdAt"],
			where: {
				businessId,
				createdAt: {
					gte: sixMonthsAgo,
				},
			},
			_count: {
				id: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		// Format the data for charts
		const formattedRevenueData = revenueData.map((item) => ({
			name: new Date(item.createdAt).toLocaleString("default", {
				month: "short",
			}),
			value: item._sum.amount || 0,
		}));

		const formattedOrderData = orderData.map((item) => ({
			name: new Date(item.createdAt).toLocaleString("default", {
				month: "short",
			}),
			orders: item._count.id,
		}));

		return NextResponse.json({
			revenue: revenue._sum.amount || 0,
			orders,
			members,
			revenueData: formattedRevenueData,
			orderData: formattedOrderData,
		});
	} catch (error) {
		console.error("Error fetching business stats:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
