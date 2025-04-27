import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		// Fetch businesses where the user is a team member
		const businesses = await prisma.business.findMany({
			where: {
				teamMembers: {
					some: {
						userId: session.user.id,
					},
				},
			},
			select: {
				id: true,
				name: true,
				logo: true,
				description: true,
				createdAt: true,
				updatedAt: true,
				status: true,
				type: true,
				category: true,
				email: true,
				phone: true,
				address: true,
				city: true,
				country: true,
				postalCode: true,
				currency: true,
				timezone: true,
				businessModel: true,
				operationMode: true,
				paymentMethods: true,
				businessHours: true,
				teamMembers: {
					select: {
						id: true,
						userId: true,
						role: true,
						createdAt: true,
						updatedAt: true,
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
			},
		});

		return NextResponse.json(businesses);
	} catch (error) {
		console.error("[BUSINESSES_GET]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
