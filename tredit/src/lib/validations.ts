import { z } from "zod";
import {
	BusinessModel,
	BusinessOperationMode,
	BusinessType,
} from "@prisma/client";

// User Validation Schemas
export const createUserSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			"Password must contain at least one uppercase letter, one lowercase letter, and one number"
		),
	walletAddress: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address"),
	acceptBlockchainStorage: z.boolean(),
});

export const updateUserSchema = createUserSchema.partial().extend({
	id: z.string().uuid(),
});

// Business Validation Schemas
export const createBusinessSchema = z.object({
	name: z.string().min(2, "Business name must be at least 2 characters"),
	description: z.string().optional(),
	bio: z.string().optional(),
	type: z.nativeEnum(BusinessType),
	category: z.string(),
	subcategories: z.array(z.string()).optional(),
	email: z.string().email("Invalid email address"),
	phone: z.string().regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format"),
	alternativePhone: z
		.string()
		.regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format")
		.optional(),
	supportEmail: z.string().email("Invalid email address").optional(),
	supportPhone: z
		.string()
		.regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format")
		.optional(),
	address: z.string(),
	city: z.string(),
	country: z.string().default("Kenya"),
	postalCode: z.string().optional(),
	coordinates: z
		.object({
			latitude: z.number().min(-90).max(90),
			longitude: z.number().min(-180).max(180),
		})
		.optional(),
	serviceAreas: z.array(z.string()).optional(),
	businessModel: z.nativeEnum(BusinessModel),
	operationMode: z.nativeEnum(BusinessOperationMode),
	employeeCount: z.number().int().positive(),
	timezone: z.string().default("Africa/Nairobi"),
	languages: z.array(z.string()).default(["en"]),
	acceptedCurrencies: z
		.array(z.string())
		.min(1, "At least one currency must be accepted"),
	paymentMethods: z
		.array(z.string())
		.min(1, "At least one payment method must be accepted"),
	businessHours: z.record(
		z.object({
			open: z
				.string()
				.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
			close: z
				.string()
				.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
		})
	),
});

export const updateBusinessSchema = createBusinessSchema.partial().extend({
	id: z.string().uuid(),
});

// Helper function to validate data against a schema
export async function validateData<T>(
	schema: z.Schema<T>,
	data: unknown
): Promise<T> {
	try {
		return await schema.parseAsync(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const details = error.errors.map((err) => ({
				field: err.path.join("."),
				message: err.message,
			}));
			throw new ValidationError("Validation failed", { details });
		}
		throw error;
	}
}
