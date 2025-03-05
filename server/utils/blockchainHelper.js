const axios = require("axios");
const { ethers } = require("ethers");
const FormData = require("form-data");
const {
	PINATA_API_KEY,
	PINATA_API_SECRET,
	CONTRACT_ADDRESS,
	CONTRACT_ABI,
	RPC_URL,
	PRIVATE_KEY,
	CHAIN_ID,
} = process.env;

// Validate configurations
if (!PINATA_API_KEY || !PINATA_API_SECRET) {
	console.error("Pinata API configuration is missing");
	throw new Error("Pinata API configuration is required");
}

if (!CONTRACT_ADDRESS || !CONTRACT_ABI || !RPC_URL || !PRIVATE_KEY) {
	console.error("Blockchain configuration is missing");
	throw new Error("Blockchain configuration is required");
}

// Parse Contract ABI
let parsedABI;
try {
	parsedABI = JSON.parse(CONTRACT_ABI);
} catch (error) {
	console.error("Failed to parse CONTRACT_ABI:", error);
	throw new Error("Invalid CONTRACT_ABI format");
}

const PINATA_BASE_URL = "https://api.pinata.cloud";

/**
 * Uploads a file to IPFS via Pinata
 * @param {Buffer|string} file - The file to upload (Buffer for files, string for JSON)
 * @param {string} name - Name for the file
 * @param {boolean} isJson - Whether the content is JSON
 * @returns {Promise<{ ipfsCid: string, ipfsUrl: string }>}
 */
async function uploadToPinata(file, name, isJson = false) {
	try {
		let response;
		const headers = {
			pinata_api_key: PINATA_API_KEY,
			pinata_secret_api_key: PINATA_API_SECRET,
		};

		if (isJson) {
			// For JSON data
			headers["Content-Type"] = "application/json";
			response = await axios.post(
				`${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
				file,
				{ headers }
			);
		} else {
			// For files
			const formData = new FormData();
			formData.append("file", file);
			formData.append(
				"pinataMetadata",
				JSON.stringify({
					name: name,
				})
			);

			headers[
				"Content-Type"
			] = `multipart/form-data; boundary=${formData.getBoundary()}`;
			response = await axios.post(
				`${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
				formData,
				{ headers }
			);
		}

		const ipfsCid = response.data.IpfsHash;
		return {
			ipfsCid,
			ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsCid}`,
		};
	} catch (error) {
		console.error("Pinata Upload Error:", {
			message: error.message,
			response: error.response?.data,
			status: error.response?.status,
		});
		throw new Error(
			`Failed to upload to Pinata: ${
				error.response?.data?.error || error.message
			}`
		);
	}
}

/**
 * Uploads user profile data to IPFS and returns the CID
 * @param {Object} data - The user profile data
 * @returns {Promise<{ ipfsCid: string, ipfsUrl: string }>}
 */
async function uploadToIPFS(data) {
	try {
		console.log("Uploading to IPFS:", {
			data: JSON.stringify(data).substring(0, 100) + "...",
		});

		const result = await uploadToPinata(data, "user-profile", true);
		console.log("IPFS upload response:", result);
		return result;
	} catch (error) {
		console.error("IPFS Upload Error:", error);
		throw error;
	}
}

/**
 * Uploads a file to IPFS
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - Name of the file
 * @returns {Promise<{ ipfsCid: string, ipfsUrl: string }>}
 */
async function uploadFileToIPFS(fileBuffer, fileName) {
	try {
		console.log("Uploading file to IPFS:", { fileName });
		const result = await uploadToPinata(fileBuffer, fileName, false);
		console.log("File upload response:", result);
		return result;
	} catch (error) {
		console.error("File Upload Error:", error);
		throw error;
	}
}

/**
 * Saves the user profile to blockchain
 * @param {Object} userData - The user profile data
 * @returns {Promise<{ success: boolean, txHash: string }>}
 */
async function saveProfileToBlockchain(userData) {
	try {
		// Validate required configurations
		if (
			!process.env.RPC_URL ||
			!process.env.PRIVATE_KEY ||
			!process.env.CONTRACT_ADDRESS ||
			!process.env.CONTRACT_ABI
		) {
			throw new Error("Missing required blockchain configuration");
		}

		// Initialize provider and wallet
		console.log("Connecting to network:", process.env.RPC_URL);
		const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
		const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
		console.log("Connected with wallet:", wallet.address);

		// Get wallet balance
		const balance = await provider.getBalance(wallet.address);
		console.log("Wallet balance:", ethers.formatEther(balance), "MATIC");

		if (balance === 0n) {
			throw new Error("Insufficient funds in wallet for gas");
		}

		// Initialize contract
		const contract = new ethers.Contract(
			process.env.CONTRACT_ADDRESS,
			JSON.parse(process.env.CONTRACT_ABI),
			wallet
		);
		console.log("Contract initialized at:", process.env.CONTRACT_ADDRESS);

		// Check if contract exists
		const code = await provider.getCode(process.env.CONTRACT_ADDRESS);
		if (code === "0x") {
			throw new Error("No contract deployed at the specified address");
		}

		// Check if profile already exists
		try {
			const existingProfile = await contract.getProfile(userData.walletAddress);
			console.log("Existing profile found:", existingProfile);
		} catch (error) {
			if (!error.message.includes("ProfileNotFound")) {
				throw error;
			}
			console.log("No existing profile found, creating new profile");
		}

		// Prepare transaction
		console.log("Preparing transaction with data:", {
			ipfsUri: userData.ipfsUrl,
		});

		// Estimate gas for the transaction
		const gasEstimate = await contract.createOrUpdateProfile.estimateGas(
			userData.ipfsUrl
		);
		console.log("Estimated gas:", gasEstimate.toString());

		// Add 10% buffer to gas estimate
		const gasLimit = (gasEstimate * 110n) / 100n;
		console.log("Using gas limit:", gasLimit.toString());

		// Create transaction with estimated gas
		const tx = await contract.createOrUpdateProfile(userData.ipfsUrl, {
			gasLimit,
		});

		console.log("Transaction sent:", tx.hash);

		// Wait for transaction confirmation
		const receipt = await tx.wait();
		console.log("Transaction confirmed in block:", receipt.blockNumber);

		return { success: true, txHash: tx.hash };
	} catch (error) {
		console.error("Blockchain error:", error);

		// Handle specific error cases
		if (error.message.includes("insufficient funds")) {
			throw new Error("INSUFFICIENT_FUNDS: Not enough MATIC to pay for gas");
		} else if (error.message.includes("network error")) {
			throw new Error("NETWORK_ERROR: Failed to connect to the blockchain");
		} else if (error.message.includes("nonce has already been used")) {
			throw new Error("NONCE_EXPIRED: Transaction nonce is no longer valid");
		} else if (error.message.includes("replacement fee too low")) {
			throw new Error(
				"REPLACEMENT_UNDERPRICED: Gas price too low for replacement"
			);
		}

		throw new Error(`Failed to register on blockchain: ${error.message}`);
	}
}

module.exports = {
	uploadToIPFS,
	uploadFileToIPFS,
	saveProfileToBlockchain,
};
