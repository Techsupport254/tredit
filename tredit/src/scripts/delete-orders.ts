import { prisma } from "@/lib/prisma";

async function deleteAllOrders() {
	try {
		// Delete all order items first (due to foreign key constraints)
		await prisma.orderItem.deleteMany({});

		// Then delete all orders
		await prisma.order.deleteMany({});

		console.log("Successfully deleted all orders and order items");
	} catch (error) {
		console.error("Error deleting orders:", error);
	} finally {
		await prisma.$disconnect();
	}
}

deleteAllOrders();
