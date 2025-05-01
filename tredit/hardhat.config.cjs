require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

// Use existing environment variables
const { NEXT_PUBLIC_PRIVATE_KEY, RPC_URL } = process.env;

if (!NEXT_PUBLIC_PRIVATE_KEY) {
	throw new Error("Please set your NEXT_PUBLIC_PRIVATE_KEY in the .env file");
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
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {
			chainId: 31337,
			allowUnlimitedContractSize: false,
		},
		localhost: {
			url: "http://127.0.0.1:8545",
			chainId: 31337,
		},
		polygonAmoy: {
			url:
				RPC_URL ||
				"https://polygon-amoy.infura.io/v3/58c6d521bff64b6fbb0ca83aba68e550",
			accounts: [NEXT_PUBLIC_PRIVATE_KEY],
			chainId: 80002,
			gasPrice: "auto",
			gas: 2100000,
			allowUnlimitedContractSize: false,
		},
	},
	etherscan: {
		apiKey: {
			polygonAmoy: "WW3VZZ86629RE5F1XED2NC8AZGKKV7QJFA", // Hardcoded since it's public for testnet
		},
		customChains: [
			{
				network: "polygonAmoy",
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
		timeout: 60000,
	},
};
