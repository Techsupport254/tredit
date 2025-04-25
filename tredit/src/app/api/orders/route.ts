import { NextResponse } from "next/server";
import { OrderService } from "@/lib/services/order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const orderId = searchParams.get("orderId");

		const orderService = OrderService.getInstance();

		if (orderId) {
			const order = await orderService.getOrderById(orderId);
			if (!order) {
				return NextResponse.json({ error: "Order not found" }, { status: 404 });
			}
			return NextResponse.json(order);
		} else {
			const orders = await orderService.getUserOrders(session.user.id);
			return NextResponse.json(orders);
		}
	} catch (error) {
		console.error("Error fetching orders:", error);
		return NextResponse.json(
			{ error: "Failed to fetch orders" },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { businessId, shippingAddress, paymentMethod } = await request.json();

		if (!businessId) {
			return NextResponse.json(
				{ error: "Business ID is required" },
				{ status: 400 }
			);
		}

		const orderService = OrderService.getInstance();

		const cartCheck = await prisma.cart.findUnique({
			where: { userId: session.user.id },
			select: { items: { take: 1 } },
		});

		if (!cartCheck || cartCheck.items.length === 0) {
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		const order = await orderService.createOrder({
			userId: session.user.id,
			businessId: businessId,
			shippingAddress,
			paymentMethod,
		});

		return NextResponse.json(order);
	} catch (error: any) {
		console.error("Error creating order:", error);
		const errorMessage =
			error.message.includes("Insufficient stock") ||
			error.message === "Cart is empty"
				? error.message
				: "Failed to create order";
		const statusCode =
			error.message.includes("Insufficient stock") ||
			error.message === "Cart is empty"
				? 400
				: 500;

		return NextResponse.json({ error: errorMessage }, { status: statusCode });
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
