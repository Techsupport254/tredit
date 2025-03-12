const { ethers } = require("ethers");
const { blockchainConfig } = require("../config/config");

// Get blockchain config with fallbacks
const {
	PRIVATE_KEY = process.env.PRIVATE_KEY,
	RPC_URL = process.env.RPC_URL ||
		"https://polygon-amoy.infura.io/v3/58c6d521bff64b6fbb0ca83aba68e550",
	USER_PROFILE_CONTRACT_ADDRESS = process.env.USER_PROFILE_CONTRACT_ADDRESS,
	BUSINESS_CONTRACT_ADDRESS = process.env.BUSINESS_CONTRACT_ADDRESS,
	USER_PROFILE_ABI = process.env.USER_PROFILE_ABI,
	BUSINESS_ABI = process.env.BUSINESS_ABI,
} = blockchainConfig;

console.log("Initializing blockchain with:", {
	rpcUrl: RPC_URL,
	userProfileAddress: USER_PROFILE_CONTRACT_ADDRESS,
	businessAddress: BUSINESS_CONTRACT_ADDRESS,
});

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log("Wallet initialized:", {
	address: wallet.address,
	rpcUrl: RPC_URL,
});

// Initialize contract instances
if (!USER_PROFILE_CONTRACT_ADDRESS || !USER_PROFILE_ABI) {
	throw new Error("User profile contract configuration is missing");
}

if (!BUSINESS_CONTRACT_ADDRESS || !BUSINESS_ABI) {
	throw new Error("Business contract configuration is missing");
}

const userProfileContract = new ethers.Contract(
	USER_PROFILE_CONTRACT_ADDRESS,
	JSON.parse(USER_PROFILE_ABI),
	wallet
);

const businessContract = new ethers.Contract(
	BUSINESS_CONTRACT_ADDRESS,
	JSON.parse(BUSINESS_ABI),
	wallet
);

// Validate contract initialization
if (!userProfileContract.runner || !businessContract.runner) {
	throw new Error("Contract initialization failed");
}

console.log("Contracts initialized:", {
	userProfileAddress: USER_PROFILE_CONTRACT_ADDRESS,
	businessAddress: BUSINESS_CONTRACT_ADDRESS,
});

async function getSignedContract(contract) {
	try {
		if (!contract) {
			throw new Error("Contract instance is required");
		}
		console.log(
			"Getting signed contract for address:",
			await contract.getAddress()
		);
		return contract.connect(wallet);
	} catch (error) {
		console.error("Error getting signed contract:", error);
		throw error;
	}
}

async function estimateGas(contract, method, args = [], options = {}) {
	try {
		console.log(`Estimating gas for ${method} with args:`, args);
		const gasEstimate = await contract.estimateGas[method](...args, options);
		const bufferedGas = (gasEstimate * BigInt(120)) / BigInt(100); // Add 20% buffer
		console.log(`Gas estimate for ${method}:`, {
			original: gasEstimate.toString(),
			buffered: bufferedGas.toString(),
		});
		return bufferedGas;
	} catch (error) {
		console.error(`Error estimating gas for ${method}:`, error);
		return BigInt(500000); // Default gas limit
	}
}

async function executeTransaction(contract, method, args = [], options = {}) {
	try {
		console.log(`Executing ${method} with args:`, args);
		console.log(`Contract address:`, await contract.getAddress());
		console.log(`Signer address:`, await wallet.getAddress());
		console.log(`Options:`, options);

		const tx = await contract[method](...args, options);
		console.log(`Transaction sent:`, tx.hash);

		const receipt = await tx.wait();
		console.log(`Transaction confirmed:`, receipt);

		return {
			success: true,
			hash: receipt.hash,
			explorerUrl: `https://amoy.polygonscan.com/tx/${receipt.hash}`,
			receipt,
		};
	} catch (error) {
		console.error(`Error executing ${method}:`, error);
		console.error(`Error details:`, {
			message: error.message,
			code: error.code,
			stack: error.stack,
			data: error.data,
		});
		return {
			success: false,
			error: error.message,
		};
	}
}

module.exports = {
	getSignedContract,
	estimateGas,
	executeTransaction,
	provider,
	wallet,
	userProfileContract,
	businessContract,
};
