require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

// Deployment configuration
const CONFIRMATION_BLOCKS = 5;
const VERIFICATION_DELAY = 5000; // 5 seconds
const GAS_MULTIPLIER = 1.2; // 20% buffer for gas limit
const MAX_RETRIES = 3;

// Deployment status tracking
const deploymentStatus = {
	startTime: null,
	endTime: null,
	contracts: {},
	transactions: [],
};

async function getOptimizedGasPrice() {
	try {
		const feeData = await ethers.provider.getFeeData();
		return {
			maxFeePerGas: feeData.maxFeePerGas,
			maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
		};
	} catch (error) {
		console.warn(
			"⚠️ Failed to get optimized gas price, using default:",
			error.message
		);
		return {};
	}
}

async function deployContract(contractName, factory, args = [], options = {}) {
	const status = {
		name: contractName,
		startTime: new Date().toISOString(),
		attempts: 0,
	};

	deploymentStatus.contracts[contractName] = status;

	while (status.attempts < MAX_RETRIES) {
		try {
			status.attempts++;
			console.log(
				`\n📝 Deploying ${contractName} (Attempt ${status.attempts}/${MAX_RETRIES})...`
			);

			const gasPrice = await getOptimizedGasPrice();
			const contract = await factory.deploy(...args, {
				...gasPrice,
				...options,
			});

			console.log(`⏳ Waiting for ${contractName} deployment...`);
			await contract.waitForDeployment();

			const address = await contract.getAddress();
			console.log(`✅ ${contractName} deployed to:`, address);

			status.address = address;
			status.endTime = new Date().toISOString();
			status.success = true;

			return contract;
		} catch (error) {
			console.error(
				`❌ Failed to deploy ${contractName} (Attempt ${status.attempts}):`,
				error.message
			);
			if (status.attempts === MAX_RETRIES) throw error;
			console.log("Retrying in 5 seconds...");
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
	}
}

async function verifyContract(address, constructorArgs, contractName) {
	if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
		console.log(
			`⏭️ Skipping verification for ${contractName} on local network`
		);
		return;
	}

	try {
		console.log(`\n🔍 Verifying ${contractName}...`);
		await hre.run("verify:verify", {
			address: address,
			constructorArguments: constructorArgs,
		});
		console.log(`✅ ${contractName} verified successfully`);
		return true;
	} catch (error) {
		if (error.message.includes("Already Verified")) {
			console.log(`ℹ️ ${contractName} already verified`);
			return true;
		}
		console.error(`❌ Error verifying ${contractName}:`, error.message);
		return false;
	}
}

async function saveDeploymentInfo(deployedAddresses) {
	const deployedAddressesPath = path.join(
		__dirname,
		"..",
		"deployed-addresses.json"
	);

	try {
		// Read existing addresses
		let existingAddresses = {};
		try {
			existingAddresses = JSON.parse(
				fs.readFileSync(deployedAddressesPath, "utf8")
			);
		} catch (error) {
			console.log("Creating new deployed-addresses.json file");
		}

		// Update with new deployment
		existingAddresses[hre.network.name] = {
			...deployedAddresses,
			deploymentStatus,
		};

		// Write updated addresses
		fs.writeFileSync(
			deployedAddressesPath,
			JSON.stringify(existingAddresses, null, 2)
		);

		console.log("\n📄 Deployment info saved to", deployedAddressesPath);
		return true;
	} catch (error) {
		console.error("❌ Failed to save deployment info:", error.message);
		return false;
	}
}

async function main() {
	console.log("\n🚀 Starting deployment process...");
	console.log("Network:", hre.network.name);
	console.log("ChainId:", hre.network.config.chainId);

	deploymentStatus.startTime = new Date().toISOString();

	// Validate environment
	const forwarderAddress = process.env.BICONOMY_FORWARDER;
	if (!forwarderAddress) {
		throw new Error("Missing BICONOMY_FORWARDER address in env variables");
	}

	try {
		// Get deployer account
		const [deployer] = await ethers.getSigners();
		const deployerAddress = await deployer.getAddress();
		console.log("\n👤 Deployer:", deployerAddress);
		const balance = await ethers.provider.getBalance(deployerAddress);
		console.log("Balance:", ethers.formatEther(balance), "ETH");

		// Deploy Business contract
		const Business = await ethers.getContractFactory("Business");
		const business = await deployContract("Business", Business);
		const businessAddress = await business.getAddress();

		// Set trusted forwarder
		console.log("\n📝 Setting trusted forwarder...");
		const setForwarderTx = await business.setTrustedForwarder(forwarderAddress);
		await setForwarderTx.wait();
		console.log("✅ Trusted forwarder set");

		deploymentStatus.transactions.push({
			type: "setTrustedForwarder",
			hash: setForwarderTx.hash,
			timestamp: new Date().toISOString(),
		});

		// Deploy UserProfile contract
		const UserProfile = await ethers.getContractFactory("UserProfile");
		const userProfile = await deployContract(
			"UserProfile",
			UserProfile,
			[forwarderAddress, businessAddress],
			{ gasLimit: BigInt(5000000) }
		);
		const userProfileAddress = await userProfile.getAddress();

		// Wait for confirmations
		console.log(
			`\n⏳ Waiting for ${CONFIRMATION_BLOCKS} block confirmations...`
		);
		await Promise.all([
			setForwarderTx.wait(CONFIRMATION_BLOCKS),
			userProfile.waitForDeployment(),
		]);

		// Save deployment info
		const deployedAddresses = {
			Business: businessAddress,
			UserProfile: userProfileAddress,
			BiconomyForwarder: forwarderAddress,
			network: hre.network.name,
			chainId: hre.network.config.chainId,
			deployer: deployerAddress,
			timestamp: new Date().toISOString(),
		};

		await saveDeploymentInfo(deployedAddresses);

		// Verify contracts
		await verifyContract(businessAddress, [], "Business");
		await new Promise((resolve) => setTimeout(resolve, VERIFICATION_DELAY));
		await verifyContract(
			userProfileAddress,
			[forwarderAddress, businessAddress],
			"UserProfile"
		);

		deploymentStatus.endTime = new Date().toISOString();
		console.log("\n🎉 Deployment completed successfully!");

		// Log deployment duration
		const duration =
			(new Date(deploymentStatus.endTime) -
				new Date(deploymentStatus.startTime)) /
			1000;
		console.log(`⏱️ Total deployment time: ${duration.toFixed(2)} seconds`);
	} catch (error) {
		console.error("\n❌ Deployment failed:", error.message);
		if (error.error) {
			console.error("Contract Error Details:", error.error);
		}
		deploymentStatus.endTime = new Date().toISOString();
		deploymentStatus.error = error.message;
		await saveDeploymentInfo({ error: error.message });
		process.exit(1);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("❌ Fatal error:", error);
		process.exit(1);
	});
