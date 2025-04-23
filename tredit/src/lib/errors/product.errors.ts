export class ProductError extends Error {
	constructor(
		message: string,
		public code: string,
		public details?: any,
		public context?: string
	) {
		super(message);
		this.name = "ProductError";
	}
}

export class ProductValidationError extends ProductError {
	constructor(message: string, details?: any) {
		super(message, "VALIDATION_ERROR", details, "validation");
		this.name = "ProductValidationError";
	}
}

export class ProductCreationError extends ProductError {
	constructor(message: string, details?: any) {
		super(message, "CREATION_ERROR", details, "creation");
		this.name = "ProductCreationError";
	}
}

export class ProductUpdateError extends ProductError {
	constructor(message: string, details?: any) {
		super(message, "UPDATE_ERROR", details, "update");
		this.name = "ProductUpdateError";
	}
}

export class ProductDeletionError extends ProductError {
	constructor(message: string, details?: any) {
		super(message, "DELETION_ERROR", details, "deletion");
		this.name = "ProductDeletionError";
	}
}

export class ProductNotFoundError extends ProductError {
	constructor(message: string = "Product not found", details?: any) {
		super(message, "NOT_FOUND", details, "fetch");
		this.name = "ProductNotFoundError";
	}
}

export class ProductDatabaseError extends ProductError {
	constructor(message: string, details?: any) {
		super(message, "DATABASE_ERROR", details, "database");
		this.name = "ProductDatabaseError";
	}
}

export class ProductMediaError extends ProductError {
	constructor(message: string, details?: any) {
		super(message, "MEDIA_ERROR", details, "media");
		this.name = "ProductMediaError";
	}
}
