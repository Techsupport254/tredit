import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
	const [deployer] = await hre.ethers.getSigners();
	console.log("Deploying contracts with the account:", deployer.address);

	// Deploy Business contract
	const Business = await hre.ethers.getContractFactory("Business");
	const business = await Business.deploy(deployer.address);
	await business.waitForDeployment();
	console.log("Business contract deployed to:", await business.getAddress());

	// Deploy UserProfile contract
	const UserProfile = await hre.ethers.getContractFactory("UserProfile");
	const userProfile = await UserProfile.deploy(
		deployer.address, // trustedForwarder
		await business.getAddress(), // businessContract
		deployer.address // initialOwner
	);
	await userProfile.waitForDeployment();
	console.log(
		"UserProfile contract deployed to:",
		await userProfile.getAddress()
	);

	// Deploy Dispute contract
	const Dispute = await hre.ethers.getContractFactory("Dispute");
	const dispute = await Dispute.deploy(deployer.address);
	await dispute.waitForDeployment();
	console.log("Dispute contract deployed to:", await dispute.getAddress());

	// Deploy Payment contract
	const Payment = await hre.ethers.getContractFactory("Payment");
	const payment = await Payment.deploy(deployer.address);
	await payment.waitForDeployment();
	console.log("Payment contract deployed to:", await payment.getAddress());

	// Deploy Escrow contract
	const Escrow = await hre.ethers.getContractFactory("GoodsEscrow");
	const escrow = await Escrow.deploy(
		deployer.address, // seller (temporary, will be updated)
		deployer.address, // arbitrator (temporary, will be updated)
		7 * 24 * 60 * 60, // delivery timeframe (7 days)
		3 * 24 * 60 * 60, // dispute time limit (3 days)
		await payment.getAddress() // payment contract address
	);
	await escrow.waitForDeployment();
	console.log("Escrow contract deployed to:", await escrow.getAddress());

	// Get contract ABIs
	const businessArtifact = await hre.artifacts.readArtifact("Business");
	const userProfileArtifact = await hre.artifacts.readArtifact("UserProfile");
	const disputeArtifact = await hre.artifacts.readArtifact("Dispute");
	const paymentArtifact = await hre.artifacts.readArtifact("Payment");
	const escrowArtifact = await hre.artifacts.readArtifact("GoodsEscrow");

	// Update .env file with contract addresses and ABIs
	const envPath = path.join(__dirname, "..", ".env");
	let envContent = "";

	try {
		envContent = fs.readFileSync(envPath, "utf8");
	} catch (error) {
		console.log("Creating new .env file");
	}

	// Update or add contract addresses and ABIs
	const updates = {
		BUSINESS_CONTRACT_ADDRESS: await business.getAddress(),
		USER_PROFILE_CONTRACT_ADDRESS: await userProfile.getAddress(),
		DISPUTE_CONTRACT_ADDRESS: await dispute.getAddress(),
		PAYMENT_CONTRACT_ADDRESS: await payment.getAddress(),
		ESCROW_CONTRACT_ADDRESS: await escrow.getAddress(),
		BUSINESS_CONTRACT_ABI: JSON.stringify(businessArtifact.abi),
		USER_PROFILE_CONTRACT_ABI: JSON.stringify(userProfileArtifact.abi),
		DISPUTE_CONTRACT_ABI: JSON.stringify(disputeArtifact.abi),
		PAYMENT_CONTRACT_ABI: JSON.stringify(paymentArtifact.abi),
		ESCROW_CONTRACT_ABI: JSON.stringify(escrowArtifact.abi),
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
	console.log("Updated .env file with contract addresses and ABIs");

	// Verify contracts on Polygonscan
	if (hre.network.name === "polygonAmoy") {
		console.log("Waiting for block confirmations...");
		await business.deploymentTransaction().wait(5);
		await userProfile.deploymentTransaction().wait(5);
		await dispute.deploymentTransaction().wait(5);
		await payment.deploymentTransaction().wait(5);
		await escrow.deploymentTransaction().wait(5);

		console.log("Verifying contracts...");
		await hre.run("verify:verify", {
			address: await business.getAddress(),
			constructorArguments: [deployer.address],
		});

		await hre.run("verify:verify", {
			address: await userProfile.getAddress(),
			constructorArguments: [
				deployer.address,
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
			constructorArguments: [
				deployer.address,
				deployer.address,
				7 * 24 * 60 * 60,
				3 * 24 * 60 * 60,
				await payment.getAddress(),
			],
		});
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
