import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { initializePayment } from "@/lib/paystack";

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const { orderId, amount, businessId } = await request.json();

		if (!orderId || !amount || !businessId) {
			return NextResponse.json(
				{ message: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Get order details
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				business: true,
				user: true,
			},
		});

		if (!order) {
			return NextResponse.json({ message: "Order not found" }, { status: 404 });
		}

		// Initialize payment with Paystack
		const payment = await initializePayment({
			amount: amount * 100, // Convert to kobo
			email: order.user.email!,
			reference: `order_${orderId}`,
			callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify/${orderId}`,
			metadata: {
				orderId,
				businessId,
				userId: session.user.id,
			},
		});

		// Create payment record
		const paymentRecord = await prisma.payment.create({
			data: {
				orderId,
				amount,
				reference: payment.reference,
				status: "PENDING",
				paymentMethod: "PAYSTACK",
			},
		});

		return NextResponse.json({
			id: paymentRecord.id,
			authorizationUrl: payment.authorization_url,
		});
	} catch (error) {
		console.error("Payment initialization error:", error);
		return NextResponse.json(
			{ message: "Failed to initialize payment" },
			{ status: 500 }
		);
	}
}
