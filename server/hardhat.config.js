require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { blockchainConfig } = require("./config/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		version: "0.8.20",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	networks: {
		polygonAmoy: {
			url: blockchainConfig.RPC_URL,
			accounts: [blockchainConfig.PRIVATE_KEY],
		},
	},
	paths: {
		sources: "./contracts",
		artifacts: "./artifacts",
	},
};
