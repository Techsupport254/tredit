import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		console.log("[transactions] Fetching escrow payments...");

		// Fetch escrow payments
		const escrows = await prisma.escrowPayment.findMany({
			include: {
				buyer: { select: { id: true, name: true } },
				seller: { select: { id: true, name: true } },
			},
		});

		console.log("[transactions] Found escrow payments:", escrows.length);

		// Map escrows to the expected format
		const allTx = escrows.map((e) => ({
			type: "escrow",
			id: e.id,
			amount: e.amount,
			status: e.status,
			createdAt: e.createdAt,
			buyerId: e.buyerId,
			buyerName: e.buyer?.name || "",
			sellerId: e.sellerId,
			sellerName: e.seller?.name || "",
		}));

		console.log("[transactions] Mapped transactions:", allTx.length);

		// Sort by createdAt desc
		allTx.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		);

		return NextResponse.json(allTx);
	} catch (error) {
		console.error("[transactions] Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch transactions" },
			{ status: 500 }
		);
	}
}
