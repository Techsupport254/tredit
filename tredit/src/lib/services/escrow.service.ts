import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export class EscrowService {
	private static instance: EscrowService;

	private constructor() {}

	public static getInstance(): EscrowService {
		if (!EscrowService.instance) {
			EscrowService.instance = new EscrowService();
		}
		return EscrowService.instance;
	}

	async createEscrowPayment(
		orderId: string,
		amount: number,
		buyerId: string,
		sellerId: string,
		conditions: {
			deliveryConfirmed: boolean;
			disputePeriod: number; // in days
			autoReleaseAfter: number; // in days
		}
	) {
		try {
			const escrow = await prisma.escrowPayment.create({
				data: {
					orderId,
					amount,
					buyerId,
					sellerId,
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
							note: "Payment held in escrow",
							timestamp: new Date().toISOString(),
						},
					},
				},
			});

			return escrow;
		} catch (error) {
			console.error("Error creating escrow payment:", error);
			throw error;
		}
	}

	async releaseEscrowPayment(escrowId: string, reason: string) {
		try {
			const escrow = await prisma.escrowPayment.findUnique({
				where: { id: escrowId },
				include: { order: true },
			});

			if (!escrow) {
				throw new Error("Escrow payment not found");
			}

			// Update escrow status
			await prisma.escrowPayment.update({
				where: { id: escrowId },
				data: {
					status: "RELEASED",
					metadata: {
						...escrow.metadata,
						releasedAt: new Date(),
						releaseReason: reason,
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
			console.error("Error releasing escrow payment:", error);
			throw error;
		}
	}

	async refundEscrowPayment(escrowId: string, reason: string) {
		try {
			const escrow = await prisma.escrowPayment.findUnique({
				where: { id: escrowId },
				include: { order: true },
			});

			if (!escrow) {
				throw new Error("Escrow payment not found");
			}

			// Update escrow status
			await prisma.escrowPayment.update({
				where: { id: escrowId },
				data: {
					status: "REFUNDED",
					metadata: {
						...escrow.metadata,
						refundedAt: new Date(),
						refundReason: reason,
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
			console.error("Error refunding escrow payment:", error);
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
				await this.releaseEscrowPayment(
					escrowId,
					"Auto-released after dispute period"
				);
				return true;
			}

			// Check if delivery is confirmed
			if (conditions.deliveryConfirmed) {
				await this.releaseEscrowPayment(escrowId, "Delivery confirmed");
				return true;
			}

			return false;
		} catch (error) {
			console.error("Error checking escrow conditions:", error);
			throw error;
		}
	}
}
