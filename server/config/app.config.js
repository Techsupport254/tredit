const config = {
	app: {
		port: process.env.PORT || 5000,
		env: process.env.NODE_ENV || "development",
		frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
	},
	cors: {
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
	},
	session: {
		secret: process.env.SESSION_SECRET || "your-secret-key",
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV === "production",
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
			sameSite: "lax",
			httpOnly: true,
		},
	},
};

module.exports = config;
