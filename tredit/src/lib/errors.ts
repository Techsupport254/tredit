import { ApiError } from "@/types/api";

export class AppError extends Error {
	code: string;
	details?: Record<string, any>;

	constructor(code: string, message: string, details?: Record<string, any>) {
		super(message);
		this.code = code;
		this.details = details;
		this.name = "AppError";
	}
}

export class ValidationError extends AppError {
	constructor(message: string, details?: Record<string, any>) {
		super("VALIDATION_ERROR", message, details);
		this.name = "ValidationError";
	}
}

export class NotFoundError extends AppError {
	constructor(resource: string, id?: string) {
		super("NOT_FOUND", `${resource} ${id ? `with ID ${id}` : ""} not found`, {
			resource,
			id,
		});
		this.name = "NotFoundError";
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized access") {
		super("UNAUTHORIZED", message);
		this.name = "UnauthorizedError";
	}
}

export class ForbiddenError extends AppError {
	constructor(message = "Access forbidden") {
		super("FORBIDDEN", message);
		this.name = "ForbiddenError";
	}
}

export class ConflictError extends AppError {
	constructor(message: string, details?: Record<string, any>) {
		super("CONFLICT", message, details);
		this.name = "ConflictError";
	}
}

export function handleError(error: unknown): ApiError {
	if (error instanceof AppError) {
		return {
			code: error.code,
			message: error.message,
			details: error.details,
		};
	}

	if (error instanceof Error) {
		return {
			code: "INTERNAL_SERVER_ERROR",
			message: error.message || "An unexpected error occurred",
		};
	}

	return {
		code: "UNKNOWN_ERROR",
		message: "An unknown error occurred",
	};
}
