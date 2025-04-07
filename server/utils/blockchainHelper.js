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

		// Validate IPFS URL
		if (!ipfsUrl || ipfsUrl.length === 0) {
			throw new Error("Invalid IPFS URL");
		}

		// Use gas settings that meet network requirements
		const options = {
			gasLimit: BigInt(500000),
			maxFeePerGas: ethers.parseUnits("50", "gwei"),
			maxPriorityFeePerGas: ethers.parseUnits("40", "gwei"),
		};

		// Send the transaction with the IPFS URL as a string
		console.log(
			"Sending createOrUpdateProfile transaction with gas settings:",
			options
		);
		const tx = await contract.createOrUpdateProfile(ipfsUrl, options);
		console.log("Transaction sent:", tx.hash);

		// Wait for transaction confirmation
		console.log("Waiting for transaction confirmation...");
		const receipt = await tx.wait();
		console.log("Transaction confirmed:", receipt);

		// Verify the profile was updated by checking the event
		const profileUpdatedEvent = receipt.logs.find(
			(log) =>
				log.eventName === "ProfileUpdated" || log.eventName === "ProfileCreated"
		);

		if (!profileUpdatedEvent) {
			throw new Error("Profile update event not found in transaction receipt");
		}

		return {
			success: true,
			hash: tx.hash,
			receipt,
			event: profileUpdatedEvent,
		};
	} catch (error) {
		console.error("Blockchain error:", error);

		// Handle specific contract errors
		let errorMessage = error.message;
		if (error.message.includes("InvalidIpfsUri")) {
			errorMessage = "Invalid IPFS URI provided";
		} else if (error.message.includes("insufficient funds")) {
			errorMessage = "Insufficient funds for gas fees";
		}

		return {
			success: false,
			error: errorMessage,
			code: error.code,
			details: {
				gasLimit: error.gasLimit,
				gasUsed: error.gasUsed,
				gasPrice: error.gasPrice,
				...error.info,
			},
		};
	}
}

// Business Blockchain Functions
async function createOrUpdateBusinessProfile(ipfsUrl, businessData) {
	try {
		const contract = await getSignedContract(businessContract);
		const contractAddress = await contract.getAddress();

		console.log(
			"Creating/Updating business profile using contract:",
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

const createBusinessOnChain = async (ipfsUrl, businessData) => {
	try {
		console.log("Creating business on blockchain");
		console.log("IPFS URL:", ipfsUrl);
		console.log("Business data:", businessData);

		// Validate IPFS URL
		if (!ipfsUrl) {
			throw new Error("IPFS URL is required");
		}

		const result = await createOrUpdateBusinessProfile(ipfsUrl, businessData);

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

// Generic blockchain update function for products
async function updateBlockchain(action, data) {
	try {
		console.log(`Updating blockchain for action: ${action}`, data);

		switch (action) {
			case "addProduct":
			case "updateProduct":
				// Upload to IPFS first
				const ipfsResult = await uploadToIPFS(data);

				// Get the contract instance
				const contract = await getSignedContract(businessContract);

				// Execute the appropriate contract method
				const method = action === "addProduct" ? "addProduct" : "updateProduct";
				const tx = await contract[method](data.productId, ipfsResult.ipfsUrl);

				// Wait for confirmation
				const receipt = await tx.wait();

				return {
					success: true,
					hash: tx.hash,
					explorerUrl: `${process.env.BLOCKCHAIN_EXPLORER_URL}/tx/${tx.hash}`,
					ipfsHash: ipfsResult.ipfsCid,
				};

			case "deleteProduct":
				const deleteContract = await getSignedContract(businessContract);
				const deleteTx = await deleteContract.removeProduct(data.productId);
				const deleteReceipt = await deleteTx.wait();

				return {
					success: true,
					hash: deleteTx.hash,
					explorerUrl: `${process.env.BLOCKCHAIN_EXPLORER_URL}/tx/${deleteTx.hash}`,
				};

			default:
				throw new Error(`Unsupported blockchain action: ${action}`);
		}
	} catch (error) {
		console.error(`Blockchain ${action} error:`, error);
		return {
			success: false,
			error: error.message,
		};
	}
}

module.exports = {
	uploadToIPFS,
	createOrUpdateUserProfile,
	createOrUpdateBusinessProfile,
	unpinFromPinata,
	createBusinessOnChain,
	updateBlockchain,
};
