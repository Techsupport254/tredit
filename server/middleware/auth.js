const User = require("../models/User");
const { verifySignature } = require("../utils/web3");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

const authenticate = async (req, res, next) => {
	try {
		const walletAddress = req.headers["x-wallet-address"];
		const signature = req.headers["x-signature"];
		const message = req.headers["x-message"];

		if (!walletAddress || !signature || !message) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		// Verify wallet signature
		const isValidSignature = verifySignature(message, signature, walletAddress);
		if (!isValidSignature) {
			return res.status(401).json({
				success: false,
				message: "Invalid signature",
			});
		}

		// Get user
		const user = await User.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
		});

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "User not found",
			});
		}

		// Add user to request object
		req.user = user;
		next();
	} catch (error) {
		console.error("Authentication error:", error);
		res.status(500).json({
			success: false,
			message: "Authentication failed",
			error: error.message,
		});
	}
};

const isAdmin = async (req, res, next) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ error: "Admin access required" });
		}
		next();
	} catch (error) {
		console.error("Admin check error:", error);
		res.status(500).json({ error: "Admin check failed" });
	}
};

const isVerified = async (req, res, next) => {
	try {
		if (!req.user.isVerified) {
			return res.status(403).json({ error: "Account verification required" });
		}
		next();
	} catch (error) {
		console.error("Verification check error:", error);
		res.status(500).json({ error: "Verification check failed" });
	}
};

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return next(new AppError("No token provided", 401));
	}

	try {
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || "your-secret-key"
		);
		req.user = decoded;
		next();
	} catch (err) {
		return next(new AppError("Invalid token", 401));
	}
};

module.exports = {
	authenticate,
	isAdmin,
	isVerified,
	authenticateToken,
};
