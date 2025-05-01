import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		// Fetch escrow payments
		const escrows = await prisma.escrowPayment.findMany({
			include: {
				buyer: { select: { id: true, name: true } },
				seller: { select: { id: true, name: true } },
			},
		});

		// Fetch orders
		const orders = await prisma.order.findMany({
			include: {
				user: { select: { id: true, name: true } },
				business: { select: { id: true, name: true } },
			},
		});

		// Fetch payments
		const payments = await prisma.payment.findMany({
			include: {
				ServiceAgreement: true,
			},
		});

		// Map and unify all into a single array
		const allTx = [
			...escrows.map((e) => ({
				type: "escrow",
				id: e.id,
				amount: e.amount,
				status: e.status,
				createdAt: e.createdAt,
				buyerId: e.buyerId,
				buyerName: e.buyer?.name || "",
				sellerId: e.sellerId,
				sellerName: e.seller?.name || "",
			})),
			...orders.map((o) => ({
				type: "order",
				id: o.id,
				amount: o.totalAmount,
				status: o.currentStatus,
				createdAt: o.createdAt,
				buyerId: o.userId,
				buyerName: o.user?.name || "",
				sellerId: o.businessId,
				sellerName: o.business?.name || "",
			})),
			...payments.map((p) => ({
				type: "payment",
				id: p.id,
				amount: p.amount,
				status: p.status,
				createdAt: p.createdAt,
				buyerId: p.ServiceAgreement?.clientId || "",
				buyerName: "",
				sellerId: p.ServiceAgreement?.businessId || "",
				sellerName: "",
			})),
		];

		// Sort all by createdAt desc
		allTx.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		);

		return NextResponse.json(allTx);
	} catch (error) {
		console.error("[all-transactions] Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch transactions" },
			{ status: 500 }
		);
	}
}
