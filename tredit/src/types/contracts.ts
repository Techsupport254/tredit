import { ethers } from "ethers";

export interface TokenContract {
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
}

export interface EscrowContract {
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

export interface PaymentContract {
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
		payee: string,
		amount: ethers.BigNumberish,
		token: string
	): Promise<string>;

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

	target: string;
}
