/**
 * Standard response format for success
 * @param {Object} data - The data to send back
 * @param {string} message - Success message
 * @returns {Object} Formatted success response
 */
const successResponse = (data = null, message = "Operation successful") => ({
	success: true,
	message,
	data,
	timestamp: new Date().toISOString(),
});

/**
 * Standard response format for errors
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} details - Additional error details
 * @returns {Object} Formatted error response
 */
const errorResponse = (
	message = "Operation failed",
	code = "UNKNOWN_ERROR",
	details = null
) => ({
	success: false,
	message,
	code,
	details,
	timestamp: new Date().toISOString(),
});

/**
 * Standard validation error response
 * @param {Array} errors - Array of validation errors
 * @returns {Object} Formatted validation error response
 */
const validationError = (errors) => ({
	success: false,
	message: "Validation failed",
	code: "VALIDATION_ERROR",
	errors,
	timestamp: new Date().toISOString(),
});

/**
 * Standard blockchain error response
 * @param {string} message - Error message
 * @param {Object} txDetails - Transaction details
 * @returns {Object} Formatted blockchain error response
 */
const blockchainError = (message, txDetails = null) => ({
	success: false,
	message,
	code: "BLOCKCHAIN_ERROR",
	details: {
		transaction: txDetails,
		timestamp: new Date().toISOString(),
	},
});

/**
 * Standard response codes
 */
const ResponseCodes = {
	// Authentication & Authorization
	UNAUTHORIZED: "UNAUTHORIZED",
	FORBIDDEN: "FORBIDDEN",
	INVALID_TOKEN: "INVALID_TOKEN",
	TOKEN_EXPIRED: "TOKEN_EXPIRED",

	// Resource errors
	NOT_FOUND: "NOT_FOUND",
	ALREADY_EXISTS: "ALREADY_EXISTS",
	CONFLICT: "CONFLICT",

	// Validation errors
	INVALID_INPUT: "INVALID_INPUT",
	MISSING_FIELDS: "MISSING_FIELDS",
	INVALID_FORMAT: "INVALID_FORMAT",

	// Business logic errors
	BUSINESS_RULE_VIOLATION: "BUSINESS_RULE_VIOLATION",
	INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
	LIMIT_EXCEEDED: "LIMIT_EXCEEDED",

	// Blockchain errors
	BLOCKCHAIN_UNAVAILABLE: "BLOCKCHAIN_UNAVAILABLE",
	TRANSACTION_FAILED: "TRANSACTION_FAILED",
	GAS_LIMIT_EXCEEDED: "GAS_LIMIT_EXCEEDED",

	// IPFS errors
	IPFS_UPLOAD_FAILED: "IPFS_UPLOAD_FAILED",
	IPFS_UNAVAILABLE: "IPFS_UNAVAILABLE",

	// System errors
	INTERNAL_ERROR: "INTERNAL_ERROR",
	SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
	NETWORK_ERROR: "NETWORK_ERROR",
};

module.exports = {
	successResponse,
	errorResponse,
	validationError,
	blockchainError,
	ResponseCodes,
};
