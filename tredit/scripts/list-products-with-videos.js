const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function listProductsWithVideos() {
	try {
		console.log("Fetching products with YouTube videos...");

		const products = await prisma.product.findMany({
			where: {
				NOT: {
					youtubeVideoId: null,
				},
			},
			include: {
				media: {
					where: {
						type: "VIDEO",
					},
				},
			},
		});

		if (products.length === 0) {
			console.log("No products found with YouTube videos.");
			return;
		}

		console.log("\nProducts with YouTube videos:");
		products.forEach((product, index) => {
			console.log(`\n${index + 1}. Product: ${product.name}`);
			console.log(`   ID: ${product.id}`);
			console.log(`   YouTube Video ID: ${product.youtubeVideoId}`);
			if (product.media.length > 0) {
				console.log("   Video Details:");
				product.media.forEach((media) => {
					console.log(`   - URL: ${media.url}`);
				});
			}
		});
	} catch (error) {
		console.error("Error listing products:", error);
	} finally {
		await prisma.$disconnect();
	}
}

listProductsWithVideos();
