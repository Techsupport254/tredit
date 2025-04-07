const { Server } = require("socket.io");
const {
	ChatSession,
	Message,
	User,
	Business,
	BusinessTeamMember,
} = require("../models");
const { Op } = require("sequelize");

class SocketService {
	constructor() {
		this.io = null;
		this.connectedUsers = new Map(); // Map to store connected users and their socket IDs
		this.userChatSessions = new Map(); // Map to store user's active chat sessions
		this.messageRateLimits = new Map(); // Map to store message rate limits per user
		this.reconnectionAttempts = new Map(); // Map to store reconnection attempts
		this.MAX_RECONNECTION_ATTEMPTS = 3;
		this.RECONNECTION_TIMEOUT = 5000; // 5 seconds
		this.MAX_MESSAGE_SIZE = 5000; // 5KB
		this.RATE_LIMIT_WINDOW = 60000; // 1 minute
		this.MAX_MESSAGES_PER_WINDOW = 30;
	}

	initialize(server) {
		this.io = new Server(server, {
			cors: {
				origin: process.env.CLIENT_URL || "http://localhost:3000",
				methods: ["GET", "POST"],
			},
			pingTimeout: 60000,
			pingInterval: 25000,
		});

		this.io.on("connection", (socket) => {
			console.log("User connected:", socket.id);

			// Handle user authentication
			socket.on("authenticate", async (userId) => {
				try {
					// Check for existing connection
					const existingSocketId = this.connectedUsers.get(userId);
					if (existingSocketId) {
						// Disconnect existing socket if it exists
						const existingSocket =
							this.io.sockets.sockets.get(existingSocketId);
						if (existingSocket) {
							existingSocket.disconnect(true);
						}
					}

					// Set new connection
					this.connectedUsers.set(userId, socket.id);
					console.log("User authenticated:", userId);

					// Reset reconnection attempts
					this.reconnectionAttempts.delete(userId);

					// Check if user is a business owner or team member
					const businessOwner = await Business.findOne({
						where: { ownerId: userId },
					});

					const teamMemberships = await BusinessTeamMember.findAll({
						where: { userId },
						include: [
							{
								model: Business,
								as: "business",
							},
						],
					});

					// If user is a business owner, join their business room
					if (businessOwner) {
						const businessRoom = `business_${businessOwner.id}`;
						socket.join(businessRoom);
						console.log(
							`User ${userId} joined business room ${businessRoom} as owner`
						);
					}

					// If user is a team member, join all their business rooms
					if (teamMemberships.length > 0) {
						teamMemberships.forEach((membership) => {
							const businessRoom = `business_${membership.businessId}`;
							socket.join(businessRoom);
							console.log(
								`User ${userId} joined business room ${businessRoom} as team member`
							);
						});
					}
				} catch (error) {
					console.error("Authentication error:", error);
					socket.emit("error", {
						message: "Authentication failed",
						error: error.message,
					});
				}
			});

			// Handle joining a chat session
			socket.on("join_chat", async (chatSessionId) => {
				try {
					const userId = Array.from(this.connectedUsers.entries()).find(
						([_, socketId]) => socketId === socket.id
					)?.[0];

					if (!userId) {
						throw new Error("User not authenticated");
					}

					// Verify chat session exists and user has access
					const chatSession = await ChatSession.findByPk(chatSessionId, {
						include: [
							{
								model: Business,
								as: "business",
								include: [
									{
										model: User,
										as: "owner",
									},
									{
										model: BusinessTeamMember,
										as: "teamMembers",
										include: [
											{
												model: User,
												as: "user",
											},
										],
									},
								],
							},
						],
					});

					if (!chatSession) {
						throw new Error("Chat session not found");
					}

					// Verify user has access to the chat
					const isBuyer = chatSession.buyerId === userId;
					const isBusinessOwner = chatSession.business.owner.id === userId;
					const isTeamMember = chatSession.business.teamMembers.some(
						(member) => member.user.id === userId
					);

					if (!isBuyer && !isBusinessOwner && !isTeamMember) {
						throw new Error("Unauthorized access to chat session");
					}

					// Join the chat room
					socket.join(chatSessionId);

					const userSessions = this.userChatSessions.get(userId) || new Set();
					userSessions.add(chatSessionId);
					this.userChatSessions.set(userId, userSessions);

					// Notify others in the chat
					socket.to(chatSessionId).emit("user_joined", {
						chatSessionId,
						userId,
					});
				} catch (error) {
					console.error("Error joining chat:", error);
					socket.emit("error", {
						message: "Failed to join chat",
						error: error.message,
					});
				}
			});

			// Handle leaving a chat session
			socket.on("leave_chat", (chatSessionId) => {
				socket.leave(chatSessionId);
				const userId = Array.from(this.connectedUsers.entries()).find(
					([_, socketId]) => socketId === socket.id
				)?.[0];

				if (userId) {
					const userSessions = this.userChatSessions.get(userId) || new Set();
					userSessions.delete(chatSessionId);
					this.userChatSessions.set(userId, userSessions);

					// Notify others in the chat
					socket.to(chatSessionId).emit("user_left", {
						chatSessionId,
						userId,
					});
				}
			});

			// Handle sending a message
			socket.on("send_message", async (data) => {
				try {
					const { chatSessionId, content, metadata } = data;
					const userId = Array.from(this.connectedUsers.entries()).find(
						([_, socketId]) => socketId === socket.id
					)?.[0];

					if (!userId) {
						throw new Error("User not authenticated");
					}

					// Validate message content
					if (!content || content.trim().length === 0) {
						throw new Error("Message content cannot be empty");
					}

					if (content.length > this.MAX_MESSAGE_SIZE) {
						throw new Error("Message content exceeds maximum size");
					}

					// Check rate limit
					const now = Date.now();
					const userRateLimit = this.messageRateLimits.get(userId) || {
						count: 0,
						windowStart: now,
					};

					if (now - userRateLimit.windowStart > this.RATE_LIMIT_WINDOW) {
						userRateLimit.count = 0;
						userRateLimit.windowStart = now;
					}

					if (userRateLimit.count >= this.MAX_MESSAGES_PER_WINDOW) {
						throw new Error("Rate limit exceeded. Please try again later.");
					}

					userRateLimit.count++;
					this.messageRateLimits.set(userId, userRateLimit);

					// Verify chat session exists and is active
					const chatSession = await ChatSession.findByPk(chatSessionId, {
						include: [
							{
								model: Business,
								as: "business",
								include: [
									{
										model: User,
										as: "owner",
									},
									{
										model: BusinessTeamMember,
										as: "teamMembers",
										include: [
											{
												model: User,
												as: "user",
											},
										],
									},
								],
							},
						],
					});

					if (!chatSession) {
						throw new Error("Chat session not found");
					}

					if (chatSession.status !== "active") {
						throw new Error("Cannot send messages to an inactive chat session");
					}

					// Determine sender type and recipients
					const isBuyer = chatSession.buyerId === userId;
					const isBusinessOwner = chatSession.business.owner.id === userId;
					const isTeamMember = chatSession.business.teamMembers.some(
						(member) => member.user.id === userId
					);

					if (!isBuyer && !isBusinessOwner && !isTeamMember) {
						throw new Error(
							"You are not authorized to send messages in this chat"
						);
					}

					// Create message in database
					const message = await Message.create({
						chatSessionId,
						senderId: userId,
						senderType: isBuyer ? "buyer" : "business",
						content,
						metadata,
					});

					// Update chat session's last message timestamp
					await ChatSession.update(
						{ lastMessageAt: new Date() },
						{ where: { id: chatSessionId } }
					);

					// Fetch message with sender details
					const messageWithSender = await Message.findByPk(message.id, {
						include: [
							{
								model: User,
								as: "sender",
								attributes: ["id", "name", "email"],
							},
						],
					});

					// Create a business room if it doesn't exist
					const businessRoom = `business_${chatSession.businessId}`;

					// Send message to the business room
					this.io.to(businessRoom).emit("message_received", {
						messageId: message.id,
						chatSessionId,
						senderId: userId,
						senderType: message.senderType,
						content,
						metadata,
						createdAt: message.createdAt,
					});

					// If sender is a buyer, also send to their personal socket
					if (isBuyer) {
						socket.emit("message_received", {
							messageId: message.id,
							chatSessionId,
							senderId: userId,
							senderType: message.senderType,
							content,
							metadata,
							createdAt: message.createdAt,
						});
					}
				} catch (error) {
					console.error("Error sending message:", error);
					socket.emit("error", {
						message: "Failed to send message",
						error: error.message,
					});
				}
			});

			// Handle marking messages as read
			socket.on("mark_read", async (data) => {
				const { chatSessionId, messageId } = data;
				const userId = Array.from(this.connectedUsers.entries()).find(
					([_, socketId]) => socketId === socket.id
				)?.[0];

				if (!userId) {
					return;
				}

				try {
					const message = await Message.findByPk(messageId);
					if (message) {
						const readBy = [...message.readBy, userId];
						await message.update({
							isRead: true,
							readBy,
						});

						// Broadcast read status to all users in the chat session
						this.io.to(chatSessionId).emit("message_read", {
							messageId,
							chatSessionId,
							readBy,
						});
					}
				} catch (error) {
					console.error("Error marking message as read:", error);
					socket.emit("error", {
						message: "Failed to mark message as read",
						error: error.message,
					});
				}
			});

			// Handle disconnection
			socket.on("disconnect", () => {
				const userId = Array.from(this.connectedUsers.entries()).find(
					([_, socketId]) => socketId === socket.id
				)?.[0];

				if (userId) {
					this.connectedUsers.delete(userId);
					const userSessions = this.userChatSessions.get(userId) || new Set();

					// Notify all chat sessions that user has left
					userSessions.forEach((chatSessionId) => {
						socket.to(chatSessionId).emit("user_left", {
							chatSessionId,
							userId,
						});
					});

					this.userChatSessions.delete(userId);
				}

				console.log("User disconnected:", socket.id);
			});
		});
	}

	// Helper method to get socket ID for a user
	getUserSocketId(userId) {
		return this.connectedUsers.get(userId);
	}

	// Helper method to get all users in a chat session
	getChatSessionUsers(chatSessionId) {
		const users = [];
		this.userChatSessions.forEach((sessions, userId) => {
			if (sessions.has(chatSessionId)) {
				users.push(userId);
			}
		});
		return users;
	}

	// Helper method to emit event to specific user
	emitToUser(userId, event, data) {
		const socketId = this.getUserSocketId(userId);
		if (socketId) {
			this.io.to(socketId).emit(event, data);
		}
	}

	// Helper method to emit event to all users in a chat session
	emitToChatSession(chatSessionId, event, data) {
		this.io.to(chatSessionId).emit(event, data);
	}
}

module.exports = new SocketService();
