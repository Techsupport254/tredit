import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verifyPayment } from "@/lib/paystack";

export async function GET(
	request: Request,
	{ params }: { params: { reference: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const { reference } = params;

		if (!reference) {
			return NextResponse.json(
				{ message: "Payment reference is required" },
				{ status: 400 }
			);
		}

		// Verify payment with Paystack
		const paymentData = await verifyPayment(reference);

		// Update payment record
		const payment = await prisma.payment.update({
			where: { reference },
			data: {
				status: paymentData.status === "success" ? "COMPLETED" : "FAILED",
				paymentDetails: paymentData,
			},
			include: {
				order: true,
			},
		});

		// If payment is successful, update order status
		if (payment.status === "COMPLETED") {
			await prisma.order.update({
				where: { id: payment.orderId },
				data: {
					status: "PAID",
				},
			});
		}

		return NextResponse.json(payment);
	} catch (error) {
		console.error("Payment verification error:", error);
		return NextResponse.json(
			{ message: "Failed to verify payment" },
			{ status: 500 }
		);
	}
}
