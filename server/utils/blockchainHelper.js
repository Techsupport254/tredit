const axios = require("axios");
const { ethers } = require("ethers");
const FormData = require("form-data");
const EventEmitter = require("events");
const { PinataManager } = require("./ipfs");
const { blockchainConfig } = require("../config/config");
const {
	getSignedContract,
	estimateGas,
	executeTransaction,
	userProfileContract,
	businessContract,
	wallet,
} = require("./contractHelper");

// Get blockchain config with fallbacks
const {
	PINATA_API_KEY = process.env.PINATA_API_KEY,
	PINATA_API_SECRET = process.env.PINATA_API_SECRET,
	PINATA_BASE_URL = process.env.PINATA_BASE_URL,
	PINATA_GATEWAY_URL = process.env.PINATA_GATEWAY_URL,
} = blockchainConfig;

// Initialize Pinata manager
const pinataManager = new PinataManager();

// IPFS Upload Function
async function uploadToIPFS(data, sendEvent) {
	try {
		console.log(
			"Starting IPFS upload with data:",
			JSON.stringify(data, null, 2)
		);

		sendEvent?.({
			type: "ipfs",
			status: "preparing",
			message: "Preparing data for IPFS...",
			progress: 10,
			state: "PREPARING",
		});

		console.log("Calling pinataManager.uploadContent...");
		const result = await pinataManager.uploadContent(
			data,
			`business_${Date.now()}`
		);
		console.log("IPFS upload result:", JSON.stringify(result, null, 2));

		const ipfsData = {
			success: true,
			ipfsCid: result.cid,
			ipfsUrl: result.url,
		};
		console.log("Formatted IPFS response:", JSON.stringify(ipfsData, null, 2));

		sendEvent?.({
			type: "ipfs",
			status: "success",
			message: "Data uploaded to IPFS successfully",
			progress: 100,
			state: "COMPLETED",
			data: {
				cid: result.cid,
				url: result.url,
			},
		});

		return ipfsData;
	} catch (error) {
		console.error("IPFS upload error:", error);
		console.error("Error stack:", error.stack);
		sendEvent?.({
			type: "ipfs",
			status: "error",
			message: "Failed to upload to IPFS",
			progress: 0,
			state: "ERROR",
			error: error.message,
		});
		throw error;
	}
}

// User Profile Blockchain Functions
async function createOrUpdateUserProfile(walletAddress, ipfsUrl) {
	try {
		console.log("Creating/updating user profile on blockchain:", {
			walletAddress,
			ipfsUrl,
		});

		// Get the contract instance with the wallet
		const contract = await getSignedContract(userProfileContract);
		console.log("Got signed contract:", await contract.getAddress());

		// Send the transaction
		console.log("Sending createOrUpdateProfile transaction...");
		const tx = await contract.createOrUpdateProfile(ipfsUrl);
		console.log("Transaction sent:", tx.hash);

		// Wait for transaction confirmation
		console.log("Waiting for transaction confirmation...");
		const receipt = await tx.wait();
		console.log("Transaction confirmed:", receipt);

		return {
			success: true,
			hash: tx.hash,
			explorerUrl: `https://amoy.polygonscan.com/tx/${tx.hash}`,
			receipt,
		};
	} catch (error) {
		console.error("Blockchain error:", error);
		return {
			success: false,
			error: error.message || "Failed to update profile on blockchain",
		};
	}
}

// Business Blockchain Functions
async function createOrUpdateBusinessProfile(
	walletAddress,
	ipfsUrl,
	businessData
) {
	try {
		const contract = await getSignedContract(businessContract);
		const contractAddress = await contract.getAddress();

		console.log(
			"Creating/Updating business profile for wallet:",
			walletAddress,
			"using contract:",
			contractAddress
		);
		console.log("IPFS URL:", ipfsUrl);

		// Use default gas settings instead of estimation
		const options = {
			gasLimit: BigInt(500000), // Default gas limit
		};

		// Execute the transaction
		const result = await executeTransaction(
			contract,
			"createBusiness",
			[ipfsUrl],
			options
		);

		return result;
	} catch (error) {
		console.error("Blockchain error:", error);
		return {
			success: false,
			error: error.message,
		};
	}
}

// Pinata Cleanup Function
async function unpinFromPinata(ipfsCid) {
	try {
		const response = await axios.delete(
			`${PINATA_BASE_URL}/pinning/unpin/${ipfsCid}`,
			{
				headers: {
					pinata_api_key: PINATA_API_KEY,
					pinata_secret_api_key: PINATA_API_SECRET,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Pinata unpin error:", error);
		throw error;
	}
}

const createBusinessOnChain = async (walletAddress, ipfsUrl, businessData) => {
	try {
		console.log("Creating business on blockchain for wallet:", walletAddress);
		console.log("IPFS URL:", ipfsUrl);
		console.log("Business data:", businessData);

		// Validate IPFS URL
		if (!ipfsUrl) {
			throw new Error("IPFS URL is required");
		}

		const result = await createOrUpdateBusinessProfile(
			walletAddress,
			ipfsUrl,
			businessData
		);

		console.log("Blockchain result:", result);

		if (!result.success) {
			console.error("Blockchain error details:", result.error);
			throw new Error(result.error);
		}

		return {
			success: true,
			hash: result.hash,
			explorerUrl: `${process.env.BLOCKCHAIN_EXPLORER_URL}/tx/${result.hash}`,
		};
	} catch (error) {
		console.error("Error creating business on blockchain:", error);
		console.error("Error stack:", error.stack);
		return {
			success: false,
			error: error.message,
		};
	}
};

module.exports = {
	uploadToIPFS,
	createOrUpdateUserProfile,
	createOrUpdateBusinessProfile,
	unpinFromPinata,
	createBusinessOnChain,
};
