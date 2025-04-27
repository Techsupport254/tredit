"use client";

import { io, Socket } from "socket.io-client";
import { Server } from "socket.io";
import prisma from "./prisma";

let socket: Socket | null = null;

export const getSocket = () => {
	if (typeof window === "undefined") {
		return null;
	}

	if (!socket) {
		socket = io(window.location.origin, {
			path: "/api/socket",
			addTrailingSlash: false,
			transports: ["polling", "websocket"],
			reconnection: true,
			reconnectionAttempts: Infinity,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			timeout: 20000,
			autoConnect: true,
			withCredentials: true,
			upgrade: true,
			rememberUpgrade: true,
			rejectUnauthorized: false,
		});

		// Add basic event listeners
		socket.on("connect", () => {
			console.log("[Socket Client] Connected to server");
		});

		socket.on("disconnect", (reason) => {
			console.log("[Socket Client] Disconnected from server:", reason);
		});

		socket.on("connect_error", (error) => {
			console.error("[Socket Client] Connection error:", error);
		});

		socket.on("error", (error) => {
			console.error("[Socket Client] Socket error:", error);
		});

		// Add message status event listener
		socket.on("message_status_update", (data) => {
			console.log("[Socket Client] Message status update:", data);
		});

		// Add reconnection event listeners
		socket.on("reconnect_attempt", (attemptNumber) => {
			console.log("[Socket Client] Reconnection attempt:", attemptNumber);
		});

		socket.on("reconnect", (attemptNumber) => {
			console.log(
				"[Socket Client] Reconnected after",
				attemptNumber,
				"attempts"
			);
		});

		socket.on("reconnect_error", (error) => {
			console.error("[Socket Client] Reconnection error:", error);
		});

		socket.on("reconnect_failed", () => {
			console.error("[Socket Client] Failed to reconnect");
		});

		// Add user status event listeners
		socket.on("userConnected", (user) => {
			console.log("[Socket Client] User connected:", user);
		});

		socket.on("userDisconnected", (user) => {
			console.log("[Socket Client] User disconnected:", user);
		});

		socket.on("userStatus", (data) => {
			console.log("[Socket Client] User status changed:", data);
		});

		socket.on("connectedUsers", (users) => {
			console.log("[Socket Client] Connected users:", users);
		});
	}

	return socket;
};

export function setupSocketServer(io: Server) {
	io.on("connection", (socket) => {
		// Join user room
		socket.on("join_user_room", ({ userId }) => {
			if (userId) {
				socket.join(userId);
				console.log(`Socket ${socket.id} joined user room: ${userId}`);
			}
		});

		// Send message to user room
		socket.on("send_message", async (messageData) => {
			try {
				const message = await prisma.message.create({
					data: {
						...messageData,
						status: "SENDING",
						contentBlocks: [
							{
								type: "TEXT",
								content: messageData.content,
								order: 0,
							},
						],
					},
					include: {
						sender: {
							select: {
								id: true,
								name: true,
								profileImage: true,
							},
						},
					},
				});

				// Emit message status update to sender
				socket.emit("message_status_update", {
					messageId: message.id,
					status: "SENDING",
					tempId: messageData._tempId,
				});

				// Broadcast message to user room (recipient)
				const messageWithTempId = {
					...message,
					metadata: {
						...(typeof message.metadata === "object" &&
						message.metadata !== null
							? message.metadata
							: {}),
						_tempId: messageData._tempId,
					},
				};
				if (messageData.receiverId) {
					io.to(messageData.receiverId).emit("new_message", messageWithTempId);
				}
				// Optionally, also emit to sender's room
				if (messageData.senderId) {
					io.to(messageData.senderId).emit("new_message", messageWithTempId);
				}

				// Update message status to SENT
				await prisma.message.update({
					where: { id: message.id },
					data: { status: "SENT" },
				});

				socket.emit("message_status_update", {
					messageId: message.id,
					status: "SENT",
					tempId: messageData._tempId,
				});

				// Update message status to DELIVERED after a short delay
				setTimeout(async () => {
					await prisma.message.update({
						where: { id: message.id },
						data: { status: "DELIVERED" },
					});

					if (messageData.receiverId) {
						io.to(messageData.receiverId).emit("message_status_update", {
							messageId: message.id,
							status: "DELIVERED",
							tempId: messageData._tempId,
						});
					}
				}, 1000);
			} catch (error) {
				console.error("Error sending message:", error);
				socket.emit("error", { message: "Failed to send message" });
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

				io.to(`chat:${chatSessionId}`).emit("message_status_update", {
					messageId,
					status: "READ",
				});
			} catch (error) {
				console.error("Message read status error:", error);
			}
		});

		// Handle disconnection
		socket.on("disconnect", () => {
			// Update team member status
			// Implementation depends on your user tracking system
		});
	});
}
