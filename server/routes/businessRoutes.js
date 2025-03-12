const express = require("express");
const router = express.Router();
const { Business, BusinessTeamMember, User } = require("../models");
const { uploadToIPFS } = require("../utils/blockchainHelper");
const { createOrUpdateBusinessProfile } = require("../utils/blockchainHelper");
const { protect } = require("../middleware/authMiddleware");
const { Op } = require("sequelize");
const { manageTransaction } = require("../utils/transactionManager");
const {
	errorResponse,
	successResponse,
	ResponseCodes,
} = require("../utils/responseHelper");
const { createBusinessOnChain } = require("../utils/blockchainHelper");
const { sequelize } = require("../models");

// Create a new business
router.post("/", protect, async (req, res) => {
	const transaction = await sequelize.transaction();

	try {
		const {
			name,
			description,
			type,
			category,
			businessModel,
			operationMode,
			email,
			contactPhone,
			walletAddress,
			status,
			verificationStatus,
			location,
			socialMedia,
			services,
			operatingHours,
			paymentMethods,
			currency,
		} = req.body;

		// Validate required fields
		if (
			!name ||
			!description ||
			!type ||
			!category ||
			!businessModel ||
			!operationMode ||
			!email ||
			!walletAddress
		) {
			await transaction.rollback();
			return res
				.status(400)
				.json(
					errorResponse(
						"All required fields must be provided",
						ResponseCodes.BAD_REQUEST
					)
				);
		}

		// Validate wallet address format
		if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
			await transaction.rollback();
			return res
				.status(400)
				.json(
					errorResponse(
						"Invalid wallet address format",
						ResponseCodes.BAD_REQUEST
					)
				);
		}

		// Create business data object
		const businessData = {
			name,
			description,
			type: type.toLowerCase(),
			category,
			businessModel,
			operationMode,
			email,
			contactPhone,
			walletAddress,
			status: status || "active",
			verificationStatus: verificationStatus || "pending",
			location,
			socialMedia,
			services,
			operatingHours,
			paymentMethods,
			currency,
			userId: req.user.id,
		};

		// Create business in database
		const business = await Business.create(businessData, { transaction });

		// Upload business data to IPFS
		const ipfsResult = await uploadToIPFS(businessData);

		if (!ipfsResult.success) {
			await transaction.rollback();
			return res
				.status(500)
				.json(
					errorResponse(
						"Failed to upload to IPFS",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}

		// Update business with IPFS data
		await business.update(
			{
				ipfsCid: ipfsResult.ipfsCid,
				ipfsUrl: ipfsResult.ipfsUrl,
			},
			{ transaction }
		);

		// Create business on blockchain
		const blockchainResult = await createBusinessOnChain(
			walletAddress,
			ipfsResult.ipfsUrl,
			businessData
		);

		if (!blockchainResult.success) {
			await transaction.rollback();
			return res
				.status(500)
				.json(
					errorResponse(
						"Failed to create business on blockchain: " +
							blockchainResult.error,
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}

		// Update business with blockchain data
		await business.update(
			{
				blockchainTxHash: blockchainResult.hash,
				lastBlockchainUpdate: new Date(),
			},
			{ transaction }
		);

		await transaction.commit();

		return res.status(201).json(
			successResponse({
				message: "Business created successfully",
				business: business.toJSON(),
				blockchain: {
					txHash: blockchainResult.hash,
					explorerUrl: blockchainResult.explorerUrl,
				},
			})
		);
	} catch (error) {
		await transaction.rollback();
		console.error("Error creating business:", error);
		return res
			.status(500)
			.json(
				errorResponse(
					error.message || "Failed to create business",
					ResponseCodes.INTERNAL_SERVER_ERROR
				)
			);
	}
});

// Get all businesses for the authenticated user
router.get("/", protect, async (req, res) => {
	try {
		const businesses = await Business.findAll({
			where: { userId: req.user.id },
			include: [
				{
					model: BusinessTeamMember,
					as: "teamMembers",
					include: [
						{
							model: User,
							as: "user",
							attributes: [
								"id",
								"name",
								"email",
								"profileImage",
								"walletAddress",
							],
						},
					],
				},
				{
					model: User,
					as: "owner",
					attributes: ["id", "name", "email", "profileImage", "walletAddress"],
				},
			],
		});
		return res.json({
			success: true,
			data: "Businesses retrieved successfully",
			message: businesses,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error fetching businesses:", error);
		return res.status(500).json({
			success: false,
			data: "Error fetching businesses",
			message: error.message,
			timestamp: new Date().toISOString(),
		});
	}
});

// Get businesses by wallet address
router.get("/wallet/:walletAddress", protect, async (req, res) => {
	try {
		const user = await User.findOne({
			where: { walletAddress: req.params.walletAddress },
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				data: "User not found",
				message: null,
				timestamp: new Date().toISOString(),
			});
		}

		const businesses = await Business.findAll({
			where: { userId: user.id },
			include: [
				{
					model: BusinessTeamMember,
					as: "teamMembers",
					include: [
						{
							model: User,
							as: "user",
							attributes: [
								"id",
								"name",
								"email",
								"profileImage",
								"walletAddress",
							],
						},
					],
				},
				{
					model: User,
					as: "owner",
					attributes: ["id", "name", "email", "profileImage", "walletAddress"],
				},
			],
		});
		return res.json({
			success: true,
			data: "Businesses retrieved successfully",
			message: businesses,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error fetching businesses:", error);
		return res.status(500).json({
			success: false,
			data: "Error fetching businesses",
			message: error.message,
			timestamp: new Date().toISOString(),
		});
	}
});

// Get a specific business
router.get("/:id", protect, async (req, res) => {
	try {
		const business = await Business.findByPk(req.params.id, {
			include: [
				{
					model: BusinessTeamMember,
					as: "teamMembers",
					include: [
						{
							model: User,
							as: "user",
							attributes: [
								"id",
								"name",
								"email",
								"profileImage",
								"walletAddress",
							],
						},
					],
				},
				{
					model: User,
					as: "owner",
					attributes: ["id", "name", "email", "profileImage", "walletAddress"],
				},
			],
		});

		if (!business) {
			return res
				.status(404)
				.json(errorResponse("Business not found", ResponseCodes.NOT_FOUND));
		}

		// Check if user has access to this business
		const isTeamMember = await BusinessTeamMember.findOne({
			where: {
				businessId: business.id,
				userId: req.user.id,
				status: "active",
			},
		});

		if (business.userId !== req.user.id && !isTeamMember) {
			return res
				.status(403)
				.json(
					errorResponse(
						"Not authorized to access this business",
						ResponseCodes.FORBIDDEN
					)
				);
		}

		return res.json(
			successResponse("Business retrieved successfully", business)
		);
	} catch (error) {
		console.error("Error fetching business:", error);
		return res
			.status(500)
			.json(
				errorResponse(
					"Error fetching business",
					ResponseCodes.INTERNAL_SERVER_ERROR
				)
			);
	}
});

// Update a business
router.patch("/:id", protect, async (req, res) => {
	const transaction = await req.db.sequelize.transaction();

	try {
		const { id } = req.params;
		const { walletAddress, user } = req;

		// Check if user has permission to update
		const teamMember = await BusinessTeamMember.findOne({
			where: {
				businessId: id,
				userId: user.id,
				status: "active",
			},
		});

		if (
			!teamMember ||
			(!teamMember.isOwner() && !teamMember.canManageSettings())
		) {
			return res.status(403).json({
				success: false,
				message: "Access denied",
			});
		}

		const business = await Business.findByPk(id);
		if (!business) {
			return res.status(404).json({
				success: false,
				message: "Business not found",
			});
		}

		const updateData = {
			...req.body,
			updatedAt: new Date(),
		};

		// Upload to IPFS
		const { cid: ipfsCid, url: ipfsUrl } = await uploadToIPFS({
			...business.toJSON(),
			...updateData,
		});

		// Store on blockchain
		const blockchainResult = await createOrUpdateBusinessProfile(
			walletAddress,
			ipfsUrl,
			updateData
		);

		if (!blockchainResult?.success) {
			throw new Error("Failed to update business on blockchain");
		}

		// Update in database
		await business.update(
			{
				...updateData,
				ipfsCid,
				ipfsUrl,
				lastBlockchainUpdate: new Date(),
				metadata: {
					...business.metadata,
					...updateData.metadata,
					blockchainTxHash: blockchainResult.hash,
				},
			},
			{ transaction }
		);

		await transaction.commit();

		res.json({
			success: true,
			message: "Business updated successfully",
			data: {
				business,
				ipfs: { cid: ipfsCid, url: ipfsUrl },
				blockchain: { txHash: blockchainResult.hash },
			},
		});
	} catch (error) {
		await transaction.rollback();
		console.error("Error updating business:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update business",
			error: error.message,
		});
	}
});

// Delete a business
router.delete("/:id", protect, async (req, res) => {
	const transaction = await req.db.sequelize.transaction();

	try {
		const { id } = req.params;
		const { user } = req;

		// Check if user is the owner
		const teamMember = await BusinessTeamMember.findOne({
			where: {
				businessId: id,
				userId: user.id,
				role: "owner",
				status: "active",
			},
		});

		if (!teamMember) {
			return res.status(403).json({
				success: false,
				message: "Only the business owner can delete the business",
			});
		}

		// Soft delete the business and all related team members
		await Business.update({ status: "closed" }, { where: { id }, transaction });

		await BusinessTeamMember.update(
			{ status: "inactive" },
			{ where: { businessId: id }, transaction }
		);

		await transaction.commit();

		res.json({
			success: true,
			message: "Business deleted successfully",
		});
	} catch (error) {
		await transaction.rollback();
		console.error("Error deleting business:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete business",
			error: error.message,
		});
	}
});

module.exports = router;
