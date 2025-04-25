import { prisma } from "@/lib/prisma";
import { Prisma, CartItem as PrismaCartItem } from "@prisma/client"; // Import Prisma types
// Remove CartService import if it's not used for persistent cart
// import { CartService, CartItem } from "./cart";

export interface OrderInput {
	userId: string;
	// items: CartItem[]; // We will fetch items from DB now
	// totalAmount: number; // We will calculate totalAmount from DB
	businessId: string; // Need businessId to group order items
	shippingAddress: string;
	paymentMethod: string;
}

export class OrderService {
	private static instance: OrderService;
	// private cartService: CartService;

	private constructor() {
		// this.cartService = CartService.getInstance();
	}

	static getInstance(): OrderService {
		if (!OrderService.instance) {
			OrderService.instance = new OrderService();
		}
		return OrderService.instance;
	}

	async createOrder(input: OrderInput) {
		return prisma.$transaction(
			async (tx) => {
				// 1. Fetch user's persistent cart items
				const cart = await tx.cart.findUnique({
					where: { userId: input.userId },
					include: {
						items: {
							include: {
								product: true,
								variant: true,
							},
						},
					},
				});

				if (!cart || cart.items.length === 0) {
					throw new Error("Cart is empty");
				}

				// Group items by businessId (assuming cart can have items from multiple businesses)
				// For simplicity now, we assume all items are for input.businessId
				// TODO: Enhance this if cart can hold items from multiple businesses
				const itemsForOrder = cart.items;
				const businessId = input.businessId; // Assuming order is per business

				// 2. Check stock for all items first
				for (const item of itemsForOrder) {
					if (item.variant) {
						const variant = await tx.productVariant.findUnique({
							where: { id: item.variantId! },
						});
						if (!variant || variant.stock < item.quantity) {
							throw new Error(
								`Insufficient stock for variant ${item.variant.name}`
							);
						}
					} else if (item.product) {
						const product = await tx.product.findUnique({
							where: { id: item.productId! },
						});
						if (!product || product.stock < item.quantity) {
							throw new Error(
								`Insufficient stock for product ${item.product.name}`
							);
						}
					} else {
						// Handle service items if they exist - no stock check needed usually
					}
				}

				// 3. Calculate Total Amount
				const totalAmount = itemsForOrder.reduce((sum, item) => {
					const price = Number(item.variant?.price || item.product?.price || 0);
					return sum + price * item.quantity;
				}, 0);

				// 4. Create the Order
				const order = await tx.order.create({
					data: {
						userId: input.userId,
						businessId: businessId, // Use the determined businessId
						totalAmount: totalAmount,
						shippingAddress: input.shippingAddress,
						paymentMethod: input.paymentMethod,
						status: "PENDING", // Or determine based on payment success?
						paymentStatus: "PENDING", // Or determine based on payment success?
						items: {
							create: itemsForOrder.map((item) => ({
								productId: item.productId,
								// serviceId: item.serviceId, // Add if services are cartable
								variantId: item.variantId,
								quantity: item.quantity,
								price: Number(item.variant?.price || item.product?.price || 0),
							})),
						},
					},
					include: {
						items: true, // Include items in the response
					},
				});

				// 5. Decrement stock for each item
				for (const item of itemsForOrder) {
					if (item.variantId) {
						await tx.productVariant.update({
							where: { id: item.variantId },
							data: { stock: { decrement: item.quantity } },
						});
					} else if (item.productId) {
						await tx.product.update({
							where: { id: item.productId },
							data: { stock: { decrement: item.quantity } },
						});
					}
				}

				// 6. Clear the user's cart
				await tx.cartItem.deleteMany({
					where: { cartId: cart.id },
				});

				// Optional: Update cart status if needed
				// await tx.cart.update({ where: { id: cart.id }, data: { status: 'CHECKOUT_COMPLETED' } });

				// 7. Return the created order
				return order;
			},
			{
				maxWait: 10000, // Optional: Increase transaction timeout if needed
				timeout: 15000, // Optional: Increase transaction timeout if needed
			}
		);
	}

	async getOrderById(orderId: string) {
		try {
			const order = await prisma.order.findUnique({
				where: { id: orderId },
				include: {
					items: {
						include: {
							product: true,
						},
					},
				},
			});
			return order;
		} catch (error) {
			console.error("Error fetching order:", error);
			throw new Error("Failed to fetch order");
		}
	}

	async getUserOrders(userId: string) {
		try {
			const orders = await prisma.order.findMany({
				where: { userId },
				include: {
					items: {
						include: {
							product: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			});
			return orders;
		} catch (error) {
			console.error("Error fetching user orders:", error);
			throw new Error("Failed to fetch user orders");
		}
	}

	async updateOrderStatus(orderId: string, status: string) {
		try {
			const order = await prisma.order.update({
				where: { id: orderId },
				data: { status },
				include: {
					items: {
						include: {
							product: true,
						},
					},
				},
			});
			return order;
		} catch (error) {
			console.error("Error updating order status:", error);
			throw new Error("Failed to update order status");
		}
	}
}
