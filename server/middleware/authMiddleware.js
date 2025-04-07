const jwt = require("jsonwebtoken");
const { db, sequelize } = require("../models");
const AppError = require("../utils/appError");
const { JWT_CONFIG } = require("../utils/jwt");

const protect = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		console.log(
			"Auth middleware - Authorization header present:",
			!!authHeader
		);

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({
				success: false,
				error: "No token provided",
			});
		}

		const token = authHeader.split(" ")[1];
		if (!token) {
			return res.status(401).json({
				success: false,
				error: "Invalid token format",
			});
		}

		try {
			console.log("Auth middleware - Verifying token");
			const decoded = jwt.verify(token, JWT_CONFIG.secret);
			console.log("Auth middleware - Token verified, decoded:", decoded);

			let user;
			// Try to find user by ID first
			if (decoded.id) {
				user = await db.User.findByPk(decoded.id);
			}
			// If not found by ID, try wallet address
			if (!user && decoded.walletAddress) {
				user = await db.User.findOne({
					where: sequelize.where(
						sequelize.fn("LOWER", sequelize.col("walletAddress")),
						sequelize.fn("LOWER", decoded.walletAddress)
					),
				});
			}

			if (!user) {
				console.log(
					"Auth middleware - User not found for decoded data:",
					decoded
				);
				return res.status(401).json({
					success: false,
					error: "User not found",
				});
			}

			console.log("Auth middleware - User found:", user.id);

			// Add decoded token and user to request
			req.token = decoded;
			req.user = user;
			next();
		} catch (error) {
			console.error("Token verification error:", error);

			// Handle specific JWT errors
			if (error.name === "JsonWebTokenError") {
				return res.status(401).json({
					success: false,
					error: "Invalid token",
				});
			}

			if (error.name === "TokenExpiredError") {
				return res.status(401).json({
					success: false,
					error: "Token expired",
				});
			}

			return res.status(401).json({
				success: false,
				error: "Authentication failed",
			});
		}
	} catch (error) {
		console.error("Auth middleware error:", error);
		return res.status(500).json({
			success: false,
			error: "Internal server error",
		});
	}
};

const adminProtect = async (req, res, next) => {
	try {
		if (req.user.role !== "admin" && req.user.role !== "superadmin") {
			return res.status(403).json({
				success: false,
				error: "Admin access required",
			});
		}
		next();
	} catch (error) {
		console.error("Admin check error:", error);
		res.status(500).json({
			success: false,
			error: "Admin check failed",
		});
	}
};

const vendor = async (req, res, next) => {
	try {
		if (req.user && (req.user.role === "vendor" || req.user.role === "admin")) {
			next();
		} else {
			res.status(401).json({
				success: false,
				error: "Not authorized as vendor",
			});
		}
	} catch (error) {
		console.error("Vendor check error:", error);
		res.status(500).json({
			success: false,
			error: "Vendor check failed",
		});
	}
};

module.exports = {
	protect,
	adminProtect,
	vendor,
};
