const Store = artifacts.require("Store");
const UserProfile = artifacts.require("UserProfile");
const MilestoneEscrow = artifacts.require("MilestoneEscrow");

module.exports = async function (deployer, network, accounts) {
	console.log(`\nStarting deployment to ${network} network...`);

	// Get forwarder address based on network
	let forwarderAddress;
	if (network === "development") {
		forwarderAddress = accounts[9];
		console.log("Using development forwarder:", forwarderAddress);
	} else if (network === "amoy") {
		forwarderAddress = process.env.POLYGON_AMOY_BICONOMY_FORWARDER;
		console.log("Using Amoy Biconomy forwarder:", forwarderAddress);
	} else if (network === "polygon") {
		forwarderAddress = "0xf0511f123164602042ab2bCF02111fA5D3Fe97CD";
		console.log("Using Polygon Mainnet forwarder:", forwarderAddress);
	}

	try {
		console.log("\nDeploying Store contract...");
		await deployer.deploy(Store, forwarderAddress, { gas: 5000000 });
		const storeInstance = await Store.deployed();
		console.log("Store deployed at:", storeInstance.address);

		console.log("\nDeploying UserProfile contract...");
		await deployer.deploy(UserProfile, forwarderAddress, { gas: 5000000 });
		const userProfileInstance = await UserProfile.deployed();
		console.log("UserProfile deployed at:", userProfileInstance.address);

		console.log("\nDeploying MilestoneEscrow contract...");
		await deployer.deploy(MilestoneEscrow, userProfileInstance.address, {
			gas: 5000000,
		});
		const escrowInstance = await MilestoneEscrow.deployed();
		console.log("MilestoneEscrow deployed at:", escrowInstance.address);

		console.log("\n✅ Deployment completed successfully!");
		console.log("--------------------");
		console.log("📄 Contract Addresses:");
		console.log("Store:", storeInstance.address);
		console.log("UserProfile:", userProfileInstance.address);
		console.log("MilestoneEscrow:", escrowInstance.address);
		console.log("--------------------");

		// Save contract addresses to a file for frontend use
		const fs = require("fs");
		const contractAddresses = {
			Store: storeInstance.address,
			UserProfile: userProfileInstance.address,
			MilestoneEscrow: escrowInstance.address,
			network: network,
		};

		fs.writeFileSync(
			"deployed-addresses.json",
			JSON.stringify(contractAddresses, null, 2)
		);
		console.log("\n📝 Contract addresses saved to deployed-addresses.json");
	} catch (error) {
		console.error("\n❌ Deployment failed:", error);
		throw error;
	}
};
