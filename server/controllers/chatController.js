const { db } = require("../models");
const { Op } = require("sequelize");
const rateLimit = require("express-rate-limit");

// Rate limiting middleware
const messageRateLimit = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 30, // 30 messages per minute
	message: "Too many messages sent. Please try again later.",
});

class ChatController {
	// Get or create chat session
	async getOrCreateChatSession(req, res) {
		try {
			const { businessId } = req.params;
			const userId = req.user.id;

			// Check if business exists
			const business = await db.Business.findByPk(businessId);
			if (!business) {
				return res.status(404).json({
					success: false,
					message: "Business not found",
				});
			}

			// Find or create chat session
			let chatSession = await db.ChatSession.findOne({
				where: {
					buyerId: userId,
					businessId,
					status: "active",
				},
			});

			if (!chatSession) {
				chatSession = await db.ChatSession.create({
					buyerId: userId,
					businessId,
					status: "active",
					metadata: {
						lastOrderId: null,
						lastOrderStatus: null,
						lastOrderUpdate: null,
					},
				});
			}

			// Get messages for this chat session
			const messages = await db.Message.findAll({
				where: { chatSessionId: chatSession.id },
				order: [["createdAt", "ASC"]],
			});

			return res.json({
				success: true,
				data: {
					chatSession,
					messages,
				},
			});
		} catch (error) {
			console.error("Error in getOrCreateChatSession:", error);
			res.status(500).json({
				success: false,
				message: "Failed to get or create chat session",
				error: error.message,
			});
		}
	}

	// Send message
	async sendMessage(req, res) {
		try {
			const { chatSessionId } = req.params;
			const { content, metadata } = req.body;
			const userId = req.user.id;

			// Validate message content
			if (!content || content.trim().length === 0) {
				return res.status(400).json({
					success: false,
					message: "Message content cannot be empty",
				});
			}

			if (content.length > 5000) {
				return res.status(400).json({
					success: false,
					message: "Message content cannot exceed 5000 characters",
				});
			}

			// Find chat session
			const chatSession = await db.ChatSession.findByPk(chatSessionId, {
				include: [
					{
						model: db.Business,
						as: "business",
						include: [
							{
								model: db.User,
								as: "owner",
							},
							{
								model: db.BusinessTeamMember,
								as: "teamMembers",
								include: [
									{
										model: db.User,
										as: "user",
									},
								],
							},
						],
					},
				],
			});

			if (!chatSession) {
				return res.status(404).json({
					success: false,
					message: "Chat session not found",
				});
			}

			// Check chat session status
			if (chatSession.status !== "active") {
				return res.status(403).json({
					success: false,
					message: "Cannot send messages to an inactive chat session",
				});
			}

			// Verify user is either the buyer or a business team member
			const isBuyer = chatSession.buyerId === userId;
			const isBusinessOwner = chatSession.business.owner.id === userId;
			const isTeamMember = chatSession.business.teamMembers.some(
				(member) => member.user.id === userId
			);

			if (!isBuyer && !isBusinessOwner && !isTeamMember) {
				return res.status(403).json({
					success: false,
					message: "You are not authorized to send messages in this chat",
				});
			}

			// Create message with transaction to handle concurrent messages
			const message = await db.Message.create({
				chatSessionId,
				senderId: userId,
				senderType: isBuyer ? "buyer" : "business",
				content,
				metadata,
			});

			// Update chat session's last message timestamp
			await chatSession.update({
				lastMessageAt: new Date(),
			});

			// Fetch message with sender details
			const messageWithSender = await db.Message.findByPk(message.id, {
				include: [
					{
						model: db.User,
						as: "sender",
						attributes: ["id", "name", "email"],
					},
				],
			});

			res.status(201).json({
				success: true,
				data: messageWithSender,
			});
		} catch (error) {
			console.error("Error in sendMessage:", error);
			res.status(500).json({
				success: false,
				message: "Failed to send message",
				error: error.message,
			});
		}
	}

	// Get chat history with pagination
	async getChatHistory(req, res) {
		try {
			const { chatSessionId } = req.params;
			const { page = 1, limit = 50 } = req.query;
			const userId = req.user.id;

			const offset = (page - 1) * limit;

			const chatSession = await db.ChatSession.findByPk(chatSessionId, {
				include: [
					{
						model: db.Message,
						as: "messages",
						include: [
							{
								model: db.User,
								as: "sender",
								attributes: ["id", "name", "email"],
							},
						],
						order: [["createdAt", "DESC"]],
						limit: parseInt(limit),
						offset: parseInt(offset),
					},
					{
						model: db.Business,
						as: "business",
						include: [
							{
								model: db.User,
								as: "owner",
							},
							{
								model: db.BusinessTeamMember,
								as: "teamMembers",
								include: [
									{
										model: db.User,
										as: "user",
									},
								],
							},
						],
					},
				],
			});

			if (!chatSession) {
				return res.status(404).json({
					success: false,
					message: "Chat session not found",
				});
			}

			// Verify user is either the buyer or a business team member
			const isBuyer = chatSession.buyerId === userId;
			const isBusinessOwner = chatSession.business.owner.id === userId;
			const isTeamMember = chatSession.business.teamMembers.some(
				(member) => member.user.id === userId
			);

			if (!isBuyer && !isBusinessOwner && !isTeamMember) {
				return res.status(403).json({
					success: false,
					message: "You are not authorized to view this chat",
				});
			}

			res.status(200).json({
				success: true,
				data: {
					chatSession,
					pagination: {
						total: await db.Message.count({
							where: { chatSessionId },
						}),
						page: parseInt(page),
						limit: parseInt(limit),
						totalPages: Math.ceil(
							(await db.Message.count({
								where: { chatSessionId },
							})) / limit
						),
					},
				},
			});
		} catch (error) {
			console.error("Error in getChatHistory:", error);
			res.status(500).json({
				success: false,
				message: "Failed to get chat history",
				error: error.message,
			});
		}
	}

	// Mark messages as read
	async markMessagesAsRead(req, res) {
		try {
			const { chatSessionId } = req.params;
			const userId = req.user.id;

			const chatSession = await db.ChatSession.findByPk(chatSessionId, {
				include: [
					{
						model: db.Business,
						as: "business",
						include: [
							{
								model: db.User,
								as: "owner",
							},
							{
								model: db.BusinessTeamMember,
								as: "teamMembers",
								include: [
									{
										model: db.User,
										as: "user",
									},
								],
							},
						],
					},
				],
			});

			if (!chatSession) {
				return res.status(404).json({
					success: false,
					message: "Chat session not found",
				});
			}

			// Verify user is either the buyer or a business team member
			const isBuyer = chatSession.buyerId === userId;
			const isBusinessOwner = chatSession.business.owner.id === userId;
			const isTeamMember = chatSession.business.teamMembers.some(
				(member) => member.user.id === userId
			);

			if (!isBuyer && !isBusinessOwner && !isTeamMember) {
				return res.status(403).json({
					success: false,
					message: "You are not authorized to mark messages as read",
				});
			}

			// Get unread messages
			const unreadMessages = await db.Message.findAll({
				where: {
					chatSessionId,
					senderId: {
						[Op.ne]: userId,
					},
					isRead: false,
				},
			});

			// Update messages and readBy array
			await Promise.all(
				unreadMessages.map(async (message) => {
					const readBy = [...message.readBy, userId];
					await message.update({
						isRead: true,
						readBy,
					});
				})
			);

			res.status(200).json({
				success: true,
				message: "Messages marked as read",
			});
		} catch (error) {
			console.error("Error in markMessagesAsRead:", error);
			res.status(500).json({
				success: false,
				message: "Failed to mark messages as read",
				error: error.message,
			});
		}
	}

	// Update chat session when cart is converted to order
	async updateChatSessionForOrder(req, res) {
		try {
			const { chatSessionId } = req.params;
			const { orderId } = req.body;
			const userId = req.user.id;

			const chatSession = await db.ChatSession.findByPk(chatSessionId, {
				include: [
					{
						model: db.Business,
						as: "business",
						include: [
							{
								model: db.User,
								as: "owner",
							},
							{
								model: db.BusinessTeamMember,
								as: "teamMembers",
								include: [
									{
										model: db.User,
										as: "user",
									},
								],
							},
						],
					},
				],
			});

			if (!chatSession) {
				return res.status(404).json({
					success: false,
					message: "Chat session not found",
				});
			}

			// Verify user is either the buyer or a business team member
			const isBuyer = chatSession.buyerId === userId;
			const isBusinessOwner = chatSession.business.owner.id === userId;
			const isTeamMember = chatSession.business.teamMembers.some(
				(member) => member.user.id === userId
			);

			if (!isBuyer && !isBusinessOwner && !isTeamMember) {
				return res.status(403).json({
					success: false,
					message: "You are not authorized to update this chat session",
				});
			}

			// Verify order exists and belongs to the correct business
			const order =
				chatSession.cartType === "product"
					? await db.Order.findOne({
							where: {
								id: orderId,
								businessId: chatSession.businessId,
							},
					  })
					: await db.ServiceOrder.findOne({
							where: {
								id: orderId,
								businessId: chatSession.businessId,
							},
					  });

			if (!order) {
				return res.status(404).json({
					success: false,
					message: "Order not found or does not belong to this business",
				});
			}

			// Update chat session with order ID while preserving cart ID
			await chatSession.update({
				orderId,
				lastMessageAt: new Date(), // Update last message timestamp
			});

			res.status(200).json({
				success: true,
				message: "Chat session updated with order ID",
				data: {
					chatSessionId: chatSession.id,
					cartId: chatSession.cartId,
					orderId: chatSession.orderId,
					status: chatSession.status,
				},
			});
		} catch (error) {
			console.error("Error in updateChatSessionForOrder:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update chat session",
				error: error.message,
			});
		}
	}
}

module.exports = new ChatController();
