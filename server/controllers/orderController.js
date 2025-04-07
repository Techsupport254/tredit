const { sequelize } = require("../models");
const {
	Order,
	OrderItem,
	ProductCart,
	ProductCartItem,
	Product,
	ProductVariant,
	Service,
	Business,
	ChatSession,
	Message,
	BusinessTeamMember,
	User,
} = sequelize.models;
const { generateOrderNumber } = require("../utils/orderUtils");
const { Op } = require("sequelize");

// System user ID for system-generated messages
const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000";

class OrderController {
	// Create a new order
	async create(req, res) {
		const t = await sequelize.transaction();

		try {
			const { userId, businessId } = req.params;
			const {
				items,
				shippingAddress,
				billingAddress,
				paymentMethod,
				notes,
				currency = "USD",
			} = req.body;

			// Validate items exist and have stock
			const itemsWithDetails = await Promise.all(
				items.map(async (item) => {
					const product = await Product.findByPk(item.productId);
					if (!product) {
						throw new Error(`Product ${item.productId} not found`);
					}

					let variant = null;
					if (item.variantId) {
						variant = await ProductVariant.findByPk(item.variantId);
						if (!variant) {
							throw new Error(`Variant ${item.variantId} not found`);
						}
						if (variant.stockQuantity < item.quantity) {
							throw new Error(
								`Insufficient stock for variant ${item.variantId}`
							);
						}
					} else if (product.stockQuantity < item.quantity) {
						throw new Error(`Insufficient stock for product ${item.productId}`);
					}

					return {
						...item,
						product,
						variant,
						unitPrice: variant ? variant.price : product.price,
					};
				})
			);

			// Calculate totals
			let subtotal = 0;
			let tax = 0;
			let shippingCost = 0;
			let discount = 0;

			itemsWithDetails.forEach((item) => {
				const itemSubtotal = item.unitPrice * item.quantity;
				subtotal += itemSubtotal;
				tax += (itemSubtotal * (item.product.taxRate || 0)) / 100;
				shippingCost += item.product.shippingCost || 0;
			});

			const totalAmount = subtotal + tax + shippingCost - discount;

			// Create order
			const order = await Order.create(
				{
					userId,
					businessId,
					totalAmount,
					status: "pending",
					paymentStatus: "pending",
					shippingAddress,
					billingAddress,
					items,
					metadata: {},
				},
				{ transaction: t }
			);

			// Create order items
			await Promise.all(
				itemsWithDetails.map(async (item) => {
					const orderItem = await OrderItem.create(
						{
							orderId: order.id,
							productId: item.productId,
							variantId: item.variantId,
							quantity: item.quantity,
							unitPrice: item.unitPrice,
							subtotal: item.unitPrice * item.quantity,
							tax:
								(item.unitPrice * item.quantity * (item.product.taxRate || 0)) /
								100,
							isService: item.product.isService || false,
							serviceDate: item.serviceDate,
							serviceDuration: item.serviceDuration,
							customizations: item.customizations,
						},
						{ transaction: t }
					);

					// Update inventory
					if (item.variantId) {
						await item.variant.decrement("stockQuantity", {
							by: item.quantity,
							transaction: t,
						});
					}
					// Skip product stock quantity update since it's not a real field
					// and stock is managed through variants

					return orderItem;
				})
			);

			await t.commit();

			// Fetch complete order with items
			const completeOrder = await Order.findByPk(order.id, {
				include: [{ model: OrderItem, as: "items" }],
			});

			res.status(201).json({
				success: true,
				data: completeOrder,
			});
		} catch (error) {
			await t.rollback();
			console.error("Error creating order:", error);
			res.status(500).json({
				success: false,
				message: "Failed to create order",
				error: error.message,
			});
		}
	}

	// Get all orders for a business
	async getAllByBusiness(req, res) {
		try {
			const { businessId } = req.params;
			const { status, startDate, endDate } = req.query;

			const where = { businessId };

			if (status) {
				where.status = status;
			}

			if (startDate && endDate) {
				where.createdAt = {
					[Op.between]: [new Date(startDate), new Date(endDate)],
				};
			}

			const orders = await Order.findAll({
				where,
				include: [
					{
						model: OrderItem,
						as: "items",
						include: [
							{
								model: Product,
								as: "product",
							},
						],
					},
				],
				order: [["createdAt", "DESC"]],
			});

			res.status(200).json({
				success: true,
				data: orders,
			});
		} catch (error) {
			console.error("Error fetching orders:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch orders",
				error: error.message,
			});
		}
	}

	// Get user's orders
	async getUserOrders(req, res) {
		try {
			const { userId } = req.params;
			const orders = await Order.findAll({
				where: { userId },
				include: [
					{
						model: OrderItem,
						as: "items",
						include: [
							{
								model: Product,
								as: "product",
							},
						],
					},
				],
				order: [["createdAt", "DESC"]],
			});

			res.status(200).json({
				success: true,
				data: orders,
			});
		} catch (error) {
			console.error("Error fetching user orders:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch user orders",
				error: error.message,
			});
		}
	}

	// Get order details
	async getOrderDetails(req, res) {
		try {
			const { orderId } = req.params;
			const order = await Order.findByPk(orderId, {
				include: [
					{
						model: OrderItem,
						as: "items",
						include: [
							{
								model: Product,
								as: "product",
							},
						],
					},
				],
			});

			if (!order) {
				return res.status(404).json({
					success: false,
					message: "Order not found",
				});
			}

			res.status(200).json({
				success: true,
				data: order,
			});
		} catch (error) {
			console.error("Error fetching order details:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch order details",
				error: error.message,
			});
		}
	}

	// Get order timeline
	async getOrderTimeline(req, res) {
		try {
			const { orderId } = req.params;
			const order = await Order.findByPk(orderId);

			if (!order) {
				return res.status(404).json({
					success: false,
					message: "Order not found",
				});
			}

			const timeline = [
				{
					date: order.createdAt,
					status: "Order created",
					details: "Order was placed",
				},
				{
					date: order.updatedAt,
					status: order.status,
					details: `Order status updated to ${order.status}`,
				},
			];

			res.status(200).json({
				success: true,
				data: timeline,
			});
		} catch (error) {
			console.error("Error fetching order timeline:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch order timeline",
				error: error.message,
			});
		}
	}

	// Update order status
	async updateStatus(req, res) {
		try {
			const { orderId } = req.params;
			const { status, notes, securityKey } = req.body;
			const userId = req.user.id;

			const transaction = await sequelize.transaction();

			try {
				// Find the order
				const order = await Order.findByPk(orderId, {
					transaction,
				});

				if (!order) {
					await transaction.rollback();
					return res.status(404).json({
						success: false,
						message: "Order not found",
					});
				}

				// Validate order status transition
				const validTransitions = {
					pending: ["processing", "cancelled"],
					processing: ["shipped", "cancelled"],
					shipped: ["delivered"],
					delivered: ["disputed"],
					disputed: ["resolved"],
					resolved: ["closed"],
					cancelled: [],
					closed: [],
				};

				if (!validTransitions[order.status]?.includes(status)) {
					await transaction.rollback();
					return res.status(400).json({
						success: false,
						message: `Invalid status transition from ${order.status} to ${status}`,
					});
				}

				// Check user authorization based on status
				const isBuyer = order.userId === userId;
				const teamMember = await BusinessTeamMember.findOne({
					where: {
						businessId: order.businessId,
						userId: userId,
						status: "active",
					},
					include: [
						{
							model: User,
							as: "user",
							attributes: ["id", "name", "email"],
						},
					],
					transaction,
				});

				// Only buyer can set status to disputed
				if (status === "disputed") {
					if (!isBuyer) {
						await transaction.rollback();
						return res.status(403).json({
							success: false,
							message: "Only the buyer can mark an order as disputed",
						});
					}
				} else {
					// All other status updates require business team member
					if (!teamMember) {
						await transaction.rollback();
						return res.status(403).json({
							success: false,
							message: "Only business team members can update order status",
						});
					}
				}

				// Generate security key if order is being shipped
				let generatedSecurityKey = null;
				if (status === "shipped") {
					// Generate a 6-digit security key
					generatedSecurityKey = Math.floor(
						100000 + Math.random() * 900000
					).toString();

					// Update order metadata with security key while preserving existing metadata
					const metadata = { ...order.metadata } || {};
					metadata.securityKey = {
						key: generatedSecurityKey,
						generatedAt: new Date(),
						verified: false,
						verifiedAt: null,
					};

					// Update using Sequelize
					await order.update(
						{
							metadata,
							status,
							notes: notes || `Order status updated to ${status}`,
						},
						{ transaction }
					);

					// Force reload to get the updated data
					await order.reload({ transaction });
				}

				// Verify security key if updating to delivered
				if (status === "delivered") {
					const metadata = order.metadata || {};

					if (!metadata.securityKey || !metadata.securityKey.key) {
						await transaction.rollback();
						return res.status(400).json({
							success: false,
							message: "No security key found for this order",
						});
					}

					const storedKey = metadata.securityKey.key;

					if (metadata.securityKey.verified) {
						await transaction.rollback();
						return res.status(400).json({
							success: false,
							message: "Security key has already been verified",
						});
					}

					if (!securityKey || storedKey !== securityKey) {
						await transaction.rollback();
						return res.status(400).json({
							success: false,
							message: "Invalid security key",
						});
					}

					// Only business team members can verify delivery
					if (!teamMember) {
						await transaction.rollback();
						return res.status(403).json({
							success: false,
							message: "Only business team members can verify order delivery",
						});
					}

					// Update security key verification status with verifier details
					const updatedMetadata = {
						...metadata,
						securityKey: {
							...metadata.securityKey,
							verified: true,
							verifiedAt: new Date(),
							verifiedBy: {
								userId: teamMember.userId,
								name: teamMember.user.name,
								role: teamMember.role,
								verifiedAt: new Date(),
							},
						},
					};

					// Update using Sequelize
					await order.update(
						{
							metadata: updatedMetadata,
							status,
							notes: notes || `Order status updated to ${status}`,
						},
						{ transaction }
					);

					// Force reload to get the updated data
					await order.reload({ transaction });
				}

				// Find the chat session for this order's business and buyer
				const chatSession = await ChatSession.findOne({
					where: {
						buyerId: order.userId,
						businessId: order.businessId,
						status: "active",
					},
					include: [
						{
							model: Business,
							as: "business",
							include: [
								{
									model: User,
									as: "owner",
								},
							],
						},
					],
					transaction,
				});

				// If no chat session exists, create one
				if (!chatSession) {
					const newChatSession = await ChatSession.create(
						{
							buyerId: order.userId,
							businessId: order.businessId,
							status: "active",
							metadata: {
								lastOrderId: order.id,
								lastOrderStatus: status,
								lastOrderUpdate: new Date(),
							},
						},
						{ transaction }
					);

					// Send the system message in the new chat session
					let systemMessage = "";
					switch (status) {
						case "processing":
							systemMessage =
								"Your order has been approved and is now being processed.";
							break;
						case "shipped":
							systemMessage = `Your order has been shipped. ${notes || ""}`;
							if (generatedSecurityKey) {
								systemMessage += `\n\nYour security key for order verification is: ${generatedSecurityKey}\nPlease keep this key safe and share it with the delivery person when receiving your order.`;
							}
							break;
						case "delivered":
							systemMessage = "Your order has been marked as delivered.";
							break;
						case "cancelled":
							systemMessage = `Order has been cancelled. ${notes || ""}`;
							break;
						case "disputed":
							systemMessage = `A dispute has been opened for this order. ${
								notes || ""
							}`;
							break;
						case "resolved":
							systemMessage = `The dispute for this order has been resolved. ${
								notes || ""
							}`;
							break;
						default:
							systemMessage = `Order status has been updated to ${status}. ${
								notes || ""
							}`;
					}

					// Create system message using system user ID
					await Message.create(
						{
							chatSessionId: newChatSession.id,
							senderId: SYSTEM_USER_ID,
							senderType: "system",
							content: systemMessage,
							metadata: {
								isSystemMessage: true,
								orderStatus: status,
								orderId: order.id,
								timestamp: new Date(),
								...(generatedSecurityKey && {
									securityKey: generatedSecurityKey,
								}),
							},
						},
						{ transaction }
					);

					// Update chat session's last message timestamp
					await newChatSession.update(
						{
							lastMessageAt: new Date(),
						},
						{ transaction }
					);
				} else {
					// Send the system message in the existing chat session
					let systemMessage = "";
					switch (status) {
						case "processing":
							systemMessage =
								"Your order has been approved and is now being processed.";
							break;
						case "shipped":
							systemMessage = `Your order has been shipped. ${notes || ""}`;
							if (generatedSecurityKey) {
								systemMessage += `\n\nYour security key for order verification is: ${generatedSecurityKey}\nPlease keep this key safe and share it with the delivery person when receiving your order.`;
							}
							break;
						case "delivered":
							systemMessage = "Your order has been marked as delivered.";
							break;
						case "cancelled":
							systemMessage = `Order has been cancelled. ${notes || ""}`;
							break;
						case "disputed":
							systemMessage = `A dispute has been opened for this order. ${
								notes || ""
							}`;
							break;
						case "resolved":
							systemMessage = `The dispute for this order has been resolved. ${
								notes || ""
							}`;
							break;
						default:
							systemMessage = `Order status has been updated to ${status}. ${
								notes || ""
							}`;
					}

					// Create system message using system user ID
					await Message.create(
						{
							chatSessionId: chatSession.id,
							senderId: SYSTEM_USER_ID,
							senderType: "system",
							content: systemMessage,
							metadata: {
								isSystemMessage: true,
								orderStatus: status,
								orderId: order.id,
								timestamp: new Date(),
								...(generatedSecurityKey && {
									securityKey: generatedSecurityKey,
								}),
							},
						},
						{ transaction }
					);

					// Update chat session's last message timestamp and metadata
					await chatSession.update(
						{
							lastMessageAt: new Date(),
							metadata: {
								...chatSession.metadata,
								lastOrderId: order.id,
								lastOrderStatus: status,
								lastOrderUpdate: new Date(),
							},
						},
						{ transaction }
					);
				}

				await transaction.commit();

				// Fetch the updated order with all its data
				const updatedOrder = await Order.findByPk(orderId, {
					include: [
						{
							model: OrderItem,
							as: "items",
							include: [
								{
									model: Product,
									as: "product",
								},
							],
						},
					],
				});

				res.json({
					success: true,
					data: updatedOrder,
				});
			} catch (error) {
				await transaction.rollback();
				throw error;
			}
		} catch (error) {
			console.error("Error in updateStatus:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update order status",
				error: error.message,
			});
		}
	}

	// Cancel order
	async cancel(req, res) {
		try {
			const { orderId } = req.params;
			const order = await Order.findByPk(orderId);

			if (!order) {
				return res.status(404).json({
					success: false,
					message: "Order not found",
				});
			}

			if (order.status === "cancelled") {
				return res.status(400).json({
					success: false,
					message: "Order is already cancelled",
				});
			}

			await order.update({ status: "cancelled" });

			res.status(200).json({
				success: true,
				data: order,
			});
		} catch (error) {
			console.error("Error cancelling order:", error);
			res.status(500).json({
				success: false,
				message: "Failed to cancel order",
				error: error.message,
			});
		}
	}

	// Create order from cart
	async createFromCart(req, res) {
		let t;
		try {
			t = await sequelize.transaction();

			const { cartId } = req.params;
			const cart = await sequelize.models.ProductCart.findByPk(cartId, {
				include: [
					{
						model: sequelize.models.ProductCartItem,
						as: "items",
						include: [
							{
								model: sequelize.models.Product,
								as: "product",
							},
							{
								model: sequelize.models.ProductVariant,
								as: "variant",
							},
						],
					},
					{
						model: sequelize.models.Business,
						as: "business",
					},
				],
				transaction: t,
			});

			if (!cart) {
				await t.rollback();
				return res.status(404).json({
					success: false,
					message: "Cart not found",
				});
			}

			if (cart.status !== "active") {
				await t.rollback();
				return res.status(400).json({
					success: false,
					message: "Cart is not active",
				});
			}

			// Check if cart has items
			if (!cart.items || cart.items.length === 0) {
				await t.rollback();
				return res.status(400).json({
					success: false,
					message: "Cannot create order with empty cart",
				});
			}

			// Validate that all items have variants and sufficient stock
			for (const item of cart.items) {
				if (!item.variantId || !item.variant) {
					await t.rollback();
					return res.status(400).json({
						success: false,
						message: "All items must have a variant selected",
					});
				}

				if (item.variant.stockQuantity < item.quantity) {
					await t.rollback();
					return res.status(400).json({
						success: false,
						message: `Insufficient stock for variant ${item.variant.name} of product ${item.product.name}`,
					});
				}
			}

			// Convert string shipping address to object if needed
			let shippingAddress = cart.shippingAddress;
			if (!shippingAddress) {
				await t.rollback();
				return res.status(400).json({
					success: false,
					message: "Shipping address is required",
				});
			}

			// Generate order number
			const orderNumber = await generateOrderNumber();

			// Create order with cart metadata
			const order = await sequelize.models.Order.create(
				{
					userId: cart.userId,
					businessId: cart.businessId,
					cartId: cart.id,
					orderNumber,
					subtotal: cart.subtotal,
					tax: cart.tax,
					shippingCost: cart.shippingCost,
					discount: cart.discount,
					totalAmount: cart.totalAmount,
					status: "pending",
					paymentStatus: "pending",
					shippingAddress,
					currency: cart.currency,
					estimatedDeliveryDate: cart.estimatedDeliveryDate,
					metadata: {
						cart: {
							id: cart.id,
							status: cart.status,
							createdAt: cart.createdAt,
							updatedAt: cart.updatedAt,
							items: cart.items.map((item) => ({
								id: item.id,
								productId: item.productId,
								variantId: item.variantId,
								quantity: item.quantity,
								unitPrice: item.unitPrice,
								subtotal: item.subtotal,
								product: {
									id: item.product.id,
									name: item.product.name,
									description: item.product.description,
									price: item.product.price,
									currency: item.product.currency,
									stockQuantity: item.product.stockQuantity,
									images: item.product.images,
									metadata: item.product.metadata,
								},
								variant: item.variant
									? {
											id: item.variant.id,
											name: item.variant.name,
											sku: item.variant.sku,
											price: item.variant.price,
											stockQuantity: item.variant.stockQuantity,
											metadata: item.variant.metadata,
									  }
									: null,
							})),
						},
					},
				},
				{ transaction: t }
			);

			// Create order items
			await Promise.all(
				cart.items.map(async (item) => {
					const orderItem = await sequelize.models.OrderItem.create(
						{
							orderId: order.id,
							productId: item.productId,
							variantId: item.variantId,
							quantity: item.quantity,
							unitPrice: item.unitPrice,
							subtotal: item.subtotal,
							tax:
								typeof item.tax === "object"
									? ((item.tax.rate || 0) * item.subtotal) / 100
									: item.tax,
							isService: item.product.isService || false,
							serviceDate: item.serviceDate,
							serviceDuration: item.serviceDuration,
							customizations: item.customizations,
						},
						{ transaction: t }
					);

					// Update inventory
					if (item.variantId) {
						await item.variant.decrement("stockQuantity", {
							by: item.quantity,
							transaction: t,
						});
					}

					return orderItem;
				})
			);

			// Clear cart items but keep the cart record
			await sequelize.models.ProductCartItem.destroy({
				where: { cartId },
				transaction: t,
			});

			// Reset cart totals
			await cart.update(
				{
					status: "active", // Keep cart active for future items
					subtotal: 0,
					tax: 0,
					shippingCost: 0,
					discount: 0,
					totalAmount: 0,
					items: [], // Clear items array
				},
				{ transaction: t }
			);

			await t.commit();

			// Fetch complete order with items
			const completeOrder = await sequelize.models.Order.findByPk(order.id, {
				include: [{ model: sequelize.models.OrderItem, as: "items" }],
			});

			// Handle chat session and messages outside the transaction
			try {
				// Update chat session with order ID
				const chatSession = await sequelize.models.ChatSession.findOne({
					where: {
						buyerId: cart.userId,
						businessId: cart.businessId,
						status: "active",
					},
				});

				if (chatSession) {
					await chatSession.update({
						lastMessageAt: new Date(),
						metadata: {
							...chatSession.metadata,
							lastOrderStatus: "pending",
							lastOrderId: order.id,
							lastOrderUpdate: new Date(),
						},
					});

					// Create system message
					await sequelize.models.Message.create({
						chatSessionId: chatSession.id,
						senderId: SYSTEM_USER_ID,
						senderType: "system",
						content: "A new order has been created and is pending approval.",
						metadata: {
							isSystemMessage: true,
							orderStatus: "pending",
							orderId: order.id,
							timestamp: new Date(),
						},
					});
				} else {
					// Create new chat session
					const newChatSession = await sequelize.models.ChatSession.create({
						buyerId: cart.userId,
						businessId: cart.businessId,
						status: "active",
						lastMessageAt: new Date(),
						metadata: {
							lastOrderStatus: "pending",
							lastOrderId: order.id,
							lastOrderUpdate: new Date(),
						},
					});

					// Create welcome message
					await sequelize.models.Message.create({
						chatSessionId: newChatSession.id,
						senderId: SYSTEM_USER_ID,
						senderType: "system",
						content:
							"Welcome! A new order has been created and is pending approval.",
						metadata: {
							isSystemMessage: true,
							orderStatus: "pending",
							orderId: order.id,
							timestamp: new Date(),
						},
					});
				}
			} catch (chatError) {
				console.error("Error creating chat session or message:", chatError);
				// Don't fail the order creation if chat fails
			}

			res.status(201).json({
				success: true,
				data: completeOrder,
			});
		} catch (error) {
			console.error("Error creating order from cart:", error);
			if (t) await t.rollback();
			res.status(500).json({
				success: false,
				message: "Failed to create order from cart",
				error: error.message,
			});
		}
	}
}

module.exports = new OrderController();
