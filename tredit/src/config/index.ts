import { config as dotenvConfig } from "dotenv";

dotenvConfig();

interface Config {
	server: {
		port: number;
		env: string;
		enableRateLimiting: boolean;
		frontendUrl: string;
		backendUrl: string;
		appUrl: string;
	};
	urls: {
		frontend: string;
		backend: string;
	};
	database: {
		host: string;
		port: number;
		user: string;
		password: string;
		name: string;
		ssl: boolean;
		forceSync: boolean;
	};
	ipfs: {
		apiKey: string;
		apiSecret: string;
		jwt: string;
		baseUrl: string;
		gatewayUrl: string;
	};
	blockchain: {
		userProfileContract: string;
		userProfileAbi: any[];
		businessContract: string;
		businessAbi: any[];
		paymentContract: string;
		paymentAbi: any[];
		escrowContract: string;
		escrowAbi: any[];
		tokenAddress: string;
		tokenAbi: any[];
		biconomyForwarder: string;
		rpcUrl: string;
		chainId: number;
		mnemonic: string;
		privateKey: string;
		polygonscanApiKey: string;
		usdcToken: string;
	};
	jwt: {
		secret: string;
		expire: string;
	};
	session: {
		secret: string;
	};
	email: {
		host: string;
		port: number;
		user: string;
		pass: string;
		from: {
			email: string;
			name: string;
		};
	};
	oauth: {
		youtube: {
			apiKey: string;
			clientId: string;
			clientSecret: string;
			redirectUri: string;
		};
		google: {
			clientId: string;
			clientSecret: string;
			redirectUri: string;
		};
		facebook: {
			appId: string;
			appSecret: string;
		};
		instagram: {
			clientId: string;
			clientSecret: string;
		};
		tiktok: {
			clientKey: string;
			clientSecret: string;
		};
	};
	firebase: {
		apiKey: string;
		authDomain: string;
		projectId: string;
		storageBucket: string;
		messagingSenderId: string;
		appId: string;
	};
	security: {
		corsOrigin: string;
		rateLimitWindow: number;
		rateLimitMax: number;
		requireAuth: boolean;
	};
	youtube: {
		clientId: string;
		clientSecret: string;
		redirectUri: string;
		refreshToken: string;
	};
	paystack: {
		secretKey: string;
	};
	appUrl: string;
}

// Helper function to safely parse JSON
function safeJsonParse<T>(value: string | undefined, defaultValue: T): T {
	if (!value) return defaultValue;
	try {
		return JSON.parse(value) as T;
	} catch (error) {
		console.error("Error parsing JSON:", error);
		return defaultValue;
	}
}

const development: Config = {
	server: {
		port: Number(process.env.PORT) || 3000,
		env: "development",
		enableRateLimiting: false,
		frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
		backendUrl: process.env.BACKEND_URL || "http://localhost:8000",
		appUrl: process.env.APP_URL || "http://localhost:3000",
	},
	urls: {
		frontend: process.env.FRONTEND_URL || "http://localhost:5173",
		backend: process.env.BACKEND_URL || "http://localhost:8000",
	},
	database: {
		host: process.env.DB_HOST || "localhost",
		port: Number(process.env.DB_PORT) || 5432,
		user: process.env.DB_USER || "postgres",
		password: process.env.DB_PASS || "",
		name: process.env.DB_NAME || "tredit_test",
		ssl: process.env.DB_SSL === "true",
		forceSync: process.env.DB_FORCE_SYNC === "true",
	},
	ipfs: {
		apiKey: process.env.PINATA_API_KEY || "",
		apiSecret: process.env.PINATA_API_SECRET || "",
		jwt: process.env.PINATA_JWT || "",
		baseUrl: process.env.PINATA_BASE_URL || "https://api.pinata.cloud",
		gatewayUrl:
			process.env.PINATA_GATEWAY_URL || "https://gateway.pinata.cloud",
	},
	blockchain: {
		userProfileContract: (() => {
			const value = process.env.NEXT_PUBLIC_USER_PROFILE_CONTRACT_ADDRESS;
			if (!value)
				throw new Error("NEXT_PUBLIC_USER_PROFILE_CONTRACT_ADDRESS is not set");
			return value;
		})(),
		userProfileAbi: safeJsonParse(process.env.NEXT_PUBLIC_USER_PROFILE_ABI, []),
		businessContract: (() => {
			const value = process.env.NEXT_PUBLIC_BUSINESS_CONTRACT_ADDRESS;
			if (!value)
				throw new Error("NEXT_PUBLIC_BUSINESS_CONTRACT_ADDRESS is not set");
			return value;
		})(),
		businessAbi: safeJsonParse(process.env.NEXT_PUBLIC_BUSINESS_ABI, []),
		paymentContract: (() => {
			const value = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS;
			if (!value)
				throw new Error("NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS is not set");
			return value;
		})(),
		paymentAbi: safeJsonParse(process.env.NEXT_PUBLIC_PAYMENT_ABI, []),
		escrowContract: (() => {
			const value = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;
			if (!value)
				throw new Error("NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS is not set");
			return value;
		})(),
		escrowAbi: safeJsonParse(process.env.NEXT_PUBLIC_ESCROW_ABI, []),
		tokenAddress: (() => {
			const value = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;
			if (!value)
				throw new Error("NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS is not set");
			return value;
		})(),
		tokenAbi: safeJsonParse(process.env.NEXT_PUBLIC_TOKEN_ABI, []),
		biconomyForwarder: (() => {
			const value = process.env.NEXT_PUBLIC_BICONOMY_FORWARDER;
			if (!value) throw new Error("NEXT_PUBLIC_BICONOMY_FORWARDER is not set");
			return value;
		})(),
		rpcUrl: (() => {
			const value = process.env.NEXT_PUBLIC_RPC_URL;
			if (!value) throw new Error("NEXT_PUBLIC_RPC_URL is not set");
			return value;
		})(),
		chainId: (() => {
			const value = process.env.NEXT_PUBLIC_CHAIN_ID;
			if (!value) throw new Error("NEXT_PUBLIC_CHAIN_ID is not set");
			return Number(value);
		})(),
		mnemonic: (() => {
			const value = process.env.NEXT_PUBLIC_MNEMONIC;
			if (!value) throw new Error("NEXT_PUBLIC_MNEMONIC is not set");
			return value;
		})(),
		privateKey: (() => {
			const key = process.env.NEXT_PUBLIC_PRIVATE_KEY;
			if (!key) {
				throw new Error(
					"NEXT_PUBLIC_PRIVATE_KEY environment variable is not set"
				);
			}
			if (!key.startsWith("0x")) {
				throw new Error("NEXT_PUBLIC_PRIVATE_KEY must start with '0x'");
			}
			if (key.length !== 66) {
				throw new Error(
					"NEXT_PUBLIC_PRIVATE_KEY must be 64 hexadecimal characters (32 bytes)"
				);
			}
			return key;
		})(),
		polygonscanApiKey: (() => {
			const value = process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY;
			if (!value) throw new Error("NEXT_PUBLIC_POLYGONSCAN_API_KEY is not set");
			return value;
		})(),
		usdcToken: (() => {
			const value = process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS;
			if (!value) throw new Error("NEXT_PUBLIC_USDC_TOKEN_ADDRESS is not set");
			return value;
		})(),
	},
	jwt: {
		secret: process.env.JWT_SECRET || "development_secret",
		expire: process.env.JWT_EXPIRE || "1d",
	},
	session: {
		secret: process.env.SESSION_SECRET || "development_session_secret",
	},
	email: {
		host: process.env.SMTP_HOST || "smtp.gmail.com",
		port: Number(process.env.SMTP_PORT) || 587,
		user: process.env.SMTP_USER || "",
		pass: process.env.SMTP_PASS || "",
		from: {
			email: process.env.FROM_EMAIL || "",
			name: process.env.FROM_NAME || "Tredit",
		},
	},
	oauth: {
		youtube: {
			apiKey: process.env.YOUTUBE_API_KEY || "",
			clientId: process.env.YOUTUBE_CLIENT_ID || "",
			clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
			redirectUri:
				process.env.YOUTUBE_REDIRECT_URI ||
				"http://localhost:8000/api/youtube/callback",
		},
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
			redirectUri:
				process.env.GOOGLE_REDIRECT_URI ||
				"http://localhost:5173/auth/google/callback",
		},
		facebook: {
			appId: process.env.FACEBOOK_APP_ID || "",
			appSecret: process.env.FACEBOOK_APP_SECRET || "",
		},
		instagram: {
			clientId: process.env.INSTAGRAM_CLIENT_ID || "",
			clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
		},
		tiktok: {
			clientKey: process.env.TIKTOK_CLIENT_KEY || "",
			clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
		},
	},
	firebase: {
		apiKey: process.env.FIREBASE_API_KEY || "",
		authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
		projectId: process.env.FIREBASE_PROJECT_ID || "",
		storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
		messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
		appId: process.env.FIREBASE_APP_ID || "",
	},
	security: {
		corsOrigin: process.env.CORS_ORIGIN || "*",
		rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
		rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,
		requireAuth: process.env.REQUIRE_AUTH === "true",
	},
	youtube: {
		clientId: process.env.YOUTUBE_CLIENT_ID || "",
		clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
		redirectUri:
			process.env.YOUTUBE_REDIRECT_URI ||
			"http://localhost:8000/api/youtube/callback",
		refreshToken: process.env.YOUTUBE_REFRESH_TOKEN || "",
	},
	paystack: {
		secretKey: process.env.PAYSTACK_SECRET_KEY || "",
	},
	appUrl: process.env.APP_URL || "http://localhost:3000",
};

const production: Config = {
	...development,
	server: {
		port: Number(process.env.PORT) || 3000,
		env: "production",
		enableRateLimiting: true,
		frontendUrl: process.env.FRONTEND_URL || "https://tredit.com",
		backendUrl: process.env.BACKEND_URL || "https://api.tredit.com",
		appUrl: process.env.APP_URL || "https://tredit.com",
	},
	urls: {
		frontend: process.env.FRONTEND_URL || "https://tredit.com",
		backend: process.env.BACKEND_URL || "https://api.tredit.com",
	},
	database: {
		...development.database,
		ssl: true,
	},
	security: {
		...development.security,
		corsOrigin: process.env.CORS_ORIGIN || "https://tredit.com",
		rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW) || 15,
		rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 50, // Stricter in production
		requireAuth: true,
	},
	paystack: {
		secretKey:
			process.env.PAYSTACK_SECRET_KEY ||
			process.env.PAYSTACK_LIVE_SECRET_KEY ||
			"",
	},
	appUrl: process.env.APP_URL || "https://tredit.com",
};

const config: Config =
	process.env.NODE_ENV === "production" ? production : development;

export default config;
