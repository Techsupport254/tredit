import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PRODUCT_ID = "32e246fc-f7f5-4945-bf86-fc70e616979a"; // ID from the latest product

async function addTestVideoMedia() {
	try {
		console.log(`Adding test video media to product ${PRODUCT_ID}...`);

		// First, get the highest order number
		const highestOrderMedia = await prisma.productMedia.findFirst({
			where: {
				productId: PRODUCT_ID,
			},
			orderBy: {
				order: "desc",
			},
		});

		const nextOrder = (highestOrderMedia?.order || 0) + 1;

		// Create a test video media entry
		const videoMedia = await prisma.productMedia.create({
			data: {
				productId: PRODUCT_ID,
				type: "VIDEO",
				url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Test YouTube URL
				order: nextOrder,
			},
		});

		console.log("Successfully added video media:");
		console.log(JSON.stringify(videoMedia, null, 2));

		// Get the updated product
		const updatedProduct = await prisma.product.findUnique({
			where: {
				id: PRODUCT_ID,
			},
			include: {
				media: {
					orderBy: {
						order: "asc",
					},
				},
			},
		});

		console.log("\nUpdated product media:");
		console.log(JSON.stringify(updatedProduct.media, null, 2));
	} catch (error) {
		console.error("Error adding test video media:", error);
	} finally {
		await prisma.$disconnect();
	}
}

// Run the function
addTestVideoMedia();
