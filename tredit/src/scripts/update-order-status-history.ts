import { prisma } from "@/lib/prisma";

async function updateOrderStatusHistory() {
	try {
		// Rename status column to statusHistory
		await prisma.$executeRaw`
      ALTER TABLE "Order" RENAME COLUMN "status" TO "statusHistory";
    `;

		console.log("Successfully renamed status column to statusHistory");
	} catch (error) {
		console.error("Error updating order status history:", error);
	} finally {
		await prisma.$disconnect();
	}
}

updateOrderStatusHistory();
