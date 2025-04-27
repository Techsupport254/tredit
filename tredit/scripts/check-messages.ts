import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	// Find all messages and log them
	const messages = await prisma.message.findMany({
		include: {
			contentBlocks: true, // Include content blocks if needed
			sender: true, // Include sender information if needed
			chatSession: true, // Include chat session information if needed
		},
	});
	console.log(`Found ${messages.length} messages:`);
	console.log(JSON.stringify(messages, null, 2)); // Pretty print the messages

	await prisma.$disconnect();
}

main().catch((e) => {
	console.error(e);
	prisma.$disconnect();
	process.exit(1);
});
