import { ethers } from "ethers";
import config from "@/config";

const DEFAULT_PAYMENT_ABI = [
	"function recordPayment(string paymentId, uint256 amount, string metadata)",
	"function completePayment(string paymentId, string metadata)",
	"function initiateBlockchainPayment(address payee, uint256 amount, address token) returns (bytes32)",
	"function getPayment(bytes32 paymentId) view returns (tuple(address payer, address payee, uint256 amount, bytes32 paymentId, address token, bool isFiat, bool isCompleted, uint256 timestamp))",
	"function supportedTokens(address) view returns (bool)",
	"function addSupportedToken(address token)",
	"function removeSupportedToken(address token)",
];

const DEFAULT_TOKEN_ABI = [
	"function approve(address spender, uint256 amount) returns (bool)",
	"function transferFrom(address from, address to, uint256 amount) returns (bool)",
	"function balanceOf(address account) view returns (uint256)",
	"function allowance(address owner, address spender) view returns (uint256)",
	"function transfer(address to, uint256 amount) returns (bool)",
	"function decimals() view returns (uint8)",
	"function symbol() view returns (string)",
	"function name() view returns (string)",
];

const DEFAULT_BUSINESS_ABI = [
	"function getBusiness(bytes16 businessId) view returns (tuple(address owner, bytes32 ipfsHash, bytes16 id, bool isActive, uint40 updatedAt))",
];

export class PaymentClient {
	private static instance: PaymentClient;
	private provider: ethers.BrowserProvider | null = null;
	private signer: ethers.Signer | null = null;

	private constructor() {}

	public static getInstance(): PaymentClient {
		if (!PaymentClient.instance) {
			PaymentClient.instance = new PaymentClient();
		}
		return PaymentClient.instance;
	}

	private async getEthereumProvider() {
		console.log("Checking for ethereum provider...");
		if (typeof window !== "undefined" && window.ethereum) {
			console.log("Found ethereum provider");
			return window.ethereum;
		}
		console.error("No ethereum provider found");
		throw new Error("MetaMask not found. Please install MetaMask to continue.");
	}

	private async initialize() {
		try {
			console.log("Initializing payment client...");
			const provider = await this.getEthereumProvider();
			console.log("Got ethereum provider");

			console.log("Requesting account access...");
			await provider.request({ method: "eth_requestAccounts" });
			console.log("Account access granted");

			console.log("Creating browser provider...");
			this.provider = new ethers.BrowserProvider(provider);
			console.log("Browser provider created");

			console.log("Getting signer...");
			this.signer = await this.provider.getSigner();
			console.log("Signer obtained:", await this.signer.getAddress());
		} catch (error) {
			console.error("Failed to initialize payment client:", error);
			throw new Error(
				"Failed to connect to MetaMask. Please make sure MetaMask is installed and unlocked."
			);
		}
	}

	private uuidToBytes16(uuid: string): string {
		// Remove hyphens and convert to bytes16
		const hex = uuid.replace(/-/g, "");
		return `0x${hex.slice(0, 32)}`;
	}

	public async getBusinessOwner(businessId: string): Promise<string> {
		try {
			if (!this.provider || !this.signer) {
				await this.initialize();
			}

			const businessContract = new ethers.Contract(
				config.blockchain.businessContract,
				DEFAULT_BUSINESS_ABI,
				this.signer
			);

			const bytes16Id = this.uuidToBytes16(businessId);
			const business = await businessContract.getBusiness(bytes16Id);
			return business.owner;
		} catch (error) {
			console.error("Failed to get business owner:", error);
			throw new Error("Failed to get business owner address");
		}
	}

	public async initiatePayment(
		payeeAddress: string,
		amount: string,
		tokenAddress: string
	): Promise<{ paymentId: string }> {
		try {
			console.log("Starting payment initiation...");
			if (!this.provider || !this.signer) {
				console.log("Provider or signer not initialized, initializing...");
				await this.initialize();
			}

			// Validate addresses
			console.log("Validating addresses...");
			if (!ethers.isAddress(payeeAddress)) {
				throw new Error("Invalid payee address");
			}

			if (!ethers.isAddress(tokenAddress)) {
				throw new Error("Invalid token address");
			}

			if (!ethers.isAddress(config.blockchain.paymentContract)) {
				throw new Error("Invalid payment contract address");
			}

			console.log("Converting amount to BigNumber...");
			const amountBN = ethers.parseEther(amount);

			// Initialize contracts
			console.log("Initializing payment contract...");
			const paymentContract = new ethers.Contract(
				config.blockchain.paymentContract,
				DEFAULT_PAYMENT_ABI,
				this.signer
			);

			console.log("Initializing token contract...");
			let tokenContract;
			try {
				tokenContract = new ethers.Contract(
					tokenAddress,
					DEFAULT_TOKEN_ABI,
					this.signer
				);

				// Approve token spending directly (skipping allowance check)
				console.log("Approving token spending (direct call)...");
				try {
					const approveTx = await tokenContract.approve(
						config.blockchain.paymentContract,
						amountBN,
						{ gasLimit: 100000 }
					);
					console.log("Approval transaction sent, waiting for confirmation...");
					await approveTx.wait();
					console.log("Approval transaction confirmed");
				} catch (error) {
					console.error("Error in token approval process:", error);
					if (
						error instanceof Error &&
						error.message.includes("user rejected")
					) {
						throw new Error("Token approval was rejected by the user");
					}
					throw new Error(
						`Failed to approve token spending: ${
							error instanceof Error ? error.message : String(error)
						}`
					);
				}

				// Get gas settings
				console.log("Estimating gas for payment...");
				const gasEstimate =
					await paymentContract.initiateBlockchainPayment.estimateGas(
						payeeAddress,
						amountBN,
						tokenAddress
					);

				const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100); // Add 20% buffer
				console.log("Getting fee data...");
				const feeData = await this.provider!.getFeeData();

				// Initiate the payment with explicit gas settings to trigger MetaMask
				console.log("Initiating blockchain payment...");
				const tx = await paymentContract.initiateBlockchainPayment(
					payeeAddress,
					amountBN,
					tokenAddress,
					{
						gasLimit: gasLimit,
						maxFeePerGas: feeData.maxFeePerGas,
						maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
					}
				);

				// Wait for the transaction to be mined
				console.log("Waiting for transaction confirmation...");
				const receipt = await tx.wait();

				if (!receipt) {
					throw new Error("Transaction failed - no receipt received");
				}

				console.log("Payment initiated successfully");
				return { paymentId: receipt.hash };
			} catch (error) {
				console.error("Error in payment process:", error);
				if (error instanceof Error) {
					if (error.message.includes("invalid address")) {
						throw new Error(
							"Invalid contract address. Please check the configuration."
						);
					} else if (error.message.includes("network error")) {
						throw new Error(
							"Network error. Please check your internet connection."
						);
					} else if (error.message.includes("user rejected")) {
						throw new Error("Transaction was rejected by the user");
					}
				}
				throw new Error(
					`Failed to process payment: ${
						error instanceof Error ? error.message : String(error)
					}`
				);
			}
		} catch (error) {
			console.error("Payment initiation error:", error);
			throw new Error(
				`Failed to initiate payment: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
		}
	}
}
