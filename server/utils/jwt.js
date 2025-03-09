const jwt = require("jsonwebtoken");

const JWT_CONFIG = {
	secret: process.env.JWT_SECRET || "your-secret-key",
	algorithm: "HS256",
	expiresIn: "30d",
};

const generateToken = (user) => {
	try {
		// Ensure we have a valid input
		if (!user) {
			throw new Error("User data is required");
		}

		// Extract and normalize the wallet address
		const walletAddress =
			typeof user === "string"
				? user.toLowerCase()
				: user.walletAddress
				? user.walletAddress.toLowerCase()
				: null;

		if (!walletAddress) {
			throw new Error("Wallet address is required");
		}

		// Create the token payload
		const payload = {
			walletAddress,
			// Only include role if it's a user object and has a role
			...(typeof user !== "string" && user.role && { role: user.role }),
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
