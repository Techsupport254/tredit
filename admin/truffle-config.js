require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
	networks: {
		development: {
			host: "127.0.0.1",
			port: 8545,
			network_id: "*",
		},
		amoy: {
			provider: () =>
				new HDWalletProvider(
					process.env.MNEMONIC,
					process.env.POLYGON_AMOY_RPC
				),
			network_id: 80002, // Polygon Amoy chain ID
			confirmations: 2,
			timeoutBlocks: 200,
			skipDryRun: true,
			gas: 6000000,
			gasPrice: 10000000000, // 10 gwei
			networkCheckTimeout: 10000,
			timeoutBlocks: 200,
		},
		polygon: {
			provider: () =>
				new HDWalletProvider(process.env.MNEMONIC, `https://polygon-rpc.com`),
			network_id: 137,
			confirmations: 2,
			timeoutBlocks: 200,
			skipDryRun: true,
		},
	},
	compilers: {
		solc: {
			version: "0.8.19",
			settings: {
				optimizer: {
					enabled: true,
					runs: 1000, // Increased optimization runs
					details: {
						yul: true, // Enable Yul optimizer
						yulDetails: {
							stackAllocation: true,
							optimizerSteps: "dhfoDgvulfnTUtnIf", // Aggressive optimization
						},
					},
				},
				viaIR: true, // Enable IR-based code generation
				metadata: {
					bytecodeHash: "none", // Remove metadata hash
				},
			},
		},
	},
	plugins: ["truffle-plugin-verify"],
	api_keys: {
		polygonscan: process.env.POLYGONSCAN_API_KEY,
	},
	mocha: {
		timeout: 100000,
	},
};
