import axios from "axios";
import { BrowserProvider, Contract } from "ethers";

// Replace these with your actual Pinata API credentials from environment variables
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;

// Deployed contract address of UserProfileRegistry
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// ABI for the UserProfile contract
const CONTRACT_ABI = [
	"function createOrUpdateProfile(string ipfsUri)",
	"function getProfile(address walletAddress) view returns (tuple(address walletAddress, string ipfsUri, uint256 createdAt, uint256 updatedAt, bool isActive))",
	"function setProfileStatus(bool isActive)",
];

/**
 * Uploads user profile data to IPFS via Pinata.
 * @param {Object} data - The user profile data.
 * @param {function} setStatusMessage - Callback for UI status updates.
 * @returns {Promise<{ ipfsUrl: string, ipfsCid: string }>}
 */
export async function uploadToIPFS(data, setStatusMessage = () => {}) {
	try {
		console.log("Starting Upload Process with Pinata:", data);
		setStatusMessage("Uploading data to Pinata...");

		const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
		const response = await axios.post(url, data, {
			headers: {
				"Content-Type": "application/json",
				pinata_api_key: PINATA_API_KEY,
				pinata_secret_api_key: PINATA_API_SECRET,
			},
		});

		const ipfsCid = response.data.IpfsHash;
		const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsCid}`;

		setStatusMessage(`Profile uploaded successfully: ${ipfsUrl}`);
		console.log("Upload Successful:", ipfsUrl);

		return { ipfsUrl, ipfsCid };
	} catch (error) {
		setStatusMessage(`IPFS Upload Error: ${error.message}`);
		console.error("IPFS Upload Error:", error);
		throw error;
	}
}

/**
 * Fetches user profile data from IPFS.
 * @param {string} ipfsUrl - The IPFS URL.
 * @param {function} setStatusMessage - Callback for UI status updates.
 * @returns {Promise<Object>} The JSON data retrieved from IPFS.
 */
export async function fetchFromIPFS(ipfsUrl, setStatusMessage = () => {}) {
	try {
		setStatusMessage(`Fetching data from IPFS: ${ipfsUrl}`);
		const response = await axios.get(ipfsUrl);
		console.log("Data Fetched Successfully:", response.data);
		setStatusMessage("Data fetched successfully.");
		return response.data;
	} catch (error) {
		setStatusMessage(`IPFS Fetch Error: ${error.message}`);
		console.error("IPFS Fetch Error:", error);
		throw error;
	}
}

/**
 * Saves the user profile to blockchain by uploading the profile data to IPFS,
 * then calling the createOrUpdateProfile function on the deployed contract.
 *
 * @param {Object} user - The user profile data.
 * @param {function} setStatusMessage - Callback for UI status updates.
 * @returns {Promise<{ ipfsUrl: string, ipfsCid: string }>}
 */
export async function saveProfileToBlockchain(
	user,
	setStatusMessage = () => {}
) {
	try {
		setStatusMessage("Preparing to upload data...");

		if (!user || !user.walletAddress) {
			throw new Error("Invalid user data for blockchain registration");
		}

		// Check MetaMask
		if (typeof window === "undefined" || !window.ethereum) {
			throw new Error("MetaMask not detected. Please install MetaMask.");
		}

		setStatusMessage("Requesting wallet connection...");
		await window.ethereum.request({ method: "eth_requestAccounts" });

		const provider = new BrowserProvider(window.ethereum);
		const signer = await provider.getSigner();
		const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

		// Upload to IPFS first
		setStatusMessage("Uploading to IPFS...");
		const { ipfsUrl, ipfsCid } = await uploadToIPFS(user, setStatusMessage);
		console.log("IPFS Upload successful:", ipfsUrl);

		// Save IPFS URI to blockchain
		setStatusMessage("Creating blockchain profile...");

		// Estimate gas for the transaction
		const gasEstimate = await contract.createOrUpdateProfile.estimateGas(
			ipfsUrl
		);
		console.log("Estimated gas:", gasEstimate.toString());

		// Add 10% buffer to gas estimate
		const gasLimit = (gasEstimate * 110n) / 100n;
		console.log("Using gas limit:", gasLimit.toString());

		const tx = await contract.createOrUpdateProfile(ipfsUrl, {
			gasLimit,
		});

		setStatusMessage("Waiting for transaction confirmation...");
		await tx.wait();
		setStatusMessage("Profile successfully recorded on blockchain!");

		return { ipfsUrl, ipfsCid };
	} catch (error) {
		console.error("Blockchain operation failed:", error);

		// Enhanced error handling
		if (error.code === "CALL_EXCEPTION") {
			if (error.message.includes("already registered")) {
				throw new Error("User already registered");
			}
			throw new Error("Smart contract call failed. Please try again.");
		} else if (error.code === "ACTION_REJECTED") {
			throw new Error("Transaction was rejected by user.");
		} else if (error.message.includes("MetaMask")) {
			throw new Error("MetaMask not found. Please install MetaMask.");
		} else if (error.message.includes("network")) {
			throw new Error("Please connect to the correct network.");
		}

		throw new Error(error.message || "Failed to save profile to blockchain");
	}
}
