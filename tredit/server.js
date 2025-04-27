import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient, Prisma } from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

// Store connected users
const connectedUsers = new Map();

app.prepare().then(() => {
	const server = createServer((req, res) => {
		// Handle Socket.IO requests
		if (req.url?.startsWith("/api/socket")) {
			res.setHeader(
				"Access-Control-Allow-Origin",
				process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
			);
			res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
			res.setHeader(
				"Access-Control-Allow-Headers",
				"Content-Type, Authorization"
			);
			res.setHeader("Access-Control-Allow-Credentials", "true");

			if (req.method === "OPTIONS") {
				res.writeHead(200);
				res.end();
				return;
			}
		}

		handle(req, res);
	});

	const io = new Server(server, {
		path: "/api/socket",
		addTrailingSlash: false,
		cors: {
			origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
			methods: ["GET", "POST", "OPTIONS"],
			credentials: true,
			allowedHeaders: ["Content-Type", "Authorization"],
		},
		transports: ["polling"],
		allowEIO3: true,
		pingTimeout: 60000,
		pingInterval: 25000,
		upgradeTimeout: 30000,
		allowUpgrades: false,
		perMessageDeflate: false,
		httpCompression: {
			threshold: 2048,
		},
		connectTimeout: 45000,
		rememberUpgrade: true,
		rejectUnauthorized: false,
	});

	// Handle WebSocket upgrade
	server.on("upgrade", (request, socket, head) => {
		if (request.url?.startsWith("/api/socket")) {
			io.engine.handleUpgrade(request, socket, head);
		} else {
			socket.destroy();
		}
	});

	// Socket connection handling
	io.on("connection", async (socket) => {
		console.log("[Socket Server] Client connected:", socket.id);

		// Handle user authentication
		socket.on("authenticate", async (data) => {
			try {
				if (!data.userId) {
					socket.emit("error", { message: "User ID is required" });
					return;
				}

				// Store user connection
				connectedUsers.set(data.userId, {
					socketId: socket.id,
					connectedAt: new Date(),
					businesses: [],
				});

				// Update user's online status
				await prisma.user.update({
					where: { id: data.userId },
					data: { isOnline: true },
				});

				// Join user's business rooms
				const userBusinesses = await prisma.businessTeamMember.findMany({
					where: { userId: data.userId },
					select: { businessId: true },
				});

				// Store user's businesses
				connectedUsers.get(data.userId).businesses = userBusinesses.map(
					(b) => b.businessId
				);

				userBusinesses.forEach((business) => {
					socket.join(`business:${business.businessId}`);
				});

				// Broadcast user's online status to their businesses
				userBusinesses.forEach((business) => {
					io.to(`business:${business.businessId}`).emit("userStatus", {
						userId: data.userId,
						isOnline: true,
					});
				});

				// Emit list of connected users to the newly connected user
				socket.emit(
					"connectedUsers",
					Array.from(connectedUsers.entries()).map(([userId, data]) => ({
						userId,
						socketId: data.socketId,
						connectedAt: data.connectedAt,
						businesses: data.businesses,
					}))
				);

				// Broadcast new user connection to all connected users
				io.emit("userConnected", {
					userId: data.userId,
					socketId: socket.id,
					connectedAt: new Date(),
					businesses: userBusinesses.map((b) => b.businessId),
				});

				socket.emit("authenticated");
			} catch (error) {
				console.error("[Socket Server] Authentication error:", error);
				socket.emit("error", { message: "Authentication failed" });
			}
		});

		// Handle get connected users request
		socket.on("getConnectedUsers", () => {
			const users = Array.from(connectedUsers.entries()).map(
				([userId, data]) => ({
					userId,
					socketId: data.socketId,
					connectedAt: data.connectedAt,
					businesses: data.businesses,
				})
			);
			socket.emit("connectedUsers", users);
		});

		// Handle new messages
		socket.on("send_message", async (data) => {
			console.log("[Socket Server] Received message data:", data);
			try {
				// Destructure attachment data from the payload
				const { chatSessionId, senderId, content, type, attachment } = data;

				// Prepare base message data
				const messageCreateData = {
					chatSession: { connect: { id: chatSessionId } },
					sender: { connect: { id: senderId } },
					type,
					status: "SENT",
					direction: "OUTGOING",
					contentBlocks: {
						create: [
							{
								type: type === "FILE" ? "TEXT" : type, // Store filename as text for FILE
								content,
								order: 0,
							},
						],
					},
					metadata: {},
				};

				// If it's a FILE message and attachment data exists, create the attachment record
				if (type === "FILE" && attachment) {
					messageCreateData.attachments = {
						create: [
							{
								type: attachment.type,
								url: attachment.url,
								filename: attachment.filename,
								size: attachment.size,
								metadata: { ipfsHash: attachment.ipfsHash }, // Store IPFS hash in metadata
							},
						],
					};
				}

				console.log(
					"[Socket Server] Creating message with data:",
					messageCreateData
				);

				// Create message in database
				const message = await prisma.message.create({
					data: messageCreateData,
					// Include necessary relations for broadcasting
					include: {
						sender: {
							select: {
								id: true,
								name: true,
								profileImage: true,
							},
						},
						contentBlocks: true,
						attachments: true, // Ensure attachments are included in the returned object
					},
				});

				console.log("[Socket Server] Message created successfully:", message);

				// Emit message status update to sender
				socket.emit("message_status", {
					messageId: message.id,
					status: "SENT",
				});

				// Broadcast message to chat room
				io.to(`chat:${chatSessionId}`).emit("new_message", message);
				console.log(
					"[Socket Server] Message broadcasted to room:",
					`chat:${chatSessionId}`
				);

				// Update message status to DELIVERED after a short delay
				setTimeout(async () => {
					await prisma.message.update({
						where: { id: message.id },
						data: { status: "DELIVERED" },
					});

					io.to(`chat:${chatSessionId}`).emit("message_status", {
						messageId: message.id,
						status: "DELIVERED",
					});
					console.log("[Socket Server] Message status updated to DELIVERED");
				}, 1000);
			} catch (error) {
				console.error("[Socket Server] Message handling error:", error);
				console.error("[Socket Server] Error details:", {
					name: error.name,
					message: error.message,
					stack: error.stack,
				});
				socket.emit("error", {
					message: "Failed to send message",
					error: error.message,
				});
			}
		});

		// Handle message read status
		socket.on("message_read", async (data) => {
			try {
				const { messageId, chatSessionId } = data;

				await prisma.message.update({
					where: { id: messageId },
					data: { status: "READ" },
				});

				io.to(`chat:${chatSessionId}`).emit("message_status", {
					messageId,
					status: "READ",
				});
			} catch (error) {
				console.error("[Socket Server] Message read status error:", error);
			}
		});

		// Handle disconnection
		socket.on("disconnect", async () => {
			console.log("[Socket Server] Client disconnected:", socket.id);

			// Find and remove disconnected user
			for (const [userId, data] of connectedUsers.entries()) {
				if (data.socketId === socket.id) {
					// Update user's online status
					await prisma.user.update({
						where: { id: userId },
						data: { isOnline: false },
					});

					// Broadcast user's offline status to their businesses
					data.businesses.forEach((businessId) => {
						io.to(`business:${businessId}`).emit("userStatus", {
							userId,
							isOnline: false,
						});
					});

					// Remove user from connected users
					connectedUsers.delete(userId);

					// Broadcast user disconnection to all connected users
					io.emit("userDisconnected", {
						userId,
						socketId: socket.id,
					});

					break;
				}
			}
		});

		// Handle errors
		socket.on("error", (error) => {
			console.error("[Socket Server] Socket error:", error);
		});
	});

	// Handle server errors
	server.on("error", (error) => {
		console.error("[Socket Server] Server error:", error);
	});

	const PORT = process.env.PORT || 3000;
	server.listen(PORT, (err) => {
		if (err) throw err;
		console.log(`> Ready on http://localhost:${PORT}`);
	});
});
