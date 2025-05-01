import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const disputes = await prisma.dispute.findMany({
			orderBy: {
				createdAt: "desc",
			},
			include: {
				user: {
					select: {
						name: true,
						id: true,
					},
				},
				order: {
					select: {
						id: true,
					},
				},
			},
		});

		// Transform the data to match the frontend expectations
		const formattedDisputes = disputes.map((dispute) => ({
			id: dispute.id,
			title: dispute.reason,
			status: dispute.status,
			severity: dispute.severity,
			reporterName: dispute.user?.name,
			reporterId: dispute.user?.id,
			createdAt: dispute.createdAt.toISOString(),
			updatedAt: dispute.updatedAt.toISOString(),
		}));

		return NextResponse.json(formattedDisputes);
	} catch (error) {
		console.error("Error fetching disputes:", error);
		return NextResponse.json(
			{ error: "Failed to fetch disputes" },
			{ status: 500 }
		);
	}
}
