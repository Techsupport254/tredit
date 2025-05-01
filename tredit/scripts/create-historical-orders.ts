import { PrismaClient, OrderStatus, PaymentStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function createHistoricalOrders() {
	try {
		console.log("Creating historical orders for 2024...\n");

		// Get all users
		const users = await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				walletAddress: true,
			},
		});

		// Get all products
		const products = await prisma.product.findMany({
			select: {
				id: true,
				name: true,
				price: true,
				businessId: true,
			},
		});

		// Create orders for each month of 2024
		for (let month = 0; month < 12; month++) {
			// Create 5-10 orders per month
			const numOrders = faker.number.int({ min: 5, max: 10 });

			for (let i = 0; i < numOrders; i++) {
				// Select a random user
				const user = faker.helpers.arrayElement(users);

				// Select 1-3 random products
				const numProducts = faker.number.int({ min: 1, max: 3 });
				const selectedProducts = faker.helpers.arrayElements(
					products,
					numProducts
				);

				// Calculate total amount
				const totalAmount = selectedProducts.reduce((sum, product) => {
					const quantity = faker.number.int({ min: 1, max: 3 });
					return sum + Number(product.price) * quantity;
				}, 0);

				// Generate a random date in the current month
				const orderDate = faker.date.between({
					from: new Date(2024, month, 1),
					to: new Date(2024, month + 1, 0),
				});

				// Create order
				const order = await prisma.order.create({
					data: {
						userId: user.id,
						businessId: selectedProducts[0].businessId,
						currentStatus: faker.helpers.arrayElement([
							OrderStatus.PENDING,
							OrderStatus.PROCESSING,
							OrderStatus.COMPLETED,
						]),
						totalAmount,
						paymentStatus: faker.helpers.arrayElement([
							PaymentStatus.PENDING,
							PaymentStatus.COMPLETED,
						]),
						shippingAddress: faker.location.streetAddress(),
						createdAt: orderDate,
						updatedAt: orderDate,
						items: {
							create: selectedProducts.map((product) => ({
								productId: product.id,
								quantity: faker.number.int({ min: 1, max: 3 }),
								price: product.price,
								createdAt: orderDate,
							})),
						},
					},
				});

				console.log(`Created order for ${user.name}:`);
				console.log(`   Order ID: ${order.id}`);
				console.log(`   Date: ${orderDate.toLocaleDateString()}`);
				console.log(`   Total Amount: KES ${order.totalAmount}`);
				console.log(`   Status: ${order.currentStatus}`);
				console.log(`   Payment Status: ${order.paymentStatus}`);
				console.log("");
			}
		}

		console.log("Finished creating historical orders!");
	} catch (error) {
		console.error("Error creating historical orders:", error);
	} finally {
		await prisma.$disconnect();
	}
}

createHistoricalOrders();
