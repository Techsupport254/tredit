const { db } = require("../models");
const { Op } = require("sequelize");
const { PinataManager } = require("../utils/ipfs");
const { ethers } = require("ethers");
const {
	executeTransaction,
	getSignedContract,
	disputeContract,
} = require("../utils/contractHelper");
const Dispute = require("../models/dispute");
const Order = require("../models/order");
const BusinessTeamMember = require("../models/businessTeamMember");
const { blockchainConfig } = require("../config/config");

// Initialize PinataManager
const pinataManager = new PinataManager();

// Initialize blockchain provider and contract
const provider = new ethers.JsonRpcProvider(blockchainConfig.RPC_URL);
const wallet = new ethers.Wallet(blockchainConfig.PRIVATE_KEY, provider);
const disputeContractInstance = new ethers.Contract(
	blockchainConfig.DISPUTE_CONTRACT_ADDRESS,
	[
		"function createDispute(bytes32 _disputeId, bytes32 _orderId, address _buyer, address _business, uint8 _reason, string memory _pinataCid) external",
	],
	wallet
);

// Helper function to convert dispute reason to enum value
function getDisputeReasonEnum(reason) {
	const reasonMap = {
		damaged_item: 0,
		wrong_item: 1,
		missing_item: 2,
		late_delivery: 3,
		quality_issue: 4,
		other: 5,
	};
	return reasonMap[reason] || 5;
}

class DisputeController {
	// Create a new dispute
	async create(req, res) {
		try {
			const { orderId } = req.params;
			const { reason, description, evidence } = req.body;
			const userId = req.user.id;

			// Find the order
			const order = await db.Order.findByPk(orderId, {
				include: [
					{
						model: db.Business,
						as: "business",
						include: [
							{
								model: db.User,
								as: "owner",
							},
						],
					},
				],
			});

			if (!order) {
				return res.status(404).json({
					success: false,
					message: "Order not found",
				});
			}

			// Check if user is the buyer
			if (order.userId !== userId) {
				return res.status(403).json({
					success: false,
					message: "You are not authorized to create a dispute for this order",
				});
			}

			// Check if order is eligible for dispute
			if (!["shipped", "delivered"].includes(order.status)) {
				return res.status(400).json({
					success: false,
					message: "Only shipped or delivered orders can be disputed",
				});
			}

			// Check if dispute already exists
			const existingDispute = await db.Dispute.findOne({
				where: {
					orderId,
					status: {
						[Op.in]: ["open", "in_progress"],
					},
				},
			});

			if (existingDispute) {
				return res.status(400).json({
					success: false,
					message: "A dispute is already open for this order",
				});
			}

			// Upload evidence to Pinata
			const evidenceData = [];
			for (const item of evidence) {
				const { type, data } = item;
				const pinataResult = await pinataManager.uploadContent(
					data,
					`dispute_evidence_${Date.now()}`
				);
				evidenceData.push({
					pinataCid: pinataResult.cid,
					type: type,
					timestamp: Date.now(),
				});
			}

			// Create dispute data object for Pinata
			const disputeData = {
				description,
				evidence: evidenceData,
				createdAt: new Date().toISOString(),
				orderStatus: order.status,
			};

			// Upload dispute data to Pinata
			const disputePinataResult = await pinataManager.uploadContent(
				disputeData,
				`dispute_${Date.now()}`
			);

			// Create dispute in database
			const dispute = await db.Dispute.create({
				orderId,
				userId,
				businessId: order.businessId,
				reason,
				description,
				status: "open",
				evidence: evidenceData,
				pinataCid: disputePinataResult.cid,
				metadata: {
					createdAt: new Date(),
					updatedAt: new Date(),
					orderStatusAtDispute: order.status,
				},
			});

			// Create dispute on blockchain
			const disputeIdBytes = ethers.utils.id(dispute.id);
			const orderIdBytes = ethers.utils.id(orderId);
			const buyerAddress = req.user.walletAddress;
			const businessAddress = order.business.walletAddress;
			const disputeReason = getDisputeReasonEnum(reason);

			const tx = await disputeContractInstance.createDispute(
				disputeIdBytes,
				orderIdBytes,
				buyerAddress,
				businessAddress,
				disputeReason,
				disputePinataResult.cid
			);

			await tx.wait();

			// Update dispute with blockchain transaction hash
			await dispute.update({
				metadata: {
					...dispute.metadata,
					blockchainTransactionHash: tx.hash,
				},
			});

			// Update order status to disputed
			await order.update({
				status: "disputed",
				notes: `Order disputed by buyer while ${order.status}`,
			});

			return res.status(201).json({
				success: true,
				message: "Dispute created successfully",
				data: {
					dispute,
					blockchainTransactionHash: tx.hash,
				},
			});
		} catch (error) {
			console.error("Error in create dispute:", error);
			return res.status(500).json({
				success: false,
				message: "Failed to create dispute",
				error: error.message,
			});
		}
	}

	// Add evidence to dispute
	async addEvidence(req, res) {
		try {
			const { disputeId } = req.params;
			const { type, data } = req.body;
			const userId = req.user.id;

			const dispute = await db.Dispute.findByPk(disputeId, {
				include: [
					{
						model: db.Order,
						as: "order",
					},
				],
			});

			if (!dispute) {
				return res.status(404).json({
					success: false,
					message: "Dispute not found",
				});
			}

			// Check if user is authorized
			const isBuyer = dispute.userId === userId;
			const isBusinessOwner = dispute.business.ownerId === userId;
			const isTeamMember = await db.BusinessTeamMember.findOne({
				where: {
					businessId: dispute.businessId,
					userId: userId,
					status: "active",
				},
			});

			if (!isBuyer && !isBusinessOwner && !isTeamMember) {
				return res.status(403).json({
					success: false,
					message: "You are not authorized to add evidence to this dispute",
				});
			}

			// Upload evidence to Pinata
			const pinataResult = await pinataManager.uploadToPinata(data);

			// Add evidence to blockchain
			const disputeIdBytes = ethers.utils.keccak256(
				ethers.utils.toUtf8Bytes(disputeId)
			);
			const tx = await disputeContract.addEvidence(
				disputeIdBytes,
				pinataResult.cid,
				getEvidenceTypeEnum(type)
			);

			await tx.wait();

			// Update dispute in database
			const evidence = {
				pinataCid: pinataResult.cid,
				type: getEvidenceTypeEnum(type),
				timestamp: Date.now(),
			};

			await dispute.update({
				evidence: [...dispute.evidence, evidence],
				metadata: {
					...dispute.metadata,
					updatedAt: new Date(),
					blockchainTransactionHash: tx.hash,
				},
			});

			// Update chat session
			const chat = await db.ChatSession.findOne({
				where: {
					buyerId: dispute.userId,
					businessId: dispute.businessId,
					status: "active",
				},
			});

			if (chat) {
				await db.Message.create({
					chatSessionId: chat.id,
					senderId: userId,
					senderType: isBuyer ? "buyer" : "business",
					content: `New evidence added to dispute: ${type}`,
					metadata: {
						isSystemMessage: true,
						disputeId: dispute.id,
						blockchainTransactionHash: tx.hash,
						timestamp: new Date(),
					},
				});

				await chat.update({
					lastMessageAt: new Date(),
				});
			}

			res.json({
				success: true,
				data: {
					evidence,
					blockchain: {
						transactionHash: tx.hash,
					},
				},
			});
		} catch (error) {
			console.error("Error in add evidence:", error);
			res.status(500).json({
				success: false,
				message: "Failed to add evidence",
				error: error.message,
			});
		}
	}

	// Resolve dispute
	async resolve(req, res) {
		try {
			const { disputeId } = req.params;
			const { type, amount, description, evidence } = req.body;
			const userId = req.user.id;

			const dispute = await db.Dispute.findByPk(disputeId, {
				include: [
					{
						model: db.Order,
						as: "order",
					},
				],
			});

			if (!dispute) {
				return res.status(404).json({
					success: false,
					message: "Dispute not found",
				});
			}

			// Check if user is authorized (only business can resolve)
			const isBusinessOwner = dispute.business.ownerId === userId;
			const isTeamMember = await db.BusinessTeamMember.findOne({
				where: {
					businessId: dispute.businessId,
					userId: userId,
					status: "active",
				},
			});

			if (!isBusinessOwner && !isTeamMember) {
				return res.status(403).json({
					success: false,
					message: "You are not authorized to resolve this dispute",
				});
			}

			// Upload resolution evidence to Pinata if any
			let resolutionEvidence = [];
			if (evidence && evidence.length > 0) {
				for (const item of evidence) {
					const { type, data } = item;
					const pinataResult = await pinataManager.uploadToPinata(data);
					resolutionEvidence.push({
						pinataCid: pinataResult.cid,
						type: getEvidenceTypeEnum(type),
						timestamp: Date.now(),
					});
				}
			}

			// Create resolution data object for Pinata
			const resolutionData = {
				type,
				amount,
				description,
				evidence: resolutionEvidence,
				timestamp: new Date().toISOString(),
			};

			// Upload resolution data to Pinata
			const resolutionPinataResult = await pinataManager.uploadToPinata(
				JSON.stringify(resolutionData)
			);

			// Resolve dispute on blockchain
			const disputeIdBytes = ethers.utils.keccak256(
				ethers.utils.toUtf8Bytes(disputeId)
			);
			const tx = await disputeContract.resolveDispute(
				disputeIdBytes,
				getResolutionTypeEnum(type),
				amount,
				resolutionPinataResult.cid
			);

			await tx.wait();

			// Update dispute in database
			await dispute.update({
				status: "resolved",
				resolution: {
					type,
					amount,
					description,
					evidence: resolutionEvidence,
					timestamp: new Date(),
				},
				metadata: {
					...dispute.metadata,
					updatedAt: new Date(),
					blockchainTransactionHash: tx.hash,
				},
			});

			// Update order status
			await dispute.order.update({
				status: "resolved",
				notes: `Dispute resolved: ${description}`,
			});

			// Update chat session
			const chat = await db.ChatSession.findOne({
				where: {
					buyerId: dispute.userId,
					businessId: dispute.businessId,
					status: "active",
				},
			});

			if (chat) {
				await db.Message.create({
					chatSessionId: chat.id,
					senderId: userId,
					senderType: "business",
					content: `Dispute has been resolved. Resolution: ${description}`,
					metadata: {
						isSystemMessage: true,
						disputeId: dispute.id,
						blockchainTransactionHash: tx.hash,
						timestamp: new Date(),
					},
				});

				await chat.update({
					lastMessageAt: new Date(),
				});
			}

			res.json({
				success: true,
				data: {
					dispute,
					blockchain: {
						transactionHash: tx.hash,
					},
				},
			});
		} catch (error) {
			console.error("Error in resolve dispute:", error);
			res.status(500).json({
				success: false,
				message: "Failed to resolve dispute",
				error: error.message,
			});
		}
	}

	// Close dispute
	async close(req, res) {
		try {
			const { disputeId } = req.params;
			const userId = req.user.id;

			const dispute = await db.Dispute.findByPk(disputeId, {
				include: [
					{
						model: db.Order,
						as: "order",
					},
				],
			});

			if (!dispute) {
				return res.status(404).json({
					success: false,
					message: "Dispute not found",
				});
			}

			// Check if user is authorized (only business can close)
			const isBusinessOwner = dispute.business.ownerId === userId;
			const isTeamMember = await db.BusinessTeamMember.findOne({
				where: {
					businessId: dispute.businessId,
					userId: userId,
					status: "active",
				},
			});

			if (!isBusinessOwner && !isTeamMember) {
				return res.status(403).json({
					success: false,
					message: "You are not authorized to close this dispute",
				});
			}

			// Close dispute on blockchain
			const disputeIdBytes = ethers.utils.keccak256(
				ethers.utils.toUtf8Bytes(disputeId)
			);
			const tx = await disputeContract.closeDispute(disputeIdBytes);
			await tx.wait();

			// Update dispute in database
			await dispute.update({
				status: "closed",
				metadata: {
					...dispute.metadata,
					updatedAt: new Date(),
					blockchainTransactionHash: tx.hash,
				},
			});

			// Update order status
			await dispute.order.update({
				status: "closed",
				notes: "Dispute has been closed",
			});

			// Update chat session
			const chat = await db.ChatSession.findOne({
				where: {
					buyerId: dispute.userId,
					businessId: dispute.businessId,
					status: "active",
				},
			});

			if (chat) {
				await db.Message.create({
					chatSessionId: chat.id,
					senderId: userId,
					senderType: "business",
					content: "Dispute has been closed",
					metadata: {
						isSystemMessage: true,
						disputeId: dispute.id,
						blockchainTransactionHash: tx.hash,
						timestamp: new Date(),
					},
				});

				await chat.update({
					lastMessageAt: new Date(),
				});
			}

			res.json({
				success: true,
				data: {
					dispute,
					blockchain: {
						transactionHash: tx.hash,
					},
				},
			});
		} catch (error) {
			console.error("Error in close dispute:", error);
			res.status(500).json({
				success: false,
				message: "Failed to close dispute",
				error: error.message,
			});
		}
	}

	// Get dispute details
	async getDispute(req, res) {
		try {
			const { disputeId } = req.params;
			const userId = req.user.id;

			const dispute = await db.Dispute.findByPk(disputeId, {
				include: [
					{
						model: db.Order,
						as: "order",
					},
					{
						model: db.User,
						as: "user",
					},
					{
						model: db.Business,
						as: "business",
					},
				],
			});

			if (!dispute) {
				return res.status(404).json({
					success: false,
					message: "Dispute not found",
				});
			}

			// Check if user is authorized to view dispute
			const isBuyer = dispute.userId === userId;
			const isBusinessOwner = dispute.business.ownerId === userId;
			const isTeamMember = await db.BusinessTeamMember.findOne({
				where: {
					businessId: dispute.businessId,
					userId: userId,
					status: "active",
				},
			});

			if (!isBuyer && !isBusinessOwner && !isTeamMember) {
				return res.status(403).json({
					success: false,
					message: "You are not authorized to view this dispute",
				});
			}

			// Get dispute from blockchain
			const disputeIdBytes = ethers.utils.keccak256(
				ethers.utils.toUtf8Bytes(disputeId)
			);
			const blockchainDispute = await disputeContract.getDispute(
				disputeIdBytes
			);

			// Get evidence from blockchain
			const blockchainEvidence = await disputeContract.getEvidence(
				disputeIdBytes
			);

			// Combine database and blockchain data
			const disputeData = {
				...dispute.toJSON(),
				blockchainData: {
					...blockchainDispute,
					evidence: blockchainEvidence,
				},
			};

			res.json({
				success: true,
				data: disputeData,
			});
		} catch (error) {
			console.error("Error in get dispute:", error);
			res.status(500).json({
				success: false,
				message: "Failed to get dispute",
				error: error.message,
			});
		}
	}

	// List disputes for a business
	async listBusinessDisputes(req, res) {
		try {
			const { businessId } = req.params;
			const userId = req.user.id;
			const { status, page = 1, limit = 10 } = req.query;

			// Verify user is authorized to view business disputes
			const business = await db.Business.findByPk(businessId);
			if (!business) {
				return res.status(404).json({
					success: false,
					message: "Business not found",
				});
			}

			const isBusinessOwner = business.ownerId === userId;
			const isTeamMember = await db.BusinessTeamMember.findOne({
				where: {
					businessId,
					userId,
					status: "active",
				},
			});

			if (!isBusinessOwner && !isTeamMember) {
				return res.status(403).json({
					success: false,
					message: "You are not authorized to view business disputes",
				});
			}

			const where = { businessId };
			if (status) {
				where.status = status;
			}

			const offset = (page - 1) * limit;

			const disputes = await db.Dispute.findAndCountAll({
				where,
				include: [
					{
						model: db.Order,
						as: "order",
					},
					{
						model: db.User,
						as: "user",
					},
				],
				order: [["createdAt", "DESC"]],
				limit: parseInt(limit),
				offset: parseInt(offset),
			});

			// Get blockchain data for each dispute
			const signedDisputeContract = await getSignedContract(disputeContract);
			const disputesWithBlockchain = await Promise.all(
				disputes.rows.map(async (dispute) => {
					const disputeIdBytes = ethers.utils.keccak256(
						ethers.utils.toUtf8Bytes(dispute.id)
					);
					const blockchainDispute = await signedDisputeContract.getDispute(
						disputeIdBytes
					);
					const blockchainEvidence = await signedDisputeContract.getEvidence(
						disputeIdBytes
					);
					return {
						...dispute.toJSON(),
						blockchain: {
							...blockchainDispute,
							evidence: blockchainEvidence,
						},
					};
				})
			);

			res.json({
				success: true,
				data: {
					disputes: disputesWithBlockchain,
					pagination: {
						total: disputes.count,
						page: parseInt(page),
						limit: parseInt(limit),
						totalPages: Math.ceil(disputes.count / limit),
					},
				},
			});
		} catch (error) {
			console.error("Error in list business disputes:", error);
			res.status(500).json({
				success: false,
				message: "Failed to list business disputes",
				error: error.message,
			});
		}
	}

	// List disputes for a user
	async listUserDisputes(req, res) {
		try {
			const userId = req.user.id;
			const { status, page = 1, limit = 10 } = req.query;

			const where = { userId };
			if (status) {
				where.status = status;
			}

			const offset = (page - 1) * limit;

			const disputes = await db.Dispute.findAndCountAll({
				where,
				include: [
					{
						model: db.Order,
						as: "order",
					},
					{
						model: db.Business,
						as: "business",
					},
				],
				order: [["createdAt", "DESC"]],
				limit: parseInt(limit),
				offset: parseInt(offset),
			});

			// Get blockchain data for each dispute
			const signedDisputeContract = await getSignedContract(disputeContract);
			const disputesWithBlockchain = await Promise.all(
				disputes.rows.map(async (dispute) => {
					const disputeIdBytes = ethers.utils.keccak256(
						ethers.utils.toUtf8Bytes(dispute.id)
					);
					const blockchainDispute = await signedDisputeContract.getDispute(
						disputeIdBytes
					);
					const blockchainEvidence = await signedDisputeContract.getEvidence(
						disputeIdBytes
					);
					return {
						...dispute.toJSON(),
						blockchain: {
							...blockchainDispute,
							evidence: blockchainEvidence,
						},
					};
				})
			);

			res.json({
				success: true,
				data: {
					disputes: disputesWithBlockchain,
					pagination: {
						total: disputes.count,
						page: parseInt(page),
						limit: parseInt(limit),
						totalPages: Math.ceil(disputes.count / limit),
					},
				},
			});
		} catch (error) {
			console.error("Error in list user disputes:", error);
			res.status(500).json({
				success: false,
				message: "Failed to list user disputes",
				error: error.message,
			});
		}
	}

	// Get dispute by order ID
	async getDisputeByOrder(req, res) {
		try {
			const { orderId } = req.params;
			const userId = req.user.id;

			const dispute = await db.Dispute.findOne({
				where: { orderId },
				include: [
					{
						model: db.Order,
						as: "order",
					},
					{
						model: db.User,
						as: "user",
					},
					{
						model: db.Business,
						as: "business",
					},
				],
			});

			if (!dispute) {
				return res.status(404).json({
					success: false,
					message: "No dispute found for this order",
				});
			}

			// Check if user is authorized to view dispute
			const isBuyer = dispute.userId === userId;
			const isBusinessOwner = dispute.business.ownerId === userId;
			const isTeamMember = await db.BusinessTeamMember.findOne({
				where: {
					businessId: dispute.businessId,
					userId: userId,
					status: "active",
				},
			});

			if (!isBuyer && !isBusinessOwner && !isTeamMember) {
				return res.status(403).json({
					success: false,
					message: "You are not authorized to view this dispute",
				});
			}

			// Get dispute from blockchain
			const disputeIdBytes = ethers.utils.id(dispute.id);
			const blockchainDispute = await disputeContractInstance.getDispute(
				disputeIdBytes
			);

			// Combine database and blockchain data
			const disputeData = {
				...dispute.toJSON(),
				blockchainData: blockchainDispute,
			};

			res.json({
				success: true,
				data: disputeData,
			});
		} catch (error) {
			console.error("Error in get dispute by order:", error);
			res.status(500).json({
				success: false,
				message: "Failed to get dispute",
				error: error.message,
			});
		}
	}
}

// Helper function to convert evidence type to enum value
const getEvidenceTypeEnum = (type) => {
	const typeMap = {
		image: 0,
		video: 1,
		chat_history: 2,
		order_details: 3,
		product_details: 4,
		shipping_details: 5,
		payment_details: 6,
		other: 7,
	};
	return typeMap[type] || 7;
};

// Helper function to convert resolution type to enum value
const getResolutionTypeEnum = (type) => {
	const typeMap = {
		refund: 0,
		replacement: 1,
		partial_refund: 2,
		store_credit: 3,
		other: 4,
	};
	return typeMap[type] || 4;
};

module.exports = new DisputeController();
