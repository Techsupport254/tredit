const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
	try {
		const business = await prisma.business.findFirst({
			where: {
				name: "SasaTech Africa",
			},
			include: {
				user: true,
			},
		});
		console.log("Business details:", JSON.stringify(business, null, 2));
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await prisma.$disconnect();
	}
}

main();
