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

		const { id } = await req.json();

		if (!id) {
			return NextResponse.json({ error: "Missing escrow ID" }, { status: 400 });
		}

		const escrow = await prisma.escrowPayment.findUnique({
			where: { id },
		});

		if (!escrow) {
			return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
		}

		if (escrow.buyerId !== session.user.id) {
			return NextResponse.json(
				{ error: "Only the buyer can request a refund" },
				{ status: 403 }
			);
		}

		if (escrow.status !== "PENDING") {
			return NextResponse.json(
				{ error: "Escrow is not in pending state" },
				{ status: 400 }
			);
		}

		const updatedEscrow = await prisma.escrowPayment.update({
			where: { id },
			data: { status: "REFUNDED" },
		});

		return NextResponse.json(updatedEscrow);
	} catch (error: any) {
		console.error("Error refunding escrow:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to refund escrow" },
			{ status: 500 }
		);
	}
}
