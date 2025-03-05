const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();
const {
	connectDB,
	createDatabaseIfNotExists,
	sequelize,
} = require("./config/database");

// Import models
const User = require("./models/User");
const Store = require("./models/Store");
const SocialAccount = require("./models/SocialAccount");
const UserLoginHistory = require("./models/UserLoginHistory");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
	cors({
		origin: ["http://localhost:5173", "https://localhost:5173"],
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

// Health check endpoint
app.get("/api/health", async (req, res) => {
	try {
		// Check database connection
		await sequelize.authenticate();

		res.json({
			success: true,
			message: "Server is healthy",
			timestamp: new Date().toISOString(),
			database: "connected",
		});
	} catch (error) {
		console.error("Health check failed:", error);
		res.status(503).json({
			success: false,
			message: "Server is unhealthy",
			error: error.message,
			timestamp: new Date().toISOString(),
		});
	}
});

// Session configuration
app.use(
	session({
		secret: process.env.SESSION_SECRET || "your-secret-key",
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV === "production",
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		},
	})
);

// Initialize associations
const initializeAssociations = () => {
	// User has many stores
	User.hasMany(Store, {
		foreignKey: "userId",
		as: "stores",
	});

	// Store belongs to User
	Store.belongsTo(User, {
		foreignKey: "userId",
		as: "user",
	});

	// User has many social accounts
	User.hasMany(SocialAccount, {
		foreignKey: "userId",
		as: "socialAccounts",
	});

	// Social account belongs to User
	SocialAccount.belongsTo(User, {
		foreignKey: "userId",
		as: "user",
	});

	// User has many login history entries
	User.hasMany(UserLoginHistory, {
		foreignKey: "userId",
		as: "loginHistory",
	});

	// Login history belongs to User
	UserLoginHistory.belongsTo(User, {
		foreignKey: "userId",
		as: "user",
	});

	console.log("✅ Model associations initialized");
};

// Routes
const userRoutes = require("./routes/userRoutes");
const storeRoutes = require("./routes/storeRoutes");
const socialRoutes = require("./routes/socialRoutes");

app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/social", socialRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		success: false,
		error: err.message || "Something went wrong!",
	});
});

const PORT = process.env.PORT || 5000;

// Ensure database is created, then sync models and start server
const startServer = async () => {
	try {
		await createDatabaseIfNotExists();
		await connectDB();

		// Initialize model associations
		initializeAssociations();

		// Sync all models
		await sequelize.sync();

		console.log("✅ Database synchronized successfully");

		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
			console.log(
				`📱 Frontend URL: ${
					process.env.FRONTEND_URL || "http://localhost:5173"
				}`
			);
		});
	} catch (error) {
		console.error("❌ Server startup error:", error);
		process.exit(1);
	}
};

startServer();
