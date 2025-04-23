import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getBusinessProducts(businessId: string) {
	try {
		const products = await prisma.product.findMany({
			where: {
				businessId: businessId,
			},
			include: {
				media: true,
				variants: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		console.log("Products found:", products.length);
		console.log(JSON.stringify(products, null, 2));
	} catch (error) {
		console.error("Error fetching products:", error);
	} finally {
		await prisma.$disconnect();
	}
}

// Business ID: d0f46abb-4493-498c-b43a-5f70e58b0d6f
getBusinessProducts("d0f46abb-4493-498c-b43a-5f70e58b0d6f");
