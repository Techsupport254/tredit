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

// CORS configuration
const allowedOrigins = [
	"http://localhost:5173",
	"https://localhost:5173",
	process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
	cors({
		origin: function (origin, callback) {
			// Allow requests with no origin (like mobile apps or curl requests)
			if (!origin) return callback(null, true);

			if (allowedOrigins.indexOf(origin) === -1) {
				const msg =
					"The CORS policy for this site does not allow access from the specified Origin.";
				return callback(new Error(msg), false);
			}
			return callback(null, true);
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
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
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/stores", require("./routes/storeRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/social", require("./routes/socialRoutes"));

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
