const UserProfileRegistry = artifacts.require("UserProfileRegistry");

module.exports = async function (deployer) {
	await deployer.deploy(UserProfileRegistry);
	const userProfileRegistry = await UserProfileRegistry.deployed();

	console.log("UserProfileRegistry deployed at:", userProfileRegistry.address);
};
