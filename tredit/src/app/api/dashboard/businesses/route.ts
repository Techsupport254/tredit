import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const businesses = await prisma.business.findMany({
			where: {
				userId: session.user.id,
			},
			select: {
				id: true,
				name: true,
				logo: true,
				status: true,
				_count: {
					select: {
						orders: true,
						products: true,
					},
				},
				orders: {
					select: {
						totalAmount: true,
					},
				},
			},
		});

		const formattedBusinesses = businesses.map((biz) => ({
			id: biz.id,
			name: biz.name,
			logo: biz.logo,
			status: biz.status,
			orders: biz._count.orders,
			products: biz._count.products,
			sales: biz.orders.reduce(
				(acc, order) => acc + Number(order.totalAmount || 0),
				0
			),
			customers: 0, // This will need to be implemented when we have customer tracking
		}));

		return NextResponse.json({ businesses: formattedBusinesses });
	} catch (error) {
		console.error("Error fetching businesses:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
