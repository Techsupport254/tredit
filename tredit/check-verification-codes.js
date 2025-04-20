const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
	try {
		const codes = await prisma.verificationCode.findMany();
		console.log("Verification Codes:", codes);
	} catch (e) {
		console.error("Error:", e);
	} finally {
		await prisma.$disconnect();
	}
}

main();
