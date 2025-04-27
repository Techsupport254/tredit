import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const { id } = params;

		// Verify user has access to this business
		const business = await prisma.business.findFirst({
			where: {
				id,
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

		// Fetch team members
		const teamMembers = await prisma.businessTeamMember.findMany({
			where: {
				businessId: id,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						profileImage: true,
						status: true,
					},
				},
			},
		});

		// Format the response
		const formattedTeamMembers = teamMembers.map((member) => ({
			id: member.user.id,
			name: member.user.name,
			email: member.user.email,
			profileImage: member.user.profileImage,
			role: member.role,
			responsibilities: member.responsibilities,
			permissions: member.permissions,
			status: member.user.status?.toLowerCase() || "inactive",
			isOnline: false, // This will be updated by socket events
		}));

		return NextResponse.json(formattedTeamMembers);
	} catch (error) {
		console.error("[TEAM_GET]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
