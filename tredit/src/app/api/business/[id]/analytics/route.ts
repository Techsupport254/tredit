import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import prisma from "@/lib/prisma";

export async function GET(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			console.log("[ANALYTICS] Unauthorized access attempt");
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		const businessId = params.id;
		console.log(`[ANALYTICS] Fetching analytics for businessId: ${businessId}`);

		// Count products
		const products = await prisma.product.count({
			where: { businessId },
		});
		console.log(`[ANALYTICS] Products count:`, products);

		// Count orders
		const orders = await prisma.order.count({
			where: { businessId },
		});
		console.log(`[ANALYTICS] Orders count:`, orders);

		// Sum sales
		const salesAgg = await prisma.order.aggregate({
			where: { businessId },
			_sum: { totalAmount: true },
		});
		const sales = salesAgg._sum.totalAmount || 0;
		console.log(
			`[ANALYTICS] Sales aggregate:`,
			salesAgg,
			`Final sales:`,
			sales
		);

		// Customers: count of unique userIds in orders for this business
		const customers = await prisma.order.findMany({
			where: { businessId },
			select: { userId: true },
			distinct: ["userId"],
		});
		console.log(
			`[ANALYTICS] Unique customers:`,
			customers.map((c) => c.userId)
		);

		const result = {
			customers: customers.length,
			products,
			orders,
			sales,
		};
		console.log(`[ANALYTICS] Final analytics result:`, result);
		return NextResponse.json(result);
	} catch (error) {
		console.error("[ANALYTICS] Error fetching business analytics:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: String(error) },
			{ status: 500 }
		);
	}
}
