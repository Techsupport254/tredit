import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
	// Create HTTP server
	const httpServer = createServer(handler);

	// Initialize Socket.IO server
	const io = new Server(httpServer, {
		path: "/api/socket",
		addTrailingSlash: false,
		cors: {
			origin: "*",
			methods: ["GET", "POST", "OPTIONS"],
			credentials: true,
		},
		transports: ["websocket", "polling"],
		pingTimeout: 60000,
		pingInterval: 25000,
		connectTimeout: 45000,
		allowUpgrades: true,
		perMessageDeflate: {
			threshold: 2048,
		},
		cookie: {
			name: "io",
			path: "/",
			httpOnly: true,
			sameSite: "lax",
		},
	});

	// Store active chat rooms
	const activeChats = new Map();

	// Handle Socket.IO connections
	io.on("connection", (socket) => {
		console.log("[Socket Server] Client connected:", {
			socketId: socket.id,
			transport: socket.conn.transport.name,
		});

		// Handle joining a chat room
		socket.on("join_chat", async ({ chatSessionId, userId, businessId }) => {
			try {
				// Join the socket to the chat room
				socket.join(chatSessionId);

				// Store user info in the chat room
				if (!activeChats.has(chatSessionId)) {
					activeChats.set(chatSessionId, new Set());
				}
				activeChats.get(chatSessionId).add(userId);

				console.log("[Socket Server] User joined chat:", {
					chatSessionId,
					userId,
					businessId,
					activeUsers: activeChats.get(chatSessionId).size,
				});
			} catch (error) {
				console.error("[Socket Server] Error joining chat:", error);
			}
		});

		// Handle leaving a chat room
		socket.on("leave_chat", ({ chatSessionId, userId, businessId }) => {
			try {
				// Leave the socket from the chat room
				socket.leave(chatSessionId);

				// Remove user from active users
				if (activeChats.has(chatSessionId)) {
					activeChats.get(chatSessionId).delete(userId);
					if (activeChats.get(chatSessionId).size === 0) {
						activeChats.delete(chatSessionId);
					}
				}

				console.log("[Socket Server] User left chat:", {
					chatSessionId,
					userId,
					businessId,
					activeUsers: activeChats.get(chatSessionId)?.size || 0,
				});
			} catch (error) {
				console.error("[Socket Server] Error leaving chat:", error);
			}
		});

		// Handle sending messages
		socket.on("send_message", async (messageData) => {
			try {
				// Save message to database
				const message = await prisma.message.create({
					data: {
						content: messageData.content,
						senderId: messageData.senderId,
						receiverId: messageData.receiverId,
						chatSessionId: messageData.chatSessionId,
						type: messageData.type,
						status: messageData.status,
					},
				});

				// Broadcast message to all users in the chat room
				io.to(messageData.chatSessionId).emit("new_message", message);

				// Update message status to delivered
				await prisma.message.update({
					where: { id: message.id },
					data: { status: "DELIVERED" },
				});

				// Notify sender about message status
				socket.emit("message_status", message.id, "DELIVERED");

				console.log("[Socket Server] Message sent:", {
					messageId: message.id,
					chatSessionId: messageData.chatSessionId,
				});
			} catch (error) {
				console.error("[Socket Server] Error sending message:", error);
				socket.emit("error", "Failed to send message");
			}
		});

		// Handle typing indicators
		socket.on("typing", ({ chatSessionId, userId, isTyping }) => {
			try {
				// Broadcast typing status to all users in the chat room except the sender
				socket.to(chatSessionId).emit("typing", { userId, isTyping });
			} catch (error) {
				console.error("[Socket Server] Error handling typing:", error);
			}
		});

		socket.on("disconnect", (reason) => {
			console.log("[Socket Server] Client disconnected:", {
				socketId: socket.id,
				reason,
			});
		});

		socket.on("error", (error) => {
			console.error("[Socket Server] Socket error:", {
				socketId: socket.id,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		});
	});

	// Handle server errors
	httpServer.once("error", (err) => {
		console.error("[Server] Error:", err);
		process.exit(1);
	});

	// Start the server
	httpServer.listen(port, () => {
		console.log(`> Ready on http://${hostname}:${port}`);
	});
});
