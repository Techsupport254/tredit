require("dotenv").config();
const express = require("express");
const {
	connectDB,
	createDatabaseIfNotExists,
	sequelize,
} = require("./config/database");
const config = require("./config/app.config");
const setupMiddleware = require("./middleware");
const routes = require("./routes");

// Import models
const User = require("./models/User");
const UserLoginHistory = require("./models/UserLoginHistory");

const app = express();

// Setup middleware
setupMiddleware(app);

// Initialize associations
const initializeAssociations = () => {
	User.hasMany(UserLoginHistory, {
		foreignKey: "userAddress",
		sourceKey: "walletAddress",
		as: "loginHistory",
	});

	UserLoginHistory.belongsTo(User, {
		foreignKey: "userAddress",
		targetKey: "walletAddress",
	});

	console.log("✅ Model associations initialized");
};

// Mount routes
app.use("/api", routes);

// Start server
const startServer = async () => {
	try {
		await createDatabaseIfNotExists();
		await connectDB();

		// Initialize model associations
		initializeAssociations();

		// Sync all models
		await sequelize.sync();
		console.log("✅ Database synchronized successfully");

		app.listen(config.app.port, () => {
			console.log(`🚀 Server running on port ${config.app.port}`);
			console.log(`📱 Frontend URL: ${config.app.frontendUrl}`);
		});
	} catch (error) {
		console.error("❌ Server startup error:", error);
		process.exit(1);
	}
};

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
	console.error("❌ UNCAUGHT EXCEPTION! Shutting down...");
	console.error(err.name, err.message);
	process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
	console.error("❌ UNHANDLED REJECTION! Shutting down...");
	console.error(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});

startServer();
