require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const { MNEMONIC, POLYGONSCAN_API_KEY } = process.env;

if (!MNEMONIC || !POLYGONSCAN_API_KEY) {
	throw new Error(
		"Please set your MNEMONIC and POLYGONSCAN_API_KEY in a .env file"
	);
}

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
		hardhat: {
			chainId: 31337,
			allowUnlimitedContractSize: false, // Ensures optimized contract size
		},
		localhost: {
			url: "http://127.0.0.1:8545",
			chainId: 31337,
		},
		amoy: {
			url: "https://rpc-amoy.polygon.technology",
			accounts: {
				mnemonic: MNEMONIC,
			},
			chainId: 80002,
		},
	},
	etherscan: {
		apiKey: {
			polygonAmoy: POLYGONSCAN_API_KEY,
		},
		customChains: [
			{
				network: "amoy",
				chainId: 80002,
				urls: {
					apiURL: "https://api-amoy.polygonscan.com/api",
					browserURL: "https://www.oklink.com/amoy",
				},
			},
		],
	},
	paths: {
		sources: "./contracts",
		tests: "./test",
		cache: "./cache",
		artifacts: "./artifacts",
	},
	mocha: {
		timeout: 60000, // Increased timeout for large deployments
	},
};
