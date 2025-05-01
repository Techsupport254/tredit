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
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const data = await request.json();
		const orderService = OrderService.getInstance();
		const updatedOrder = await orderService.updateOrderShipping(
			params.id,
			data
		);

		return NextResponse.json(updatedOrder);
	} catch (error) {
		console.error("Error updating order shipping:", error);
		return NextResponse.json(
			{ error: "Failed to update order shipping" },
			{ status: 500 }
		);
	}
}
