import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id, amount, seller, conditions } = await req.json();

		if (!id || !amount || !seller || !conditions) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		const escrow = await prisma.escrowPayment.create({
			data: {
				id,
				amount: Number(amount),
				status: "PENDING",
				buyerId: session.user.id,
				sellerId: seller,
				conditions,
			},
		});

		return NextResponse.json(escrow);
	} catch (error: any) {
		console.error("Error creating escrow:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to create escrow" },
			{ status: 500 }
		);
	}
}
