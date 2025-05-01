import { PrismaClient, OrderStatus, PaymentStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function createOrders() {
	try {
		console.log("Creating orders for users...\n");

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

		// Create 2-3 orders per user
		for (const user of users) {
			const numOrders = faker.number.int({ min: 2, max: 3 });

			for (let i = 0; i < numOrders; i++) {
				// Select 1-3 random products for each order
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
						items: {
							create: selectedProducts.map((product) => ({
								productId: product.id,
								quantity: faker.number.int({ min: 1, max: 3 }),
								price: product.price,
							})),
						},
					},
				});

				console.log(`Created order for ${user.name}:`);
				console.log(`   Order ID: ${order.id}`);
				console.log(`   Total Amount: KES ${order.totalAmount}`);
				console.log(`   Status: ${order.currentStatus}`);
				console.log(`   Payment Status: ${order.paymentStatus}`);
				console.log("");
			}
		}

		console.log("Finished creating orders!");
	} catch (error) {
		console.error("Error creating orders:", error);
	} finally {
		await prisma.$disconnect();
	}
}

createOrders();
