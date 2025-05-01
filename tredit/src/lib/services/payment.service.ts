import { ethers } from "ethers";
import config from "@/config";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

declare global {
	interface Window {
		ethereum?: any;
	}
}

interface PaymentMetadata {
	agreementId: string;
	paymentMethod: string;
	buyerAddress: string;
	sellerAddress: string;
	token?: string;
}

interface IPaymentContract {
	recordFiatPayment(
		payer: string,
		payee: string,
		amount: ethers.BigNumberish,
		paymentId: string
	): Promise<ethers.ContractTransactionResponse>;

	completePayment(
		paymentId: string
	): Promise<ethers.ContractTransactionResponse>;

	initiateBlockchainPayment: {
		(
			payee: string,
			amount: ethers.BigNumberish,
			token: string,
			overrides?: ethers.Overrides
		): Promise<ethers.ContractTransactionResponse>;
		estimateGas(
			payee: string,
			amount: ethers.BigNumberish,
			token: string
		): Promise<bigint>;
	};

	getPayment(paymentId: string): Promise<{
		payer: string;
		payee: string;
		amount: bigint;
		paymentId: string;
		token: string;
		isFiat: boolean;
		isCompleted: boolean;
		timestamp: bigint;
	}>;

	supportedTokens(token: string): Promise<boolean>;

	addSupportedToken(token: string): Promise<ethers.ContractTransactionResponse>;

	removeSupportedToken(
		token: string
	): Promise<ethers.ContractTransactionResponse>;

	target: string;
}

interface EscrowContract {
	approve(
		spender: string,
		amount: ethers.BigNumberish
	): Promise<ethers.ContractTransactionResponse>;

	transferFrom(
		from: string,
		to: string,
		amount: ethers.BigNumberish
	): Promise<ethers.ContractTransactionResponse>;

	balanceOf(account: string): Promise<bigint>;

	allowance(owner: string, spender: string): Promise<bigint>;

	target: string;
}

interface TokenContract {
	approve(
		spender: string,
		amount: ethers.BigNumberish
	): Promise<ethers.ContractTransactionResponse>;

	transferFrom(
		from: string,
		to: string,
		amount: ethers.BigNumberish
	): Promise<ethers.ContractTransactionResponse>;

	balanceOf(account: string): Promise<bigint>;

	allowance(owner: string, spender: string): Promise<bigint>;

	transfer(
		to: string,
		amount: ethers.BigNumberish
	): Promise<ethers.ContractTransactionResponse>;

	decimals(): Promise<number>;

	symbol(): Promise<string>;

	name(): Promise<string>;

	target: string;

	[key: string]: any; // Add index signature for dynamic function access
}

const DEFAULT_PAYMENT_ABI = [
	"function recordFiatPayment(address payer, address payee, uint256 amount, bytes32 paymentId)",
	"function completePayment(bytes32 paymentId)",
	"function initiateBlockchainPayment(address payee, uint256 amount, address token) returns (bytes32)",
	"function getPayment(bytes32 paymentId) view returns (tuple(address payer, address payee, uint256 amount, bytes32 paymentId, address token, bool isFiat, bool isCompleted, uint256 timestamp))",
	"function supportedTokens(address) view returns (bool)",
	"function addSupportedToken(address token)",
	"function removeSupportedToken(address token)",
];

const DEFAULT_ESCROW_ABI = [
	"function approve(address spender, uint256 amount)",
	"function transferFrom(address from, address to, uint256 amount)",
	"function balanceOf(address account) view returns (uint256)",
	"function allowance(address owner, address spender) view returns (uint256)",
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

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export class PaymentService {
	private static instance: PaymentService;
	private provider: ethers.JsonRpcProvider;
	private signer: ethers.Signer;
	private paymentContract!: IPaymentContract;
	private escrowContract!: EscrowContract;
	private tokenContract!: TokenContract;
	private initialized: boolean = false;

	private constructor() {
		// Initialize non-async properties
		if (!config.blockchain.paymentContract) {
			throw new Error("Payment contract address not configured");
		}

		if (!config.blockchain.escrowContract) {
			throw new Error("Escrow contract address not configured");
		}

		if (!config.blockchain.privateKey) {
			throw new Error("Private key not configured");
		}

		if (!config.blockchain.rpcUrl) {
			throw new Error("RPC URL not configured");
		}

		this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
		this.signer = new ethers.Wallet(
			config.blockchain.privateKey,
			this.provider
		);
	}

	private async initialize() {
		try {
			console.log("Starting PaymentService initialization...");
			console.log("Configuration:", {
				rpcUrl: config.blockchain.rpcUrl,
				paymentContract: config.blockchain.paymentContract,
				escrowContract: config.blockchain.escrowContract,
				tokenAddress: config.blockchain.tokenAddress,
				privateKey: config.blockchain.privateKey ? "***" : undefined,
				chainId: config.blockchain.chainId,
				paymentAbi: config.blockchain.paymentAbi,
				escrowAbi: config.blockchain.escrowAbi,
				tokenAbi: config.blockchain.tokenAbi,
			});

			// Initialize provider and signer
			console.log("Initializing provider and signer...");
			this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
			console.log(
				"Provider initialized with RPC URL:",
				config.blockchain.rpcUrl
			);

			this.signer = new ethers.Wallet(
				config.blockchain.privateKey,
				this.provider
			);
			console.log(
				"Signer initialized with address:",
				await this.signer.getAddress()
			);
			console.log("Provider and signer initialized successfully");

			// Initialize payment contract
			const paymentContractAddress = config.blockchain.paymentContract;
			console.log(
				"Initializing payment contract at address:",
				paymentContractAddress
			);

			if (!ethers.isAddress(paymentContractAddress)) {
				console.error(
					"Invalid payment contract address:",
					paymentContractAddress
				);
				throw new Error("Invalid payment contract address");
			}

			// Log contract verification attempt
			console.log("Verifying payment contract deployment...");
			const isPaymentDeployed = await this.verifyTokenContract(
				paymentContractAddress
			);
			console.log(
				"Payment contract deployment verification result:",
				isPaymentDeployed
			);

			if (!isPaymentDeployed) {
				console.error(
					"Payment contract not deployed at address:",
					paymentContractAddress
				);
				throw new Error(
					"Payment contract is not deployed at the specified address"
				);
			}

			// Use the ABI from the .env file if available, otherwise use the default
			const paymentAbi = process.env.PAYMENT_CONTRACT_ABI
				? JSON.parse(process.env.PAYMENT_CONTRACT_ABI)
				: DEFAULT_PAYMENT_ABI;
			console.log("Using payment contract ABI:", paymentAbi);

			this.paymentContract = new ethers.Contract(
				paymentContractAddress,
				paymentAbi,
				this.signer
			) as unknown as IPaymentContract;
			console.log("Payment contract initialized successfully");

			// Initialize escrow contract
			const escrowContractAddress = config.blockchain.escrowContract;
			console.log(
				"Initializing escrow contract at address:",
				escrowContractAddress
			);

			if (!ethers.isAddress(escrowContractAddress)) {
				console.error(
					"Invalid escrow contract address:",
					escrowContractAddress
				);
				throw new Error("Invalid escrow contract address");
			}

			// Log contract verification attempt
			console.log("Verifying escrow contract deployment...");
			const isEscrowDeployed = await this.verifyTokenContract(
				escrowContractAddress
			);
			console.log(
				"Escrow contract deployment verification result:",
				isEscrowDeployed
			);

			if (!isEscrowDeployed) {
				console.error(
					"Escrow contract not deployed at address:",
					escrowContractAddress
				);
				throw new Error(
					"Escrow contract is not deployed at the specified address"
				);
			}

			// Use the ABI from the .env file if available, otherwise use the default
			const escrowAbi = process.env.ESCROW_CONTRACT_ABI
				? JSON.parse(process.env.ESCROW_CONTRACT_ABI)
				: DEFAULT_ESCROW_ABI;
			console.log("Using escrow contract ABI:", escrowAbi);

			this.escrowContract = new ethers.Contract(
				escrowContractAddress,
				escrowAbi,
				this.signer
			) as unknown as EscrowContract;
			console.log("Escrow contract initialized successfully");

			// Initialize token contract
			const tokenContractAddress = config.blockchain.tokenAddress;
			console.log(
				"Initializing token contract at address:",
				tokenContractAddress
			);

			if (!ethers.isAddress(tokenContractAddress)) {
				console.error("Invalid token contract address:", tokenContractAddress);
				throw new Error("Invalid token contract address");
			}

			// Log contract verification attempt
			console.log("Verifying token contract deployment...");
			const isTokenDeployed = await this.verifyTokenContract(
				tokenContractAddress
			);
			console.log(
				"Token contract deployment verification result:",
				isTokenDeployed
			);

			if (!isTokenDeployed) {
				console.error(
					"Token contract not deployed at address:",
					tokenContractAddress
				);
				throw new Error(
					"Token contract is not deployed at the specified address"
				);
			}

			// Use the ABI from the .env file if available, otherwise use the default
			const tokenAbi = process.env.TOKEN_CONTRACT_ABI
				? JSON.parse(process.env.TOKEN_CONTRACT_ABI)
				: DEFAULT_TOKEN_ABI;
			console.log("Using token contract ABI:", tokenAbi);

			this.tokenContract = new ethers.Contract(
				tokenContractAddress,
				tokenAbi,
				this.signer
			) as unknown as TokenContract;
			console.log("Token contract initialized successfully");

			// Verify token contract has all required functions
			console.log("Verifying token contract functions...");
			const requiredFunctions = [
				"approve",
				"transferFrom",
				"balanceOf",
				"allowance",
				"transfer",
				"decimals",
				"symbol",
				"name",
			] as const;

			for (const func of requiredFunctions) {
				if (typeof this.tokenContract[func] !== "function") {
					console.error("Missing required function:", func);
					throw new Error(`Token contract missing required function: ${func}`);
				}
			}
			console.log("Token contract functions verified successfully");

			// Check if token is supported and add it if needed
			console.log("Checking if token is supported...");
			await this.ensureTokenIsSupported(tokenContractAddress);
			console.log("Token support verified successfully");

			this.initialized = true;
			console.log("Payment service initialized successfully");
		} catch (error) {
			console.error("Payment service initialization error:", error);
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			throw new Error(`Payment service initialization failed: ${errorMessage}`);
		}
	}

	private async ensureTokenIsSupported(tokenAddress: string): Promise<void> {
		try {
			// Check if token is supported by calling the contract's supportedTokens mapping
			const isSupported = await this.paymentContract.supportedTokens(
				tokenAddress
			);
			if (!isSupported) {
				console.log("Adding token to supported tokens list...");
				const tx = await this.paymentContract.addSupportedToken(tokenAddress);
				await tx.wait();
				console.log("Token added to supported tokens list");
			}
		} catch (error) {
			console.error("Error ensuring token is supported:", error);
			// If the error is because the token is not supported, try to add it
			if (
				error instanceof Error &&
				error.message.includes("Unsupported token")
			) {
				try {
					console.log("Token not supported, attempting to add it...");
					const tx = await this.paymentContract.addSupportedToken(tokenAddress);
					await tx.wait();
					console.log("Token added to supported tokens list");
				} catch (addError) {
					console.error("Failed to add token to supported tokens:", addError);
					throw new Error(
						`Failed to add token to supported tokens: ${
							addError instanceof Error ? addError.message : String(addError)
						}`
					);
				}
			} else {
				throw new Error(
					`Failed to ensure token is supported: ${
						error instanceof Error ? error.message : String(error)
					}`
				);
			}
		}
	}

	private async checkTokenBalance(
		amount: ethers.BigNumberish
	): Promise<boolean> {
		try {
			const balance = await this.tokenContract.balanceOf(
				(this.signer as ethers.Wallet).address
			);
			return balance >= BigInt(amount);
		} catch (error) {
			console.error("Error checking token balance:", error);
			return false;
		}
	}

	private async approveTokenSpending(
		amount: ethers.BigNumberish
	): Promise<void> {
		try {
			const spender = this.paymentContract.target;
			const owner = (this.signer as ethers.Wallet).address;

			// Check current allowance
			const allowance = await this.tokenContract.allowance(owner, spender);
			if (allowance < BigInt(amount)) {
				console.log("Approving token spending...");
				const approveTx = await this.tokenContract.approve(spender, amount);
				await approveTx.wait();
				console.log("Token spending approved");
			}
		} catch (error) {
			console.error("Error approving token spending:", error);
			throw new Error(
				`Failed to approve token spending: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
		}
	}

	public static async getInstance(): Promise<PaymentService> {
		if (!PaymentService.instance) {
			PaymentService.instance = new PaymentService();
			await PaymentService.instance.initialize();
		}
		return PaymentService.instance;
	}

	private async estimateGas(
		contract: IPaymentContract,
		method: keyof IPaymentContract,
		...args: any[]
	): Promise<bigint> {
		try {
			const contractMethod = contract[method] as unknown as {
				estimateGas: (...args: any[]) => Promise<bigint>;
			};
			if (!contractMethod || typeof contractMethod.estimateGas !== "function") {
				throw new Error(`Method ${String(method)} not found or not callable`);
			}
			const gasEstimate = await contractMethod.estimateGas(...args);
			return (gasEstimate * BigInt(120)) / BigInt(100); // Add 20% buffer
		} catch (error) {
			throw new Error(`Failed to estimate gas for ${String(method)}`);
		}
	}

	private async retryOperation<T>(
		operation: () => Promise<T>,
		maxRetries: number = MAX_RETRIES
	): Promise<T> {
		let lastError: Error | null = null;
		for (let i = 0; i < maxRetries; i++) {
			try {
				return await operation();
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));
				if (i < maxRetries - 1) {
					await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
				}
			}
		}
		throw lastError;
	}

	private async verifyTokenContract(address: string): Promise<boolean> {
		try {
			console.log("Verifying contract at address:", address);
			const code = await this.provider.getCode(address);
			console.log("Contract code:", code);

			if (code === "0x") {
				console.error("No contract code found at address:", address);
				return false;
			}

			// Create a contract instance for verification
			console.log("Creating contract instance for verification...");
			const contract = new ethers.Contract(
				address,
				[
					"function owner() view returns (address)",
					"function state() view returns (uint8)",
					"function balanceOf(address) view returns (uint256)",
					"function decimals() view returns (uint8)",
					"function symbol() view returns (string)",
				],
				this.provider
			);

			// Try to call a simple view function to verify the contract
			console.log("Getting contract code for verification...");
			const contractCode = await this.provider.getCode(address);
			console.log("Contract code for verification:", contractCode);

			// For Payment contract, try to call the owner() function
			if (
				address.toLowerCase() ===
				config.blockchain.paymentContract.toLowerCase()
			) {
				console.log("Calling owner function for verification...");
				await contract.owner();
				return true;
			}

			// For Escrow contract, try to call the state() function
			if (
				address.toLowerCase() === config.blockchain.escrowContract.toLowerCase()
			) {
				console.log("Calling state function for verification...");
				try {
					await contract.state();
					return true;
				} catch (error) {
					console.error("Error calling state function:", error);
					// If state() fails, try owner() as fallback
					try {
						await contract.owner();
						return true;
					} catch (ownerError) {
						console.error("Error calling owner function:", ownerError);
						return false;
					}
				}
			}

			// For Token contract, try to call decimals() and symbol()
			if (
				address.toLowerCase() === config.blockchain.tokenAddress.toLowerCase()
			) {
				console.log("Calling token functions for verification...");
				try {
					await contract.decimals();
					await contract.symbol();
					return true;
				} catch (error) {
					console.error("Error calling token functions:", error);
					// If token functions fail, try balanceOf as fallback
					try {
						await contract.balanceOf(address);
						return true;
					} catch (balanceError) {
						console.error("Error calling balanceOf function:", balanceError);
						return false;
					}
				}
			}

			// For other contracts, try to call balanceOf
			console.log("Calling balanceOf function for verification...");
			await contract.balanceOf(address);
			console.log("Contract verification successful for address:", address);
			return true;
		} catch (error) {
			console.error("Error calling contract function:", error);
			return false;
		}
	}

	private async checkAllowance(
		owner: string,
		spender: string,
		amount: bigint
	): Promise<boolean> {
		try {
			const allowance = await this.tokenContract.allowance(owner, spender);
			return allowance >= amount;
		} catch (error) {
			console.error("Error checking allowance:", error);
			return false;
		}
	}

	private async approveToken(
		amount: ethers.BigNumberish
	): Promise<ethers.ContractTransactionResponse | null> {
		try {
			const spender = this.paymentContract.target;
			const owner = (this.signer as ethers.Wallet).address;

			// Check balance first
			const balance = await this.tokenContract.balanceOf(owner);
			if (balance < BigInt(amount)) {
				throw new Error("Insufficient token balance");
			}

			// Check allowance
			const hasAllowance = await this.checkAllowance(
				owner,
				spender,
				BigInt(amount)
			);
			if (!hasAllowance) {
				// Approve the payment contract to spend tokens
				const approveTx = await this.tokenContract.approve(spender, amount);
				return approveTx;
			}
			return null;
		} catch (error) {
			console.error("Error in approveToken:", error);
			throw new Error(
				`Failed to approve token transfer: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
		}
	}

	private async getEthereumProvider() {
		if (typeof window !== "undefined" && window.ethereum) {
			return window.ethereum;
		}
		throw new Error("MetaMask not found. Please install MetaMask to continue.");
	}

	public async initiatePayment(
		paymentId: string,
		amount: string,
		metadata: PaymentMetadata
	): Promise<{ paymentId: string }> {
		if (!this.initialized) {
			await this.initialize();
		}

		try {
			const amountBN = ethers.parseEther(amount);
			const metadataStr = JSON.stringify(metadata);

			// Get the ethereum provider
			const provider = await this.getEthereumProvider();

			// Request account access if needed
			await provider.request({ method: "eth_requestAccounts" });

			// Create a new provider and signer with the browser's ethereum provider
			const browserProvider = new ethers.BrowserProvider(provider);
			const signer = await browserProvider.getSigner();

			// Initialize contracts with the browser signer
			const paymentContract = new ethers.Contract(
				config.blockchain.paymentContract,
				DEFAULT_PAYMENT_ABI,
				signer
			) as unknown as IPaymentContract;

			const tokenContract = new ethers.Contract(
				config.blockchain.tokenAddress,
				DEFAULT_TOKEN_ABI,
				signer
			) as unknown as TokenContract;

			// Check token balance
			const balance = await tokenContract.balanceOf(await signer.getAddress());
			if (balance < amountBN) {
				throw new Error("Insufficient token balance");
			}

			// Approve token spending
			const approveTx = await tokenContract.approve(
				config.blockchain.paymentContract,
				amountBN
			);
			await approveTx.wait();

			// Get gas settings
			const gasEstimate =
				await paymentContract.initiateBlockchainPayment.estimateGas(
					metadata.sellerAddress,
					amountBN,
					config.blockchain.tokenAddress
				);

			const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100); // Add 20% buffer
			const feeData = await browserProvider.getFeeData();

			// Initiate the payment with explicit gas settings to trigger MetaMask
			const tx = await paymentContract.initiateBlockchainPayment(
				metadata.sellerAddress,
				amountBN,
				config.blockchain.tokenAddress,
				{
					gasLimit: gasLimit,
					maxFeePerGas: feeData.maxFeePerGas,
					maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
				}
			);

			// Wait for the transaction to be mined
			const receipt = await tx.wait();

			if (!receipt) {
				throw new Error("Transaction failed - no receipt received");
			}

			return { paymentId: receipt.hash };
		} catch (error) {
			console.error("Payment initiation error:", error);
			throw new Error(
				`Failed to initiate payment: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
		}
	}

	public async completePayment(
		paymentId: string,
		metadata: PaymentMetadata
	): Promise<ethers.ContractTransactionResponse> {
		if (!this.initialized) {
			await this.initialize();
		}

		try {
			// Get payment status first
			const paymentStatus = await this.getPaymentStatus(paymentId);
			if (!paymentStatus) {
				throw new Error("Payment not found");
			}

			if (paymentStatus.isCompleted) {
				throw new Error("Payment already completed");
			}

			// Complete the payment
			const tx = await this.paymentContract.completePayment(paymentId);
			await tx.wait();

			return tx;
		} catch (error) {
			console.error("Error completing payment:", error);
			throw new Error(
				`Failed to complete payment: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
		}
	}

	public async recordFiatPayment(
		payer: string,
		payee: string,
		amount: string,
		paymentId: string
	): Promise<ethers.ContractTransactionResponse> {
		if (!this.initialized) {
			await this.initialize();
		}

		try {
			const amountBN = ethers.parseEther(amount);
			const tx = await this.paymentContract.recordFiatPayment(
				payer,
				payee,
				amountBN,
				paymentId
			);
			await tx.wait();
			return tx;
		} catch (error) {
			console.error("Error recording fiat payment:", error);
			throw new Error(
				`Failed to record fiat payment: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
		}
	}

	public async completePaymentWithTransaction(
		paymentId: string,
		transactionResponse: ethers.ContractTransactionResponse,
		metadata: PaymentMetadata
	): Promise<{ success: boolean; transactionHash: string }> {
		if (!this.initialized) {
			await this.initialize();
		}

		try {
			// Wait for the transaction to be mined
			const receipt = await transactionResponse.wait();

			if (!receipt) {
				throw new Error("Transaction failed - no receipt received");
			}

			// Complete the payment
			await this.completePayment(paymentId, metadata);

			return {
				success: true,
				transactionHash: receipt.hash,
			};
		} catch (error) {
			console.error("Error completing payment with transaction:", error);
			throw new Error(
				`Failed to complete payment: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
		}
	}

	public async getPaymentStatus(paymentId: string) {
		if (!this.initialized) {
			await this.initialize();
		}

		try {
			console.log("Getting payment status for paymentId:", paymentId);
			const payment = await this.paymentContract.getPayment(paymentId);
			console.log("Payment status:", payment);
			return payment;
		} catch (error) {
			console.error("Error getting payment status:", error);
			throw new Error(
				`Failed to get payment status: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
		}
	}

	public async completePaymentFlow(
		paymentId: string,
		amount: string,
		metadata: PaymentMetadata
	): Promise<{ success: boolean; transactionHash?: string }> {
		if (!this.initialized) {
			await this.initialize();
		}

		try {
			const amountBN = ethers.parseEther(amount);

			// 1. Check token balance
			const hasEnoughBalance = await this.checkTokenBalance(amountBN);
			if (!hasEnoughBalance) {
				throw new Error(
					"Insufficient token balance. Please ensure you have enough TRDT tokens."
				);
			}

			// 2. Approve token spending
			await this.approveTokenSpending(amountBN);

			// 3. Ensure token is supported
			await this.ensureTokenIsSupported(config.blockchain.tokenAddress);

			// 4. Get payment status
			const paymentStatus = await this.getPaymentStatus(paymentId);
			if (!paymentStatus) {
				throw new Error("Payment not found");
			}

			if (paymentStatus.isCompleted) {
				throw new Error("Payment already completed");
			}

			// 5. Complete the payment
			const tx = await this.paymentContract.completePayment(paymentId);
			const receipt = await tx.wait();

			if (!receipt) {
				throw new Error("Transaction failed - no receipt received");
			}

			return {
				success: true,
				transactionHash: receipt.hash,
			};
		} catch (error) {
			console.error("Payment completion error:", error);
			throw new Error(
				`Failed to complete payment: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
		}
	}
}
