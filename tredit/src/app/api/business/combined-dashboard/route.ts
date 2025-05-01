import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import prisma from "@/lib/prisma";

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			console.log("[DASHBOARD] Unauthorized access attempt");
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { businessIds } = body;

		if (
			!businessIds ||
			!Array.isArray(businessIds) ||
			businessIds.length === 0
		) {
			console.log("[DASHBOARD] Invalid businessIds:", businessIds);
			return NextResponse.json(
				{ error: "Invalid businessIds provided" },
				{ status: 400 }
			);
		}

		console.log("[DASHBOARD] Processing request for businessIds:", businessIds);

		// Fetch combined metrics
		const metrics = await prisma.$transaction(async (tx) => {
			console.log("[DASHBOARD] Starting transaction for metrics");

			const products = await tx.product.count({
				where: {
					businessId: { in: businessIds },
				},
			});
			console.log("[DASHBOARD] Products count:", products);

			const orders = await tx.order.count({
				where: {
					businessId: { in: businessIds },
				},
			});
			console.log("[DASHBOARD] Orders count:", orders);

			const sales = await tx.order.aggregate({
				where: {
					businessId: { in: businessIds },
				},
				_sum: {
					totalAmount: true,
				},
			});
			console.log("[DASHBOARD] Sales aggregate:", sales);

			// Count unique customers by userId
			const customers = await tx.order.findMany({
				where: { businessId: { in: businessIds } },
				select: { userId: true },
				distinct: ["userId"],
			});

			return {
				customers: customers.length,
				products,
				orders,
				sales: sales._sum.totalAmount || 0,
			};
		});

		console.log("[DASHBOARD] Metrics fetched:", metrics);

		// Fetch sales trend data for the last two years
		const now = new Date();
		const currentYear = now.getFullYear();
		const lastYear = currentYear - 1;
		const salesTrendRaw = await prisma.order.findMany({
			where: {
				businessId: { in: businessIds },
				createdAt: {
					gte: new Date(`${lastYear}-01-01T00:00:00.000Z`),
					lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
				},
			},
			select: {
				createdAt: true,
				totalAmount: true,
			},
		});

		// Group by year and month
		const monthMap: Record<string, { current: number; last: number }> = {};
		salesTrendRaw.forEach((order) => {
			const date = new Date(order.createdAt);
			const year = date.getFullYear();
			const monthIdx = date.getMonth();
			const monthName = MONTHS[monthIdx];
			if (!monthMap[monthName]) monthMap[monthName] = { current: 0, last: 0 };
			if (year === currentYear)
				monthMap[monthName].current += Number(order.totalAmount);
			else if (year === lastYear)
				monthMap[monthName].last += Number(order.totalAmount);
		});
		const salesTrend = MONTHS.map((month) => ({
			month,
			current: monthMap[month]?.current || 0,
			last: monthMap[month]?.last || 0,
		}));

		// Fetch recent orders
		const orders = await prisma.order.findMany({
			where: {
				businessId: { in: businessIds },
			},
			include: {
				user: true,
				items: {
					include: {
						product: {
							include: {
								media: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 10,
		});
		console.log("[DASHBOARD] Recent orders fetched:", orders.length);

		// Fetch top sold items
		const topSold = await prisma.orderItem.groupBy({
			by: ["productId"],
			where: {
				order: {
					businessId: { in: businessIds },
				},
			},
			_sum: {
				quantity: true,
			},
			orderBy: {
				_sum: {
					quantity: "desc",
				},
			},
			take: 5,
		});
		console.log("[DASHBOARD] Top sold items:", topSold);

		const formattedOrders = orders.map((order) => {
			let productImage = "/placeholder.png";
			if (
				order.items &&
				order.items.length > 0 &&
				order.items[0].product &&
				Array.isArray(order.items[0].product.media) &&
				order.items[0].product.media.length > 0 &&
				order.items[0].product.media[0].url
			) {
				productImage = order.items[0].product.media[0].url;
			}
			return {
				orderId: order.id,
				customer: order.user?.name || "Unknown Customer",
				date: order.createdAt.toLocaleDateString(),
				price: order.totalAmount,
				status: order.currentStatus,
				productImage,
			};
		});

		// Calculate total quantity for percentage calculation
		const totalQuantity = topSold.reduce(
			(sum, item) => sum + (item._sum.quantity || 0),
			0
		);

		const formattedTopSold = await Promise.all(
			topSold.map(async (item) => {
				try {
					const product = await prisma.product.findUnique({
						where: { id: item.productId },
						include: {
							media: true,
						},
					});
					let image = "/placeholder.png";
					if (
						product &&
						Array.isArray(product.media) &&
						product.media.length > 0 &&
						product.media[0].url
					) {
						image = product.media[0].url;
					}
					return {
						productId: item.productId,
						name: product?.name || "Unknown Product",
						percent:
							totalQuantity > 0
								? Math.round(((item._sum.quantity || 0) / totalQuantity) * 100)
								: 0,
						color: "#6366f1", // Use a consistent color for all bars
						image,
					};
				} catch (error) {
					console.error("[DASHBOARD] Error formatting top sold item:", error);
					return {
						productId: item.productId,
						name: "Error loading product",
						percent: 0,
						color: "#cccccc",
						image: "/placeholder.png",
					};
				}
			})
		);

		const response = {
			metrics,
			salesTrend,
			productViews: [], // This will need to be implemented when we have product view tracking
			orders: formattedOrders,
			topSold: formattedTopSold,
		};

		console.log("[DASHBOARD] Final response prepared");
		return NextResponse.json(response);
	} catch (error) {
		console.error("[DASHBOARD] Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: String(error) },
			{ status: 500 }
		);
	}
}
