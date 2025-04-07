const axios = require("axios");
const FormData = require("form-data");
const Web3 = require("web3");
const { abi } = require("../contracts/DisputeResolution.json");

class BlockchainService {
	constructor() {
		this.pinataApiKey = process.env.PINATA_API_KEY;
		this.pinataSecretKey = process.env.PINATA_SECRET_KEY;
		this.web3 = new Web3(process.env.WEB3_PROVIDER);
		this.contractAddress = process.env.DISPUTE_CONTRACT_ADDRESS;
		this.contract = new this.web3.eth.Contract(abi, this.contractAddress);
	}

	// Upload dispute data to Pinata
	async uploadToPinata(data) {
		try {
			const formData = new FormData();
			formData.append("file", Buffer.from(JSON.stringify(data)), {
				filename: `dispute-${data.disputeId}.json`,
			});

			const response = await axios.post(
				"https://api.pinata.cloud/pinning/pinFileToIPFS",
				formData,
				{
					maxBodyLength: "Infinity",
					headers: {
						"Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
						pinata_api_key: this.pinataApiKey,
						pinata_secret_api_key: this.pinataSecretKey,
					},
				}
			);

			return response.data.IpfsHash;
		} catch (error) {
			console.error("Error uploading to Pinata:", error);
			throw error;
		}
	}

	// Create dispute on blockchain
	async createDispute(disputeData, ipfsHash) {
		try {
			const accounts = await this.web3.eth.getAccounts();
			const account = accounts[0];

			const dispute = {
				disputeId: disputeData.id,
				orderId: disputeData.orderId,
				buyerId: disputeData.userId,
				businessId: disputeData.businessId,
				reason: disputeData.reason,
				description: disputeData.description,
				ipfsHash: ipfsHash,
				status: 0, // 0 = Open
				createdAt: Math.floor(Date.now() / 1000),
			};

			const gas = await this.contract.methods
				.createDispute(
					dispute.disputeId,
					dispute.orderId,
					dispute.buyerId,
					dispute.businessId,
					dispute.reason,
					dispute.description,
					dispute.ipfsHash
				)
				.estimateGas({ from: account });

			const result = await this.contract.methods
				.createDispute(
					dispute.disputeId,
					dispute.orderId,
					dispute.buyerId,
					dispute.businessId,
					dispute.reason,
					dispute.description,
					dispute.ipfsHash
				)
				.send({ from: account, gas });

			return {
				transactionHash: result.transactionHash,
				dispute,
			};
		} catch (error) {
			console.error("Error creating dispute on blockchain:", error);
			throw error;
		}
	}

	// Update dispute status on blockchain
	async updateDisputeStatus(disputeId, status, resolution, ipfsHash) {
		try {
			const accounts = await this.web3.eth.getAccounts();
			const account = accounts[0];

			const gas = await this.contract.methods
				.updateDisputeStatus(disputeId, status, resolution, ipfsHash)
				.estimateGas({ from: account });

			const result = await this.contract.methods
				.updateDisputeStatus(disputeId, status, resolution, ipfsHash)
				.send({ from: account, gas });

			return {
				transactionHash: result.transactionHash,
			};
		} catch (error) {
			console.error("Error updating dispute status on blockchain:", error);
			throw error;
		}
	}

	// Get dispute from blockchain
	async getDispute(disputeId) {
		try {
			const dispute = await this.contract.methods.getDispute(disputeId).call();
			return dispute;
		} catch (error) {
			console.error("Error getting dispute from blockchain:", error);
			throw error;
		}
	}
}

module.exports = new BlockchainService();
