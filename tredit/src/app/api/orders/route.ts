import { NextResponse } from "next/server";
import { OrderService } from "@/lib/services/order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const slug = searchParams.get("slug");
		if (!slug) {
			return NextResponse.json(
				{ error: "Missing business slug" },
				{ status: 400 }
			);
		}

		// Support shortened slug: e.g. soundhive-electronics-d0f46abb
		const shortId = slug.split("-").pop();
		// Find the business whose id starts with the shortId
		const business = await prisma.business.findFirst({
			where: {
				id: {
					startsWith: shortId,
				},
			},
		});
		if (!business) {
			return NextResponse.json(
				{ error: "Business not found" },
				{ status: 404 }
			);
		}

		// Get all orders for this business and user
		const orders = await prisma.order.findMany({
			where: {
				businessId: business.id,
				userId: session.user.id,
			},
			include: {
				items: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json({ orders });
	} catch (error) {
		console.error("Failed to fetch orders:", error);
		return NextResponse.json(
			{ error: "Failed to fetch orders" },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const { businessId, items, totalAmount } = await request.json();

		if (!businessId || !items || !totalAmount) {
			return NextResponse.json(
				{ message: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Create order
		const order = await prisma.order.create({
			data: {
				businessId,
				userId: session.user.id,
				totalAmount,
				status: "PENDING",
				items: {
					create: items.map((item: any) => ({
						productId: item.id,
						quantity: item.quantity,
						price: item.price,
					})),
				},
			},
			include: {
				items: true,
			},
		});

		return NextResponse.json(order);
	} catch (error) {
		console.error("Order creation error:", error);
		return NextResponse.json(
			{ message: "Failed to create order" },
			{ status: 500 }
		);
	}
}

export async function PATCH(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { orderId, status } = await request.json();
		const orderService = OrderService.getInstance();

		const order = await orderService.updateOrderStatus(orderId, status);
		return NextResponse.json(order);
	} catch (error) {
		console.error("Error updating order:", error);
		return NextResponse.json(
			{ error: "Failed to update order" },
			{ status: 500 }
		);
	}
}
