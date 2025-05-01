import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const { payeeId, amount, currency, paymentMethod } = body;

		if (!payeeId || !amount || !currency || !paymentMethod) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Validate amount is positive
		if (amount <= 0) {
			return NextResponse.json(
				{ error: "Amount must be greater than 0" },
				{ status: 400 }
			);
		}

		// Validate currency
		const validCurrencies = ["KES", "USD", "ETH"];
		if (!validCurrencies.includes(currency)) {
			return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
		}

		// Validate payment method
		const validPaymentMethods = ["CRYPTO", "MPESA", "BANK"];
		if (!validPaymentMethods.includes(paymentMethod)) {
			return NextResponse.json(
				{ error: "Invalid payment method" },
				{ status: 400 }
			);
		}

		// Check if payee exists
		const payee = await prisma.user.findUnique({
			where: { id: payeeId },
		});

		if (!payee) {
			return NextResponse.json({ error: "Payee not found" }, { status: 404 });
		}

		// Create payment
		const payment = await prisma.payment.create({
			data: {
				amount,
				currency,
				paymentMethod,
				status: "PENDING",
				payerId: session.user.id,
				payeeId,
			},
		});

		return NextResponse.json(payment);
	} catch (error) {
		console.error("Error creating payment:", error);
		return NextResponse.json(
			{ error: "Failed to create payment" },
			{ status: 500 }
		);
	}
}
