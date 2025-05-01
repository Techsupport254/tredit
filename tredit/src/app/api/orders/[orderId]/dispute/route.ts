import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Input validation schema
const disputeRequestSchema = z.object({
	reason: z.string().min(1, "Dispute reason is required"),
	description: z.string().min(1, "Dispute description is required"),
	evidence: z.array(z.string()).optional(),
});

export async function PUT(
	req: NextRequest,
	{ params }: { params: { orderId: string } }
) {
	try {
		console.log("[Dispute API] Step 1: Request received", {
			orderId: params.orderId,
			headers: req.headers,
		});

		const session = await getServerSession(authOptions);
		if (!session?.user) {
			console.error("[Dispute API] Step 1: Unauthorized", { session });
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const requestBody = await req.json();
		console.log("[Dispute API] Step 2: Request body", requestBody);

		// Validate request body
		const validatedData = disputeRequestSchema.parse(requestBody);
		console.log("[Dispute API] Step 3: Validated data", validatedData);

		// Find the order
		const order = await prisma.order.findUnique({
			where: { id: params.orderId },
			include: {
				escrowPayment: true,
			},
		});

		if (!order) {
			console.error("[Dispute API] Step 4: Order not found", {
				orderId: params.orderId,
			});
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		console.log("[Dispute API] Step 4: Order found", {
			orderId: order.id,
			status: order.currentStatus,
			paymentStatus: order.paymentStatus,
			escrowStatus: order.escrowPayment?.status,
		});

		// Check if order is eligible for dispute
		if (order.currentStatus === "DISPUTED") {
			console.error("[Dispute API] Step 5: Order already disputed", {
				orderId: order.id,
				status: order.currentStatus,
			});
			return NextResponse.json(
				{ error: "Order is already disputed" },
				{ status: 400 }
			);
		}

		// Robustly parse statusHistory
		let statusHistory = [];
		if (Array.isArray(order.statusHistory)) {
			statusHistory = order.statusHistory;
		} else if (
			order.statusHistory &&
			typeof order.statusHistory.push === "object"
		) {
			statusHistory = [order.statusHistory.push];
		} else {
			statusHistory = [];
		}

		// Create dispute
		const dispute = await prisma.dispute.create({
			data: {
				reason: validatedData.reason,
				status: "OPEN",
				metadata: {
					orderStatus: order.currentStatus,
					paymentStatus: order.paymentStatus,
					createdAt: new Date().toISOString(),
					description: validatedData.description,
					evidence: {
						messages: validatedData.evidence || [],
						orderData: {
							id: order.id,
							status: order.currentStatus,
							paymentStatus: order.paymentStatus,
							totalAmount: order.totalAmount,
							shippingAddress: order.shippingAddress,
							shippingMethod: order.shippingMethod,
							metadata: order.metadata,
						},
					},
				},
				order: {
					connect: {
						id: order.id,
					},
				},
				user: {
					connect: {
						id: session.user.id,
					},
				},
			},
		});

		console.log("[Dispute API] Step 6: Dispute created", {
			disputeId: dispute.id,
			status: dispute.status,
			orderId: dispute.orderId,
		});

		// Update order status
		const updatedOrder = await prisma.order.update({
			where: { id: order.id },
			data: {
				currentStatus: "DISPUTED",
				statusHistory: [
					...statusHistory,
					{
						status: "DISPUTED",
						note: "Order disputed by customer",
						timestamp: new Date().toISOString(),
					},
				],
			},
		});

		console.log("[Dispute API] Step 7: Order status updated", {
			orderId: updatedOrder.id,
			status: updatedOrder.currentStatus,
			statusHistory: updatedOrder.statusHistory,
		});

		return NextResponse.json({
			status: "success",
			message: "Dispute created successfully",
			data: {
				dispute: {
					id: dispute.id,
					status: dispute.status,
					reason: dispute.reason,
				},
				order: {
					id: updatedOrder.id,
					status: updatedOrder.currentStatus,
				},
			},
		});
	} catch (error: any) {
		console.error("[Dispute API] Error:", {
			error,
			message: error.message,
			stack: error.stack,
		});

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.errors },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: error.message || "Failed to create dispute" },
			{ status: 500 }
		);
	}
}
