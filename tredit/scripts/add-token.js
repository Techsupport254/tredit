import hre from "hardhat";

async function main() {
	const [deployer] = await hre.ethers.getSigners();
	console.log(
		"Adding token to Payment contract with account:",
		deployer.address
	);

	// Get the Payment contract
	const paymentAddress = process.env.PAYMENT_CONTRACT_ADDRESS;
	const Payment = await hre.ethers.getContractFactory("Payment");
	const payment = await Payment.attach(paymentAddress);

	// Get the token address
	const tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS;

	// Add token to Payment contract
	console.log("Adding token to Payment contract...");
	const tx = await payment.addSupportedToken(tokenAddress);
	await tx.wait();
	console.log("Token added successfully!");

	// Verify token was added
	const isSupported = await payment.supportedTokens(tokenAddress);
	console.log("Token supported:", isSupported);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
