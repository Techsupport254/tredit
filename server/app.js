const express = require("express");
const cors = require("cors");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const { db, syncDatabase } = require("./models");
const {
	corsConfig,
	sessionConfig,
	rateLimitConfig,
} = require("./config/config");
const { setupSSE } = require("./utils/sseHelper");
const setupMiddleware = require("./middleware");
const { initializeContracts } = require("./utils/contractHelper");

// Import routes
const routes = require("./routes");
const youtubeRoutes = require("./routes/youtube");
const productRoutes = require("./routes/products");
const servicesRoutes = require("./routes/services");
const socialMediaRoutes = require("./routes/socialMediaRoutes");
const orderRoutes = require("./routes/orders");
const cartRoutes = require("./routes/cart");
const serviceCartRoutes = require("./routes/serviceCart");
const serviceOrderRoutes = require("./routes/serviceOrder");
const teamMemberRoutes = require("./routes/teamMemberRoutes");
const businessRoutes = require("./routes/businessRoutes");
const userRoutes = require("./routes/userRoutes");
const googleRoutes = require("./routes/googleRoutes");
const authRoutes = require("./routes/auth.routes");
const uploadRoutes = require("./routes/uploadRoutes");
const chatRoutes = require("./routes/chat");

const app = express();

// Create rate limiters
const generalLimiter = rateLimit(rateLimitConfig.general);
const authLimiter = rateLimit(rateLimitConfig.auth);
const sensitiveLimiter = rateLimit(rateLimitConfig.sensitive);

// Middleware setup
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));

// Apply general rate limiting to all routes (only if enabled)
if (rateLimitConfig.general.enabled) {
	app.use(generalLimiter);
}

// Apply stricter rate limiting to authentication routes (only if enabled)
if (rateLimitConfig.auth.enabled) {
	app.use("/api/auth", authLimiter);
	app.use("/api/users/wallet-auth", authLimiter);
	app.use("/api/users/register", authLimiter);
	app.use("/api/register", authLimiter);
}

// Apply stricter rate limiting to sensitive operations (only if enabled)
if (rateLimitConfig.sensitive.enabled) {
	app.use("/api/users/delete", sensitiveLimiter);
	app.use("/api/businesses/delete", sensitiveLimiter);
	app.use("/api/orders/cancel", sensitiveLimiter);
	app.use("/api/payment", sensitiveLimiter);
}

// Setup custom middleware
setupMiddleware(app);

// Mount routes
app.use("/api/youtube", youtubeRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/social-media", socialMediaRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/service-carts", serviceCartRoutes);
app.use("/api/service-orders", serviceOrderRoutes);
app.use("/api/team-members", teamMemberRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/users", userRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/register", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", routes);

// Add a simple health check route
app.get("/health", (req, res) => {
	res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// Global error handler
app.use((err, req, res, next) => {
	console.error("Global error:", err);
	res.status(err.statusCode || 500).json({
		success: false,
		message: err.message || "Internal server error",
		code: err.code || "INTERNAL_ERROR",
		details:
			process.env.NODE_ENV === "development" ? { stack: err.stack } : null,
		timestamp: new Date().toISOString(),
	});
});

// Initialize database and sync models
const initializeApp = async () => {
	try {
		await syncDatabase();
		console.log("✅ Database synchronized successfully");

		// Initialize contracts
		await initializeContracts();
		console.log("✅ Contracts initialized successfully");

		return app;
	} catch (error) {
		console.error("Failed to initialize application:", error);
		throw error;
	}
};

// Export the app and initialization function
module.exports = { app, initializeApp };
