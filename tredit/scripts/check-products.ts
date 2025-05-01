import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkProducts() {
	try {
		console.log("Fetching products from database...\n");

		const products = await prisma.product.findMany({
			select: {
				id: true,
				name: true,
				price: true,
				stock: true,
				business: {
					select: {
						name: true,
					},
				},
			},
		});

		console.log(`Found ${products.length} products:\n`);

		products.forEach((product, index) => {
			console.log(`${index + 1}. ${product.name}`);
			console.log(`   ID: ${product.id}`);
			console.log(`   Price: KES ${product.price}`);
			console.log(`   Stock: ${product.stock}`);
			console.log(`   Business: ${product.business.name}`);
			console.log("");
		});
	} catch (error) {
		console.error("Error fetching products:", error);
	} finally {
		await prisma.$disconnect();
	}
}

checkProducts();
