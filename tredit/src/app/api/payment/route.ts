import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentService } from "@/lib/services/payment.service";
import { PaystackService } from "@/lib/services/paystack.service";
import { EscrowService } from "@/lib/services/escrow.service";
import { TokenEscrowService } from "@/lib/services/token-escrow.service";
import { PaymentMethod, OrderStatus } from "@prisma/client";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import Decimal from "decimal.js";
import { generateShareableLink } from "@/lib/utils/url";
import { verifyPayment } from "@/lib/paystack";
import config from "@/config";

// Input validation schema
const paymentRequestSchema = z.object({
	businessId: z.string().min(1),
	items: z.array(
		z.object({
			id: z.string(),
			variantId: z.string().optional(),
			quantity: z.number(),
			price: z.number(),
			variant: z.any().optional(),
		})
	),
	totalAmount: z.number(),
	shippingAddress: z.string(),
	paymentMethod: z.enum(["MPESA", "CARD", "BANK_TRANSFER", "CRYPTO"] as const),
	shippingMethod: z.string(),
	shippingFee: z.number().optional(),
	subtotal: z.number(),
	tax: z.number(),
	metadata: z.any().optional(),
});

// Rate limiter configuration
const limiter = rateLimit({
	interval: 60 * 1000, // 1 minute
	uniqueTokenPerInterval: 500,
});

type OrderMetadata = {
	cart: any;
	payment: {
		method: string;
		reference: string;
		amount: number;
		currency: string;
		status: string;
		timestamp: string;
	};
	shipping: {
		method: string;
		fee: number;
		address: string;
		status: string;
	};
	tax: number;
	subtotal: number;
	business: any;
	agreementId?: string;
};

export async function POST(req: NextRequest) {
	let requestBody: any;
	try {
		// Read request body once
		requestBody = await req.json();
		console.log("[Payment Init] Step 1: Request received", {
			body: requestBody,
			headers: req.headers,
		});

		const session = await getServerSession(authOptions);
		if (!session?.user) {
			console.error("[Payment Init] Step 1: Unauthorized", { session });
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { amount, email, paymentMethod, metadata } = requestBody;
		console.log("[Payment Init] Step 2: Request data extracted", {
			amount,
			email,
			paymentMethod,
			metadata,
			userId: session.user.id,
		});

		// Step 1: Get or create default product category
		console.log(
			"[Payment Init] Step 3: Getting or creating default product category",
			{
				businessId: metadata.businessId,
				userId: session.user.id,
			}
		);

		let productCategory = await prisma.productCategory.findFirst({
			where: {
				businessId: metadata.businessId,
				name: "Default",
			},
		});

		if (!productCategory) {
			console.log("[Payment Init] Step 3: Creating default product category", {
				businessId: metadata.businessId,
				userId: session.user.id,
			});
			productCategory = await prisma.productCategory.create({
				data: {
					businessId: metadata.businessId,
					name: "Default",
					description: "Default product category for orders",
					type: "PHYSICAL",
					basePrice: 0,
					stockLevel: 0,
					isAvailable: true,
					requiresApproval: false,
				},
			});
		}

		console.log("[Payment Init] Step 3: Product category ready", {
			productCategory: {
				id: productCategory.id,
				name: productCategory.name,
				businessId: productCategory.businessId,
				type: productCategory.type,
				basePrice: productCategory.basePrice,
				stockLevel: productCategory.stockLevel,
				isAvailable: productCategory.isAvailable,
				requiresApproval: productCategory.requiresApproval,
			},
		});

		// Step 2: Create order
		console.log("[Payment Init] Step 4: Creating order", {
			businessId: metadata.businessId,
			userId: session.user.id,
			amount,
			productCategoryId: productCategory.id,
			paymentMethod,
			shippingAddress: metadata.shippingAddress,
			shippingMethod: metadata.shippingMethod,
		});

		const order = await prisma.order.create({
			data: {
				businessId: metadata.businessId,
				userId: session.user.id,
				totalAmount: amount,
				shippingAddress: metadata.shippingAddress,
				shippingMethod: metadata.shippingMethod,
				currentStatus: OrderStatus.PENDING,
				paymentStatus: "PENDING",
				statusHistory: [
					{
						status: "PENDING",
						note: "Order placed and payment pending",
						timestamp: new Date().toISOString(),
					},
				],
				metadata: {
					cart: metadata.cart,
					payment: {
						method: paymentMethod,
						amount: amount,
						currency: "KES",
						status: "PENDING",
						timestamp: new Date().toISOString(),
					},
					shipping: {
						method: metadata.shippingMethod,
						fee: metadata.shippingFee,
						address: metadata.shippingAddress,
						status: "PENDING",
					},
					tax: metadata.tax,
					subtotal: metadata.subtotal,
					business: metadata.business,
					productCategoryId: productCategory.id,
				} as OrderMetadata,
				items: {
					create: metadata.items.map((item: any) => ({
						quantity: item.quantity,
						price: item.price,
						product: { connect: { id: item.id } },
					})),
				},
			},
		});

		console.log("[Payment Init] Step 4: Order created", {
			order: {
				id: order.id,
				businessId: order.businessId,
				userId: order.userId,
				totalAmount: order.totalAmount,
				status: order.currentStatus,
				paymentStatus: order.paymentStatus,
				metadata: order.metadata,
				items: order.items,
			},
		});

		// Step 3: Initialize Paystack payment
		console.log("[Payment Init] Step 5: Initializing Paystack payment", {
			amount,
			email,
			paymentMethod,
			orderId: order.id,
			metadata: {
				...metadata,
				orderId: order.id,
				paymentMethod,
				custom_fields: [
					{
						display_name: "Order ID",
						variable_name: "orderId",
						value: order.id,
					},
					{
						display_name: "Payment Method",
						variable_name: "paymentMethod",
						value: paymentMethod,
					},
					{
						display_name: "Business ID",
						variable_name: "businessId",
						value: metadata.businessId,
					},
					{
						display_name: "User ID",
						variable_name: "userId",
						value: session.user.id,
					},
				],
			},
		});

		const paystackService = PaystackService.getInstance();
		const response = await paystackService.initializePayment(
			amount,
			email,
			paymentMethod,
			{
				...metadata,
				orderId: order.id,
				paymentMethod,
				custom_fields: [
					{
						display_name: "Order ID",
						variable_name: "orderId",
						value: order.id,
					},
					{
						display_name: "Payment Method",
						variable_name: "paymentMethod",
						value: paymentMethod,
					},
					{
						display_name: "Business ID",
						variable_name: "businessId",
						value: metadata.businessId,
					},
					{
						display_name: "User ID",
						variable_name: "userId",
						value: session.user.id,
					},
				],
			}
		);

		console.log("[Payment Init] Step 5: Paystack payment initialized", {
			response,
			orderId: order.id,
			paymentMethod,
			metadata: {
				...metadata,
				orderId: order.id,
				paymentMethod,
				custom_fields: [
					{
						display_name: "Order ID",
						variable_name: "orderId",
						value: order.id,
					},
					{
						display_name: "Payment Method",
						variable_name: "paymentMethod",
						value: paymentMethod,
					},
					{
						display_name: "Business ID",
						variable_name: "businessId",
						value: metadata.businessId,
					},
					{
						display_name: "User ID",
						variable_name: "userId",
						value: session.user.id,
					},
				],
			},
		});

		return NextResponse.json({
			authorization_url: response.data.authorization_url,
			reference: response.data.reference,
			orderId: order.id,
			paymentMethod,
			metadata: {
				...metadata,
				orderId: order.id,
				paymentMethod,
				custom_fields: [
					{
						display_name: "Order ID",
						variable_name: "orderId",
						value: order.id,
					},
					{
						display_name: "Payment Method",
						variable_name: "paymentMethod",
						value: paymentMethod,
					},
					{
						display_name: "Business ID",
						variable_name: "businessId",
						value: metadata.businessId,
					},
					{
						display_name: "User ID",
						variable_name: "userId",
						value: session.user.id,
					},
				],
			},
		});
	} catch (error) {
		console.error("[Payment Init] Error:", {
			error,
			requestBody: requestBody || "Not available",
			stack: error instanceof Error ? error.stack : undefined,
		});
		return NextResponse.json(
			{ error: "Failed to initialize payment" },
			{ status: 500 }
		);
	}
}

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams;
		const reference = searchParams.get("reference");

		if (!reference) {
			return NextResponse.json(
				{ error: "Payment reference is required" },
				{ status: 400 }
			);
		}

		console.log("[Step 1] Request received and reference extracted", {
			reference,
		});

		const paystackService = PaystackService.getInstance();
		const response = await paystackService.verifyPayment(reference);

		console.log("[Step 2] Payment verification response", {
			status: response.data.status,
			reference: response.data.reference,
			metadata: response.data.metadata,
		});

		if (response.data.status === "success") {
			// Extract orderId from metadata
			const orderId = response.data.metadata?.custom_fields?.find(
				(field: any) => field.variable_name === "orderId"
			)?.value;

			if (!orderId) {
				console.error("[Step 3] Order ID not found in metadata", {
					metadata: response.data.metadata,
				});
				return NextResponse.json(
					{ error: "Order ID not found in payment metadata" },
					{ status: 400 }
				);
			}

			console.log("[Step 3] Found order ID in metadata", { orderId });

			// Find the order
			const order = await prisma.order.findUnique({
				where: { id: orderId },
			});

			if (!order) {
				console.error("[Step 4] Order not found", { orderId });
				return NextResponse.json({ error: "Order not found" }, { status: 404 });
			}

			console.log("[Step 4] Order found", {
				orderId: order.id,
				status: order.currentStatus,
				paymentStatus: order.paymentStatus,
				totalAmount: order.totalAmount,
				businessId: order.businessId,
				userId: order.userId,
			});

			// Create escrow payment
			console.log("[Step 5] Creating escrow payment", {
				orderId: order.id,
				amount: order.totalAmount,
				buyerId: order.userId,
				sellerId: order.businessId,
				paymentMethod: response.data.channel.toUpperCase(),
				paymentReference: reference,
			});

			const escrow = await prisma.escrowPayment.create({
				data: {
					orderId: order.id,
					amount: order.totalAmount,
					currency: "KES",
					status: "ACTIVE",
					buyerId: order.userId,
					sellerId: order.businessId,
					paymentMethod: response.data.channel.toUpperCase(),
					paymentReference: reference,
					conditions: {
						deliveryConfirmed: false,
						disputePeriod: 7,
						autoReleaseAfter: 14,
					},
					metadata: {
						paymentId: response.data.id,
						paymentChannel: response.data.channel,
						paymentDate: response.data.paid_at,
						transactionFee: response.data.fees,
						gatewayResponse: response.data.gateway_response,
						paymentConfirmedAt: new Date(),
					},
				},
			});

			console.log("[Step 6] Escrow payment created", {
				escrowId: escrow.id,
				status: escrow.status,
				amount: escrow.amount,
				currency: escrow.currency,
				buyerId: escrow.buyerId,
				sellerId: escrow.sellerId,
				paymentMethod: escrow.paymentMethod,
				paymentReference: escrow.paymentReference,
				metadata: escrow.metadata,
			});

			// Update order status
			console.log("[Step 7] Updating order status", {
				orderId: order.id,
				status: "PAYMENT_HELD",
				paymentStatus: "HELD_IN_ESCROW",
			});

			const updatedOrder = await prisma.order.update({
				where: { id: order.id },
				data: {
					paymentStatus: "HELD_IN_ESCROW",
					currentStatus: "PAYMENT_HELD",
					statusHistory: {
						push: {
							status: "PAYMENT_HELD",
							note: "Payment received and held in escrow",
							timestamp: new Date().toISOString(),
						},
					},
				},
			});

			console.log("[Step 8] Order status updated", {
				orderId: updatedOrder.id,
				status: updatedOrder.currentStatus,
				paymentStatus: updatedOrder.paymentStatus,
				statusHistory: updatedOrder.statusHistory,
			});

			return NextResponse.json({
				status: "success",
				message: "Payment verified and escrow created",
				data: {
					order: {
						id: updatedOrder.id,
						status: updatedOrder.currentStatus,
						paymentStatus: updatedOrder.paymentStatus,
					},
					escrow: {
						id: escrow.id,
						status: escrow.status,
						amount: escrow.amount,
					},
				},
			});
		}

		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error("[Payment Verification] Error:", {
			error,
			message: error.message,
			stack: error.stack,
		});
		return NextResponse.json(
			{ error: error.message || "Failed to verify payment" },
			{ status: 500 }
		);
	}
}
