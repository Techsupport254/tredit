const jwt = require("jsonwebtoken");
const { appConfig } = require("../config/config");

const JWT_CONFIG = {
	secret: appConfig.jwtSecret,
	algorithm: "HS256",
	expiresIn: "30d",
};

const generateToken = (user) => {
	try {
		// Ensure we have a valid input
		if (!user) {
			throw new Error("User data is required");
		}

		// If user is just a string (wallet address), create minimal payload
		if (typeof user === "string") {
			return jwt.sign({ walletAddress: user }, JWT_CONFIG.secret, {
				algorithm: JWT_CONFIG.algorithm,
				expiresIn: JWT_CONFIG.expiresIn,
			});
		}

		// Only include essential user data in the token payload
		const payload = {
			id: user.id,
			walletAddress: user.walletAddress,
			name: user.name,
			role: user.role,
		};

		// Generate and return the token
		return jwt.sign(payload, JWT_CONFIG.secret, {
			algorithm: JWT_CONFIG.algorithm,
			expiresIn: JWT_CONFIG.expiresIn,
		});
	} catch (error) {
		console.error("Token generation error:", error);
		throw error;
	}
};

module.exports = {
	generateToken,
	JWT_CONFIG,
};
