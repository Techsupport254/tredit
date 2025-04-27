import axios from "axios";
import config from "@/config";
import { PaymentMethod } from "@prisma/client";
import { generateShareableLink } from "@/lib/utils/url";

export class PaystackService {
	private static instance: PaystackService;
	private readonly baseUrl = "https://api.paystack.co";
	private readonly secretKey: string;

	private constructor() {
		this.secretKey = config.paystack.secretKey;
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
			case "CRYPTO":
				return ["crypto"];
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
			// Extract businessName and businessType from metadata
			const businessName = metadata.businessName || "business";
			const businessType = metadata.businessType || "business";
			const businessId = metadata.businessId;
			// Use generateShareableLink to get the full base (including protocol/host)
			const slugUrl = generateShareableLink(
				businessId,
				businessName,
				businessType
			);
			const normalizedSlugUrl = slugUrl.endsWith("/") ? slugUrl : slugUrl + "/";
			const callbackUrl = `${normalizedSlugUrl}payment/verify`;
			console.log("Paystack callback URL:", callbackUrl);

			// Throw if callbackUrl is not a full absolute URL
			if (!/^https?:\/\//.test(callbackUrl)) {
				throw new Error(
					`Paystack callbackUrl is not a full absolute URL: ${callbackUrl}`
				);
			}

			const response = await axios.post(
				`${this.baseUrl}/transaction/initialize`,
				{
					amount: amount * 100, // Convert to kobo/cents
					email,
					currency: "KES",
					callback_url: callbackUrl,
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
}
