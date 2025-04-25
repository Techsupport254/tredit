const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function deleteAllProducts() {
	try {
		console.log("Starting to delete all products...");

		// First, delete all product media
		console.log("Deleting product media...");
		await prisma.productMedia.deleteMany({});

		// Delete all product variants
		console.log("Deleting product variants...");
		await prisma.productVariant.deleteMany({});

		// Delete all product SEO
		console.log("Deleting product SEO...");
		await prisma.productSEO.deleteMany({});

		// Delete all product analytics
		console.log("Deleting product analytics...");
		await prisma.productAnalytics.deleteMany({});

		// Finally, delete all products
		console.log("Deleting products...");
		const result = await prisma.product.deleteMany({});

		console.log(
			`Successfully deleted ${result.count} products and all related data.`
		);
	} catch (error) {
		console.error("Error deleting products:", error);
	} finally {
		await prisma.$disconnect();
	}
}

deleteAllProducts();
