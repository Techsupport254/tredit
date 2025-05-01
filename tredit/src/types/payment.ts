import { PaymentMethod } from "@prisma/client";

export interface PaymentInitiationData {
	payee: string;
	amount: number;
	token: string;
	metadata?: {
		agreementId: string;
		paymentMethod: PaymentMethod;
		buyerAddress: string;
		sellerAddress: string;
	};
}

export interface PaymentCompletionData {
	paymentId: string;
	metadata?: {
		transactionHash?: string;
		status?: string;
	};
}

export interface PaymentStatus {
	paymentId: string;
	payer: string;
	payee: string;
	amount: number;
	token: string;
	isFiat: boolean;
	isCompleted: boolean;
	timestamp: number;
	metadata?: {
		agreementId?: string;
		paymentMethod?: PaymentMethod;
		transactionHash?: string;
		status?: string;
	};
}
