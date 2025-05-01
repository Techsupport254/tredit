import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function getSampleOrders() {
	try {
		// Get total count
		const total = await prisma.order.count();
		const take = 20;
		// Get a random offset if there are more than 20 orders
		const skip = total > take ? Math.floor(Math.random() * (total - take)) : 0;

		const orders = await prisma.order.findMany({
			skip,
			take,
			orderBy: { createdAt: "desc" },
			include: {
				items: {
					include: {
						product: true,
					},
				},
				business: true,
				user: true,
			},
		});

		console.log(JSON.stringify(orders, null, 2));
	} catch (error) {
		console.error("Error fetching sample orders:", error);
	} finally {
		await prisma.$disconnect();
	}
}

async function createRandom2024Orders() {
	try {
		// Get users and products
		const users = await prisma.user.findMany({ select: { id: true } });
		const products = await prisma.product.findMany({
			select: { id: true, price: true, businessId: true },
		});
		if (!users.length || !products.length) {
			console.error("No users or products found in the database.");
			return;
		}
		const orders = [];
		for (let i = 0; i < 20; i++) {
			const user = faker.helpers.arrayElement(users);
			const numProducts = faker.number.int({ min: 1, max: 3 });
			const selectedProducts = faker.helpers.arrayElements(
				products,
				numProducts
			);
			const orderDate = faker.date.between({
				from: new Date(2024, 0, 1),
				to: new Date(2024, 11, 31),
			});
			const totalAmount = selectedProducts.reduce(
				(sum, p) => sum + Number(p.price),
				0
			);
			const order = await prisma.order.create({
				data: {
					userId: user.id,
					businessId: selectedProducts[0].businessId,
					totalAmount,
					paymentStatus: "PENDING",
					currentStatus: "PENDING",
					createdAt: orderDate,
					updatedAt: orderDate,
					items: {
						create: selectedProducts.map((p) => ({
							productId: p.id,
							quantity: faker.number.int({ min: 1, max: 3 }),
							price: p.price,
							createdAt: orderDate,
						})),
					},
				},
				include: {
					items: { include: { product: true } },
					business: true,
					user: true,
				},
			});
			orders.push(order);
		}
		console.log(JSON.stringify(orders, null, 2));
	} catch (error) {
		console.error("Error creating random 2024 orders:", error);
	} finally {
		await prisma.$disconnect();
	}
}

// Uncomment to run sample fetch
// getSampleOrders();

// Run the 2024 random order creation
createRandom2024Orders();
