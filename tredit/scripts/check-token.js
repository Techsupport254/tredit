import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
	const [deployer] = await ethers.getSigners();
	console.log("Using account:", deployer.address);

	// Get contract addresses from environment
	const paymentContractAddress = process.env.PAYMENT_CONTRACT_ADDRESS;
	const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS;

	if (!paymentContractAddress || !tokenContractAddress) {
		throw new Error("Contract addresses not found in environment");
	}

	// Get contract instances
	const paymentContract = await ethers.getContractAt(
		"Payment",
		paymentContractAddress
	);
	const tokenContract = await ethers.getContractAt(
		"TreditToken",
		tokenContractAddress
	);

	// Check if token is supported
	const isSupported = await paymentContract.supportedTokens(
		tokenContractAddress
	);
	console.log("Is token supported:", isSupported);

	if (!isSupported) {
		console.log("Adding token as supported...");
		const tx = await paymentContract.addSupportedToken(tokenContractAddress);
		await tx.wait();
		console.log("Token added as supported");
	}

	// Verify token contract is accessible
	const code = await ethers.provider.getCode(tokenContractAddress);
	console.log("Token contract code exists:", code !== "0x");

	// Get token details
	const name = await tokenContract.name();
	const symbol = await tokenContract.symbol();
	const decimals = await tokenContract.decimals();
	console.log("Token details:", { name, symbol, decimals });
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
