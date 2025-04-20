import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const orders = await prisma.order.findMany({
			where: {
				businessId: params.id,
			},
			include: {
				items: {
					include: {
						product: {
							select: {
								name: true,
								price: true,
							},
						},
						service: {
							select: {
								name: true,
								price: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(orders);
	} catch (error) {
		console.error("Error fetching orders:", error);
		return NextResponse.json(
			{ error: "Failed to fetch orders" },
			{ status: 500 }
		);
	}
}
