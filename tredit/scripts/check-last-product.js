const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
	// Extract businessId from the path provided in the user query
	const businessId = "d0f46abb-4493-498c-b43a-5f70e58b0d6f";
	console.log(`Fetching the latest product for business ID: ${businessId}...`);

	const product = await prisma.product.findFirst({
		where: { businessId: businessId },
		orderBy: { createdAt: "desc" },
		include: {
			variants: true,
			seo: true,
			analytics: true,
			media: true,
		},
	});

	if (product) {
		console.log("Most recently created product details:");
		console.log(`ID: ${product.id}`);
		console.log(`Name: ${product.name}`);
		console.log(`Description: ${product.description || "No description"}`);
		console.log(`Status: ${product.status}`);
		console.log(`IPFS Hash: ${product.ipfsHash || "No IPFS hash"}`);
		console.log(
			`YouTube Video ID: ${product.youtubeVideoId || "No YouTube ID found"}`
		);

		if (product.variants.length > 0) {
			const firstVariant = product.variants[0];
			console.log("\nVariant Verification:");
			console.log(
				`  - Product Price: ${product.price} (Should match first variant price)`
			);
			console.log(
				`  - Product Stock: ${product.stock} (Should match first variant stock)`
			);
			console.log(`  - First Variant Price: ${firstVariant.price}`);
			console.log(`  - First Variant Stock: ${firstVariant.stock}`);
		} else {
			console.log("Product has no variants.");
		}

		// Check for media
		if (product.media && product.media.length > 0) {
			console.log("\nProduct Media:");
			let youtubeVideo = null;

			product.media.forEach((item, index) => {
				console.log(
					`  - Media ${index + 1}: Type=${item.type}, URL=${item.url}`
				);

				// Check if this is a YouTube video
				if (item.type === "VIDEO" && item.url.includes("youtube.com")) {
					youtubeVideo = item;
				}
			});

			// If we found a YouTube video, show more details
			if (youtubeVideo) {
				console.log("\nYouTube Video Details:");
				console.log(`  - URL: ${youtubeVideo.url}`);

				// Extract video ID from URL if possible
				const videoIdMatch = youtubeVideo.url.match(/[?&]v=([^&]+)/);
				if (videoIdMatch && videoIdMatch[1]) {
					console.log(`  - Extracted Video ID: ${videoIdMatch[1]}`);
					console.log(
						`  - Does it match product.youtubeVideoId? ${
							videoIdMatch[1] === product.youtubeVideoId ? "Yes" : "No"
						}`
					);
				}
			} else {
				console.log("\nNo YouTube video found in media.");
			}

			// Count by media type
			const mediaTypes = product.media.reduce((acc, media) => {
				acc[media.type] = (acc[media.type] || 0) + 1;
				return acc;
			}, {});

			console.log("\nMedia Summary:");
			console.log(`  - Total Media Items: ${product.media.length}`);
			Object.entries(mediaTypes).forEach(([type, count]) => {
				console.log(`  - ${type}: ${count}`);
			});
		} else {
			console.log("\nProduct has no associated media.");
		}
	} else {
		console.log(`No products found for business ID: ${businessId}`);
	}
}

main()
	.catch((e) => {
		console.error("Error fetching product:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		console.log("Prisma client disconnected.");
	});
