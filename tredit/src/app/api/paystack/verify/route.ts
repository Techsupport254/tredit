import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@prisma/client";

function getPaystackSecretKey() {
	const key =
		process.env.NODE_ENV === "production"
			? process.env.PAYSTACK_LIVE_SECRET_KEY
			: process.env.PAYSTACK_TEST_SECRET_KEY;
	if (!key) {
		console.error(
			"[Paystack] Secret key is undefined! Check your .env configuration."
		);
	} else {
		console.log(
			`[Paystack] Using secret key: ${key.slice(0, 8)}...${key.slice(-4)}`
		);
	}
	return key;
}

export async function GET(req: NextRequest) {
	const steps = [];
	// Step 1: Request received and reference extraction
	const reference = req.nextUrl.searchParams.get("reference");
	steps.push({
		step: 1,
		description: "Request received and reference extracted",
		reference,
	});
	console.log("[Step 1] Request received and reference extracted", {
		reference,
	});
	if (!reference) {
		steps.push({ step: 1, error: "Missing reference param" });
		console.error("[Step 1] Error: Missing reference param");
		return NextResponse.json(
			{ steps, error: "Missing reference" },
			{ status: 400 }
		);
	}

	// Step 2: Paystack API call preparation
	const secretKey = getPaystackSecretKey();
	if (!secretKey) {
		steps.push({ step: 2, error: "Paystack secret key missing" });
		console.error("[Step 2] Error: Paystack secret key missing");
		return NextResponse.json(
			{
				steps,
				error: "Paystack secret key is not set in environment variables",
			},
			{ status: 500 }
		);
	}
	const headers = {
		Authorization: `Bearer ${secretKey}`,
		"Content-Type": "application/json",
	};
	const paystackUrl = `https://api.paystack.co/transaction/verify/${reference}`;
	steps.push({
		step: 2,
		description: "Paystack API call prepared",
		url: paystackUrl,
		headers,
	});
	console.log("[Step 2] Paystack API call prepared", {
		url: paystackUrl,
		headers,
	});

	// Step 3: Paystack API call and response
	let paystackRes, data;
	try {
		paystackRes = await fetch(paystackUrl, { headers });
		data = await paystackRes.json();
		steps.push({
			step: 3,
			description: "Paystack API response received",
			status: paystackRes.status,
			body: data,
		});
		console.log("[Step 3] Paystack API response received", {
			status: paystackRes.status,
			body: data,
		});
	} catch (err) {
		steps.push({
			step: 3,
			error: "Paystack API call failed",
			details: err.message || err.toString(),
		});
		console.error("[Step 3] Error: Paystack API call failed", err);
		return NextResponse.json(
			{ steps, error: "Failed to call Paystack API" },
			{ status: 500 }
		);
	}
	if (!paystackRes.ok) {
		steps.push({
			step: 3,
			error: "Paystack verification failed",
			details: data,
		});
		console.error("[Step 3] Error: Paystack verification failed", data);
		return NextResponse.json(
			{ steps, error: data.message || "Failed to verify payment" },
			{ status: paystackRes.status }
		);
	}

	// Step 3.5: Extract paymentMethod from metadata
	let paymentMethod;
	try {
		const customFields = data?.data?.metadata?.custom_fields || [];
		const paymentMethodField = customFields.find(
			(field: any) => field.variable_name === "paymentMethod"
		);

		paymentMethod = paymentMethodField?.value;

		steps.push({
			step: 3.5,
			description: "Extracted paymentMethod from metadata",
			paymentMethod,
			customFields,
		});
		console.log("[Step 3.5] Extracted paymentMethod from metadata", {
			paymentMethod,
			customFields,
		});
		if (!paymentMethod) {
			steps.push({
				step: 3.5,
				error: "paymentMethod missing in Paystack metadata",
				customFields,
			});
			console.error(
				"[Step 3.5] Error: paymentMethod missing in Paystack metadata",
				{ customFields }
			);
			return NextResponse.json(
				{
					steps,
					error: "paymentMethod missing in Paystack metadata",
					customFields,
				},
				{ status: 400 }
			);
		}
		// Validate paymentMethod is a valid enum value
		if (!Object.values(PaymentMethod).includes(paymentMethod)) {
			steps.push({
				step: 3.5,
				error: `Invalid paymentMethod: ${paymentMethod}`,
			});
			console.error(
				`[Step 3.5] Error: Invalid paymentMethod: ${paymentMethod}`
			);
			return NextResponse.json(
				{ steps, error: `Invalid paymentMethod: ${paymentMethod}` },
				{ status: 400 }
			);
		}
	} catch (err) {
		steps.push({
			step: 3.5,
			error: "Error extracting paymentMethod",
			details: err.message || err.toString(),
		});
		console.error("[Step 3.5] Error extracting paymentMethod", err);
		return NextResponse.json(
			{ steps, error: "Error extracting paymentMethod" },
			{ status: 500 }
		);
	}

	// Step 4: Payment DB upsert (create if not exists, update if exists)
	let payment = null;
	let paymentAction = "";
	try {
		payment = await prisma.payment.findFirst({
			where: { paystackRef: reference },
		});
		if (!payment) {
			// Create new payment record
			payment = await prisma.payment.create({
				data: {
					paymentMethod,
					paystackRef: reference,
					status: data.data.status === "success" ? "PAID" : "PENDING",
					amount: data.data.amount / 100,
					currency: data.data.currency,
					paymentDate: new Date(data.data.paid_at),
					transactionHash: data.data.reference,
					paystackId: data.data.id.toString(),
					metadata: data.data,
				},
			});
			paymentAction = "created";
			steps.push({
				step: 4,
				description: "Payment record created in DB",
				payment,
			});
			console.log("[Step 4] Payment record created in DB", { payment });
		} else {
			// Update existing payment record
			payment = await prisma.payment.update({
				where: { id: payment.id },
				data: {
					paymentMethod,
					status: data.data.status === "success" ? "PAID" : "PENDING",
					amount: data.data.amount / 100,
					currency: data.data.currency,
					paymentDate: new Date(data.data.paid_at),
					transactionHash: data.data.reference,
					paystackId: data.data.id.toString(),
					metadata: data.data,
				},
			});
			paymentAction = "updated";
			steps.push({
				step: 4,
				description: "Payment record updated in DB",
				payment,
			});
			console.log("[Step 4] Payment record updated in DB", { payment });
		}
	} catch (err) {
		steps.push({
			step: 4,
			error: "Error upserting payment record",
			details: err.message || err.toString(),
		});
		console.error("[Step 4] Error: Error upserting payment record", err);
		return NextResponse.json(
			{ steps, error: "Error upserting payment record" },
			{ status: 500 }
		);
	}

	// Step 5: Escrow DB upsert (create if not exists, update if exists)
	let escrow = null;
	let escrowAction = "";
	try {
		escrow = await prisma.escrow.findFirst({
			where: { paystackRef: reference },
		});
		if (!escrow) {
			// Create new escrow record
			escrow = await prisma.escrow.create({
				data: {
					paystackRef: reference,
					status: "ACTIVE",
					paystackId: data.data.id.toString(),
					amount: data.data.amount / 100,
					currency: data.data.currency,
					releaseConditions: {
						deliveryConfirmed: false,
						disputePeriod: 7,
						autoReleaseAfter: 14,
					},
				},
			});
			escrowAction = "created";
			steps.push({
				step: 5,
				description: "Escrow record created in DB",
				escrow,
			});
			console.log("[Step 5] Escrow record created in DB", { escrow });
		} else {
			// Update existing escrow record
			escrow = await prisma.escrow.update({
				where: { id: escrow.id },
				data: {
					status: "ACTIVE",
					paystackId: data.data.id.toString(),
					amount: data.data.amount / 100,
					currency: data.data.currency,
				},
			});
			escrowAction = "updated";
			steps.push({
				step: 5,
				description: "Escrow record updated in DB",
				escrow,
			});
			console.log("[Step 5] Escrow record updated in DB", { escrow });
		}
	} catch (err) {
		steps.push({
			step: 5,
			error: "Error upserting escrow record",
			details: err.message || err.toString(),
		});
		console.error("[Step 5] Error: Error upserting escrow record", err);
		return NextResponse.json(
			{ steps, error: "Error upserting escrow record" },
			{ status: 500 }
		);
	}

	// Step 6: Final summary
	steps.push({
		step: 6,
		description: "Verification and DB upsert complete",
		paystackRef: reference,
		status: data.data.status,
		paymentAction,
		escrowAction,
	});
	console.log("[Step 6] Verification and DB upsert complete", {
		paystackRef: reference,
		status: data.data.status,
		paymentAction,
		escrowAction,
	});
	return NextResponse.json({
		steps,
		paystackRef: reference,
		status: data.data.status,
		paymentAction,
		escrowAction,
	});
}
