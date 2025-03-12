const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { errorResponse, ResponseCodes } = require("../utils/responseHelper");

const protect = async (req, res, next) => {
	// Bypass authentication during development
	if (process.env.NODE_ENV === "development") {
		const user = await User.findOne({
			where: { walletAddress: "0xe91388a436659f2c0b42bcea6f7a9b7004f2f265" },
		});

		if (!user) {
			return res
				.status(401)
				.json(
					errorResponse(
						"Development user not found",
						ResponseCodes.UNAUTHORIZED
					)
				);
		}

		req.user = user;
		return next();
	}

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

			// Get user from the token
			req.user = await User.findOne({
				where: { walletAddress: decoded.walletAddress },
				attributes: { exclude: ["password"] },
			});

			if (!req.user) {
				return res
					.status(401)
					.json(errorResponse("Not authorized", ResponseCodes.UNAUTHORIZED));
			}

			return next();
		} catch (error) {
			console.error("Auth error:", error);
			return res
				.status(401)
				.json(errorResponse("Not authorized", ResponseCodes.UNAUTHORIZED));
		}
	}

	if (!token) {
		return res
			.status(401)
			.json(
				errorResponse("Not authorized, no token", ResponseCodes.UNAUTHORIZED)
			);
	}
};

const adminProtect = async (req, res, next) => {
	// Bypass authentication during development
	if (process.env.NODE_ENV === "development") {
		req.user = {
			id: "0bf19417-7c79-4089-8b40-d2f30eebb806",
			walletAddress: "0xe91388a436659f2c0b42bcea6f7a9b7004f2f265",
			name: "Victor Quaint",
			email: "kiruivictor097@gmail.com",
			profileImage:
				"https://lh3.googleusercontent.com/a/ACg8ocKcyVbisFX9dDFOFIwp88KBVQRW8_78F2EXZcr5znjhPot7JFyR=s64-c",
			role: "admin",
		};
		return next();
	}

	try {
		await protect(req, res, async () => {
			if (req.user.role !== "admin") {
				return res
					.status(403)
					.json(
						errorResponse(
							"Not authorized, admin access required",
							ResponseCodes.FORBIDDEN
						)
					);
			}
			next();
		});
	} catch (error) {
		console.error("Admin auth error:", error);
		res
			.status(401)
			.json(errorResponse("Not authorized", ResponseCodes.UNAUTHORIZED));
	}
};

const vendor = (req, res, next) => {
	// Bypass authentication during development
	if (process.env.NODE_ENV === "development") {
		req.user = {
			id: "25fcf193-73bb-497f-adbe-4bc1b68d9567",
			walletAddress: "0xe91388a436659f2c0b42bcea6f7a9b7004f2f265",
			name: "Victor Quaint",
			email: "kiruivictor097@gmail.com",
			profileImage:
				"https://lh3.googleusercontent.com/a/ACg8ocKcyVbisFX9dDFOFIwp88KBVQRW8_78F2EXZcr5znjhPot7JFyR=s64-c",
			role: "vendor",
		};
		return next();
	}

	if (req.user && (req.user.role === "vendor" || req.user.role === "admin")) {
		next();
	} else {
		res
			.status(401)
			.json(
				errorResponse("Not authorized as vendor", ResponseCodes.UNAUTHORIZED)
			);
	}
};

module.exports = { protect, adminProtect, vendor };
