const AppError = require("./appError");
const { ResponseCodes } = require("./responseHelper");

const handleBlockchainError = (err) => {
	if (err.message.includes("transaction underpriced")) {
		return new AppError(
			"Blockchain transaction failed: Gas price too low",
			500,
			ResponseCodes.BLOCKCHAIN_GAS_ERROR
		);
	}
	if (err.message.includes("insufficient funds")) {
		return new AppError(
			"Insufficient funds for transaction",
			400,
			ResponseCodes.BLOCKCHAIN_INSUFFICIENT_FUNDS
		);
	}
	return new AppError(
		"Blockchain transaction failed",
		500,
		ResponseCodes.BLOCKCHAIN_ERROR
	);
};

const handleIPFSError = (err) => {
	return new AppError("IPFS operation failed", 500, ResponseCodes.IPFS_ERROR);
};

const handleDatabaseError = (err) => {
	if (err.name === "SequelizeValidationError") {
		const message = err.errors.map((e) => e.message).join(", ");
		return new AppError(message, 400, ResponseCodes.VALIDATION_ERROR);
	}
	if (err.name === "SequelizeUniqueConstraintError") {
		return new AppError("Duplicate entry found", 409, ResponseCodes.CONFLICT);
	}
	return new AppError(
		"Database operation failed",
		500,
		ResponseCodes.DATABASE_ERROR
	);
};

const handleJWTError = (err) => {
	if (err.name === "JsonWebTokenError") {
		return new AppError("Invalid token", 401, ResponseCodes.INVALID_TOKEN);
	}
	if (err.name === "TokenExpiredError") {
		return new AppError("Token expired", 401, ResponseCodes.TOKEN_EXPIRED);
	}
	return new AppError("Authentication failed", 401, ResponseCodes.UNAUTHORIZED);
};

const errorHandler = (err, req, res, next) => {
	console.error("Error:", {
		name: err.name,
		message: err.message,
		code: err.code,
		stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
	});

	// Handle specific error types
	let error = err;
	if (err.message && err.message.includes("blockchain")) {
		error = handleBlockchainError(err);
	} else if (err.message && err.message.includes("IPFS")) {
		error = handleIPFSError(err);
	} else if (err.name && err.name.startsWith("Sequelize")) {
		error = handleDatabaseError(err);
	} else if (
		err.name &&
		(err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")
	) {
		error = handleJWTError(err);
	}

	// Set default values if not set
	error.statusCode = error.statusCode || 500;
	error.code = error.code || ResponseCodes.INTERNAL_ERROR;

	const response = {
		success: false,
		message: error.message,
		code: error.code,
		...(process.env.NODE_ENV === "development" && {
			stack: error.stack,
			details: error.details,
		}),
		timestamp: new Date().toISOString(),
	};

	res.status(error.statusCode).json(response);
};

const asyncHandler = (fn) => {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};

// Async error handler wrapper
const handleAsync = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch((error) => {
		console.error("Error:", error);
		res.status(500).json({
			success: false,
			message: error.message || "Internal server error",
			code: "INTERNAL_ERROR",
			details:
				process.env.NODE_ENV === "development"
					? {
							stack: error.stack,
					  }
					: null,
			timestamp: new Date().toISOString(),
		});
	});
};

module.exports = {
	errorHandler,
	asyncHandler,
	handleBlockchainError,
	handleIPFSError,
	handleDatabaseError,
	handleJWTError,
	handleAsync,
};
