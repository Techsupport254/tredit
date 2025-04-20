import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Business schema validation
const businessSchema = z.object({
	name: z
		.string()
		.min(2, "Business name must be at least 2 characters")
		.max(100, "Business name cannot exceed 100 characters"),
	description: z.string().optional(),
	bio: z.string().optional(),
	type: z.enum(["PRODUCT", "SERVICE"], {
		required_error: "Business type is required",
		invalid_type_error: "Business type must be either PRODUCT or SERVICE",
	}),
	category: z.string().min(1, "Category is required"),
	productCategories: z.array(z.string()).optional(),
	serviceCategories: z.array(z.string()).optional(),
	email: z.string().email("Invalid email format"),
	phone: z.string().min(10, "Phone number must be at least 10 digits"),
	alternativePhone: z
		.string()
		.min(10, "Alternative phone number must be at least 10 digits")
		.optional(),
	address: z.string().min(1, "Address is required"),
	city: z.string().min(1, "City is required"),
	country: z.string().default("Kenya"),
	postalCode: z.string().optional(),
	businessModel: z.string().min(1, "Business model is required"),
	operationMode: z.string().min(1, "Operation mode is required"),
	size: z.string().min(1, "Business size is required"),
	stage: z.string().min(1, "Business stage is required"),
	currency: z.string().min(1, "Currency is required"),
	paymentMethods: z
		.array(z.string())
		.min(1, "At least one payment method is required"),
	taxCategory: z.string().min(1, "Tax category is required"),
	shippingMethod: z.string().min(1, "Shipping method is required"),
	registrationNumber: z.string().optional(),
	taxId: z.string().optional(),
	logo: z.any().optional(),
	coverImage: z.any().optional(),
	images: z.array(z.any()).optional(),
	documents: z.array(z.any()).optional(),
	businessId: z.string(),
	blockchainTxHash: z.string(),
	ipfsUrl: z.string().url(),
});

export async function GET(req: Request) {
	try {
		const session = await getServerSession();
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user's businesses
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Get all businesses for this user
		const businesses = await prisma.business.findMany({
			where: { userId: user.id },
			select: {
				id: true,
				name: true,
				description: true,
				type: true,
				category: true,
				logo: true,
				averageRating: true,
				reviewCount: true,
			},
		});

		return NextResponse.json(businesses);
	} catch (error) {
		console.error("Error fetching businesses:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}

export async function POST(req: Request) {
	try {
		// Check authentication
		const session = await getServerSession();
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: "Unauthorized: Please sign in to continue" },
				{ status: 401 }
			);
		}

		// Get user from database first
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Parse request body
		const body = await req.json();

		// Validate request data
		try {
			const validatedData = businessSchema.parse(body);
			console.debug("Validated data:", validatedData);
		} catch (validationError) {
			if (validationError instanceof z.ZodError) {
				return NextResponse.json(
					{
						error: "Invalid request data",
						details: validationError.errors.map((err) => ({
							field: err.path.join("."),
							message: err.message,
						})),
					},
					{ status: 400 }
				);
			}
			throw validationError;
		}

		// Create business in database
		try {
			const business = await prisma.business.create({
				data: {
					...body,
					userId: user.id,
					status: "ACTIVE",
					verificationStatus: "PENDING",
				},
			});

			return NextResponse.json({
				success: true,
				message: "Business created successfully",
				data: business,
			});
		} catch (dbError) {
			console.error("Database error:", dbError);
			return NextResponse.json(
				{
					error: "Database error",
					details: "Failed to create business record",
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("Unexpected error:", error);
		return NextResponse.json(
			{
				error: "Internal server error",
				details: "An unexpected error occurred",
			},
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
