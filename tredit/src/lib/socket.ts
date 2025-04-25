"use client";

import { io, Socket } from "socket.io-client";

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
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			timeout: 20000,
			autoConnect: true,
			forceNew: true,
			withCredentials: true,
		});

		// Add basic event listeners
		socket.on("connect", () => {
			console.log("Socket connected");
		});

		socket.on("disconnect", (reason) => {
			console.log("Socket disconnected:", reason);
		});

		socket.on("connect_error", (error) => {
			console.error("Socket connection error:", error);
		});
	}

	return socket;
};
