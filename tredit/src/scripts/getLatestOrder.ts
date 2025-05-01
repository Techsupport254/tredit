import { prisma } from "@/lib/prisma";

async function getLatestOrder() {
	try {
		// Get the latest order with all related data
		const latestOrder = await prisma.order.findFirst({
			orderBy: {
				createdAt: "desc",
			},
			include: {
				items: {
					include: {
						product: {
							select: {
								name: true,
								price: true,
								media: true,
							},
						},
						service: {
							select: {
								name: true,
								price: true,
							},
						},
					},
				},
				business: {
					select: {
						name: true,
						id: true,
					},
				},
				user: {
					select: {
						name: true,
						email: true,
					},
				},
			},
		});

		if (!latestOrder) {
			console.log("No orders found");
			return;
		}

		// Log the raw data first
		console.log("\n=== Raw Order Data ===");
		console.log(JSON.stringify(latestOrder, null, 2));
		console.log("=== End Raw Data ===\n");

		// Format and display the order data
		console.log("\n=== Latest Order Details ===");
		console.log(`Order ID: ${latestOrder.id}`);
		console.log(`Business: ${latestOrder.business.name}`);
		console.log(
			`Customer: ${latestOrder.user.name} (${latestOrder.user.email})`
		);
		console.log(`Total Amount: KES ${latestOrder.totalAmount}`);
		console.log(`Current Status: ${latestOrder.currentStatus}`);
		console.log("\nStatus History:");

		// Handle status history
		let history = [];
		try {
			if (typeof latestOrder.statusHistory === "string") {
				history = JSON.parse(latestOrder.statusHistory);
				console.log("\nRaw Status History:");
				console.log(latestOrder.statusHistory);
			} else if (Array.isArray(latestOrder.statusHistory)) {
				history = latestOrder.statusHistory;
			}
		} catch (e) {
			console.log("No status history available");
		}

		if (history.length > 0) {
			history.forEach((status: any) => {
				console.log(
					`- ${status.status}: ${status.note} (${new Date(
						status.timestamp
					).toLocaleString()})`
				);
			});
		} else {
			console.log("No status history available");
		}

		console.log("\nOrder Items:");
		latestOrder.items.forEach((item: any) => {
			console.log(`- ${item.product?.name || item.service?.name}`);
			console.log(`  Quantity: ${item.quantity}`);
			console.log(`  Price: KES ${item.price}`);
			console.log(`  Subtotal: KES ${item.price * item.quantity}`);
		});

		console.log("\n=== End of Order Details ===\n");
	} catch (error) {
		console.error("Error fetching latest order:", error);
	} finally {
		await prisma.$disconnect();
	}
}

// Run the script
getLatestOrder();
