import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkAllOrders() {
	try {
		console.log("Fetching all orders in the database...");

		const orders = await prisma.order.findMany({
			include: {
				items: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		if (orders.length === 0) {
			console.log("No orders found.");
			return;
		}

		console.log(`\nFound ${orders.length} order(s):\n`);
		orders.forEach((order, idx) => {
			console.log(`Order #${idx + 1}`);
			console.log(`  ID: ${order.id}`);
			console.log(`  Business ID: ${order.businessId}`);
			console.log(`  User ID: ${order.userId}`);
			console.log(`  Status: ${order.status}`);
			console.log(`  Total Amount: ${order.totalAmount}`);
			console.log(`  Created At: ${order.createdAt}`);
			console.log("  Items:");
			if (order.items.length === 0) {
				console.log("    (No items)");
			} else {
				order.items.forEach((item, i) => {
					console.log(
						`    - Item #${i + 1}: Product ID=${item.productId}, Quantity=${
							item.quantity
						}, Price=${item.price}`
					);
				});
			}
			console.log("");
		});

		console.log("Summary:");
		console.log(`  Total Orders: ${orders.length}`);
		const totalItems = orders.reduce(
			(sum, order) => sum + order.items.length,
			0
		);
		console.log(`  Total Items: ${totalItems}`);
	} catch (error) {
		console.error("Error checking all orders:", error);
	} finally {
		await prisma.$disconnect();
	}
}

checkAllOrders();
