// Error codes mapping for frontend display
export const ErrorCodes = {
	// Authentication Errors
	AUTH_INVALID_CREDENTIALS: "Invalid credentials provided",
	AUTH_TOKEN_EXPIRED: "Your session has expired. Please log in again.",
	AUTH_TOKEN_INVALID: "Invalid authentication token",
	AUTH_UNAUTHORIZED: "You are not authorized to perform this action",
	AUTH_FORBIDDEN: "Access to this resource is forbidden",

	// Admin Errors
	ADMIN_NOT_FOUND: "Admin not found",
	ADMIN_ALREADY_EXISTS: "Admin with this email already exists",
	ADMIN_INVALID_EMAIL: "Invalid email format",
	ADMIN_INVALID_PASSWORD: "Invalid password format",
	ADMIN_PROFILE_UPDATE_FAILED: "Failed to update admin profile",

	// Validation Errors
	VALIDATION_INVALID_INPUT: "Invalid input data",
	VALIDATION_MISSING_REQUIRED: "Missing required fields",
	VALIDATION_INVALID_FORMAT: "Invalid data format",
	VALIDATION_ERROR: "Please check your input and try again",
	UNIQUE_CONSTRAINT_ERROR: "This value already exists",

	// Blockchain Errors
	BLOCKCHAIN_TRANSACTION_FAILED: "Blockchain transaction failed",
	BLOCKCHAIN_CONTRACT_ERROR: "Smart contract error occurred",
	BLOCKCHAIN_NETWORK_ERROR: "Blockchain network error",
	BLOCKCHAIN_INSUFFICIENT_FUNDS: "Insufficient funds for transaction",

	// Server Errors
	SERVER_INTERNAL_ERROR: "An unexpected error occurred",
	SERVER_UNAVAILABLE: "Service is temporarily unavailable",
	SERVER_DATABASE_ERROR: "Database operation failed",
};

// Error handling utility
export class ApiError extends Error {
	constructor(error) {
		super(error.message || "An unexpected error occurred");
		this.code = error.code;
		this.statusCode = error.statusCode;
		this.details = error.details;
		this.timestamp = error.timestamp;
		this.name = "ApiError";
	}

	// Get user-friendly message
	getMessage() {
		return ErrorCodes[this.code] || this.message;
	}

	// Check if error is authentication related
	isAuthError() {
		return this.code.startsWith("AUTH_");
	}

	// Check if error is validation related
	isValidationError() {
		return this.code.startsWith("VALIDATION_");
	}

	// Check if error is blockchain related
	isBlockchainError() {
		return this.code.startsWith("BLOCKCHAIN_");
	}

	// Get field-specific validation errors
	getValidationErrors() {
		if (this.isValidationError() && this.details) {
			return this.details.reduce((acc, detail) => {
				acc[detail.field] = detail.message;
				return acc;
			}, {});
		}
		return null;
	}
}
