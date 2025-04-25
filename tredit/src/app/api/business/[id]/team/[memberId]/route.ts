import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
	req: Request,
	{ params }: { params: { id: string; memberId: string } }
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

		// Check if user has permission to update team members
		const businessMember = await prisma.businessTeamMember.findFirst({
			where: {
				businessId: params.id,
				userId: user.id,
				role: { in: ["OWNER", "ADMIN"] },
			},
		});

		if (!businessMember) {
			return NextResponse.json(
				{ error: "You don't have permission to update team members" },
				{ status: 403 }
			);
		}

		const { role, responsibilities } = await req.json();

		// Update team member
		const teamMember = await prisma.businessTeamMember.update({
			where: {
				businessId_userId: {
					businessId: params.id,
					userId: params.memberId,
				},
			},
			data: {
				role,
				responsibilities,
				permissions: {
					canManageProducts: role === "ADMIN",
					canManageOrders: role === "ADMIN",
					canManageTeam: role === "ADMIN",
					canViewAnalytics: true,
				},
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
		});

		return NextResponse.json({
			id: teamMember.user.id,
			name: teamMember.user.name,
			email: teamMember.user.email,
			role: teamMember.role,
			image: teamMember.user.profileImage,
			status: "active",
			responsibilities: teamMember.responsibilities,
			permissions: teamMember.permissions,
		});
	} catch (error) {
		console.error("Error updating team member:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string; memberId: string } }
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

		// Check if user has permission to remove team members
		const businessMember = await prisma.businessTeamMember.findFirst({
			where: {
				businessId: params.id,
				userId: user.id,
				role: { in: ["OWNER", "ADMIN"] },
			},
		});

		if (!businessMember) {
			return NextResponse.json(
				{ error: "You don't have permission to remove team members" },
				{ status: 403 }
			);
		}

		// Check if trying to remove owner
		const memberToRemove = await prisma.businessTeamMember.findFirst({
			where: {
				businessId: params.id,
				userId: params.memberId,
			},
		});

		if (memberToRemove?.role === "OWNER") {
			return NextResponse.json(
				{ error: "Cannot remove the business owner" },
				{ status: 400 }
			);
		}

		// Remove team member
		await prisma.businessTeamMember.delete({
			where: {
				businessId_userId: {
					businessId: params.id,
					userId: params.memberId,
				},
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error removing team member:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
