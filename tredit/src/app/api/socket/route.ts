import { NextResponse } from "next/server";
import { Server as NetServer } from "http";
import { initSocketServer } from "@/lib/socket-server";

export async function GET(req: Request) {
	try {
		console.log("[Socket API] GET request received", {
			url: req.url,
			headers: Object.fromEntries(req.headers.entries()),
			method: req.method,
		});

		const res = new NextResponse();
		const server = res.socket?.server as NetServer;

		if (!server) {
			console.error("[Socket API] Server not available");
			return new NextResponse("Server not available", { status: 500 });
		}

		// Check if server is listening
		if (!server.listening) {
			console.error("[Socket API] Server is not listening");
			return new NextResponse("Server is not listening", { status: 500 });
		}

		// Check server address
		const address = server.address();
		if (!address) {
			console.error("[Socket API] Server has no address");
			return new NextResponse("Server has no address", { status: 500 });
		}

		console.log("[Socket API] Server details:", {
			address,
			listening: server.listening,
			maxConnections: server.maxConnections,
			timeout: server.timeout,
			keepAliveTimeout: server.keepAliveTimeout,
			headersTimeout: server.headersTimeout,
		});

		const io = initSocketServer(server);
		if (!io) {
			console.error("[Socket API] Socket server initialization failed");
			return new NextResponse("Socket server initialization failed", {
				status: 500,
			});
		}

		server.io = io;

		console.log("[Socket API] GET request successful");
		return new NextResponse("Socket server initialized", { status: 200 });
	} catch (error) {
		console.error("[Socket API] Error:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

export async function OPTIONS(req: Request) {
	console.log("[Socket API] OPTIONS request received", {
		url: req.url,
		headers: Object.fromEntries(req.headers.entries()),
		method: req.method,
	});

	return new NextResponse(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Credentials": "true",
		},
	});
}
