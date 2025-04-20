import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ethers } from "ethers";
import { z } from "zod";
import axios from "axios";
import { prisma } from "@/lib/prisma";

// Load environment variables
const BUSINESS_CONTRACT_ABI = JSON.parse(process.env.BUSINESS_ABI || "[]");
const BUSINESS_CONTRACT_ADDRESS = process.env.BUSINESS_CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_URL = process.env.PINATA_BASE_URL;
const PINATA_GATEWAY_URL = process.env.PINATA_GATEWAY_URL;

// Business schema validation
const TeamRoleEnum = z.enum([
	"OWNER",
	"STORE_MANAGER",
	"FINANCE_MANAGER",
	"CUSTOMER_SERVICE_LEAD",
	"MARKETING_MANAGER",
	"LOGISTICS_COORDINATOR",
	"INVENTORY_MANAGER",
	"CONTENT_CREATOR",
	"SOCIAL_MEDIA_MANAGER",
	"QUALITY_ASSURANCE",
	"TECHNICAL_SUPPORT",
	"SALES_REPRESENTATIVE",
	"PROCUREMENT_OFFICER",
]);

const OperatingDaysEnum = z.enum([
	"MONDAY",
	"TUESDAY",
	"WEDNESDAY",
	"THURSDAY",
	"FRIDAY",
	"SATURDAY",
	"SUNDAY",
]);

const PaymentMethodEnum = z.enum([
	"MPESA",
	"CARD",
	"BANK_TRANSFER",
	"CASH",
	"CRYPTO",
]);

const CurrencyEnum = z.enum(["KES", "USD", "EUR", "GBP"]);

const TeamMemberSchema = z.object({
	role: TeamRoleEnum,
	responsibilities: z.array(z.string()),
	canManageOrders: z.boolean().default(false),
	canManageProducts: z.boolean().default(false),
	canManageTeam: z.boolean().default(false),
	canManageFinance: z.boolean().default(false),
	canViewAnalytics: z.boolean().default(false),
	canManageContent: z.boolean().default(false),
	canManageCustomers: z.boolean().default(false),
});

const OperatingHoursSchema = z.object({
	open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
	close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
	breakStart: z
		.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
		.optional(),
	breakEnd: z
		.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
		.optional(),
});

const businessSchema = z.object({
	// Basic Information
	name: z.string().min(2).max(100),
	description: z.string().optional(),
	bio: z.string().optional(),
	type: z.enum(["PRODUCT", "SERVICE"]),
	category: z.string(),
	subcategories: z.array(z.string()).optional(),

	// Legal Information
	registrationNumber: z.string().optional(),
	taxId: z.string().optional(),
	licenseNumber: z.string().optional(),
	insuranceInfo: z
		.object({
			provider: z.string(),
			policyNumber: z.string(),
			expiryDate: z.string(),
		})
		.optional(),
	certifications: z.array(z.string()).optional(),

	// Contact Information
	email: z.string().email(),
	phone: z.string(),
	alternativePhone: z.string().optional(),
	supportEmail: z.string().email().optional(),
	supportPhone: z.string().optional(),

	// Location Information
	address: z.string(),
	city: z.string(),
	country: z.string().default("Kenya"),
	postalCode: z.string().optional(),
	coordinates: z
		.object({
			latitude: z.number(),
			longitude: z.number(),
		})
		.optional(),
	serviceAreas: z.array(z.string()).optional(),

	// Business Configuration
	businessModel: z.string(),
	operationMode: z.string(),
	employeeCount: z.number().min(1),
	timezone: z.string().default("Africa/Nairobi"),
	languages: z.array(z.string()).default(["en"]),
	acceptedCurrencies: z.array(CurrencyEnum).default(["KES"]),
	paymentMethods: z.array(PaymentMethodEnum),

	// Operating Hours
	businessHours: z.record(
		OperatingDaysEnum,
		z.union([
			OperatingHoursSchema,
			z.literal("CLOSED"),
			z.literal("BY_APPOINTMENT"),
		])
	),

	// Team Configuration
	teamRoles: z.array(TeamMemberSchema),

	// Business Policies
	returnPolicy: z.string().optional(),
	shippingPolicy: z.string().optional(),
	privacyPolicy: z.string().optional(),
	termsOfService: z.string().optional(),

	// Service Level Agreements (for service businesses)
	sla: z
		.object({
			responseTime: z.string(),
			resolutionTime: z.string(),
			availability: z.string(),
		})
		.optional(),

	// Tags for searchability
	tags: z.array(z.string()).optional(),

	// Product/Service Categories
	productCategories: z.array(z.string()).optional(),
	serviceCategories: z.array(z.string()).optional(),
});

// Stream writer helper
function streamResponse(res: any, data: string) {
	res.write(data + "\n");
}

export async function POST(req: Request) {
	const encoder = new TextEncoder();
	const stream = new TransformStream();
	const writer = stream.writable.getWriter();
	const response = new NextResponse(stream.readable);

	try {
		const session = await getServerSession();
		if (!session?.user) {
			throw new Error("Unauthorized");
		}

		const body = await req.json();
		const validatedData = businessSchema.parse(body);

		// 1. Create business on blockchain
		await writer.write(encoder.encode("Creating business on blockchain...\n"));

		const provider = new ethers.JsonRpcProvider(RPC_URL);
		const wallet = new ethers.Wallet(PRIVATE_KEY || "", provider);
		const contract = new ethers.Contract(
			BUSINESS_CONTRACT_ADDRESS || "",
			BUSINESS_CONTRACT_ABI,
			wallet
		);

		const blockchainMetadata = {
			name: validatedData.name,
			description: validatedData.description,
			type: validatedData.type,
			category: validatedData.category,
			createdAt: new Date().toISOString(),
			owner: session.user.id,
		};

		const tx = await contract.createBusiness(
			JSON.stringify(blockchainMetadata)
		);
		const receipt = await tx.wait();

		const event = receipt.logs.find(
			(log: any) => log.eventName === "BusinessCreated"
		);

		if (!event) {
			throw new Error("Business creation event not found");
		}

		const [businessId, owner, ipfsHash, timestamp] = event.args;

		await writer.write(encoder.encode("Blockchain transaction completed\n"));

		// 2. Upload to IPFS
		await writer.write(encoder.encode("Uploading to IPFS...\n"));

		const ipfsMetadata = {
			...validatedData,
			businessId,
			txHash: receipt.hash,
			owner: session.user.id,
			createdAt: new Date().toISOString(),
			version: "1.0.0",
		};

		const pinataResponse = await axios.post(
			`${PINATA_API_URL}/pinning/pinJSONToIPFS`,
			ipfsMetadata,
			{
				headers: {
					Authorization: `Bearer ${PINATA_JWT}`,
				},
			}
		);

		const { IpfsHash } = pinataResponse.data;
		const ipfsUrl = `${PINATA_GATEWAY_URL}/ipfs/${IpfsHash}`;

		await writer.write(encoder.encode("IPFS upload completed\n"));

		// 3. Save to database
		await writer.write(encoder.encode("Saving to database...\n"));

		const business = await prisma.business.create({
			data: {
				...validatedData,
				userId: session.user.id,
				businessId,
				blockchainTxHash: receipt.hash,
				ipfsUrl,
				status: "ACTIVE",
				verificationStatus: "PENDING",
			},
		});

		await writer.write(encoder.encode("Database entry created\n"));

		// Send final response
		const result = {
			success: true,
			business: {
				id: business.id,
				businessId,
				txHash: receipt.hash,
				ipfsUrl,
				name: business.name,
			},
		};

		await writer.write(encoder.encode(JSON.stringify(result)));
		await writer.close();

		return response;
	} catch (error) {
		let errorMessage = "Internal server error";
		let statusCode = 500;

		if (error instanceof z.ZodError) {
			errorMessage = "Invalid request data";
			statusCode = 400;
		} else if (error instanceof Error) {
			errorMessage = error.message;
		}

		await writer.write(
			encoder.encode(
				JSON.stringify({ error: errorMessage, status: statusCode })
			)
		);
		await writer.close();

		return response;
	}
}
