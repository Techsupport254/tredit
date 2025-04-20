const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
	try {
		// Delete existing YouTube connection
		await prisma.socialMediaConnection.deleteMany({
			where: {
				platform: "YOUTUBE",
				businessId: "1a0c84b5-746d-4ae6-b1a0-e4b5f3c554d7",
			},
		});
		console.log("Deleted existing YouTube connections");

		// First check businesses
		const businesses = await prisma.business.findMany({
			include: {
				user: true,
				teamMembers: true,
				businessHours: true,
				ratings: true,
				verifications: true,
				socialMediaConnections: true,
			},
		});
		console.log("Businesses:", JSON.stringify(businesses, null, 2));

		// Then check social media connections separately
		const socialMediaConnections =
			await prisma.socialMediaConnection.findMany();
		console.log(
			"\nSocial Media Connections:",
			JSON.stringify(socialMediaConnections, null, 2)
		);
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await prisma.$disconnect();
	}
}

main();
