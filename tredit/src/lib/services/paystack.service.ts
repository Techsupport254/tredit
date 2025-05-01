import axios from "axios";
import { PaymentMethod } from "@prisma/client";

export class PaystackService {
	private static instance: PaystackService;
	private readonly baseUrl = "https://api.paystack.co";
	private readonly secretKey: string;

	private constructor() {
		this.secretKey = getPaystackSecretKey();
	}

	public static getInstance(): PaystackService {
		if (!PaystackService.instance) {
			PaystackService.instance = new PaystackService();
		}
		return PaystackService.instance;
	}

	private getHeaders() {
		return {
			Authorization: `Bearer ${this.secretKey}`,
			"Content-Type": "application/json",
		};
	}

	private getPaymentChannels(paymentMethod: PaymentMethod): string[] {
		switch (paymentMethod) {
			case "MPESA":
				return ["mobile_money"];
			case "CARD":
				return ["card"];
			case "BANK_TRANSFER":
				return ["bank"];
			default:
				return ["card", "bank", "mobile_money"];
		}
	}

	async initializePayment(
		amount: number,
		email: string,
		paymentMethod: PaymentMethod,
		metadata: any
	) {
		try {
			const response = await axios.post(
				`${this.baseUrl}/transaction/initialize`,
				{
					amount: Math.round(amount * 100), // Convert to kobo/cents
					email,
					currency: "KES",
					callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
					metadata,
					channels: this.getPaymentChannels(paymentMethod),
				},
				{ headers: this.getHeaders() }
			);

			return response.data;
		} catch (error) {
			console.error("Error initializing payment:", error);
			throw error;
		}
	}

	async verifyPayment(reference: string) {
		try {
			const response = await axios.get(
				`${this.baseUrl}/transaction/verify/${reference}`,
				{ headers: this.getHeaders() }
			);
			return response.data;
		} catch (error) {
			console.error("Error verifying payment:", error);
			throw error;
		}
	}
}

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

export async function verifyPayment(reference: string) {
	const secretKey = getPaystackSecretKey();
	if (!secretKey) {
		throw new Error("Paystack secret key is not set in environment variables");
	}
	const headers = {
		Authorization: `Bearer ${secretKey}`,
		"Content-Type": "application/json",
	};
	console.log("[Paystack] Verifying payment with headers:", headers);
	const response = await fetch(
		`https://api.paystack.co/transaction/verify/${reference}`,
		{
			headers,
		}
	);
	if (!response.ok) {
		const error = await response.json();
		console.error("[Paystack] Verification failed:", error);
		throw new Error(error.message || "Failed to verify payment");
	}
	return response.json();
}
