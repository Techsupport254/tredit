import prisma from "../src/lib/prisma";

async function main() {
	const escrows = await prisma.escrowPayment.findMany({
		take: 20,
		orderBy: { createdAt: "desc" },
		include: {
			buyer: { select: { id: true, name: true } },
			seller: { select: { id: true, name: true } },
		},
	});
	if (escrows.length === 0) {
		console.log("No escrow payments found.");
		return;
	}
	for (const e of escrows) {
		console.log(
			`ID: ${e.id}\n  Amount: ${e.amount}\n  Status: ${e.status}\n  Buyer: ${
				e.buyer?.name || e.buyerId
			}\n  Seller: ${e.seller?.name || e.sellerId}\n  Created: ${
				e.createdAt
			}\n---`
		);
	}
}

main().finally(() => prisma.$disconnect());
