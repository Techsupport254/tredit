import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
	const [deployer] = await ethers.getSigners();
	console.log("Initializing token contract with account:", deployer.address);

	// Get the token contract
	const tokenAddress = "0xb57C3D6227c70D209E13bC5752818Ab72e023Bc9"; // Hardcoding the address since we can't access process.env in ES modules
	if (!tokenAddress) {
		throw new Error(
			"TOKEN_CONTRACT_ADDRESS not found in environment variables"
		);
	}

	const TreditToken = await ethers.getContractFactory("TreditToken");
	const token = await TreditToken.attach(tokenAddress);

	try {
		// Check current balance
		const balance = await token.balanceOf(deployer.address);
		console.log("Current balance:", ethers.formatEther(balance));

		// Mint some tokens if needed
		if (balance === 0n) {
			console.log("Minting initial supply...");
			const mintAmount = ethers.parseEther("1000000"); // 1 million tokens
			const tx = await token.mint(deployer.address, mintAmount);
			await tx.wait();
			console.log(
				"Minted",
				ethers.formatEther(mintAmount),
				"tokens to",
				deployer.address
			);
		}

		// Verify token details
		const name = await token.name();
		const symbol = await token.symbol();
		const decimals = await token.decimals();
		const totalSupply = await token.totalSupply();

		console.log("Token Details:");
		console.log("Name:", name);
		console.log("Symbol:", symbol);
		console.log("Decimals:", decimals);
		console.log("Total Supply:", ethers.formatEther(totalSupply));
		console.log("Owner:", await token.owner());
	} catch (error) {
		console.error("Error:", error.message);
		throw error;
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
