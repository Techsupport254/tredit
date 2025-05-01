import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
	// Get the deployed contract address
	const escrowAddress = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;
	if (!escrowAddress) {
		throw new Error(
			"Please set NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS in your .env file"
		);
	}

	// Get the contract instance
	const escrow = await ethers.getContractAt("Escrow", escrowAddress);

	// Get all escrow transactions
	const transactions = await escrow.getEscrowTransactions();
	console.log("All Escrow Transactions:");
	transactions.forEach((tx, index) => {
		console.log(`\nTransaction ${index + 1}:`);
		console.log(`ID: ${tx.id}`);
		console.log(`Amount: ${ethers.utils.formatEther(tx.amount)} ETH`);
		console.log(`Status: ${tx.status}`);
		console.log(`Buyer: ${tx.buyer}`);
		console.log(`Seller: ${tx.seller}`);
		console.log(
			`Created At: ${new Date(Number(tx.createdAt) * 1000).toLocaleString()}`
		);
		console.log(
			`Updated At: ${new Date(Number(tx.updatedAt) * 1000).toLocaleString()}`
		);
		console.log(`Conditions: ${tx.conditions}`);
	});

	// If you want to get a specific transaction by ID
	const specificId = process.env.ESCROW_ID;
	if (specificId) {
		try {
			const specificTx = await escrow.getEscrowTransaction(specificId);
			console.log("\nSpecific Transaction Details:");
			console.log(`ID: ${specificTx.id}`);
			console.log(`Amount: ${ethers.utils.formatEther(specificTx.amount)} ETH`);
			console.log(`Status: ${specificTx.status}`);
			console.log(`Buyer: ${specificTx.buyer}`);
			console.log(`Seller: ${specificTx.seller}`);
			console.log(
				`Created At: ${new Date(
					Number(specificTx.createdAt) * 1000
				).toLocaleString()}`
			);
			console.log(
				`Updated At: ${new Date(
					Number(specificTx.updatedAt) * 1000
				).toLocaleString()}`
			);
			console.log(`Conditions: ${specificTx.conditions}`);
		} catch (error) {
			console.error(`Error fetching transaction ${specificId}:`, error);
		}
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
