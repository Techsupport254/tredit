import { z } from "zod";

const envSchema = z.object({
	// Server
	NODE_ENV: z.enum(["development", "production", "test"]),
	PORT: z.string().transform(Number),
	ENABLE_RATE_LIMITING: z.string().transform((val) => val === "true"),

	// URLs
	FRONTEND_URL: z.string().url(),
	BACKEND_URL: z.string().url(),
	APP_URL: z.string().url(),

	// Database
	DATABASE_URL: z.string().min(1),
	DIRECT_URL: z.string().min(1),

	// Blockchain
	RPC_URL: z.string().min(1),
	CHAIN_ID: z.string().transform(Number),
	PRIVATE_KEY: z.string().min(1),
	PAYMENT_CONTRACT_ADDRESS: z.string().min(1),
	ESCROW_CONTRACT_ADDRESS: z.string().min(1),

	// Paystack
	PAYSTACK_SECRET_KEY: z.string().min(1),

	// IPFS
	PINATA_API_KEY: z.string().min(1),
	PINATA_API_SECRET: z.string().min(1),
	PINATA_JWT: z.string().min(1),
});

export function validateEnv() {
	try {
		return envSchema.parse(process.env);
	} catch (error) {
		console.error("❌ Invalid environment variables:", error);
		throw new Error("Invalid environment variables");
	}
}

export const env = validateEnv();
