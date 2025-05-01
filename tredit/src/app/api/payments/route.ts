import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const payments = await prisma.payment.findMany({
			orderBy: {
				createdAt: "desc",
			},
			include: {
				payer: {
					select: {
						name: true,
					},
				},
				payee: {
					select: {
						name: true,
					},
				},
			},
		});

		const formattedPayments = payments.map((payment) => ({
			id: payment.id,
			amount: payment.amount,
			status: payment.status,
			payerId: payment.payerId,
			payerName: payment.payer?.name,
			payeeId: payment.payeeId,
			payeeName: payment.payee?.name,
			createdAt: payment.createdAt,
			updatedAt: payment.updatedAt,
			paymentMethod: payment.paymentMethod,
			currency: payment.currency,
		}));

		return NextResponse.json(formattedPayments);
	} catch (error) {
		console.error("Error fetching payments:", error);
		return NextResponse.json(
			{ error: "Failed to fetch payments" },
			{ status: 500 }
		);
	}
}
