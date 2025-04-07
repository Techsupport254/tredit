const {
	ServiceOrder,
	ServiceCart,
	Service,
	Business,
	User,
	ChatSession,
	Message,
} = require("../models");
const { Op } = require("sequelize");

class ServiceOrderController {
	// Create service order from cart
	async create(req, res) {
		try {
			const { cartId } = req.params;
			const { userId } = req;

			const cart = await ServiceCart.findOne({
				where: {
					id: cartId,
					userId,
					status: "active",
				},
				include: [
					{
						model: Service,
						as: "service",
						include: [
							{
								model: Business,
								as: "business",
							},
						],
					},
				],
			});

			if (!cart) {
				return res.status(404).json({
					success: false,
					message: "Service cart not found",
				});
			}

			// Create service order
			const order = await ServiceOrder.create({
				userId,
				businessId: cart.service.businessId,
				serviceId: cart.serviceId,
				serviceCartId: cart.id,
				status: "pending",
				milestones: cart.selectedMilestones.map((m) => ({
					...m,
					status: "pending",
					startDate: null,
					completedDate: null,
				})),
				totalAmount: cart.totalAmount,
				paidAmount: 0,
				remainingAmount: cart.totalAmount,
				currency: cart.currency,
				customizations: cart.customizations,
				requirements: cart.requirements,
				startDate: new Date(),
			});

			// Update cart status
			await cart.update({ status: "converted" });

			// Create or update chat session
			const chatSession = await ChatSession.findOne({
				where: {
					buyerId: userId,
					businessId: cart.service.businessId,
					status: "active",
					metadata: {
						lastServiceOrderId: order.id,
					},
				},
			});

			if (chatSession) {
				await chatSession.update({
					lastMessageAt: new Date(),
					metadata: {
						...chatSession.metadata,
						lastOrderStatus: "pending",
						lastServiceOrderId: order.id,
						lastOrderUpdate: new Date(),
					},
				});

				// Create system message
				await Message.create({
					chatSessionId: chatSession.id,
					senderId: cart.service.business.owner.id,
					senderType: "business",
					content:
						"A new service order has been created and is pending approval.",
					metadata: {
						isSystemMessage: true,
						orderStatus: "pending",
						serviceOrderId: order.id,
						timestamp: new Date(),
					},
				});
			} else {
				// Create new chat session
				const newChatSession = await ChatSession.create({
					buyerId: userId,
					businessId: cart.service.businessId,
					status: "active",
					lastMessageAt: new Date(),
					metadata: {
						lastOrderStatus: "pending",
						lastServiceOrderId: order.id,
						lastOrderUpdate: new Date(),
					},
				});

				// Create welcome message
				await Message.create({
					chatSessionId: newChatSession.id,
					senderId: cart.service.business.owner.id,
					senderType: "business",
					content:
						"Welcome! A new service order has been created and is pending approval.",
					metadata: {
						isSystemMessage: true,
						orderStatus: "pending",
						serviceOrderId: order.id,
						timestamp: new Date(),
					},
				});
			}

			// Reload order with associations
			const fullOrder = await ServiceOrder.findByPk(order.id, {
				include: [
					{
						model: Service,
						as: "service",
						include: [
							{
								model: Business,
								as: "business",
							},
						],
					},
					{
						model: User,
						as: "user",
						attributes: ["id", "name", "email"],
					},
				],
			});

			res.status(201).json({
				success: true,
				data: fullOrder,
			});
		} catch (error) {
			console.error("Error creating service order:", error);
			res.status(500).json({
				success: false,
				message: "Failed to create service order",
				error: error.message,
			});
		}
	}

	// Get all orders for a business
	async getAllByBusiness(req, res) {
		try {
			const { businessId } = req.params;
			const orders = await ServiceOrder.findAll({
				where: { businessId },
				include: [
					{
						model: Service,
						as: "service",
					},
					{
						model: User,
						as: "user",
						attributes: ["id", "name", "email"],
					},
				],
				order: [["createdAt", "DESC"]],
			});

			res.status(200).json({
				success: true,
				data: orders,
			});
		} catch (error) {
			console.error("Error fetching business service orders:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch service orders",
				error: error.message,
			});
		}
	}

	// Get all orders for a user
	async getAllByUser(req, res) {
		try {
			const { userId } = req;
			const orders = await ServiceOrder.findAll({
				where: { userId },
				include: [
					{
						model: Service,
						as: "service",
						include: [
							{
								model: Business,
								as: "business",
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
			console.error("Error fetching user service orders:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch service orders",
				error: error.message,
			});
		}
	}

	// Get single order
	async getOne(req, res) {
		try {
			const { orderId } = req.params;
			const { userId } = req;

			const order = await ServiceOrder.findOne({
				where: {
					id: orderId,
					[Op.or]: [{ userId }, { "$service.business.owner.id$": userId }],
				},
				include: [
					{
						model: Service,
						as: "service",
						include: [
							{
								model: Business,
								as: "business",
								include: [
									{
										model: User,
										as: "owner",
										attributes: ["id"],
									},
								],
							},
						],
					},
					{
						model: User,
						as: "user",
						attributes: ["id", "name", "email"],
					},
				],
			});

			if (!order) {
				return res.status(404).json({
					success: false,
					message: "Service order not found",
				});
			}

			res.status(200).json({
				success: true,
				data: order,
			});
		} catch (error) {
			console.error("Error fetching service order:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch service order",
				error: error.message,
			});
		}
	}

	// Update milestone status
	async updateMilestoneStatus(req, res) {
		try {
			const { orderId, milestoneOrder } = req.params;
			const { status, feedback } = req.body;
			const { userId } = req;

			const order = await ServiceOrder.findOne({
				where: {
					id: orderId,
					[Op.or]: [{ userId }, { "$service.business.owner.id$": userId }],
				},
				include: [
					{
						model: Service,
						as: "service",
						include: [
							{
								model: Business,
								as: "business",
								include: [
									{
										model: User,
										as: "owner",
										attributes: ["id"],
									},
								],
							},
						],
					},
				],
			});

			if (!order) {
				return res.status(404).json({
					success: false,
					message: "Service order not found",
				});
			}

			const milestone = await order.updateMilestoneStatus(
				parseInt(milestoneOrder),
				status,
				feedback
			);

			// Update chat session if exists
			const chatSession = await ChatSession.findOne({
				where: {
					buyerId: order.userId,
					businessId: order.businessId,
					status: "active",
					metadata: {
						lastServiceOrderId: order.id,
					},
				},
			});

			if (chatSession) {
				await chatSession.updateMilestoneContext(
					parseInt(milestoneOrder),
					status,
					"milestone_update"
				);
			}

			res.status(200).json({
				success: true,
				data: {
					milestone,
					order,
				},
			});
		} catch (error) {
			console.error("Error updating milestone status:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update milestone status",
				error: error.message,
			});
		}
	}

	// Update order status
	async updateStatus(req, res) {
		try {
			const { orderId } = req.params;
			const { status, notes } = req.body;
			const { userId } = req;

			const order = await ServiceOrder.findOne({
				where: {
					id: orderId,
					[Op.or]: [{ userId }, { "$service.business.owner.id$": userId }],
				},
				include: [
					{
						model: Service,
						as: "service",
						include: [
							{
								model: Business,
								as: "business",
								include: [
									{
										model: User,
										as: "owner",
										attributes: ["id"],
									},
								],
							},
						],
					},
				],
			});

			if (!order) {
				return res.status(404).json({
					success: false,
					message: "Service order not found",
				});
			}

			await order.update({ status });

			// Update chat session if exists
			const chatSession = await ChatSession.findOne({
				where: {
					buyerId: order.userId,
					businessId: order.businessId,
					status: "active",
					metadata: {
						lastServiceOrderId: order.id,
					},
				},
			});

			if (chatSession) {
				await chatSession.update({
					lastMessageAt: new Date(),
					metadata: {
						...chatSession.metadata,
						lastOrderStatus: status,
						lastServiceOrderId: order.id,
						lastOrderUpdate: new Date(),
					},
				});

				// Create system message
				await Message.create({
					chatSessionId: chatSession.id,
					senderId: order.service.business.owner.id,
					senderType: "business",
					content: `Service order status has been updated to ${status}. ${
						notes || ""
					}`,
					metadata: {
						isSystemMessage: true,
						orderStatus: status,
						serviceOrderId: order.id,
						timestamp: new Date(),
					},
				});
			}

			res.status(200).json({
				success: true,
				data: order,
			});
		} catch (error) {
			console.error("Error updating order status:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update order status",
				error: error.message,
			});
		}
	}

	// Add payment to order
	async addPayment(req, res) {
		try {
			const { orderId } = req.params;
			const { amount, milestoneOrder } = req.body;
			const { userId } = req;

			const order = await ServiceOrder.findOne({
				where: {
					id: orderId,
					userId,
				},
			});

			if (!order) {
				return res.status(404).json({
					success: false,
					message: "Service order not found",
				});
			}

			// Update paid amount and remaining amount
			const paidAmount = parseFloat(order.paidAmount) + parseFloat(amount);
			const remainingAmount = parseFloat(order.totalAmount) - paidAmount;

			// Update milestone payment status if specified
			if (milestoneOrder) {
				const milestones = [...order.milestones];
				const milestone = milestones.find((m) => m.order === milestoneOrder);
				if (milestone) {
					milestone.isPaid = true;
					milestone.paidAt = new Date();
				}
				await order.update({
					milestones,
					paidAmount,
					remainingAmount,
				});
			} else {
				await order.update({
					paidAmount,
					remainingAmount,
				});
			}

			res.status(200).json({
				success: true,
				data: order,
			});
		} catch (error) {
			console.error("Error adding payment to order:", error);
			res.status(500).json({
				success: false,
				message: "Failed to add payment",
				error: error.message,
			});
		}
	}
}

module.exports = new ServiceOrderController();
