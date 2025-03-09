const axios = require("axios");
const { ethers } = require("ethers");
const FormData = require("form-data");
const EventEmitter = require("events");
const {
	PINATA_API_KEY,
	PINATA_API_SECRET,
	CONTRACT_ADDRESS,
	CONTRACT_ABI,
	PRIVATE_KEY,
	CHAIN_ID,
} = process.env;

// Validate configurations
if (!PINATA_API_KEY || !PINATA_API_SECRET) {
	console.error("Pinata API configuration is missing");
	throw new Error("Pinata API configuration is required");
}

if (!CONTRACT_ADDRESS || !CONTRACT_ABI || !PRIVATE_KEY) {
	console.error("Missing required blockchain configuration");
	throw new Error("Missing required blockchain configuration");
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
const POLYGON_AMOY_RPC = "https://rpc-amoy.polygon.technology";

const blockchainEvents = new EventEmitter();

/**
 * Uploads data to IPFS via Pinata
 * @param {Object|string} data - The data to upload
 * @returns {Promise<{ ipfsCid: string, ipfsUrl: string }>}
 */
async function uploadToIPFS(data, emitEvent = null) {
	try {
		if (emitEvent) {
			emitEvent({
				type: "ipfs",
				status: "initializing",
				message: "Initializing IPFS upload...",
				progress: 10,
				state: "INITIALIZING",
				steps: [
					{
						step: "CHECK_CONFIG",
						status: "IN_PROGRESS",
						message: "Checking configuration",
					},
					{
						step: "PREPARE_DATA",
						status: "PENDING",
						message: "Preparing data",
					},
				],
			});
		}

		// Validate Pinata configuration
		if (!PINATA_API_KEY || !PINATA_API_SECRET) {
			if (emitEvent) {
				emitEvent({
					type: "ipfs",
					status: "error",
					message: "Pinata API configuration is missing",
					progress: 0,
					state: "ERROR",
					error: true,
					steps: [
						{
							step: "CHECK_CONFIG",
							status: "FAILED",
							message: "Missing Pinata API configuration",
						},
					],
				});
			}
			throw new Error("Pinata API configuration is required");
		}

		const headers = {
			pinata_api_key: PINATA_API_KEY,
			pinata_secret_api_key: PINATA_API_SECRET,
			"Content-Type": "application/json",
		};

		// Prepare and validate data
		if (emitEvent) {
			emitEvent({
				type: "ipfs",
				status: "preparing",
				message: "Preparing data for upload...",
				progress: 20,
				state: "PREPARING",
				steps: [
					{
						step: "CHECK_CONFIG",
						status: "COMPLETED",
						message: "Configuration validated",
					},
					{
						step: "PREPARE_DATA",
						status: "IN_PROGRESS",
						message: "Formatting data",
					},
				],
			});
		}

		// Ensure data is properly formatted
		const profileData = {
			walletAddress: data.walletAddress?.toLowerCase(),
			name: data.name,
			email: data.email,
			profileImage: data.profileImage,
			role: data.role,
			createdAt: data.createdAt || new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		// Convert to JSON
		const jsonData = JSON.stringify(profileData);

		// Test Pinata connection
		if (emitEvent) {
			emitEvent({
				type: "ipfs",
				status: "connecting",
				message: "Testing Pinata connection...",
				progress: 40,
				state: "CONNECTING",
				steps: [
					{
						step: "CHECK_CONFIG",
						status: "COMPLETED",
						message: "Configuration validated",
					},
					{
						step: "PREPARE_DATA",
						status: "COMPLETED",
						message: "Data formatted successfully",
					},
					{
						step: "TEST_CONNECTION",
						status: "IN_PROGRESS",
						message: "Testing Pinata API connection",
					},
				],
			});
		}

		try {
			await axios.get(`${PINATA_BASE_URL}/data/testAuthentication`, {
				headers,
			});

			if (emitEvent) {
				emitEvent({
					type: "ipfs",
					status: "connected",
					message: "Connected to Pinata successfully",
					progress: 60,
					state: "CONNECTED",
					steps: [
						{
							step: "CHECK_CONFIG",
							status: "COMPLETED",
							message: "Configuration validated",
						},
						{
							step: "PREPARE_DATA",
							status: "COMPLETED",
							message: "Data formatted successfully",
						},
						{
							step: "TEST_CONNECTION",
							status: "COMPLETED",
							message: "Pinata connection established",
						},
						{
							step: "UPLOAD",
							status: "PENDING",
							message: "Preparing to upload",
						},
					],
				});
			}
		} catch (error) {
			if (emitEvent) {
				emitEvent({
					type: "ipfs",
					status: "error",
					message: "Failed to connect to Pinata",
					progress: 0,
					state: "ERROR",
					error: true,
					data: {
						code: error.code,
						details: error.message,
					},
					steps: [
						{
							step: "CHECK_CONFIG",
							status: "COMPLETED",
							message: "Configuration validated",
						},
						{
							step: "PREPARE_DATA",
							status: "COMPLETED",
							message: "Data formatted successfully",
						},
						{
							step: "TEST_CONNECTION",
							status: "FAILED",
							message: "Pinata connection failed",
						},
					],
				});
			}
			throw new Error(`Pinata connection failed: ${error.message}`);
		}

		// Upload to IPFS
		if (emitEvent) {
			emitEvent({
				type: "ipfs",
				status: "uploading",
				message: "Uploading to IPFS...",
				progress: 80,
				state: "UPLOADING",
				steps: [
					{
						step: "CHECK_CONFIG",
						status: "COMPLETED",
						message: "Configuration validated",
					},
					{
						step: "PREPARE_DATA",
						status: "COMPLETED",
						message: "Data formatted successfully",
					},
					{
						step: "TEST_CONNECTION",
						status: "COMPLETED",
						message: "Pinata connection established",
					},
					{
						step: "UPLOAD",
						status: "IN_PROGRESS",
						message: "Uploading data to IPFS",
					},
				],
			});
		}

		const response = await axios.post(
			`${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
			{
				pinataContent: profileData,
				pinataMetadata: {
					name: `user-profile-${profileData.walletAddress}-${Date.now()}`,
				},
				pinataOptions: {
					cidVersion: 1,
				},
			},
			{
				headers,
				timeout: 30000,
			}
		);

		if (!response.data || !response.data.IpfsHash) {
			if (emitEvent) {
				emitEvent({
					type: "ipfs",
					status: "error",
					message: "Invalid response from Pinata",
					progress: 0,
					state: "ERROR",
					error: true,
					steps: [
						{
							step: "CHECK_CONFIG",
							status: "COMPLETED",
							message: "Configuration validated",
						},
						{
							step: "PREPARE_DATA",
							status: "COMPLETED",
							message: "Data formatted successfully",
						},
						{
							step: "TEST_CONNECTION",
							status: "COMPLETED",
							message: "Pinata connection established",
						},
						{
							step: "UPLOAD",
							status: "FAILED",
							message: "Invalid response from IPFS upload",
						},
					],
				});
			}
			throw new Error("Invalid response from Pinata");
		}

		const ipfsCid = response.data.IpfsHash;
		const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsCid}`;

		if (emitEvent) {
			emitEvent({
				type: "ipfs",
				status: "success",
				message: "IPFS upload completed successfully",
				progress: 100,
				state: "COMPLETED",
				data: {
					cid: ipfsCid,
					url: ipfsUrl,
					size: response.data.PinSize,
					timestamp: response.data.Timestamp,
					filename: `user-profile-${profileData.walletAddress}-${Date.now()}`,
					gateway: "https://gateway.pinata.cloud",
				},
				steps: [
					{
						step: "CHECK_CONFIG",
						status: "COMPLETED",
						message: "Configuration validated",
					},
					{
						step: "PREPARE_DATA",
						status: "COMPLETED",
						message: "Data formatted successfully",
					},
					{
						step: "TEST_CONNECTION",
						status: "COMPLETED",
						message: "Pinata connection established",
					},
					{
						step: "UPLOAD",
						status: "COMPLETED",
						message: "Data uploaded successfully",
					},
					{
						step: "VERIFY",
						status: "COMPLETED",
						message: `Content stored with CID: ${ipfsCid}`,
					},
				],
			});
		}

		return { ipfsCid, ipfsUrl };
	} catch (error) {
		if (emitEvent) {
			emitEvent({
				type: "ipfs",
				status: "error",
				message: "IPFS upload failed",
				progress: 0,
				state: "ERROR",
				error: true,
				data: {
					code: error.code || "UNKNOWN_ERROR",
					details: error.message,
					timestamp: new Date().toISOString(),
				},
				steps: [{ step: "ERROR", status: "FAILED", message: error.message }],
			});
		}
		throw error;
	}
}

/**
 * Saves user profile to blockchain
 * @param {Object} data - Profile data containing ipfsUrl
 * @returns {Promise<{ success: boolean, txHash: string }>}
 */
async function saveProfileToBlockchain(data, emitEvent = null) {
	if (emitEvent) {
		emitEvent({
			type: "blockchain",
			status: "initializing",
			message: "Initializing blockchain transaction...",
			steps: ["Validating input data", "Setting up blockchain connection"],
		});
	}

	try {
		// Check for either ipfsUrl or ipfsUri
		const ipfsUri = data.ipfsUri || data.ipfsUrl;
		if (!ipfsUri) {
			throw new Error("IPFS URI is required for blockchain storage");
		}

		// Initialize provider
		if (emitEvent) {
			emitEvent({
				type: "blockchain",
				status: "connecting",
				message: "Connecting to blockchain network...",
				progress: 10,
				state: "CONNECTING",
				steps: [
					{
						step: "INIT_PROVIDER",
						status: "IN_PROGRESS",
						message: "Initializing provider",
					},
					{
						step: "CONNECT_NETWORK",
						status: "PENDING",
						message: "Connecting to Polygon Amoy testnet",
					},
				],
			});
		}

		const provider = new ethers.JsonRpcProvider(POLYGON_AMOY_RPC);
		const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

		// Get network info
		const network = await provider.getNetwork();
		if (emitEvent) {
			emitEvent({
				type: "blockchain",
				status: "connected",
				message: "Connected to network successfully",
				progress: 20,
				state: "CONNECTED",
				data: {
					chainId: network.chainId,
					name: network.name,
					networkType: "testnet",
				},
				steps: [
					{
						step: "INIT_PROVIDER",
						status: "COMPLETED",
						message: "Provider initialized",
					},
					{
						step: "CONNECT_NETWORK",
						status: "COMPLETED",
						message: `Connected to ${network.name}`,
					},
				],
			});
		}

		// Check wallet balance
		if (emitEvent) {
			emitEvent({
				type: "blockchain",
				status: "checking_balance",
				message: "Checking wallet balance...",
				progress: 30,
				state: "CHECKING_BALANCE",
				steps: [
					{
						step: "INIT_PROVIDER",
						status: "COMPLETED",
						message: "Provider initialized",
					},
					{
						step: "CONNECT_NETWORK",
						status: "COMPLETED",
						message: `Connected to ${network.name}`,
					},
					{
						step: "CHECK_BALANCE",
						status: "IN_PROGRESS",
						message: "Verifying wallet balance",
					},
				],
			});
		}

		const balance = await provider.getBalance(wallet.address);
		const balanceEther = ethers.formatEther(balance);

		if (balance === 0n) {
			if (emitEvent) {
				emitEvent({
					type: "blockchain",
					status: "error",
					message: "Insufficient funds in wallet",
					progress: 0,
					state: "ERROR",
					error: true,
					data: {
						balance: "0",
						address: wallet.address,
						required: "0.01 MATIC",
					},
					steps: [
						{
							step: "INIT_PROVIDER",
							status: "COMPLETED",
							message: "Provider initialized",
						},
						{
							step: "CONNECT_NETWORK",
							status: "COMPLETED",
							message: `Connected to ${network.name}`,
						},
						{
							step: "CHECK_BALANCE",
							status: "FAILED",
							message: "Insufficient wallet balance",
						},
					],
				});
			}
			throw new Error("INSUFFICIENT_FUNDS: Server wallet has no MATIC");
		}

		// Initialize contract
		if (emitEvent) {
			emitEvent({
				type: "blockchain",
				status: "preparing_contract",
				message: "Preparing smart contract...",
				progress: 40,
				state: "PREPARING_CONTRACT",
				steps: [
					{
						step: "INIT_PROVIDER",
						status: "COMPLETED",
						message: "Provider initialized",
					},
					{
						step: "CONNECT_NETWORK",
						status: "COMPLETED",
						message: `Connected to ${network.name}`,
					},
					{
						step: "CHECK_BALANCE",
						status: "COMPLETED",
						message: `Balance: ${balanceEther} MATIC`,
					},
					{
						step: "INIT_CONTRACT",
						status: "IN_PROGRESS",
						message: "Initializing smart contract",
					},
				],
			});
		}

		const contract = new ethers.Contract(CONTRACT_ADDRESS, parsedABI, wallet);

		// Get fee data for transaction
		const feeData = await provider.getFeeData();
		const txParams = {};

		// Only add gas parameters if they exist
		if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
			txParams.maxFeePerGas = feeData.maxFeePerGas;
			txParams.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
		} else if (feeData.gasPrice) {
			txParams.gasPrice = feeData.gasPrice;
		}

		if (emitEvent) {
			emitEvent({
				type: "blockchain",
				status: "preparing_transaction",
				message: "Preparing transaction...",
				progress: 60,
				state: "PREPARING_TRANSACTION",
				data: {
					gasPrice: feeData.gasPrice
						? ethers.formatUnits(feeData.gasPrice, "gwei")
						: "0",
					maxFeePerGas: feeData.maxFeePerGas
						? ethers.formatUnits(feeData.maxFeePerGas, "gwei")
						: "0",
					maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
						? ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei")
						: "0",
				},
				steps: [
					{
						step: "INIT_PROVIDER",
						status: "COMPLETED",
						message: "Provider initialized",
					},
					{
						step: "CONNECT_NETWORK",
						status: "COMPLETED",
						message: `Connected to ${network.name}`,
					},
					{
						step: "CHECK_BALANCE",
						status: "COMPLETED",
						message: `Balance: ${balanceEther} MATIC`,
					},
					{
						step: "INIT_CONTRACT",
						status: "COMPLETED",
						message: "Smart contract initialized",
					},
					{
						step: "PREPARE_TX",
						status: "IN_PROGRESS",
						message: "Preparing transaction parameters",
					},
				],
			});
		}

		// Send transaction
		if (emitEvent) {
			emitEvent({
				type: "blockchain",
				status: "sending",
				message: "Sending transaction to network...",
				progress: 70,
				state: "SENDING",
				steps: [
					{
						step: "INIT_PROVIDER",
						status: "COMPLETED",
						message: "Provider initialized",
					},
					{
						step: "CONNECT_NETWORK",
						status: "COMPLETED",
						message: `Connected to ${network.name}`,
					},
					{
						step: "CHECK_BALANCE",
						status: "COMPLETED",
						message: `Balance: ${balanceEther} MATIC`,
					},
					{
						step: "INIT_CONTRACT",
						status: "COMPLETED",
						message: "Smart contract initialized",
					},
					{
						step: "PREPARE_TX",
						status: "COMPLETED",
						message: "Transaction parameters prepared",
					},
					{
						step: "SEND_TX",
						status: "IN_PROGRESS",
						message: "Sending transaction",
					},
				],
			});
		}

		// Call the contract function with transaction parameters
		const tx = await contract.createOrUpdateProfile(ipfsUri, txParams);

		if (emitEvent) {
			emitEvent({
				type: "blockchain",
				status: "pending",
				message: "Transaction sent, waiting for confirmation...",
				progress: 80,
				state: "PENDING",
				data: {
					txHash: tx.hash,
					explorerUrl: `https://amoy.polygonscan.com/tx/${tx.hash}`,
				},
				steps: [
					{
						step: "INIT_PROVIDER",
						status: "COMPLETED",
						message: "Provider initialized",
					},
					{
						step: "CONNECT_NETWORK",
						status: "COMPLETED",
						message: `Connected to ${network.name}`,
					},
					{
						step: "CHECK_BALANCE",
						status: "COMPLETED",
						message: `Balance: ${balanceEther} MATIC`,
					},
					{
						step: "INIT_CONTRACT",
						status: "COMPLETED",
						message: "Smart contract initialized",
					},
					{
						step: "PREPARE_TX",
						status: "COMPLETED",
						message: "Transaction parameters prepared",
					},
					{ step: "SEND_TX", status: "COMPLETED", message: "Transaction sent" },
					{
						step: "CONFIRM_TX",
						status: "IN_PROGRESS",
						message: "Waiting for confirmation",
					},
				],
			});
		}

		// Wait for confirmation
		const receipt = await tx.wait();

		if (emitEvent) {
			emitEvent({
				type: "blockchain",
				status: "success",
				message: "Transaction confirmed successfully",
				progress: 100,
				state: "COMPLETED",
				data: {
					txHash: tx.hash,
					blockNumber: receipt.blockNumber,
					gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : "0",
					effectiveGasPrice: receipt.effectiveGasPrice
						? receipt.effectiveGasPrice.toString()
						: "0",
					explorerUrl: `https://amoy.polygonscan.com/tx/${tx.hash}`,
					confirmations: receipt.confirmations,
					timestamp: new Date().toISOString(),
				},
				steps: [
					{
						step: "INIT_PROVIDER",
						status: "COMPLETED",
						message: "Provider initialized",
					},
					{
						step: "CONNECT_NETWORK",
						status: "COMPLETED",
						message: `Connected to ${network.name}`,
					},
					{
						step: "CHECK_BALANCE",
						status: "COMPLETED",
						message: `Balance: ${balanceEther} MATIC`,
					},
					{
						step: "INIT_CONTRACT",
						status: "COMPLETED",
						message: "Smart contract initialized",
					},
					{
						step: "PREPARE_TX",
						status: "COMPLETED",
						message: "Transaction parameters prepared",
					},
					{ step: "SEND_TX", status: "COMPLETED", message: "Transaction sent" },
					{
						step: "CONFIRM_TX",
						status: "COMPLETED",
						message: `Confirmed in block ${receipt.blockNumber}`,
					},
				],
			});
		}

		return {
			success: true,
			txHash: tx.hash,
			blockNumber: receipt.blockNumber,
			gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : "0",
			effectiveGasPrice: receipt.effectiveGasPrice
				? receipt.effectiveGasPrice.toString()
				: "0",
			explorerUrl: `https://amoy.polygonscan.com/tx/${tx.hash}`,
			confirmations: receipt.confirmations,
			timestamp: new Date().toISOString(),
		};
	} catch (error) {
		// Format error message based on error type
		let errorMessage = error.message;
		let errorCode = error.code;
		let errorDetails = {};

		if (error.code === "INSUFFICIENT_FUNDS") {
			errorDetails = {
				balance: error.transaction?.balance,
				needed: error.transaction?.needed,
				overshot: error.transaction?.overshot,
			};
		}

		if (emitEvent) {
			emitEvent({
				type: "blockchain",
				status: "error",
				message: errorMessage,
				progress: 0,
				state: "ERROR",
				error: true,
				data: {
					code: errorCode,
					...errorDetails,
					timestamp: new Date().toISOString(),
				},
				steps: [
					{ step: "ERROR", status: "FAILED", message: errorMessage },
					...(errorDetails.overshot
						? [
								{
									step: "INSUFFICIENT_FUNDS",
									status: "FAILED",
									message: `Required additional funds: ${ethers.formatEther(
										errorDetails.overshot
									)} MATIC`,
								},
						  ]
						: []),
				],
			});
		}

		throw error;
	}
}

/**
 * Unpins content from Pinata IPFS
 * @param {string} ipfsCid - The IPFS CID to unpin
 * @returns {Promise<boolean>}
 */
async function unpinFromPinata(ipfsCid) {
	try {
		console.log("Unpinning from Pinata:", ipfsCid);

		const headers = {
			pinata_api_key: PINATA_API_KEY,
			pinata_secret_api_key: PINATA_API_SECRET,
		};

		const response = await axios.delete(
			`${PINATA_BASE_URL}/pinning/unpin/${ipfsCid}`,
			{ headers }
		);

		console.log("Successfully unpinned from Pinata");
		return true;
	} catch (error) {
		console.error("Failed to unpin from Pinata:", error);
		throw new Error(`Failed to unpin from IPFS: ${error.message}`);
	}
}

module.exports = {
	uploadToIPFS,
	saveProfileToBlockchain,
	unpinFromPinata,
	blockchainEvents,
};
