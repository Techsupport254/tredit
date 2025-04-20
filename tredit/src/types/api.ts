import { User, Business } from "@prisma/client";

export type ApiResponse<T = any> = {
	success: boolean;
	data?: T;
	error?: ApiError;
	message?: string;
};

export type ApiError = {
	code: string;
	message: string;
	details?: Record<string, any>;
};

export type ValidationError = {
	field: string;
	message: string;
};

// User API Types
export type CreateUserRequest = {
	name: string;
	email: string;
	password: string;
	walletAddress: string;
	acceptBlockchainStorage: boolean;
};

export type UpdateUserRequest = Partial<CreateUserRequest> & {
	id: string;
};

export type UserResponse = Omit<User, "password">;

// Business API Types
export type CreateBusinessRequest = {
	name: string;
	description?: string;
	bio?: string;
	type: "PRODUCT" | "SERVICE";
	category: string;
	subcategories?: string[];
	email: string;
	phone: string;
	address: string;
	city: string;
	country?: string;
	businessModel: "B2B" | "B2C" | "D2C" | "MARKETPLACE";
	operationMode: "ONLINE" | "PHYSICAL" | "HYBRID";
	// Add other fields based on schema
};

export type UpdateBusinessRequest = Partial<CreateBusinessRequest> & {
	id: string;
};

export type BusinessResponse = Business;
