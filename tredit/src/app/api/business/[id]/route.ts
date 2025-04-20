import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession();
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user from database
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Get the specific business
		const business = await prisma.business.findUnique({
			where: { id: params.id },
			select: {
				id: true,
				name: true,
				description: true,
				type: true,
				category: true,
				email: true,
				phone: true,
				city: true,
				country: true,
				employeeCount: true,
				averageRating: true,
				reviewCount: true,
				businessModel: true,
				operationMode: true,
				currency: true,
				paymentMethods: true,
				registrationNumber: true,
				taxId: true,
				userId: true,
				user: {
					select: {
						name: true,
						email: true,
					},
				},
			},
		});

		if (!business) {
			return NextResponse.json(
				{ error: "Business not found" },
				{ status: 404 }
			);
		}

		// Check if the user owns this business
		if (business.userId !== user.id) {
			return NextResponse.json(
				{ error: "You don't have permission to view this business" },
				{ status: 403 }
			);
		}

		return NextResponse.json(business);
	} catch (error) {
		console.error("Error fetching business:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
