import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
	req: Request,
	{ params }: { params: { businessId: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const { businessId } = params;

		// Verify user has access to this business
		const business = await prisma.business.findFirst({
			where: {
				id: businessId,
				teamMembers: {
					some: {
						userId: session.user.id,
					},
				},
			},
		});

		if (!business) {
			return new NextResponse("Business not found", { status: 404 });
		}

		// Fetch team members for the business
		const teamMembers = await prisma.businessTeamMember.findMany({
			where: {
				businessId,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						profileImage: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		// Format the response
		const formattedTeamMembers = teamMembers.map((member) => ({
			id: member.id,
			userId: member.userId,
			role: member.role,
			createdAt: member.createdAt,
			updatedAt: member.updatedAt,
			user: {
				id: member.user.id,
				name: member.user.name,
				email: member.user.email,
				image: member.user.profileImage,
			},
		}));

		return NextResponse.json(formattedTeamMembers);
	} catch (error) {
		console.error("[TEAM_MEMBERS_GET]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
