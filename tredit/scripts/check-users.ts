import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUsers() {
	try {
		console.log("Fetching users from database...\n");

		const users = await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				walletAddress: true,
				metadata: true,
				gender: true,
				phoneNumber: true,
				shippingAddress: true,
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 20,
		});

		console.log(`Found ${users.length} users:\n`);

		users.forEach((user, index) => {
			const metadata = user.metadata as {
				tribe: string;
				region: string;
				registrationDate: string;
			};
			console.log(`${index + 1}. ${user.name}`);
			console.log(`   Email: ${user.email}`);
			console.log(`   Wallet: ${user.walletAddress}`);
			console.log(`   Tribe: ${metadata.tribe}`);
			console.log(`   Region: ${metadata.region}`);
			console.log(`   Gender: ${user.gender}`);
			console.log(`   Phone: ${user.phoneNumber}`);
			console.log(`   Address: ${user.shippingAddress}`);
			console.log("");
		});
	} catch (error) {
		console.error("Error fetching users:", error);
	} finally {
		await prisma.$disconnect();
	}
}

checkUsers();
