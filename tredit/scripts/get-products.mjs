import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BUSINESS_ID = "d0f46abb-4493-498c-b43a-5f70e58b0d6f";

async function findProductsWithVideos() {
	try {
		// Get all products with their media
		const products = await prisma.product.findMany({
			where: {
				businessId: BUSINESS_ID,
			},
			include: {
				media: true,
				variants: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		console.log(`Found ${products.length} products total`);

		// Filter for products with VIDEO in their media type
		const productsWithVideo = products.filter((product) =>
			product.media.some(
				(media) =>
					(media.type && media.type.toUpperCase().includes("VIDEO")) ||
					(media.url &&
						(media.url.includes("youtube.com") ||
							media.url.includes("youtu.be") ||
							media.url.includes(".mp4") ||
							media.url.includes(".webm")))
			)
		);

		console.log(`\nFound ${productsWithVideo.length} products with videos:`);

		if (productsWithVideo.length > 0) {
			productsWithVideo.forEach((product, index) => {
				console.log(`\n--- Product ${index + 1} with video ---`);
				console.log(`ID: ${product.id}`);
				console.log(`Name: ${product.name}`);

				// Find video media
				const videoMedia = product.media.filter(
					(media) =>
						(media.type && media.type.toUpperCase().includes("VIDEO")) ||
						(media.url &&
							(media.url.includes("youtube.com") ||
								media.url.includes("youtu.be") ||
								media.url.includes(".mp4") ||
								media.url.includes(".webm")))
				);

				console.log(`Video media items (${videoMedia.length}):`);
				videoMedia.forEach((media) => {
					console.log(`  - Type: ${media.type}, URL: ${media.url}`);
				});
			});

			// Output full details of the first product with video
			if (productsWithVideo.length > 0) {
				console.log("\n--- Full details of first product with video ---");
				console.log(JSON.stringify(productsWithVideo[0], null, 2));
			}
		} else {
			console.log("No products with videos found");

			// Show latest product as a fallback
			if (products.length > 0) {
				console.log("\n--- Latest product (no videos) ---");
				console.log(JSON.stringify(products[0], null, 2));
			}
		}
	} catch (error) {
		console.error("Error fetching products:", error);
	} finally {
		await prisma.$disconnect();
	}
}

// Run the function
findProductsWithVideos();
