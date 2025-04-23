import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BUSINESS_ID = "d0f46abb-4493-498c-b43a-5f70e58b0d6f";

async function getLatestProduct() {
	try {
		const product = await prisma.product.findFirst({
			where: {
				businessId: BUSINESS_ID,
			},
			include: {
				media: {
					orderBy: {
						order: "asc",
					},
				},
				variants: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		if (product) {
			console.log("Latest product:");
			console.log(JSON.stringify(product, null, 2));
		} else {
			console.log("No products found");
		}
	} catch (error) {
		console.error("Error fetching product:", error);
	} finally {
		await prisma.$disconnect();
	}
}

// Run the function
getLatestProduct();
