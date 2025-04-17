const hre = require("hardhat");

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

	// Verify contracts on Polygonscan
	if (hre.network.name === "polygonAmoy") {
		console.log("Waiting for block confirmations...");
		await business.deploymentTransaction().wait(5);
		await userProfile.deploymentTransaction().wait(5);
		await dispute.deploymentTransaction().wait(5);

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
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
