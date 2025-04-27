import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { setupSocketServer } from "./socket";

let io: SocketIOServer | null = null;

export function initSocketServer(server: NetServer): SocketIOServer {
  if (!io) {
    io = new SocketIOServer(server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    setupSocketServer(io);
  }

  return io;
} 