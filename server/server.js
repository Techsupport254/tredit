require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const {
	sequelize,
	appConfig,
	corsConfig,
	sessionConfig,
} = require("./config/config");
const setupMiddleware = require("./middleware");
const routes = require("./routes");
const { errorResponse, ResponseCodes } = require("./utils/responseHelper");

// Import models
const { User, Business, BusinessTeamMember } = require("./models");

const app = express();

// Set NODE_ENV to development
process.env.NODE_ENV = "development";

// Middleware
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session(sessionConfig));

// Setup middleware
setupMiddleware(app);

// Mount routes
app.use("/api", routes);

// Global error handler
app.use((err, req, res, next) => {
	console.error("Global error:", err);

	// Default to 500 server error
	const statusCode = err.statusCode || 500;
	const errorCode = err.code || ResponseCodes.INTERNAL_ERROR;
	const message = err.message || "Internal server error";

	res.status(statusCode).json(
		errorResponse(message, errorCode, {
			stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
		})
	);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
	console.error("❌ UNHANDLED REJECTION!", err);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
	console.error("❌ UNCAUGHT EXCEPTION!", err);
	process.exit(1);
});

// Database connection and sync
const connectDB = async () => {
	try {
		await sequelize.authenticate();
		console.log("[DB] Connection to the database established successfully.");

		// Initialize models in order
		console.log("[DB] Starting database sync...");

		// First, sync User model
		await User.sync({ force: false });
		console.log("[DB] User table created");

		// Then sync Business model
		await Business.sync({ force: false });
		console.log("[DB] Business table created");

		// Finally sync BusinessTeamMember model
		await BusinessTeamMember.sync({ force: false });
		console.log("[DB] BusinessTeamMember table created");

		console.log("✅ Database synchronized successfully");
	} catch (error) {
		console.error("[DB] Unable to connect to the database:", error);
		process.exit(1);
	}
};

// Start server
const startServer = async () => {
	try {
		await connectDB();
		app.listen(appConfig.port, () => {
			console.log(`🚀 Server running on port ${appConfig.port}`);
			console.log(`📱 Frontend URL: ${appConfig.frontendUrl}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

startServer();
