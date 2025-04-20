import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Business schema validation
const businessSchema = z.object({
	name: z.string().min(2).max(100),
	description: z.string().optional(),
	bio: z.string().optional(),
	type: z.enum(["PRODUCT", "SERVICE"]),
	category: z.string(),
	productCategories: z.array(z.string()).optional(),
	serviceCategories: z.array(z.string()).optional(),
	email: z.string().email(),
	phone: z.string(),
	address: z.string(),
	businessModel: z.string(),
	operationMode: z.string(),
	paymentMethods: z.array(z.string()),
	businessHours: z.record(z.any()),
	socialMedia: z.record(z.string().url()).optional(),
	businessId: z.string(),
	blockchainTxHash: z.string(),
	ipfsUrl: z.string().url(),
});

export async function POST(req: Request) {
	try {
		const session = await getServerSession();
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const validatedData = businessSchema.parse(body);

		// Create business in database
		const business = await prisma.business.create({
			data: {
				...validatedData,
				userId: session.user.id,
				status: "ACTIVE",
				verificationStatus: "PENDING",
			},
		});

		return NextResponse.json(business);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.errors },
				{ status: 400 }
			);
		}

		console.error("Error creating business:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function GET(req: Request) {
	try {
		const session = await getServerSession();
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const userId = searchParams.get("userId");

		// If userId is provided and matches the session user's id, get their businesses
		if (userId && userId === session.user.id) {
			const businesses = await prisma.business.findMany({
				where: { userId },
			});
			return NextResponse.json(businesses);
		}

		// Otherwise, get all active and verified businesses
		const businesses = await prisma.business.findMany({
			where: {
				status: "ACTIVE",
				verificationStatus: "VERIFIED",
			},
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
	}
}
