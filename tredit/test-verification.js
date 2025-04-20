const { PrismaClient } = require("@prisma/client");
const { randomBytes } = require("crypto");
const prisma = new PrismaClient();

async function main() {
	try {
		const email = "test@example.com";
		const verificationCode = randomBytes(3).toString("hex").toUpperCase();

		// Delete any existing verification codes
		console.log("Deleting existing codes...");
		await prisma.verificationCode.deleteMany({
			where: { email },
		});

		// Create new verification code
		console.log("Creating new code...");
		const verificationRecord = await prisma.verificationCode.create({
			data: {
				email,
				code: verificationCode,
				expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
			},
		});

		console.log("Verification record created:", verificationRecord);

		// Try to delete again
		console.log("Deleting codes again...");
		await prisma.verificationCode.deleteMany({
			where: { email },
		});

		console.log("Successfully completed all operations");
	} catch (e) {
		console.error("Error:", e);
	} finally {
		await prisma.$disconnect();
	}
}

main();
