const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { Sequelize } = require("sequelize");

// Database Configuration
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 5432;
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASS || "";
const DB_NAME = process.env.DB_NAME || "tredit_test";
const USE_SSL = process.env.DB_SSL === "true";

// App Configuration
const appConfig = {
	port: process.env.PORT || 8000,
	env: process.env.NODE_ENV || "development",
	frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
	jwtSecret: process.env.JWT_SECRET || "your-jwt-secret",
	requireAuth: process.env.REQUIRE_AUTH === "true",
	enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== "false",
};

// Rate Limiting Configuration
const rateLimitConfig = {
	// General API rate limit
	general: {
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // Limit each IP to 100 requests per window
		standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
		legacyHeaders: false, // Disable the `X-RateLimit-*` headers
		enabled:
			process.env.NODE_ENV !== "development" &&
			process.env.ENABLE_RATE_LIMITING !== "false",
		message: {
			success: false,
			message: "Too many requests, please try again later",
			code: "RATE_LIMIT_EXCEEDED",
		},
	},
	// Stricter limit for authentication endpoints
	auth: {
		windowMs: 60 * 60 * 1000, // 1 hour
		max: 20, // Limit each IP to 20 authentication attempts per hour for testing (was 5)
		standardHeaders: true,
		legacyHeaders: false,
		enabled:
			process.env.NODE_ENV !== "development" &&
			process.env.ENABLE_RATE_LIMITING !== "false",
		message: {
			success: false,
			error: "Too many authentication attempts, please try again later",
			code: "AUTH_RATE_LIMIT_EXCEEDED",
		},
	},
	// Stricter limit for sensitive operations
	sensitive: {
		windowMs: 60 * 60 * 1000, // 1 hour
		max: 10, // Limit each IP to 10 sensitive operations per hour
		standardHeaders: true,
		legacyHeaders: false,
		enabled:
			process.env.NODE_ENV !== "development" &&
			process.env.ENABLE_RATE_LIMITING !== "false",
		message: {
			success: false,
			error: "Too many sensitive operations, please try again later",
			code: "SENSITIVE_RATE_LIMIT_EXCEEDED",
		},
	},
};

// CORS Configuration
const corsConfig = {
	origin: process.env.FRONTEND_URL || "http://localhost:5173",
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
	userProfileContract:
		process.env.USER_PROFILE_CONTRACT_ADDRESS ||
		"0x1E8C8a7ff284a97f3B131661Ea6548DFBfb21366",
	businessContract:
		process.env.BUSINESS_CONTRACT_ADDRESS ||
		"0xaBF8E588Ea9A791ec4b861Ba80688d817c658A62",
	disputeContract:
		process.env.DISPUTE_CONTRACT_ADDRESS ||
		"0x6b403f5B5726C79B8b5e144ff9979F6feB9E1884",
	paymentContract:
		process.env.PAYMENT_CONTRACT_ADDRESS ||
		"0x383970b2416b4d9a5c02dfcfc261a48b39b2bce9",
	escrowContract:
		process.env.ESCROW_CONTRACT_ADDRESS ||
		"0x6b403f5B5726C79B8b5e144ff9979F6feB9E1884",
	userProfileAbi: process.env.USER_PROFILE_ABI,
	businessAbi: process.env.BUSINESS_ABI,
	disputeAbi: process.env.DISPUTE_ABI,
	paymentAbi: require("../artifacts/contracts/Payment.sol/Payment.json").abi,
	escrowAbi: process.env.ESCROW_ABI,
	privateKey: process.env.PRIVATE_KEY,
	rpcUrl: process.env.RPC_URL || "https://rpc-amoy.polygon.technology",
	chainId: process.env.CHAIN_ID,
	pinataApiKey: process.env.PINATA_API_KEY,
	pinataApiSecret: process.env.PINATA_API_SECRET,
	pinataBaseUrl: process.env.PINATA_BASE_URL || "https://api.pinata.cloud",
	pinataGatewayUrl:
		process.env.PINATA_GATEWAY_URL || "https://gateway.pinata.cloud",
};

// IPFS Configuration
const ipfsConfig = {
	gateway: process.env.IPFS_GATEWAY || "https://ipfs.io/ipfs/",
	apiUrl: process.env.IPFS_API_URL || "https://ipfs.infura.io:5001",
	projectId: process.env.IPFS_PROJECT_ID,
	projectSecret: process.env.IPFS_PROJECT_SECRET,
};

// Redis Configuration
const redisConfig = {
	host: process.env.REDIS_HOST || "localhost",
	port: process.env.REDIS_PORT || 6379,
	password: process.env.REDIS_PASSWORD,
	db: process.env.REDIS_DB || 0,
};

// Email Configuration
const emailConfig = {
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	secure: process.env.SMTP_SECURE === "true",
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
	from: process.env.EMAIL_FROM,
};

// Google OAuth Configuration
const googleConfig = {
	clientId: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: process.env.GOOGLE_CALLBACK_URL,
	scope: ["profile", "email"],
};

// YouTube API Configuration
const youtubeConfig = {
	apiKey: process.env.YOUTUBE_API_KEY,
	clientId: process.env.YOUTUBE_CLIENT_ID,
	clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
	redirectUri: process.env.YOUTUBE_REDIRECT_URI,
};

// Social Media Configuration
const socialMediaConfig = {
	facebook: {
		appId: process.env.FACEBOOK_APP_ID,
		appSecret: process.env.FACEBOOK_APP_SECRET,
		callbackURL: process.env.FACEBOOK_CALLBACK_URL,
	},
	twitter: {
		consumerKey: process.env.TWITTER_CONSUMER_KEY,
		consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
		callbackURL: process.env.TWITTER_CALLBACK_URL,
	},
	linkedin: {
		clientId: process.env.LINKEDIN_CLIENT_ID,
		clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
		callbackURL: process.env.LINKEDIN_CALLBACK_URL,
	},
};

// File Upload Configuration
const uploadConfig = {
	maxFileSize: process.env.MAX_FILE_SIZE || "5mb",
	allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(",") || [
		"image/jpeg",
		"image/png",
		"image/gif",
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	],
	uploadDir: process.env.UPLOAD_DIR || "uploads",
};

// Payment Gateway Configuration
const paymentConfig = {
	stripe: {
		secretKey: process.env.STRIPE_SECRET_KEY,
		webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
	},
	paypal: {
		clientId: process.env.PAYPAL_CLIENT_ID,
		clientSecret: process.env.PAYPAL_CLIENT_SECRET,
		mode: process.env.PAYPAL_MODE || "sandbox",
	},
	mpesa: {
		consumerKey: process.env.MPESA_CONSUMER_KEY,
		consumerSecret: process.env.MPESA_CONSUMER_SECRET,
		passkey: process.env.MPESA_PASSKEY,
		shortcode: process.env.MPESA_SHORTCODE,
		callbackUrl: process.env.MPESA_CALLBACK_URL,
	},
};

// Logging Configuration
const loggingConfig = {
	level: process.env.LOG_LEVEL || "info",
	format: process.env.LOG_FORMAT || "combined",
	transports: {
		console: {
			enabled: process.env.CONSOLE_LOGGING !== "false",
		},
		file: {
			enabled: process.env.FILE_LOGGING === "true",
			filename: process.env.LOG_FILE || "logs/app.log",
			maxsize: process.env.LOG_MAX_SIZE || "10m",
			maxFiles: process.env.LOG_MAX_FILES || "7d",
		},
	},
};

// Cache Configuration
const cacheConfig = {
	enabled: process.env.CACHE_ENABLED === "true",
	ttl: process.env.CACHE_TTL || 3600, // 1 hour
	checkPeriod: process.env.CACHE_CHECK_PERIOD || 600, // 10 minutes
};

// Security Configuration
const securityConfig = {
	bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
	refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
	passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
	requireSpecialChars: process.env.REQUIRE_SPECIAL_CHARS !== "false",
	requireNumbers: process.env.REQUIRE_NUMBERS !== "false",
	requireUppercase: process.env.REQUIRE_UPPERCASE !== "false",
	requireLowercase: process.env.REQUIRE_LOWERCASE !== "false",
};

// Database configuration object
const config = {
	development: {
		username: DB_USER,
		password: DB_PASSWORD,
		database: DB_NAME,
		host: DB_HOST,
		port: DB_PORT,
		dialect: "postgres",
		logging: false,
		dialectOptions: {
			ssl: USE_SSL
				? {
						require: true,
						rejectUnauthorized: false,
				  }
				: false,
		},
	},
	test: {
		username: DB_USER,
		password: DB_PASSWORD,
		database: DB_NAME,
		host: DB_HOST,
		port: DB_PORT,
		dialect: "postgres",
		logging: false,
		dialectOptions: {
			ssl: USE_SSL
				? {
						require: true,
						rejectUnauthorized: false,
				  }
				: false,
		},
	},
	production: {
		username: DB_USER,
		password: DB_PASSWORD,
		database: DB_NAME,
		host: DB_HOST,
		port: DB_PORT,
		dialect: "postgres",
		logging: false,
		dialectOptions: {
			ssl: USE_SSL
				? {
						require: true,
						rejectUnauthorized: false,
				  }
				: false,
		},
	},
};

// For Sequelize CLI
module.exports = config;

// For the application
const sequelize = new Sequelize(
	config[appConfig.env].database,
	config[appConfig.env].username,
	config[appConfig.env].password,
	{
		host: config[appConfig.env].host,
		port: config[appConfig.env].port,
		dialect: config[appConfig.env].dialect,
		logging: config[appConfig.env].logging,
		dialectOptions: config[appConfig.env].dialectOptions,
	}
);

module.exports = {
	sequelize,
	appConfig,
	rateLimitConfig,
	corsConfig,
	sessionConfig,
	blockchainConfig,
	ipfsConfig,
	redisConfig,
	emailConfig,
	googleConfig,
	youtubeConfig,
	socialMediaConfig,
	uploadConfig,
	paymentConfig,
	loggingConfig,
	cacheConfig,
	securityConfig,
	...config,
};
