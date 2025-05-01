import { ethers } from "ethers";

interface PaymentContract {
	recordPayment(
		paymentId: string,
		amount: ethers.BigNumberish,
		metadata: string
	): Promise<ethers.ContractTransactionResponse>;

	completePayment(
		paymentId: string,
		metadata: string
	): Promise<ethers.ContractTransactionResponse>;

	initiateBlockchainPayment(
		paymentId: string,
		amount: ethers.BigNumberish,
		metadata: string
	): Promise<ethers.ContractTransactionResponse>;

	target: string;
}

interface PaymentMetadata {
	agreementId: string;
	paymentMethod: string;
	buyerAddress: string;
	sellerAddress: string;
}

const DEFAULT_PAYMENT_ABI = [
	"function recordPayment(string paymentId, uint256 amount, string metadata)",
	"function completePayment(string paymentId, string metadata)",
	"function initiateBlockchainPayment(string paymentId, uint256 amount, string metadata)",
];

const DEFAULT_ESCROW_ABI = [
	"function approve(address spender, uint256 amount)",
	"function transferFrom(address from, address to, uint256 amount)",
	"function balanceOf(address account) view returns (uint256)",
	"function allowance(address owner, address spender) view returns (uint256)",
];

export class BlockchainPaymentService {
	private provider: ethers.Provider;
	private signer: ethers.Signer;
	private paymentContract: PaymentContract;
	private escrowContract: ethers.Contract;

	constructor() {
		const paymentContractAddress = process.env.PAYMENT_CONTRACT_ADDRESS;
		const escrowContractAddress = process.env.ESCROW_CONTRACT_ADDRESS;
		const rpcUrl = process.env.RPC_URL || "https://polygon-rpc.com";

		if (!paymentContractAddress) {
			throw new Error("Payment contract address not configured");
		}

		if (!escrowContractAddress) {
			throw new Error("Escrow contract address not configured");
		}

		this.provider = new ethers.JsonRpcProvider(rpcUrl);
		this.signer = new ethers.Wallet(
			process.env.PRIVATE_KEY || "",
			this.provider
		);

		const paymentAbi = process.env.PAYMENT_CONTRACT_ABI
			? JSON.parse(process.env.PAYMENT_CONTRACT_ABI)
			: DEFAULT_PAYMENT_ABI;

		const escrowAbi = process.env.ESCROW_CONTRACT_ABI
			? JSON.parse(process.env.ESCROW_CONTRACT_ABI)
			: DEFAULT_ESCROW_ABI;

		const contract = new ethers.Contract(
			paymentContractAddress,
			paymentAbi,
			this.signer
		);

		this.paymentContract = {
			recordPayment: contract.recordPayment.bind(contract),
			completePayment: contract.completePayment.bind(contract),
			initiateBlockchainPayment:
				contract.initiateBlockchainPayment.bind(contract),
			target: contract.target as string,
		};

		this.escrowContract = new ethers.Contract(
			escrowContractAddress,
			escrowAbi,
			this.signer
		);
	}

	async approveToken(
		amount: ethers.BigNumberish
	): Promise<ethers.ContractTransactionResponse | null> {
		try {
			const currentAllowance = await this.escrowContract.allowance(
				await this.signer.getAddress(),
				this.paymentContract.target
			);

			if (currentAllowance.lt(amount)) {
				const tx = await this.escrowContract.approve(
					this.paymentContract.target,
					amount
				);
				return tx;
			}
			return null;
		} catch (error) {
			console.error("Error approving token:", error);
			throw error;
		}
	}

	async initiatePayment(
		paymentId: string,
		amount: string,
		metadata: PaymentMetadata
	): Promise<ethers.ContractTransactionResponse> {
		try {
			const tx = await this.paymentContract.initiateBlockchainPayment(
				paymentId,
				ethers.parseUnits(amount, 18),
				JSON.stringify(metadata)
			);
			return tx;
		} catch (error) {
			console.error("Error initiating payment:", error);
			throw error;
		}
	}

	async completePayment(
		paymentId: string,
		metadata: PaymentMetadata
	): Promise<ethers.ContractTransactionResponse> {
		try {
			const tx = await this.paymentContract.completePayment(
				paymentId,
				JSON.stringify(metadata)
			);
			return tx;
		} catch (error) {
			console.error("Error completing payment:", error);
			throw error;
		}
	}

	async getAllPayments(): Promise<any[]> {
		try {
			// Get all payment events from the contract
			const filter = this.paymentContract.filters.PaymentCreated();
			const events = await this.paymentContract.queryFilter(filter);

			// Transform events into payment objects
			const payments = await Promise.all(
				events.map(async (event) => {
					const payment = await this.paymentContract.getPayment(
						event.args.paymentId
					);
					return {
						paymentId: event.args.paymentId,
						amount: ethers.formatEther(payment.amount),
						payer: payment.payer,
						payee: payment.payee,
						token: payment.token,
						isFiat: payment.isFiat,
						isCompleted: payment.isCompleted,
						timestamp: payment.timestamp,
					};
				})
			);

			return payments;
		} catch (error) {
			console.error("Error fetching payments:", error);
			throw error;
		}
	}
}
