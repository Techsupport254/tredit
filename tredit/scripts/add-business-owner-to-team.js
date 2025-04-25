const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function addBusinessOwnersToTeam() {
	try {
		// Get all businesses
		const businesses = await prisma.business.findMany({
			select: {
				id: true,
				userId: true,
				name: true,
			},
		});

		console.log(`Found ${businesses.length} businesses`);

		// For each business, check if owner is in team
		for (const business of businesses) {
			// Check if owner is already in team
			const existingTeamMember = await prisma.businessTeamMember.findUnique({
				where: {
					businessId_userId: {
						businessId: business.id,
						userId: business.userId,
					},
				},
			});

			if (!existingTeamMember) {
				// Add owner to team
				await prisma.businessTeamMember.create({
					data: {
						businessId: business.id,
						userId: business.userId,
						role: "OWNER",
						responsibilities: ["Full business management"],
						permissions: {
							canManageTeam: true,
							canManageProducts: true,
							canManageServices: true,
							canManageOrders: true,
							canManagePayments: true,
							canManageSettings: true,
							canManageContent: true,
							canManageAnalytics: true,
						},
					},
				});
				console.log(`Added owner to team for business: ${business.name}`);
			} else {
				console.log(`Owner already in team for business: ${business.name}`);
			}
		}

		console.log("Finished adding business owners to teams");
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await prisma.$disconnect();
	}
}

// Run the script
addBusinessOwnersToTeam();
