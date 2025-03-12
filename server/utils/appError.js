class AppError extends Error {
	constructor(message, statusCode, code = null, details = null) {
		super(message);

		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
		this.code = code;
		this.details = details;
		this.timestamp = new Date().toISOString();
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}

	toJSON() {
		return {
			success: false,
			message: this.message,
			code: this.code,
			status: this.status,
			details: this.details,
			timestamp: this.timestamp,
			...(process.env.NODE_ENV === "development" && {
				stack: this.stack,
			}),
		};
	}

	static badRequest(message, code = "BAD_REQUEST", details = null) {
		return new AppError(message, 400, code, details);
	}

	static unauthorized(message, code = "UNAUTHORIZED", details = null) {
		return new AppError(message, 401, code, details);
	}

	static forbidden(message, code = "FORBIDDEN", details = null) {
		return new AppError(message, 403, code, details);
	}

	static notFound(message, code = "NOT_FOUND", details = null) {
		return new AppError(message, 404, code, details);
	}

	static conflict(message, code = "CONFLICT", details = null) {
		return new AppError(message, 409, code, details);
	}

	static internal(message, code = "INTERNAL_ERROR", details = null) {
		return new AppError(message, 500, code, details);
	}

	static blockchain(message, code = "BLOCKCHAIN_ERROR", details = null) {
		return new AppError(message, 500, code, details);
	}

	static ipfs(message, code = "IPFS_ERROR", details = null) {
		return new AppError(message, 500, code, details);
	}
}

module.exports = AppError;
