const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserLoginHistory = require("../models/UserLoginHistory");
const UAParser = require("ua-parser-js");
const { JWT_CONFIG } = require("../utils/jwt");

const logLoginAttempt = async (
	walletAddress,
	req,
	status,
	failureReason = null
) => {
	try {
		// Only create login history if walletAddress is provided
		if (walletAddress) {
			const parser = new UAParser(req.headers["user-agent"]);
			const browser = parser.getBrowser();
			const os = parser.getOS();
			const device = parser.getDevice();

			await UserLoginHistory.create({
				userAddress: walletAddress.toLowerCase(),
				ipAddress: req.ip || req.connection.remoteAddress,
				userAgent: req.headers["user-agent"],
				browser: browser.name,
				browserVersion: browser.version,
				os: os.name,
				osVersion: os.version,
				device: device.model || device.vendor,
				deviceType: device.type || "other",
				status,
				failureReason,
				loginMethod: "wallet",
				location: null, // You can add IP geolocation service here if needed
			});
		}
	} catch (error) {
		console.error("Error logging login attempt:", error);
	}
};

const protect = async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			// Get token from header
			token = req.headers.authorization.split(" ")[1];

			// Verify token
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET || "your-secret-key"
			);

			// Get user from token
			const user = await User.findOne({
				where: { walletAddress: decoded.walletAddress.toLowerCase() },
			});

			if (!user) {
				await logLoginAttempt(
					decoded.walletAddress,
					req,
					"failed",
					"User not found"
				);
				return res.status(404).json({
					success: false,
					message: "User not found",
					code: "USER_NOT_FOUND"
				});
			}

			// Check if user is verified
			if (!user.isVerified) {
				await logLoginAttempt(
					decoded.walletAddress,
					req,
					"failed",
					"User not verified"
				);
				return res.status(401).json({
					success: false,
					message: "User not verified",
					code: "USER_NOT_VERIFIED"
				});
			}

			// Log successful login attempt
			await logLoginAttempt(decoded.walletAddress, req, "success");

			// Attach user to request
			req.user = user;
			next();
		} catch (error) {
			console.error("Auth error:", error);
			
			// Handle specific JWT errors
			if (error.name === "JsonWebTokenError") {
				return res.status(401).json({
					success: false,
					message: "Invalid token",
					code: "INVALID_TOKEN"
				});
			} else if (error.name === "TokenExpiredError") {
				return res.status(401).json({
					success: false,
					message: "Token expired",
					code: "TOKEN_EXPIRED"
				});
			}

			return res.status(401).json({
				success: false,
				message: "Authentication failed",
				code: "AUTH_FAILED"
			});
		}
	}

	if (!token) {
		return res.status(401).json({
			success: false,
			message: "No token provided",
			code: "NO_TOKEN"
		});
	}
};

const adminProtect = async (req, res, next) => {
	try {
		// First run the normal protection
		await protect(req, res, () => {
			// Check if user is admin
			if (req.user && req.user.role === "admin") {
				next();
			} else {
				res.status(403).json({
					success: false,
					message: "Not authorized, admin access required",
				});
			}
		});
	} catch (error) {
		console.error("Admin auth error:", error);
		res.status(401).json({
			success: false,
			message: "Not authorized",
		});
	}
};

const vendor = (req, res, next) => {
	if (req.user && (req.user.role === "vendor" || req.user.role === "admin")) {
		next();
	} else {
		res.status(401).json({ message: "Not authorized as vendor" });
	}
};

module.exports = { protect, adminProtect, vendor };
