import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import hre from "hardhat";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
	console.log("Starting contract deployment...");

	const [deployer] = await hre.ethers.getSigners();
	console.log("Deploying contracts with the account:", deployer.address);

	// Deploy TreditToken
	console.log("\nDeploying TreditToken...");
	const TreditToken = await hre.ethers.getContractFactory("TreditToken");
	const treditToken = await TreditToken.deploy();
	await treditToken.waitForDeployment();
	console.log("TreditToken deployed to:", await treditToken.getAddress());

	// Deploy Business
	console.log("\nDeploying Business...");
	const Business = await hre.ethers.getContractFactory("Business");
	const business = await Business.deploy(deployer.address);
	await business.waitForDeployment();
	console.log("Business deployed to:", await business.getAddress());

	// Deploy UserProfile
	console.log("\nDeploying UserProfile...");
	const UserProfile = await hre.ethers.getContractFactory("UserProfile");
	const userProfile = await UserProfile.deploy(
		process.env.NEXT_PUBLIC_BICONOMY_FORWARDER,
		await business.getAddress(),
		deployer.address
	);
	await userProfile.waitForDeployment();
	console.log("UserProfile deployed to:", await userProfile.getAddress());

	// Deploy Dispute
	console.log("\nDeploying Dispute...");
	const Dispute = await hre.ethers.getContractFactory("Dispute");
	const dispute = await Dispute.deploy(deployer.address);
	await dispute.waitForDeployment();
	console.log("Dispute deployed to:", await dispute.getAddress());

	// Deploy Payment
	console.log("\nDeploying Payment...");
	const Payment = await hre.ethers.getContractFactory("Payment");
	const payment = await Payment.deploy(deployer.address);
	await payment.waitForDeployment();
	console.log("Payment deployed to:", await payment.getAddress());

	// Deploy Escrow
	console.log("\nDeploying Escrow...");
	const Escrow = await hre.ethers.getContractFactory("Escrow");
	const escrow = await Escrow.deploy();
	await escrow.waitForDeployment();
	console.log("Escrow deployed to:", await escrow.getAddress());

	// Get contract ABIs
	const tokenArtifact = await hre.artifacts.readArtifact("TreditToken");
	const businessArtifact = await hre.artifacts.readArtifact("Business");
	const userProfileArtifact = await hre.artifacts.readArtifact("UserProfile");
	const disputeArtifact = await hre.artifacts.readArtifact("Dispute");
	const paymentArtifact = await hre.artifacts.readArtifact("Payment");
	const escrowArtifact = await hre.artifacts.readArtifact("Escrow");

	// Update .env file with contract addresses and ABIs
	const envPath = path.join(__dirname, "..", ".env");
	let envContent = fs.readFileSync(envPath, "utf8");

	// Update contract addresses
	envContent = envContent.replace(
		/NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=.*/,
		`NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=${await treditToken.getAddress()}`
	);
	envContent = envContent.replace(
		/NEXT_PUBLIC_BUSINESS_CONTRACT_ADDRESS=.*/,
		`NEXT_PUBLIC_BUSINESS_CONTRACT_ADDRESS=${await business.getAddress()}`
	);
	envContent = envContent.replace(
		/NEXT_PUBLIC_USER_PROFILE_CONTRACT_ADDRESS=.*/,
		`NEXT_PUBLIC_USER_PROFILE_CONTRACT_ADDRESS=${await userProfile.getAddress()}`
	);
	envContent = envContent.replace(
		/NEXT_PUBLIC_DISPUTE_CONTRACT_ADDRESS=.*/,
		`NEXT_PUBLIC_DISPUTE_CONTRACT_ADDRESS=${await dispute.getAddress()}`
	);
	envContent = envContent.replace(
		/NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS=.*/,
		`NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS=${await payment.getAddress()}`
	);
	envContent = envContent.replace(
		/NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=.*/,
		`NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=${await escrow.getAddress()}`
	);

	// Update contract ABIs
	envContent = envContent.replace(
		/NEXT_PUBLIC_TOKEN_CONTRACT_ABI=.*/,
		`NEXT_PUBLIC_TOKEN_CONTRACT_ABI=${JSON.stringify(tokenArtifact.abi)}`
	);
	envContent = envContent.replace(
		/NEXT_PUBLIC_BUSINESS_CONTRACT_ABI=.*/,
		`NEXT_PUBLIC_BUSINESS_CONTRACT_ABI=${JSON.stringify(businessArtifact.abi)}`
	);
	envContent = envContent.replace(
		/NEXT_PUBLIC_USER_PROFILE_CONTRACT_ABI=.*/,
		`NEXT_PUBLIC_USER_PROFILE_CONTRACT_ABI=${JSON.stringify(
			userProfileArtifact.abi
		)}`
	);
	envContent = envContent.replace(
		/NEXT_PUBLIC_DISPUTE_CONTRACT_ABI=.*/,
		`NEXT_PUBLIC_DISPUTE_CONTRACT_ABI=${JSON.stringify(disputeArtifact.abi)}`
	);
	envContent = envContent.replace(
		/NEXT_PUBLIC_PAYMENT_CONTRACT_ABI=.*/,
		`NEXT_PUBLIC_PAYMENT_CONTRACT_ABI=${JSON.stringify(paymentArtifact.abi)}`
	);
	envContent = envContent.replace(
		/NEXT_PUBLIC_ESCROW_CONTRACT_ABI=.*/,
		`NEXT_PUBLIC_ESCROW_CONTRACT_ABI=${JSON.stringify(escrowArtifact.abi)}`
	);

	// Write updated content back to .env file
	fs.writeFileSync(envPath, envContent);

	console.log("\nDeployment completed successfully!");
	console.log("Contract addresses and ABIs have been updated in .env file");

	// Verify contracts if on polygonAmoy network
	if (hre.network.name === "polygonAmoy") {
		console.log(
			"\nWaiting before verification to ensure contracts are propagated..."
		);
		// Wait for a few seconds to ensure contracts are propagated
		await new Promise((resolve) => setTimeout(resolve, 30000));

		console.log("\nVerifying contracts on Polygonscan...");

		try {
			await hre.run("verify:verify", {
				address: await treditToken.getAddress(),
				constructorArguments: [],
			});

			await hre.run("verify:verify", {
				address: await business.getAddress(),
				constructorArguments: [deployer.address],
			});

			await hre.run("verify:verify", {
				address: await userProfile.getAddress(),
				constructorArguments: [
					process.env.NEXT_PUBLIC_BICONOMY_FORWARDER,
					await business.getAddress(),
					deployer.address,
				],
			});

			await hre.run("verify:verify", {
				address: await dispute.getAddress(),
				constructorArguments: [deployer.address],
			});

			await hre.run("verify:verify", {
				address: await payment.getAddress(),
				constructorArguments: [deployer.address],
			});

			await hre.run("verify:verify", {
				address: await escrow.getAddress(),
				constructorArguments: [],
			});

			console.log("All contracts verified successfully!");
		} catch (error) {
			console.error("Error during contract verification:", error);
		}
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Deployment failed:", error);
		process.exit(1);
	});
