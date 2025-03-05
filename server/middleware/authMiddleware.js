const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserLoginHistory = require("../models/UserLoginHistory");
const UAParser = require("ua-parser-js");

const logLoginAttempt = async (userId, req, status, failureReason = null) => {
	try {
		const parser = new UAParser(req.headers["user-agent"]);
		const browser = parser.getBrowser();
		const os = parser.getOS();
		const device = parser.getDevice();

		await UserLoginHistory.create({
			userId,
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
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Get user from token
			req.user = await User.findByPk(decoded.id);

			if (!req.user) {
				await logLoginAttempt(decoded.id, req, "failed", "User not found");
				res.status(401).json({ message: "Not authorized, user not found" });
				return;
			}

			// Log successful login
			await logLoginAttempt(req.user.id, req, "success");
			next();
		} catch (error) {
			await logLoginAttempt(null, req, "failed", "Invalid token");
			res.status(401).json({ message: "Not authorized, token failed" });
			return;
		}
	}

	if (!token) {
		await logLoginAttempt(null, req, "failed", "No token provided");
		res.status(401).json({ message: "Not authorized, no token" });
		return;
	}
};

const admin = (req, res, next) => {
	if (req.user && req.user.role === "admin") {
		next();
	} else {
		res.status(401).json({ message: "Not authorized as admin" });
	}
};

const vendor = (req, res, next) => {
	if (req.user && (req.user.role === "vendor" || req.user.role === "admin")) {
		next();
	} else {
		res.status(401).json({ message: "Not authorized as vendor" });
	}
};

module.exports = { protect, admin, vendor };
