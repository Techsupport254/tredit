import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function findDuplicates() {
	try {
		console.log("Fetching all cartIds and orderIds from ChatSession...");
		const sessions = await prisma.chatSession.findMany({
			select: {
				id: true,
				cartId: true,
				orderId: true,
			},
		});

		console.log(`Processing ${sessions.length} total sessions...`);

		const cartIdCounts = {};
		const orderIdCounts = {};
		const duplicateCartIds = new Set();
		const duplicateOrderIds = new Set();

		sessions.forEach((session) => {
			if (session.cartId !== null && session.cartId !== undefined) {
				cartIdCounts[session.cartId] = (cartIdCounts[session.cartId] || 0) + 1;
				if (cartIdCounts[session.cartId] > 1) {
					duplicateCartIds.add(session.cartId);
				}
			}
			if (session.orderId !== null && session.orderId !== undefined) {
				orderIdCounts[session.orderId] =
					(orderIdCounts[session.orderId] || 0) + 1;
				if (orderIdCounts[session.orderId] > 1) {
					duplicateOrderIds.add(session.orderId);
				}
			}
		});

		const duplicateCartIdArray = Array.from(duplicateCartIds);
		const duplicateOrderIdArray = Array.from(duplicateOrderIds);

		if (duplicateCartIdArray.length > 0) {
			console.warn("\nFound duplicate non-null cartIds:");
			console.table(
				duplicateCartIdArray.map((id) => ({
					cartId: id,
					count: cartIdCounts[id],
				}))
			);
		} else {
			console.log("\nNo duplicate non-null cartIds found.");
		}

		if (duplicateOrderIdArray.length > 0) {
			console.warn("\nFound duplicate non-null orderIds:");
			console.table(
				duplicateOrderIdArray.map((id) => ({
					orderId: id,
					count: orderIdCounts[id],
				}))
			);
		} else {
			console.log("\nNo duplicate non-null orderIds found.");
		}

		if (duplicateCartIdArray.length > 0 || duplicateOrderIdArray.length > 0) {
			console.error(
				"\nAction Required: Please resolve the duplicate entries before applying the unique constraint."
			);
			console.log(
				"You might need to manually inspect the ChatSessions associated with these IDs and delete or merge the redundant ones."
			);
			console.log(
				"Example query: `prisma.chatSession.findMany({ where: { cartId: 'duplicate_id' } })`"
			);
			console.log(
				"Alternatively, if duplicates are expected, remove the `@unique` constraint from `cartId` and `orderId` in `prisma/schema.prisma` and run `npx prisma generate` again before `db push`."
			);
		} else {
			console.log(
				"\nSafe to proceed: No duplicate non-null cartIds or orderIds found. You can likely run `npx prisma db push` without data loss."
			);
		}
	} catch (error) {
		console.error("Error checking for duplicates:", error);
	} finally {
		await prisma.$disconnect();
	}
}

findDuplicates();
