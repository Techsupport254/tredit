import axios from "axios";
import { BrowserProvider, Contract } from "ethers";

// Replace these with your actual Pinata API credentials from environment variables
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;

// Deployed contract address of UserProfileRegistry
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// ABI for the registerUser function (No more `_did` parameter)
const CONTRACT_ABI = ["function registerUser(string _profileURI) public"];

/**
 * Uploads user profile data to IPFS via Pinata.
 * @param {Object} data - The user profile data.
 * @param {function} setStatusMessage - Callback for UI status updates.
 * @returns {Promise<{ ipfsUrl: string, data: Object }>}
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

		const cid = response.data.IpfsHash;
		const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

		setStatusMessage(`Profile uploaded successfully: ${ipfsUrl}`);
		console.log("Upload Successful:", ipfsUrl);

		return { ipfsUrl, data };
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
 * then calling the registerUser function on the deployed contract.
 *
 * @param {Object} data - The user profile data.
 * @param {function} setStatusMessage - Callback for UI status updates.
 * @param {function} saveOnChain - (Optional) Callback to update on-chain state in context.
 * @returns {Promise<{ tx: any, ipfsUrl: string }>}
 */
export async function saveProfileToBlockchain(
	user,
	setStatusMessage = () => {}
) {
	try {
		setStatusMessage("Uploading user data to Pinata...");
		const userData = { id: user.id, walletAddress: user.walletAddress };
		const { ipfsUrl } = await uploadToIPFS(userData, setStatusMessage);
		console.log("IPFS URL:", ipfsUrl);

		if (typeof window === "undefined" || !window.ethereum) {
			throw new Error("Ethereum provider not found. Please install MetaMask.");
		}

		await window.ethereum.request({ method: "eth_requestAccounts" });
		const provider = new BrowserProvider(window.ethereum);
		const signer = await provider.getSigner();
		const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

		setStatusMessage("Saving profile to blockchain...");
		const tx = await contract.registerUser(ipfsUrl);
		await tx.wait();
		setStatusMessage("User profile recorded on blockchain.");
		console.log("Transaction Hash:", tx.hash);

		return { tx, ipfsUrl };
	} catch (error) {
		setStatusMessage(`Blockchain Error: ${error.message}`);
		console.error("Error saving user to blockchain:", error);
		throw error;
	}
}
