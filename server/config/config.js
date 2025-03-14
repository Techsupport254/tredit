const { Sequelize } = require("sequelize");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Database Configuration
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 5432;
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "tredit_test";
const USE_SSL = process.env.DB_SSL === "true";

// App Configuration
const appConfig = {
	port: process.env.PORT || 8000,
	env: process.env.NODE_ENV || "production",
	frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
	jwtSecret: process.env.JWT_SECRET || "your-jwt-secret",
	requireAuth: process.env.REQUIRE_AUTH === "true",
};

// CORS Configuration
const corsConfig = {
	origins: ["http://localhost:5173", "https://localhost:5173"],
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
	allowedHeaders: [
		"Content-Type",
		"Authorization",
		"X-Requested-With",
		"Accept",
		"Origin",
	],
	exposedHeaders: ["set-cookie"],
};

// Session Configuration
const sessionConfig = {
	secret: process.env.SESSION_SECRET || "your-secret-key",
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: process.env.NODE_ENV === "production",
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
		sameSite: "lax",
		httpOnly: true,
	},
};

// Blockchain Configuration
const blockchainConfig = {
	USER_PROFILE_CONTRACT_ADDRESS: process.env.USER_PROFILE_CONTRACT_ADDRESS,
	BUSINESS_CONTRACT_ADDRESS: process.env.BUSINESS_CONTRACT_ADDRESS,
	USER_PROFILE_ABI: process.env.USER_PROFILE_ABI,
	BUSINESS_ABI: process.env.BUSINESS_ABI,
	PRIVATE_KEY: process.env.PRIVATE_KEY,
	RPC_URL: process.env.RPC_URL || "https://rpc-amoy.polygon.technology",
	CHAIN_ID: process.env.CHAIN_ID,
	PINATA_API_KEY: process.env.PINATA_API_KEY,
	PINATA_API_SECRET: process.env.PINATA_API_SECRET,
	PINATA_BASE_URL: process.env.PINATA_BASE_URL || "https://api.pinata.cloud",
	PINATA_GATEWAY_URL:
		process.env.PINATA_GATEWAY_URL || "https://gateway.pinata.cloud",
};

// Database Configuration for different environments
const dbConfig = {
	development: {
		username: process.env.DB_USER || "postgres",
		password: process.env.DB_PASSWORD || "postgres",
		database: process.env.DB_NAME || "tredit",
		host: process.env.DB_HOST || "localhost",
		port: process.env.DB_PORT || 5432,
		dialect: "postgres",
		logging: false,
	},
	test: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		dialect: "postgres",
		logging: false,
	},
	production: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		dialect: "postgres",
		logging: false,
	},
};

// Initialize Sequelize with configuration
const env = process.env.NODE_ENV || "development";
const config = dbConfig[env];
const sequelize = new Sequelize(
	config.database,
	config.username,
	config.password,
	{
		host: config.host,
		port: config.port,
		dialect: config.dialect,
		dialectOptions: config.dialectOptions,
		logging: false,
	}
);

module.exports = {
	sequelize,
	appConfig,
	corsConfig,
	sessionConfig,
	blockchainConfig,
	...dbConfig,
};
