const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkProduct(productId) {
	try {
		console.log(`Fetching product with ID: ${productId}...`);

		const product = await prisma.product.findUnique({
			where: { id: productId },
			include: {
				variants: true,
				media: {
					orderBy: { order: "asc" },
				},
			},
		});

		if (!product) {
			console.log("Product not found");
			return;
		}

		console.log("\nProduct Details:");
		console.log(`ID: ${product.id}`);
		console.log(`Name: ${product.name}`);
		console.log(`Description: ${product.description}`);
		console.log(`Status: ${product.status}`);
		console.log(`IPFS Hash: ${product.ipfsHash}`);
		console.log(
			`YouTube Video ID: ${product.youtubeVideoId || "No YouTube ID found"}`
		);

		console.log("\nVariant Verification:");
		console.log(
			`  - Product Price: ${product.price} (Should match first variant price)`
		);
		console.log(
			`  - Product Stock: ${product.stock} (Should match first variant stock)`
		);
		if (product.variants.length > 0) {
			console.log(`  - First Variant Price: ${product.variants[0].price}`);
			console.log(`  - First Variant Stock: ${product.variants[0].stock}`);
		}

		console.log("\nProduct Media:");
		let youtubeVideo = null;
		product.media.forEach((media, index) => {
			console.log(
				`  - Media ${index + 1}: Type=${media.type}, URL=${media.url}`
			);
			if (media.type === "VIDEO") {
				youtubeVideo = media;
			}
		});

		if (youtubeVideo) {
			console.log("\nYouTube Video Details:");
			console.log(`  - Video URL: ${youtubeVideo.url}`);
			if (youtubeVideo.metadata) {
				console.log(`  - Title: ${youtubeVideo.metadata.title}`);
				console.log(`  - Description: ${youtubeVideo.metadata.description}`);
				console.log(`  - Visibility: ${youtubeVideo.metadata.visibility}`);
				console.log(`  - Category: ${youtubeVideo.metadata.category}`);
			}
		} else {
			console.log("\nNo YouTube video found in media.");
		}

		console.log("\nMedia Summary:");
		const mediaTypes = product.media.reduce((acc, media) => {
			acc[media.type] = (acc[media.type] || 0) + 1;
			return acc;
		}, {});
		console.log(`  - Total Media Items: ${product.media.length}`);
		Object.entries(mediaTypes).forEach(([type, count]) => {
			console.log(`  - ${type}: ${count}`);
		});
	} catch (error) {
		console.error("Error checking product:", error);
	} finally {
		await prisma.$disconnect();
	}
}

// Get product ID from command line argument
const productId = process.argv[2];
if (!productId) {
	console.error("Please provide a product ID as an argument");
	process.exit(1);
}

checkProduct(productId);
