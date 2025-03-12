class AppError extends Error {
	constructor(message, statusCode, code, details = null) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		this.details = details;
		this.timestamp = new Date().toISOString();
		Error.captureStackTrace(this, this.constructor);
	}
}

// Authentication Errors
const AuthErrors = {
	INVALID_CREDENTIALS: {
		message: "Invalid credentials provided",
		statusCode: 401,
		code: "AUTH_INVALID_CREDENTIALS",
	},
	TOKEN_EXPIRED: {
		message: "Authentication token has expired",
		statusCode: 401,
		code: "AUTH_TOKEN_EXPIRED",
	},
	TOKEN_INVALID: {
		message: "Invalid authentication token",
		statusCode: 401,
		code: "AUTH_TOKEN_INVALID",
	},
	UNAUTHORIZED: {
		message: "You are not authorized to perform this action",
		statusCode: 403,
		code: "AUTH_UNAUTHORIZED",
	},
	FORBIDDEN: {
		message: "Access to this resource is forbidden",
		statusCode: 403,
		code: "AUTH_FORBIDDEN",
	},
};

// User Errors
const UserErrors = {
	NOT_FOUND: {
		message: "User not found",
		statusCode: 404,
		code: "USER_NOT_FOUND",
	},
	ALREADY_EXISTS: {
		message: "User with this wallet address already exists",
		statusCode: 409,
		code: "USER_ALREADY_EXISTS",
	},
	INVALID_WALLET: {
		message: "Invalid wallet address format",
		statusCode: 400,
		code: "USER_INVALID_WALLET",
	},
	EMAIL_EXISTS: {
		message: "Email address is already registered",
		statusCode: 409,
		code: "USER_EMAIL_EXISTS",
	},
	INVALID_EMAIL: {
		message: "Invalid email format",
		statusCode: 400,
		code: "USER_INVALID_EMAIL",
	},
	INVALID_PHONE: {
		message: "Invalid phone number format",
		statusCode: 400,
		code: "USER_INVALID_PHONE",
	},
	INVALID_DOB: {
		message: "Invalid date of birth",
		statusCode: 400,
		code: "USER_INVALID_DOB",
	},
	PROFILE_UPDATE_FAILED: {
		message: "Failed to update user profile",
		statusCode: 500,
		code: "USER_PROFILE_UPDATE_FAILED",
	},
};

// Business Errors
const BusinessErrors = {
	NOT_FOUND: {
		message: "Business not found",
		statusCode: 404,
		code: "BUSINESS_NOT_FOUND",
	},
	ALREADY_EXISTS: {
		message: "Business with this name already exists",
		statusCode: 409,
		code: "BUSINESS_ALREADY_EXISTS",
	},
	INVALID_CATEGORY: {
		message: "Invalid business category",
		statusCode: 400,
		code: "BUSINESS_INVALID_CATEGORY",
	},
	INVALID_TYPE: {
		message: "Invalid business type",
		statusCode: 400,
		code: "BUSINESS_INVALID_TYPE",
	},
	INVALID_OPERATION_MODE: {
		message: "Invalid operation mode",
		statusCode: 400,
		code: "BUSINESS_INVALID_OPERATION_MODE",
	},
	INVALID_BUSINESS_MODEL: {
		message: "Invalid business model",
		statusCode: 400,
		code: "BUSINESS_INVALID_MODEL",
	},
	NOT_OWNER: {
		message: "You are not the owner of this business",
		statusCode: 403,
		code: "BUSINESS_NOT_OWNER",
	},
	UPDATE_FAILED: {
		message: "Failed to update business details",
		statusCode: 500,
		code: "BUSINESS_UPDATE_FAILED",
	},
};

// Team Member Errors
const TeamMemberErrors = {
	NOT_FOUND: {
		message: "Team member not found",
		statusCode: 404,
		code: "TEAM_MEMBER_NOT_FOUND",
	},
	ALREADY_EXISTS: {
		message: "User is already a team member",
		statusCode: 409,
		code: "TEAM_MEMBER_ALREADY_EXISTS",
	},
	INVALID_ROLE: {
		message: "Invalid team member role",
		statusCode: 400,
		code: "TEAM_MEMBER_INVALID_ROLE",
	},
	INSUFFICIENT_PERMISSIONS: {
		message: "Insufficient permissions to perform this action",
		statusCode: 403,
		code: "TEAM_MEMBER_INSUFFICIENT_PERMISSIONS",
	},
	REMOVE_OWNER: {
		message: "Cannot remove the business owner",
		statusCode: 403,
		code: "TEAM_MEMBER_REMOVE_OWNER",
	},
};

// Validation Errors
const ValidationErrors = {
	INVALID_INPUT: {
		message: "Invalid input data",
		statusCode: 400,
		code: "VALIDATION_INVALID_INPUT",
	},
	MISSING_REQUIRED: {
		message: "Missing required fields",
		statusCode: 400,
		code: "VALIDATION_MISSING_REQUIRED",
	},
	INVALID_FORMAT: {
		message: "Invalid data format",
		statusCode: 400,
		code: "VALIDATION_INVALID_FORMAT",
	},
};

// Blockchain Errors
const BlockchainErrors = {
	TRANSACTION_FAILED: {
		message: "Blockchain transaction failed",
		statusCode: 500,
		code: "BLOCKCHAIN_TRANSACTION_FAILED",
	},
	CONTRACT_ERROR: {
		message: "Smart contract error occurred",
		statusCode: 500,
		code: "BLOCKCHAIN_CONTRACT_ERROR",
	},
	NETWORK_ERROR: {
		message: "Blockchain network error",
		statusCode: 503,
		code: "BLOCKCHAIN_NETWORK_ERROR",
	},
	INSUFFICIENT_FUNDS: {
		message: "Insufficient funds for transaction",
		statusCode: 400,
		code: "BLOCKCHAIN_INSUFFICIENT_FUNDS",
	},
};

// Server Errors
const ServerErrors = {
	INTERNAL_ERROR: {
		message: "An internal server error occurred",
		statusCode: 500,
		code: "SERVER_INTERNAL_ERROR",
	},
	SERVICE_UNAVAILABLE: {
		message: "Service is temporarily unavailable",
		statusCode: 503,
		code: "SERVER_UNAVAILABLE",
	},
	DATABASE_ERROR: {
		message: "Database operation failed",
		statusCode: 500,
		code: "SERVER_DATABASE_ERROR",
	},
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
	console.error(err);

	if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			success: false,
			error: {
				message: err.message,
				code: err.code,
				details: err.details,
				timestamp: err.timestamp,
			},
		});
	}

	// Handle Sequelize errors
	if (err.name === "SequelizeValidationError") {
		return res.status(400).json({
			success: false,
			error: {
				message: "Validation error",
				code: "VALIDATION_ERROR",
				details: err.errors.map((e) => ({
					field: e.path,
					message: e.message,
				})),
				timestamp: new Date().toISOString(),
			},
		});
	}

	if (err.name === "SequelizeUniqueConstraintError") {
		return res.status(409).json({
			success: false,
			error: {
				message: "Unique constraint violation",
				code: "UNIQUE_CONSTRAINT_ERROR",
				details: err.errors.map((e) => ({
					field: e.path,
					message: `${e.path} already exists`,
				})),
				timestamp: new Date().toISOString(),
			},
		});
	}

	// Handle JWT errors
	if (err.name === "JsonWebTokenError") {
		return res.status(401).json({
			success: false,
			error: {
				message: "Invalid token",
				code: "AUTH_TOKEN_INVALID",
				timestamp: new Date().toISOString(),
			},
		});
	}

	if (err.name === "TokenExpiredError") {
		return res.status(401).json({
			success: false,
			error: {
				message: "Token expired",
				code: "AUTH_TOKEN_EXPIRED",
				timestamp: new Date().toISOString(),
			},
		});
	}

	// Default error
	return res.status(500).json({
		success: false,
		error: {
			message: "An unexpected error occurred",
			code: "SERVER_INTERNAL_ERROR",
			timestamp: new Date().toISOString(),
		},
	});
};

module.exports = {
	AppError,
	AuthErrors,
	UserErrors,
	BusinessErrors,
	TeamMemberErrors,
	ValidationErrors,
	BlockchainErrors,
	ServerErrors,
	errorHandler,
};
