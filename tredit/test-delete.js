const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
	try {
		// Try to delete verification codes for a test email
		const result = await prisma.verificationCode.deleteMany({
			where: { email: "test@example.com" },
		});
		console.log("Delete result:", result);
	} catch (e) {
		console.error("Error:", e);
	} finally {
		await prisma.$disconnect();
	}
}

main();
