import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { initializePayment } from "@/lib/paystack";
import {
	PaymentMethod,
	Order,
	OrderItem,
	Business,
	User,
	Payment,
	EscrowStatus,
} from "@prisma/client";

type OrderMetadata = {
	shippingFee?: number;
	subtotal?: number;
	tax?: number;
};

type OrderWithRelations = Order & {
	items: OrderItem[];
	business: Business;
	user: User;
	metadata: OrderMetadata;
	status: string;
};

export async function POST(request: Request) {
	let requestBody: any;
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user) {
			console.error("[Payment Init] Unauthorized request", {
				session: session ? "exists" : "null",
				user: session?.user ? "exists" : "null",
			});
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		// Read request body once
		requestBody = await request.json();
		const { orderId, amount, businessId, paymentMethod } = requestBody;

		console.log("[Payment Init] Step 1: Request received", {
			requestBody,
			userId: session.user.id,
		});

		if (!orderId || !amount || !businessId || !paymentMethod) {
			console.error("[Payment Init] Step 1: Missing required fields", {
				orderId,
				amount,
				businessId,
				paymentMethod,
			});
			return NextResponse.json(
				{ message: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Step 1: Get order details
		console.log("[Payment Init] Step 2: Getting order details", {
			orderId,
			businessId,
			amount,
			paymentMethod,
			userId: session.user.id,
		});

		const order = (await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				business: true,
				user: true,
				items: true,
			},
		})) as OrderWithRelations | null;

		if (!order) {
			console.error("[Payment Init] Step 2: Order not found", { orderId });
			return NextResponse.json({ message: "Order not found" }, { status: 404 });
		}

		console.log("[Payment Init] Step 2: Order found", {
			order: {
				id: order.id,
				businessId: order.businessId,
				userId: order.userId,
				totalAmount: order.totalAmount,
				status: order.status,
				items: order.items,
				business: order.business,
				user: order.user,
				metadata: order.metadata,
			},
		});

		// Step 2: Payment initialization
		try {
			console.log("[Payment Init] Step 3: Initializing payment with Paystack", {
				amount,
				email: order.user.email,
				paymentMethod,
				metadata: {
					orderId,
					businessId,
					paymentMethod,
				},
			});

			const payment = await initializePayment({
				amount: amount * 100, // Convert to cents
				email: order.user.email!,
				reference: orderId,
				callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify/${orderId}`,
				metadata: {
					custom_fields: [
						{
							display_name: "Order ID",
							variable_name: "orderId",
							value: orderId,
						},
						{
							display_name: "Business ID",
							variable_name: "businessId",
							value: businessId,
						},
						{
							display_name: "User ID",
							variable_name: "userId",
							value: session.user.id,
						},
						{
							display_name: "Payment Method",
							variable_name: "paymentMethod",
							value: paymentMethod,
						},
					],
				},
			});

			console.log("[Payment Init] Step 4: Payment initialized successfully", {
				payment,
				authorizationUrl: payment.authorization_url,
			});

			return NextResponse.json(payment);
		} catch (error) {
			console.error("[Payment Init] Step 3: Payment initialization failed", {
				error,
				orderId,
				amount,
				paymentMethod,
			});
			return NextResponse.json(
				{ message: "Failed to initialize payment" },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("[Payment Init] Global error:", {
			error,
			requestData: requestBody,
		});
		return NextResponse.json(
			{ message: "Failed to initialize payment" },
			{ status: 500 }
		);
	}
}
