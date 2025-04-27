import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentService } from "@/lib/services/payment.service";
import { PaystackService } from "@/lib/services/paystack.service";
import { PaymentMethod } from "@prisma/client";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import Decimal from "decimal.js";
import { generateShareableLink } from "@/lib/utils/url";
import { verifyPayment } from "@/lib/paystack";

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

export async function POST(req: Request) {
	try {
		// Rate limiting
		try {
			await limiter.check(5); // 5 requests per minute
		} catch {
			return NextResponse.json({ error: "Too many requests" }, { status: 429 });
		}

		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Validate input
		const body = await req.json();
		const validationResult = paymentRequestSchema.safeParse(body);
		if (!validationResult.success) {
			return NextResponse.json(
				{ error: "Invalid input", details: validationResult.error },
				{ status: 400 }
			);
		}

		const {
			businessId,
			items,
			totalAmount,
			shippingAddress,
			paymentMethod,
			shippingMethod,
			shippingFee,
			subtotal,
			tax,
			metadata,
		} = validationResult.data;

		// Extra check for paymentMethod
		if (
			!paymentMethod ||
			!["MPESA", "CARD", "BANK_TRANSFER", "CRYPTO"].includes(paymentMethod)
		) {
			return NextResponse.json(
				{
					error: "Invalid payment method",
					details: {
						received: paymentMethod,
						options: ["MPESA", "CARD", "BANK_TRANSFER", "CRYPTO"],
					},
				},
				{ status: 400 }
			);
		}

		// Log the incoming payment request for debugging
		console.log("Payment request received:", validationResult.data);

		// Fetch the business by businessId
		const business = await prisma.business.findUnique({
			where: { id: businessId },
		});
		if (!business) {
			console.error("Business not found for id:", businessId);
			return NextResponse.json(
				{ error: "Business not found" },
				{ status: 404 }
			);
		}

		// Log the fetched business and session user
		console.log("Fetched business:", business);
		console.log("Session user:", session.user);

		const paymentService = PaymentService.getInstance();
		const paystackService = PaystackService.getInstance();

		// Find or create a default service category for the business
		let serviceCategory = await prisma.serviceCategory.findFirst({
			where: {
				businessId: business.id,
				name: "Default",
			},
		});
		if (!serviceCategory) {
			serviceCategory = await prisma.serviceCategory.create({
				data: {
					businessId: business.id,
					name: "Default",
					description: "Default service category for agreements",
					type: "CUSTOM",
					basePrice: new Decimal(0),
					duration: 0,
				},
			});
		}

		// Create service agreement for the payment
		const serviceAgreement = await prisma.serviceAgreement.create({
			data: {
				businessId: business.id,
				clientId: session.user.id,
				serviceCategoryId: serviceCategory.id,
				title: `Order Payment - ${business.id}`,
				description: `Payment for business ${business.id}`,
				startDate: new Date(),
				paymentModel: "ONE_TIME",
				totalAmount: new Decimal(totalAmount),
				currency: "KES",
				terms: {
					items: items,
				},
			},
		});

		let paymentResult;
		let paymentRecord;

		try {
			if (paymentMethod === "CRYPTO") {
				const buyerWallet = session.user.walletAddress || "";
				if (!buyerWallet) {
					throw new Error(
						"User wallet address is required for crypto payments"
					);
				}
				// Handle crypto payment
				paymentResult = await paymentService.initiatePayment(
					totalAmount,
					"KES",
					paymentMethod,
					serviceAgreement.id,
					buyerWallet,
					"" // No seller wallet address available, pass empty string or update as needed
				);

				// Only create payment record if blockchain payment was initiated
				paymentRecord = await prisma.payment.create({
					data: {
						agreementId: serviceAgreement.id,
						amount: new Decimal(totalAmount),
						paymentMethod,
						status: "PENDING",
						...(paymentResult && paymentResult.paymentId
							? { blockchainPaymentId: paymentResult.paymentId }
							: {}),
						...(paymentResult && paymentResult.transactionHash
							? { blockchainTxHash: paymentResult.transactionHash }
							: {}),
					},
				});

				return NextResponse.json({
					paymentId: paymentResult.paymentId,
					type: "crypto",
					status: "pending",
				});
			} else {
				// Handle fiat payment through Paystack
				const paystackResponse = await paystackService.initializePayment(
					totalAmount,
					session.user.email!,
					paymentMethod,
					{
						businessId,
						userId: session.user.id,
						items,
						totalAmount,
						shippingAddress,
						paymentMethod,
						shippingMethod,
						shippingFee,
						subtotal,
						tax,
						paymentAgreementId: serviceAgreement.id,
						businessName: business.name,
						businessType: business.type,
						...metadata,
					}
				);

				// Only create payment record if Paystack payment was initialized
				paymentRecord = await prisma.payment.create({
					data: {
						agreementId: serviceAgreement.id,
						amount: new Decimal(totalAmount),
						paymentMethod,
						status: "PENDING",
						...(paystackResponse && paystackResponse.data.reference
							? { paystackRef: paystackResponse.data.reference }
							: {}),
					},
				});

				return NextResponse.json({
					authorizationUrl: paystackResponse.data.authorization_url,
					type: "fiat",
					status: "pending",
				});
			}
		} catch (error) {
			// If payment initialization fails, delete the service agreement
			await prisma.serviceAgreement.delete({
				where: { id: serviceAgreement.id },
			});
			console.error("Payment initialization failed:", error);
			throw error;
		}
	} catch (error) {
		console.error("Payment initialization error:", error);
		return NextResponse.json(
			{ error: "Failed to initialize payment" },
			{ status: 500 }
		);
	}
}

export async function GET(req: Request) {
	try {
		// Rate limiting
		try {
			await limiter.check(10); // 10 requests per minute
		} catch {
			return NextResponse.json({ error: "Too many requests" }, { status: 429 });
		}

		const { searchParams } = new URL(req.url);
		let reference = searchParams.get("reference");

		const paymentService = PaymentService.getInstance();

		// Start a transaction
		const result = await prisma.$transaction(
			async (tx) => {
				try {
					// Verify payment with Paystack
					const verificationRaw = await verifyPayment(reference || "");
					// The real Paystack verify endpoint returns a nested data object
					const verification = verificationRaw as any;
					const metadata = verification.metadata;

					// Fallback: get reference from verification response if not present
					if (!reference && verification.reference) {
						reference = verification.reference;
					}

					if (!reference) {
						return {
							status: "failed",
							error: "Missing payment reference for update",
						};
					}

					if (verification.status === "success") {
						// Update payment status by paystackRef
						await tx.payment.update({
							where: { paystackRef: reference },
							data: { status: "PAID" },
						});

						// Complete payment in blockchain (if needed)
						if (metadata && metadata.paymentId) {
							await paymentService.completePayment(metadata.paymentId);
						}

						// Create order after payment is successful
						const order = await tx.order.create({
							data: {
								businessId: metadata.businessId,
								userId: metadata.userId,
								totalAmount: new Decimal(metadata.totalAmount),
								shippingAddress: metadata.shippingAddress,
								shippingMethod: metadata.shippingMethod,
								status: "PROCESSING",
								paymentStatus: "PAID",
								items: {
									create: Array.isArray(metadata.items)
										? metadata.items.map((item: any) => {
												const base = {
													quantity:
														typeof item.quantity === "string"
															? parseInt(item.quantity, 10)
															: item.quantity,
													price: new Decimal(item.price),
												};
												if (item.id && !item.serviceId) {
													return {
														...base,
														product: { connect: { id: item.id } },
													};
												} else if (item.serviceId) {
													return {
														...base,
														service: { connect: { id: item.serviceId } },
													};
												}
												return base;
										  })
										: [],
								},
								// Add any other fields as needed
							},
						});

						// Generate slug URL for redirect or response
						const slugUrl = generateShareableLink(
							metadata.businessId,
							metadata.businessName || "business",
							metadata.businessType || "business"
						);

						// Build the orders page URL for redirect
						const ordersUrl = `${slugUrl}/orders`;

						return { status: "success", orderId: order.id, ordersUrl };
					} else {
						return { status: "failed", error: "Payment not successful" };
					}
				} catch (error: any) {
					console.error("Payment verification error:", error);
					return {
						status: "failed",
						error: error.message || "Verification failed",
					};
				}
			},
			{ timeout: 20000 }
		); // Increased timeout to 20 seconds

		return NextResponse.json(result);
	} catch (error) {
		console.error("Payment verification error:", error);
		return NextResponse.json(
			{ status: "failed", error: "Failed to verify payment" },
			{ status: 500 }
		);
	}
}
