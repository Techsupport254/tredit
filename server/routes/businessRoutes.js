const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { protect } = require("../middleware/authMiddleware");
const { manageTransaction } = require("../utils/transactionManager");
const {
	errorResponse,
	successResponse,
	ResponseCodes,
} = require("../utils/responseHelper");
const { BUSINESS_CONSTANTS } = require("../config/constants");
const productController = require("../controllers/productController");
const {
	validateBusinessData,
} = require("../middleware/businessValidationMiddleware");
const { checkBusinessOwnership } = require("../middleware/business");

// Import models
const { db, sequelize } = require("../models");
const { Business, BusinessTeamMember, User } = db;

// Import blockchain helpers
const {
	uploadToIPFS,
	createOrUpdateBusinessProfile,
	createBusinessOnChain,
} = require("../utils/blockchainHelper");

// Middleware to log validation errors
const logValidationAttempt = (req, res, next) => {
	console.log(
		`[${new Date().toISOString()}] Validation attempt for business data:`,
		{
			userId: req.user?.id,
			businessId: req.params?.id || "new business",
			endpoint: req.originalUrl,
			method: req.method,
		}
	);

	// Store original json method to intercept validation errors
	const originalJson = res.json;
	res.json = function (data) {
		if (data && data.success === false && data.errors) {
			console.log(`[${new Date().toISOString()}] Validation failed:`, {
				userId: req.user?.id,
				businessId: req.params?.id || "new business",
				errors: data.errors,
			});
		}
		return originalJson.call(this, data);
	};

	next();
};

// Middleware to validate business type
const validateBusinessType = async (req, res, next) => {
	try {
		// Only validate business type for POST requests
		if (req.method !== "POST") {
			return next();
		}

		const business = await Business.findOne({
			where: {
				id: req.params.businessId,
				type: "product",
			},
		});

		if (!business) {
			return res.status(400).json({
				success: false,
				message: "This business is not a product business",
			});
		}

		next();
	} catch (error) {
		console.error("Error validating business type:", error);
		res.status(500).json({
			success: false,
			message: "Error validating business type",
		});
	}
};

// Create a new business
router.post(
	"/",
	protect,
	logValidationAttempt,
	validateBusinessData,
	async (req, res) => {
		console.log("Request body:", JSON.stringify(req.body, null, 2));
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
				phone,
				status,
				verificationStatus,
				address,
				socialMedia,
				services,
				businessHours,
				paymentMethods,
				currency,
				productCategories,
				serviceCategories,
				skipIpfs = false,
			} = req.body;

			// Enhanced validation checks
			const validationErrors = [];

			// Check if phone is present and in correct format
			if (!phone) {
				validationErrors.push("Phone number is required");
			} else if (!phone.match(BUSINESS_CONSTANTS.VALIDATION.PHONE_REGEX)) {
				validationErrors.push("Invalid phone number format");
			}

			// Check if all required fields are present and not empty strings
			const requiredFields = {
				name,
				description,
				type,
				category,
				businessModel,
				operationMode,
				email,
				phone,
			};

			Object.entries(requiredFields).forEach(([field, value]) => {
				if (!value || (typeof value === "string" && value.trim() === "")) {
					validationErrors.push(`${field} is required and cannot be empty`);
				}
			});

			// Validate email format
			if (!email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
				validationErrors.push("Invalid email format");
			}

			// Validate address structure
			if (!address || typeof address !== "object") {
				validationErrors.push("Address must be a valid object");
			} else {
				BUSINESS_CONSTANTS.REQUIRED_ADDRESS_FIELDS.forEach((field) => {
					if (!address[field]) {
						validationErrors.push(`Address field ${field} is required`);
					}
				});
			}

			// If there are validation errors, return them
			if (validationErrors.length > 0) {
				await transaction.rollback();
				return res
					.status(400)
					.json(
						errorResponse(
							"Validation failed",
							ResponseCodes.BAD_REQUEST,
							validationErrors
						)
					);
			}

			// Create business data object with sanitized values
			const businessData = {
				name: name.trim(),
				description: description.trim(),
				type: type.toLowerCase(),
				category,
				businessModel,
				operationMode,
				email: email.toLowerCase(),
				phone,
				status: status || "active",
				verificationStatus: verificationStatus || "pending",
				address,
				socialMedia: socialMedia || {
					facebook: { isConnected: false, permissions: [], metadata: {} },
					instagram: { isConnected: false, permissions: [], metadata: {} },
					tiktok: { isConnected: false, permissions: [], metadata: {} },
					youtube: { isConnected: false, permissions: [], metadata: {} },
				},
				services,
				businessHours,
				paymentMethods,
				currency,
				userId: req.user.id,
				productCategories,
				serviceCategories,
			};

			console.log(
				"Creating business with data:",
				JSON.stringify(businessData, null, 2)
			);

			// Create business in database
			let business;
			try {
				business = await Business.create(businessData, { transaction });
			} catch (error) {
				console.error("Database error creating business:", error);
				await transaction.rollback();
				return res
					.status(500)
					.json(
						errorResponse(
							"Failed to create business in database",
							ResponseCodes.INTERNAL_SERVER_ERROR,
							error.errors || error.message
						)
					);
			}

			// Upload business data to IPFS if not skipped
			let ipfsResult = { success: true, ipfsUrl: null };
			if (!skipIpfs) {
				try {
					ipfsResult = await uploadToIPFS(businessData);
					if (!ipfsResult.success) {
						throw new Error(ipfsResult.error || "Failed to upload to IPFS");
					}
				} catch (error) {
					console.error("IPFS upload error:", error);
					await transaction.rollback();
					return res
						.status(500)
						.json(
							errorResponse(
								"Failed to upload to IPFS",
								ResponseCodes.INTERNAL_SERVER_ERROR,
								error.message
							)
						);
				}
			}

			// Create business on blockchain if IPFS was successful or skipped
			let blockchainResult = { success: true, txHash: null };
			if (ipfsResult.success) {
				try {
					blockchainResult = await createBusinessOnChain(
						ipfsResult.ipfsUrl,
						businessData
					);
					if (!blockchainResult.success) {
						throw new Error(
							blockchainResult.error ||
								"Failed to create business on blockchain"
						);
					}
				} catch (error) {
					console.error("Blockchain error:", error);
					await transaction.rollback();
					return res
						.status(500)
						.json(
							errorResponse(
								"Failed to create business on blockchain",
								ResponseCodes.INTERNAL_SERVER_ERROR,
								error.message
							)
						);
				}
			}

			// Update business with blockchain transaction hash and IPFS URL
			try {
				await business.update(
					{
						blockchainTxHash: blockchainResult.txHash,
						ipfsUrl: ipfsResult.ipfsUrl,
					},
					{ transaction }
				);
			} catch (error) {
				console.error("Error updating business with blockchain data:", error);
				await transaction.rollback();
				return res
					.status(500)
					.json(
						errorResponse(
							"Failed to update business with blockchain data",
							ResponseCodes.INTERNAL_SERVER_ERROR,
							error.message
						)
					);
			}

			await transaction.commit();
			console.log("Business created successfully:", business.id);

			return res.status(201).json(
				successResponse({
					message: "Business created successfully",
					business: business.toJSON(),
					blockchain: {
						txHash: blockchainResult.txHash,
						explorerUrl: blockchainResult.explorerUrl,
					},
				})
			);
		} catch (error) {
			console.error("Unexpected error creating business:", error);
			await transaction.rollback();
			return res
				.status(500)
				.json(
					errorResponse(
						"An unexpected error occurred while creating the business",
						ResponseCodes.INTERNAL_SERVER_ERROR,
						error.message
					)
				);
		}
	}
);

// Get all businesses for the authenticated user
router.get("/", protect, async (req, res) => {
	try {
		console.log("GET /businesses - User ID:", req.user.id);
		console.log(
			"GET /businesses - User:",
			JSON.stringify({
				id: req.user.id,
				email: req.user.email,
			})
		);

		// Get businesses where the user is the owner
		const ownedBusinesses = await Business.findAll({
			where: { userId: req.user.id },
			include: [
				{
					model: BusinessTeamMember,
					as: "teamMembers",
					required: false,
					include: [
						{
							model: User,
							as: "user",
							attributes: ["id", "name", "email", "profileImage"],
						},
					],
				},
				{
					model: User,
					as: "owner",
					attributes: ["id", "name", "email", "profileImage"],
				},
			],
		});

		console.log(
			`GET /businesses - Found ${ownedBusinesses.length} owned businesses`
		);

		// Get businesses where the user is a team member
		const teamMemberships = await BusinessTeamMember.findAll({
			where: {
				userId: req.user.id,
				status: "active",
			},
			attributes: ["businessId"],
		});

		const teamBusinessIds = teamMemberships.map((member) => member.businessId);
		console.log(
			`GET /businesses - Found ${teamBusinessIds.length} team memberships`
		);

		// If user is a team member of any businesses, fetch those too
		let teamBusinesses = [];
		if (teamBusinessIds.length > 0) {
			teamBusinesses = await Business.findAll({
				where: {
					id: { [Op.in]: teamBusinessIds },
					userId: { [Op.ne]: req.user.id }, // Exclude businesses user already owns
				},
				include: [
					{
						model: BusinessTeamMember,
						as: "teamMembers",
						required: false,
						include: [
							{
								model: User,
								as: "user",
								attributes: ["id", "name", "email", "profileImage"],
							},
						],
					},
					{
						model: User,
						as: "owner",
						attributes: ["id", "name", "email", "profileImage"],
					},
				],
			});
		}

		console.log(
			`GET /businesses - Found ${teamBusinesses.length} team businesses`
		);

		// Combine owned and team businesses
		const allBusinesses = [...ownedBusinesses, ...teamBusinesses];

		return res.json(
			successResponse("Businesses retrieved successfully", allBusinesses)
		);
	} catch (error) {
		console.error("Error fetching businesses:", error);
		return res
			.status(500)
			.json(
				errorResponse(
					"Failed to fetch businesses",
					ResponseCodes.INTERNAL_SERVER_ERROR,
					error.message
				)
			);
	}
});

// Get business by ID
router.get("/:id", protect, async (req, res) => {
	try {
		const business = await Business.findOne({
			where: {
				id: req.params.id,
				[Op.or]: [
					{ userId: req.user.id },
					{
						"$teamMembers.userId$": req.user.id,
					},
				],
			},
			include: [
				{
					model: BusinessTeamMember,
					as: "teamMembers",
					required: false,
					include: [
						{
							model: User,
							as: "user",
							attributes: ["id", "name", "email", "profileImage"],
						},
					],
				},
				{
					model: User,
					as: "owner",
					attributes: ["id", "name", "email", "profileImage"],
				},
			],
		});

		if (!business) {
			return res
				.status(404)
				.json(errorResponse("Business not found", ResponseCodes.NOT_FOUND));
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
					"Failed to fetch business",
					ResponseCodes.INTERNAL_SERVER_ERROR,
					error.message
				)
			);
	}
});

// Update a business
router.patch(
	"/:id",
	protect,
	logValidationAttempt,
	validateBusinessData,
	async (req, res) => {
		const transaction = await sequelize.transaction();

		try {
			const { id } = req.params;
			const { skipIpfs = false } = req.body;

			const business = await Business.findByPk(id);
			if (!business) {
				await transaction.rollback();
				return res
					.status(404)
					.json(errorResponse("Business not found", ResponseCodes.NOT_FOUND));
			}

			// Check if the user has permission to update this business
			const isOwner = business.userId === req.user.id;
			const isTeamMember = await BusinessTeamMember.findOne({
				where: {
					businessId: business.id,
					userId: req.user.id,
					status: "active",
				},
			});

			// Check if team member has admin or manager role with update permissions
			let hasUpdatePermission = false;
			if (isTeamMember) {
				hasUpdatePermission =
					isTeamMember.role === "owner" ||
					isTeamMember.role === "admin" ||
					(isTeamMember.permissions &&
						(isTeamMember.permissions.all === true ||
							isTeamMember.permissions.manage_settings === true));
			}

			if (!isOwner && !hasUpdatePermission) {
				await transaction.rollback();
				return res
					.status(403)
					.json(
						errorResponse(
							"Not authorized to update this business",
							ResponseCodes.FORBIDDEN
						)
					);
			}

			const updateData = {
				...req.body,
				updatedAt: new Date(),
			};

			// Upload to IPFS if not skipped
			let ipfsResult = { success: true, ipfsUrl: null };
			if (!skipIpfs) {
				ipfsResult = await uploadToIPFS({
					...business.toJSON(),
					...updateData,
				});

				if (!ipfsResult.success || !ipfsResult.ipfsUrl) {
					throw new Error("Failed to upload to IPFS");
				}
			}

			// Store on blockchain if IPFS was successful or skipped
			let blockchainResult = { success: true, txHash: null };
			if (ipfsResult.success) {
				blockchainResult = await createBusinessOnChain(
					ipfsResult.ipfsUrl,
					updateData
				);

				if (!blockchainResult.success) {
					throw new Error(
						`Failed to update business on blockchain: ${blockchainResult.error}`
					);
				}
			}

			// Update in database
			await business.update(
				{
					...updateData,
					ipfsCid: ipfsResult.ipfsCid,
					ipfsUrl: ipfsResult.ipfsUrl,
					lastBlockchainUpdate: new Date(),
					metadata: {
						...business.metadata,
						...updateData.metadata,
						blockchainTxHash: blockchainResult.txHash,
					},
				},
				{ transaction }
			);

			await transaction.commit();

			return res.json(
				successResponse("Business updated successfully", {
					business,
					ipfs: { cid: ipfsResult.ipfsCid, url: ipfsResult.ipfsUrl },
					blockchain: { txHash: blockchainResult.txHash },
				})
			);
		} catch (error) {
			await transaction.rollback();
			console.error("Error updating business:", error);
			return res
				.status(500)
				.json(
					errorResponse(
						"Failed to update business: " + error.message,
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}
	}
);

// Delete a business
router.delete("/:id", protect, async (req, res) => {
	const transaction = await sequelize.transaction();

	try {
		const { id } = req.params;
		const { user } = req;

		// Get the business to get its details
		const business = await Business.findByPk(id);
		if (!business) {
			await transaction.rollback();
			return res
				.status(404)
				.json(errorResponse("Business not found", ResponseCodes.NOT_FOUND));
		}

		// Check if user is the owner or has admin rights
		const isOwner = business.userId === user.id;
		const teamMember = await BusinessTeamMember.findOne({
			where: {
				businessId: id,
				userId: user.id,
				status: "active",
			},
		});

		// Only owners can delete businesses
		if (!isOwner && (!teamMember || teamMember.role !== "owner")) {
			await transaction.rollback();
			return res
				.status(403)
				.json(
					errorResponse(
						"Only the business owner can delete the business",
						ResponseCodes.FORBIDDEN
					)
				);
		}

		// Hard delete the business and all related team members
		await BusinessTeamMember.destroy({
			where: { businessId: id },
			transaction,
		});

		await Business.destroy({
			where: { id },
			transaction,
		});

		// Update user's metadata to remove the deleted business
		const userMetadata = user.metadata || {};
		const businesses = userMetadata.businesses || [];
		const updatedBusinesses = businesses.filter((b) => b.id !== id);

		await user.update(
			{
				metadata: {
					...userMetadata,
					businesses: updatedBusinesses,
				},
			},
			{ transaction }
		);

		await transaction.commit();

		return res.json(successResponse("Business deleted successfully", null));
	} catch (error) {
		await transaction.rollback();
		console.error("Error deleting business:", error);
		return res
			.status(500)
			.json(
				errorResponse(
					"Failed to delete business: " + error.message,
					ResponseCodes.INTERNAL_SERVER_ERROR
				)
			);
	}
});

// Product routes
router.post(
	"/:businessId/products",
	protect,
	checkBusinessOwnership,
	validateBusinessType,
	productController.create
);
router.get(
	"/:businessId/products",
	protect,
	productController.getAllByBusiness
);
router.get(
	"/:businessId/products/:productId",
	protect,
	productController.getOne
);
router.put(
	"/:businessId/products/:productId",
	protect,
	checkBusinessOwnership,
	productController.update
);
router.delete(
	"/:businessId/products/:productId",
	protect,
	checkBusinessOwnership,
	productController.delete
);

module.exports = router;
