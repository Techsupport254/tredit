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
		console.dir(product, { depth: null });

		if (product.variants.length > 0) {
			const firstVariant = product.variants[0];
			console.log("\nVerification:");
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
			product.media.forEach((item, index) => {
				console.log(
					`  - Media ${index + 1}: Type=${item.type}, URL=${item.url}`
				);
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
