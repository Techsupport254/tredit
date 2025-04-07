require("dotenv").config();
const { app, initializeApp } = require("./app");
const http = require("http");

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
	console.error("❌ UNHANDLED REJECTION!", err);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
	console.error("❌ UNCAUGHT EXCEPTION!", err);
	if (err.code !== "EADDRINUSE") {
		process.exit(1);
	}
});

// Start server
const PORT = process.env.PORT || 8000;

const startServer = async () => {
	try {
		await initializeApp();

		// Create HTTP server
		const server = http.createServer(app);

		// Handle server errors
		server.on("error", (error) => {
			if (error.code === "EADDRINUSE") {
				const newPort = parseInt(PORT) + 1;
				if (newPort < 65536) {
					console.log(`⚠️ Port ${PORT} is in use, trying ${newPort}...`);
					server.listen(newPort);
				} else {
					console.error("❌ No available ports found!");
					process.exit(1);
				}
			} else {
				console.error("Server error:", error);
				process.exit(1);
			}
		});

		// Start listening
		server.listen(PORT, () => {
			const actualPort = server.address().port;
			console.log(`🚀 Server running on port ${actualPort}`);
			console.log(`📱 Frontend URL: http://localhost:5173`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

startServer();
