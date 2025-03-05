require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const { MNEMONIC, POLYGON_AMOY_RPC, POLYGONSCAN_API_KEY } = process.env;

// Validate environment variables
if (!MNEMONIC || !POLYGON_AMOY_RPC || !POLYGONSCAN_API_KEY) {
	console.warn(
		"⚠️ Missing environment variables! Please check your .env file."
	);
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		version: "0.8.20",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200, // Adjusted for better balance between gas savings and execution cost
				details: {
					yul: true,
					yulDetails: {
						stackAllocation: true,
						optimizerSteps: "dhfoDgvulfnTUtnIf",
					},
				},
			},
			viaIR: true,
			metadata: {
				bytecodeHash: "none",
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
			url: POLYGON_AMOY_RPC || "https://rpc-amoy.matic.today", // Fallback for safety
			accounts: MNEMONIC ? { mnemonic: MNEMONIC } : [],
			chainId: 80002,
			gas: "auto",
			gasPrice: 250_000_000_000, // 250 Gwei
			maxFeePerGas: 300_000_000_000, // 300 Gwei
			maxPriorityFeePerGas: 50_000_000_000, // 50 Gwei
			confirmations: 2, // Wait for 2 confirmations before considering a transaction final
			timeoutBlocks: 200,
		},
	},
	etherscan: {
		apiKey: POLYGONSCAN_API_KEY,
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
