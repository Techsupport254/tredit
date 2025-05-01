import { ethers } from "ethers";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import config from "@/config";

const TOKEN_CONTRACT_ABI = [
	"function transfer(address to, uint256 amount) returns (bool)",
	"function transferFrom(address from, address to, uint256 amount) returns (bool)",
	"function balanceOf(address account) view returns (uint256)",
	"function approve(address spender, uint256 amount) returns (bool)",
	"function allowance(address owner, address spender) view returns (uint256)",
];

export class TokenEscrowService {
	private static instance: TokenEscrowService;
	private provider: ethers.JsonRpcProvider;
	private signer: ethers.Signer;
	private tokenContract: ethers.Contract;

	private constructor() {
		if (
			!config.blockchain.rpcUrl ||
			!config.blockchain.privateKey ||
			!config.blockchain.tokenAddress
		) {
			throw new Error("Blockchain configuration is missing");
		}

		this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
		this.signer = new ethers.Wallet(
			config.blockchain.privateKey,
			this.provider
		);
		this.tokenContract = new ethers.Contract(
			config.blockchain.tokenAddress,
			TOKEN_CONTRACT_ABI,
			this.signer
		);
	}

	public static getInstance(): TokenEscrowService {
		if (!TokenEscrowService.instance) {
			TokenEscrowService.instance = new TokenEscrowService();
		}
		return TokenEscrowService.instance;
	}

	async convertFiatToTokens(amount: number): Promise<number> {
		// Convert KES to TRDT tokens (1 TRDT = 100 KES)
		return amount / 100;
	}

	async createTokenEscrow(
		orderId: string,
		amount: number,
		buyerId: string,
		sellerId: string,
		conditions: {
			deliveryConfirmed: boolean;
			disputePeriod: number;
			autoReleaseAfter: number;
		}
	) {
		try {
			if (!prisma) {
				throw new Error("Prisma client is not initialized");
			}

			// Convert fiat amount to tokens
			const tokenAmount = await this.convertFiatToTokens(amount);

			// Create escrow payment record
			const escrow = await prisma.escrowPayment.create({
				data: {
					order: {
						connect: { id: orderId },
					},
					amount: tokenAmount,
					buyer: {
						connect: { id: buyerId },
					},
					seller: {
						connect: { id: sellerId },
					},
					status: "PENDING",
					conditions: {
						deliveryConfirmed: conditions.deliveryConfirmed,
						disputePeriod: conditions.disputePeriod,
						autoReleaseAfter: conditions.autoReleaseAfter,
						createdAt: new Date(),
					},
					metadata: {
						createdAt: new Date(),
						updatedAt: new Date(),
						tokenAmount,
						fiatAmount: amount,
						tokenAddress: config.blockchain.tokenAddress,
					},
				},
			});

			// Update order status
			await prisma.order.update({
				where: { id: orderId },
				data: {
					paymentStatus: "HELD_IN_ESCROW",
					statusHistory: {
						push: {
							status: "PAYMENT_HELD",
							note: "Payment held in token escrow",
							timestamp: new Date().toISOString(),
						},
					},
				},
			});

			return escrow;
		} catch (error) {
			console.error("Error creating token escrow:", error);
			throw error;
		}
	}

	async releaseTokenEscrow(escrowId: string, reason: string) {
		try {
			const escrow = await prisma.escrowPayment.findUnique({
				where: { id: escrowId },
				include: { order: true },
			});

			if (!escrow) {
				throw new Error("Escrow payment not found");
			}

			// Get seller's wallet address
			const seller = await prisma.user.findUnique({
				where: { id: escrow.sellerId },
				select: { walletAddress: true },
			});

			if (!seller?.walletAddress) {
				throw new Error("Seller wallet address not found");
			}

			// Transfer tokens to seller
			const tokenAmount = ethers.parseEther(escrow.amount.toString());
			const tx = await this.tokenContract.transfer(
				seller.walletAddress,
				tokenAmount
			);
			await tx.wait();

			// Update escrow status
			await prisma.escrowPayment.update({
				where: { id: escrowId },
				data: {
					status: "RELEASED",
					metadata: {
						...escrow.metadata,
						releasedAt: new Date(),
						releaseReason: reason,
						transactionHash: tx.hash,
					},
				},
			});

			// Update order status
			await prisma.order.update({
				where: { id: escrow.orderId },
				data: {
					paymentStatus: "PAID",
					statusHistory: {
						push: {
							status: "PAYMENT_RELEASED",
							note: `Payment released from escrow: ${reason}`,
							timestamp: new Date().toISOString(),
						},
					},
				},
			});

			return escrow;
		} catch (error) {
			console.error("Error releasing token escrow:", error);
			throw error;
		}
	}

	async refundTokenEscrow(escrowId: string, reason: string) {
		try {
			const escrow = await prisma.escrowPayment.findUnique({
				where: { id: escrowId },
				include: { order: true },
			});

			if (!escrow) {
				throw new Error("Escrow payment not found");
			}

			// Get buyer's wallet address
			const buyer = await prisma.user.findUnique({
				where: { id: escrow.buyerId },
				select: { walletAddress: true },
			});

			if (!buyer?.walletAddress) {
				throw new Error("Buyer wallet address not found");
			}

			// Transfer tokens back to buyer
			const tokenAmount = ethers.parseEther(escrow.amount.toString());
			const tx = await this.tokenContract.transfer(
				buyer.walletAddress,
				tokenAmount
			);
			await tx.wait();

			// Update escrow status
			await prisma.escrowPayment.update({
				where: { id: escrowId },
				data: {
					status: "REFUNDED",
					metadata: {
						...escrow.metadata,
						refundedAt: new Date(),
						refundReason: reason,
						transactionHash: tx.hash,
					},
				},
			});

			// Update order status
			await prisma.order.update({
				where: { id: escrow.orderId },
				data: {
					paymentStatus: "REFUNDED",
					statusHistory: {
						push: {
							status: "PAYMENT_REFUNDED",
							note: `Payment refunded: ${reason}`,
							timestamp: new Date().toISOString(),
						},
					},
				},
			});

			return escrow;
		} catch (error) {
			console.error("Error refunding token escrow:", error);
			throw error;
		}
	}

	async checkEscrowConditions(escrowId: string) {
		try {
			const escrow = await prisma.escrowPayment.findUnique({
				where: { id: escrowId },
				include: { order: true },
			});

			if (!escrow) {
				throw new Error("Escrow payment not found");
			}

			const conditions = escrow.conditions as any;
			const now = new Date();
			const createdAt = new Date(conditions.createdAt);
			const daysSinceCreation = Math.floor(
				(now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
			);

			// Check if auto-release period has passed
			if (daysSinceCreation >= conditions.autoReleaseAfter) {
				await this.releaseTokenEscrow(
					escrowId,
					"Auto-released after dispute period"
				);
				return true;
			}

			// Check if delivery is confirmed
			if (conditions.deliveryConfirmed) {
				await this.releaseTokenEscrow(escrowId, "Delivery confirmed");
				return true;
			}

			return false;
		} catch (error) {
			console.error("Error checking escrow conditions:", error);
			throw error;
		}
	}
}
