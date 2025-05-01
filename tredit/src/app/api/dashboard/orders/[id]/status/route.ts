import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/lib/services/order";

export async function PATCH(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return new Response("Unauthorized", { status: 401 });
		}

		const { status, note } = await request.json();
		if (!status) {
			return new Response("Status is required", { status: 400 });
		}

		const orderService = OrderService.getInstance();
		const updatedOrder = await orderService.updateOrderStatus(
			params.id,
			status,
			note || `Status updated to ${status}`,
			session.user.id
		);

		return Response.json(updatedOrder);
	} catch (error) {
		console.error("Error updating order status:", error);
		return new Response("Failed to update order status", { status: 500 });
	}
}
