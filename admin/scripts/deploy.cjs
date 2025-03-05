require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");

async function main() {
	console.log("🚀 Starting deployment...");

	// Load and validate environment variables
	let forwarderAddress = process.env.POLYGON_AMOY_BICONOMY_FORWARDER;
	if (!forwarderAddress) {
		console.error(
			"❌ Error: Missing Biconomy Forwarder address in env variables."
		);
		process.exit(1);
	}

	try {
		// Convert to lowercase to avoid checksum issues
		forwarderAddress = forwarderAddress.toLowerCase();
		console.log("🔹 Using Biconomy Forwarder:", forwarderAddress);

		// Get the signer
		const [deployer] = await hre.ethers.getSigners();
		console.log("Deploying contracts with the account:", deployer.address);

		// Deploy Store contract
		console.log("\n📝 Deploying Store contract...");
		const Store = await hre.ethers.getContractFactory("Store");
		const store = await Store.deploy(forwarderAddress, {
			gasLimit: 5000000,
		});
		await store.deploymentTransaction().wait();
		const storeAddress = await store.getAddress();
		console.log("✅ Store deployed to:", storeAddress);

		// Deploy UserProfile contract
		console.log("\n📝 Deploying UserProfile contract...");
		const UserProfile = await hre.ethers.getContractFactory("UserProfile");
		const userProfile = await UserProfile.deploy(forwarderAddress, {
			gasLimit: 5000000,
		});
		await userProfile.deploymentTransaction().wait();
		const userProfileAddress = await userProfile.getAddress();
		console.log("✅ UserProfile deployed to:", userProfileAddress);

		// Deploy MilestoneEscrow contract
		console.log("\n📝 Deploying MilestoneEscrow contract...");
		const MilestoneEscrow = await hre.ethers.getContractFactory(
			"MilestoneEscrow"
		);
		const milestoneEscrow = await MilestoneEscrow.deploy(userProfileAddress, {
			gasLimit: 5000000,
		});
		await milestoneEscrow.deploymentTransaction().wait();
		const milestoneEscrowAddress = await milestoneEscrow.getAddress();
		console.log("✅ MilestoneEscrow deployed to:", milestoneEscrowAddress);

		// Save deployed addresses
		const addresses = {
			Store: storeAddress,
			UserProfile: userProfileAddress,
			MilestoneEscrow: milestoneEscrowAddress,
			BiconomyForwarder: forwarderAddress,
			network: hre.network.name,
			chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
			deployer: deployer.address,
			timestamp: new Date().toISOString(),
		};

		const deploymentPath = "./deployed-addresses.json";
		fs.writeFileSync(deploymentPath, JSON.stringify(addresses, null, 2));
		console.log("\n📄 Contract addresses saved to", deploymentPath);

		// Verify contracts if not on local network
		if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
			console.log("\n🔍 Starting contract verification...");

			const verify = async (address, constructorArgs, contract) => {
				try {
					console.log(`Verifying ${contract}...`);
					await hre.run("verify:verify", {
						address: address,
						constructorArguments: constructorArgs,
					});
					console.log(`✅ ${contract} verified successfully`);
				} catch (error) {
					if (error.message.includes("Already Verified")) {
						console.log(`ℹ️ ${contract} already verified`);
					} else {
						console.error(`❌ Error verifying ${contract}:`, error.message);
					}
				}
			};

			// Add delay between verifications to avoid rate limiting
			const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

			await verify(storeAddress, [forwarderAddress], "Store");
			await delay(5000); // 5 second delay
			await verify(userProfileAddress, [forwarderAddress], "UserProfile");
			await delay(5000); // 5 second delay
			await verify(
				milestoneEscrowAddress,
				[userProfileAddress],
				"MilestoneEscrow"
			);
		}

		console.log("\n🎉 Deployment completed successfully!");
	} catch (error) {
		console.error("\n❌ Deployment failed:", error);
		if (error.error) {
			console.error("Contract Error Details:", error.error);
		}
		process.exit(1);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("❌ Fatal error:", error);
		process.exit(1);
	});
