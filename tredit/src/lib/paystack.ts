import axios from "axios";

const PAYSTACK_API_URL = "https://api.paystack.co";

interface InitializePaymentParams {
	amount: number;
	email: string;
	reference: string;
	callback_url: string;
	metadata?: Record<string, any>;
}

interface PaystackResponse {
	status: boolean;
	message: string;
	data: {
		authorization_url: string;
		reference: string;
	};
}

export async function initializePayment({
	amount,
	email,
	reference,
	callback_url,
	metadata,
}: InitializePaymentParams) {
	try {
		const response = await axios.post<PaystackResponse>(
			`${PAYSTACK_API_URL}/transaction/initialize`,
			{
				amount,
				email,
				reference,
				callback_url,
				metadata,
			},
			{
				headers: {
					Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET_KEY}`,
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.data.status) {
			throw new Error(response.data.message);
		}

		return response.data.data;
	} catch (error) {
		console.error("Paystack initialization error:", error);
		throw new Error("Failed to initialize payment");
	}
}

export async function verifyPayment(reference: string) {
	try {
		const response = await axios.get<PaystackResponse>(
			`${PAYSTACK_API_URL}/transaction/verify/${reference}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET_KEY}`,
				},
			}
		);

		if (!response.data.status) {
			throw new Error(response.data.message);
		}

		return response.data.data;
	} catch (error) {
		console.error("Paystack verification error:", error);
		throw new Error("Failed to verify payment");
	}
}
