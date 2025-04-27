import { ethers } from "ethers";
import config from "@/config";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

interface PaymentContract extends ethers.BaseContract {
	recordFiatPayment(
		buyerAddress: string,
		sellerAddress: string,
		amount: bigint,
		paymentId: string
	): Promise<ethers.ContractTransactionResponse>;
	completePayment(
		paymentId: string
	): Promise<ethers.ContractTransactionResponse>;
	getPayment(paymentId: string): Promise<{ isCompleted: boolean }>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export class PaymentService {
	private static instance: PaymentService;
	private provider: ethers.JsonRpcProvider;
	private paymentContract: PaymentContract;
	private escrowContract: ethers.Contract;

	private constructor() {
		this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);

		// Initialize payment contract
		this.paymentContract = new ethers.Contract(
			config.blockchain.paymentContract,
			config.blockchain.paymentAbi,
			this.provider
		) as unknown as PaymentContract;

		// Initialize escrow contract
		this.escrowContract = new ethers.Contract(
			config.blockchain.escrowContract,
			config.blockchain.escrowAbi,
			this.provider
		);
	}

	public static getInstance(): PaymentService {
		if (!PaymentService.instance) {
			PaymentService.instance = new PaymentService();
		}
		return PaymentService.instance;
	}

	private async estimateGas(
		contract: PaymentContract,
		method: string,
		...args: any[]
	): Promise<bigint> {
		try {
			const gasEstimate = await contract[method].estimateGas(...args);
			return (gasEstimate * BigInt(120)) / BigInt(100); // Add 20% buffer
		} catch (error) {
			console.error(`Gas estimation failed for ${method}:`, error);
			throw new Error(`Failed to estimate gas for ${method}`);
		}
	}

	private async retryOperation<T>(
		operation: () => Promise<T>,
		maxRetries: number = MAX_RETRIES
	): Promise<T> {
		let lastError: Error | null = null;

		for (let i = 0; i < maxRetries; i++) {
			try {
				return await operation();
			} catch (error) {
				lastError = error as Error;
				if (i < maxRetries - 1) {
					await new Promise((resolve) =>
						setTimeout(resolve, RETRY_DELAY * (i + 1))
					);
				}
			}
		}

		throw lastError || new Error("Operation failed after retries");
	}

	async initiatePayment(
		amount: number,
		currency: string,
		paymentMethod: PaymentMethod,
		agreementId: string,
		buyerAddress: string,
		sellerAddress: string
	) {
		try {
			// Create a wallet instance
			const wallet = new ethers.Wallet(
				config.blockchain.privateKey,
				this.provider
			);

			// Connect the contract with the wallet
			const contractWithSigner = this.paymentContract.connect(
				wallet
			) as PaymentContract;

			// Generate payment ID
			const paymentId = ethers.keccak256(
				ethers.toUtf8Bytes(`${agreementId}-${amount}-${Date.now()}`)
			);

			// Estimate gas
			const gasLimit = await this.estimateGas(
				contractWithSigner,
				"recordFiatPayment",
				buyerAddress,
				sellerAddress,
				ethers.parseEther(amount.toString()),
				paymentId
			);

			// Record payment in blockchain with retry mechanism
			const tx = await this.retryOperation(async () => {
				return await contractWithSigner.recordFiatPayment(
					buyerAddress,
					sellerAddress,
					ethers.parseEther(amount.toString()),
					paymentId,
					{ gasLimit }
				);
			});

			// Wait for the transaction to be mined
			const receipt = await tx.wait();
			if (!receipt) {
				throw new Error("Transaction failed");
			}

			return {
				paymentId,
				transactionHash: receipt.hash,
				status: PaymentStatus.PENDING,
			};
		} catch (error) {
			console.error("Payment initiation error:", error);
			throw new Error("Failed to initiate payment");
		}
	}

	async completePayment(paymentId: string) {
		try {
			// Create a wallet instance
			const wallet = new ethers.Wallet(
				config.blockchain.privateKey,
				this.provider
			);

			// Connect the contract with the wallet
			const contractWithSigner = this.paymentContract.connect(
				wallet
			) as PaymentContract;

			// Estimate gas
			const gasLimit = await this.estimateGas(
				contractWithSigner,
				"completePayment",
				paymentId
			);

			// Complete payment in blockchain with retry mechanism
			const tx = await this.retryOperation(async () => {
				return await contractWithSigner.completePayment(paymentId, {
					gasLimit,
				});
			});

			const receipt = await tx.wait();
			if (!receipt) {
				throw new Error("Transaction failed");
			}

			return {
				transactionHash: receipt.hash,
				status: PaymentStatus.PAID,
			};
		} catch (error) {
			console.error("Payment completion error:", error);
			throw new Error("Failed to complete payment");
		}
	}

	async getPaymentStatus(paymentId: string) {
		try {
			const payment = await this.retryOperation(async () => {
				return await this.paymentContract.getPayment(paymentId);
			});

			return {
				isCompleted: payment.isCompleted,
				status: payment.isCompleted
					? PaymentStatus.PAID
					: PaymentStatus.PENDING,
			};
		} catch (error) {
			console.error("Payment status check error:", error);
			throw new Error("Failed to get payment status");
		}
	}
}
