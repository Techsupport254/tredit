import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
	const [deployer] = await hre.ethers.getSigners();
	console.log("Deploying token contract with the account:", deployer.address);

	// Deploy TreditToken contract
	const TreditToken = await hre.ethers.getContractFactory("TreditToken");
	const token = await TreditToken.deploy();
	await token.waitForDeployment();
	console.log("TreditToken contract deployed to:", await token.getAddress());

	// Get contract ABI
	const tokenArtifact = await hre.artifacts.readArtifact("TreditToken");

	// Update .env file with token address and ABI
	const envPath = path.join(__dirname, "..", ".env");
	let envContent = "";

	try {
		envContent = fs.readFileSync(envPath, "utf8");
	} catch (error) {
		console.log("Creating new .env file");
	}

	// Update or add token address and ABI
	const updates = {
		TOKEN_CONTRACT_ADDRESS: await token.getAddress(),
		TOKEN_CONTRACT_ABI: JSON.stringify(tokenArtifact.abi),
	};

	// Update .env content
	Object.entries(updates).forEach(([key, value]) => {
		const regex = new RegExp(`^${key}=.*`, "m");
		const newLine = `${key}=${value}`;

		if (envContent.match(regex)) {
			envContent = envContent.replace(regex, newLine);
		} else {
			envContent += `\n${newLine}`;
		}
	});

	// Write updated content back to .env
	fs.writeFileSync(envPath, envContent.trim() + "\n");
	console.log("Updated .env file with token address and ABI");

	// Verify contract on Polygonscan
	if (hre.network.name === "polygonAmoy") {
		console.log("Waiting for block confirmations...");
		await token.deploymentTransaction().wait(5);

		console.log("Verifying contract...");
		await hre.run("verify:verify", {
			address: await token.getAddress(),
			constructorArguments: [],
		});
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
