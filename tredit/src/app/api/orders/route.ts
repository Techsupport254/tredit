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
				items: {
					include: {
						product: {
							select: {
								name: true,
								price: true,
								media: true,
							},
						},
						service: {
							select: {
								name: true,
								price: true,
							},
						},
					},
				},
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

		const { businessId, items, totalAmount, cartMetadata } =
			await request.json();

		if (!businessId || !items || !totalAmount) {
			return NextResponse.json(
				{ message: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Create initial status array
		const initialStatus = [
			{
				status: "PENDING",
				note: "Order placed",
				timestamp: new Date().toISOString(),
			},
		];

		// Create service agreement first
		const serviceAgreement = await prisma.serviceAgreement.create({
			data: {
				businessId,
				clientId: session.user.id,
				serviceCategoryId: "default", // You might want to make this dynamic based on the order type
				title: `Order Agreement for ${businessId}`,
				description: "Standard order agreement",
				startDate: new Date(),
				paymentModel: "ONE_TIME",
				totalAmount: totalAmount,
				currency: "KES",
				terms: {
					deliveryConfirmed: false,
					disputePeriod: 7, // 7 days dispute period
					autoReleaseAfter: 14, // Auto-release after 14 days if no dispute
				},
			},
		});

		// Create order with cart metadata and proper status structure
		const order = await prisma.$transaction(
			async (tx) => {
				// Create the order
				const newOrder = await tx.order.create({
					data: {
						businessId,
						userId: session.user.id,
						totalAmount,
						currentStatus: "PENDING",
						statusHistory: [
							{
								status: "PENDING",
								note: "Order placed",
								updatedBy: session.user.id,
								timestamp: new Date().toISOString(),
							},
						],
						metadata: {
							...cartMetadata,
							agreementId: serviceAgreement.id,
						},
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

				// Delete the user's cart after successful order creation
				await tx.cart.delete({
					where: {
						userId: session.user.id,
					},
				});

				return newOrder;
			},
			{
				maxWait: 10000, // 10 seconds to wait for a connection from the pool
				timeout: 15000, // 15 seconds for the transaction itself
			}
		);

		return NextResponse.json(order);
	} catch (error) {
		console.error("Order creation error:", error);
		return NextResponse.json(
			{ message: "Failed to create order" },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const { status, note } = await req.json();
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
		return new Response("Internal Server Error", { status: 500 });
	}
}
