const Business = require("../models/Business");
const { validateBusinessData } = require("../utils/validation");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const {
	uploadToIPFS,
	saveProfileToBlockchain,
} = require("../utils/blockchainHelper");

// Create a new business
exports.createBusiness = catchAsync(async (req, res) => {
	validateBusinessData(req.body);

	// Upload business data to IPFS first
	const businessData = {
		...req.body,
		walletAddress: req.body.walletAddress || req.user?.walletAddress,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	try {
		// Upload to IPFS
		const { ipfsCid, ipfsUrl } = await uploadToIPFS(businessData);

		// Create business with IPFS data
		const business = await Business.create({
			...businessData,
			ipfsCid,
			ipfsUrl,
		});

		res.status(201).json({
			status: "success",
			data: business,
			ipfs: {
				cid: ipfsCid,
				url: ipfsUrl,
			},
		});
	} catch (error) {
		throw new AppError(`Failed to create business: ${error.message}`, 500);
	}
});

// Get all businesses
exports.getBusinesses = catchAsync(async (req, res) => {
	const businesses = await Business.findAll({
		where: { status: "active" },
	});

	res.status(200).json({
		status: "success",
		data: businesses,
	});
});

// Get businesses owned by the user
exports.getMyBusinesses = catchAsync(async (req, res) => {
	const businesses = await Business.findAll({
		where: {
			walletAddress: req.user?.walletAddress,
			status: "active",
		},
	});

	res.status(200).json({
		status: "success",
		data: businesses,
	});
});

// Get a business by ID
exports.getBusinessById = catchAsync(async (req, res) => {
	const business = await Business.findOne({
		where: {
			id: req.params.businessId,
			status: "active",
		},
	});

	if (!business) {
		throw new AppError("Business not found", 404);
	}

	res.status(200).json({
		status: "success",
		data: business,
	});
});

// Update a business
exports.updateBusiness = catchAsync(async (req, res) => {
	const business = await Business.findOne({
		where: {
			id: req.params.businessId,
			status: "active",
		},
	});

	if (!business) {
		throw new AppError("Business not found", 404);
	}

	const requestWalletAddress =
		req.body.walletAddress || req.user?.walletAddress;
	if (
		!requestWalletAddress ||
		business.walletAddress !== requestWalletAddress
	) {
		throw new AppError("You are not authorized to update this business", 403);
	}

	try {
		// Update IPFS data first
		const updatedData = {
			...business.toJSON(),
			...req.body,
			updatedAt: new Date().toISOString(),
		};

		// Upload updated data to IPFS
		const { ipfsCid, ipfsUrl } = await uploadToIPFS(updatedData);

		// Update business with new IPFS data
		await business.update({
			...req.body,
			ipfsCid,
			ipfsUrl,
		});

		res.status(200).json({
			status: "success",
			data: business,
			ipfs: {
				cid: ipfsCid,
				url: ipfsUrl,
			},
		});
	} catch (error) {
		throw new AppError(`Failed to update business: ${error.message}`, 500);
	}
});

// Delete a business
exports.deleteBusiness = catchAsync(async (req, res) => {
	const business = await Business.findOne({
		where: {
			id: req.params.businessId,
			status: "active",
		},
	});

	if (!business) {
		throw new AppError("Business not found", 404);
	}

	if (business.walletAddress !== req.user?.walletAddress) {
		throw new AppError("You are not authorized to delete this business", 403);
	}

	// Soft delete by updating status
	await business.update({ status: "closed" });

	res.status(204).json({
		status: "success",
		data: null,
	});
});

// Team Management
exports.addTeamMember = catchAsync(async (req, res) => {
	const business = await Business.findOne({
		where: {
			id: req.params.businessId,
			status: "active",
		},
	});

	if (!business) {
		throw new AppError("Business not found", 404);
	}

	if (business.walletAddress !== req.user?.walletAddress) {
		throw new AppError("Only the business owner can add team members", 403);
	}

	// Add team member logic here
	res.status(201).json({
		status: "success",
		data: {
			id: 1,
			...req.body,
		},
	});
});

exports.getTeamMembers = catchAsync(async (req, res) => {
	const business = await Business.findOne({
		where: {
			id: req.params.businessId,
			status: "active",
		},
	});

	if (!business) {
		throw new AppError("Business not found", 404);
	}

	// Get team members logic here
	res.status(200).json({
		status: "success",
		data: [],
	});
});

exports.updateTeamMember = catchAsync(async (req, res) => {
	const business = await Business.findOne({
		where: {
			id: req.params.businessId,
			status: "active",
		},
	});

	if (!business) {
		throw new AppError("Business not found", 404);
	}

	if (business.walletAddress !== req.user?.walletAddress) {
		throw new AppError("Only the business owner can update team members", 403);
	}

	// Update team member logic here
	res.status(200).json({
		status: "success",
		data: {
			id: req.params.memberId,
			...req.body,
		},
	});
});

exports.removeTeamMember = catchAsync(async (req, res) => {
	const business = await Business.findOne({
		where: {
			id: req.params.businessId,
			status: "active",
		},
	});

	if (!business) {
		throw new AppError("Business not found", 404);
	}

	if (business.walletAddress !== req.user?.walletAddress) {
		throw new AppError("Only the business owner can remove team members", 403);
	}

	// Remove team member logic here
	res.status(204).json({
		status: "success",
		data: null,
	});
});

// Business Verification
exports.requestVerification = catchAsync(async (req, res) => {
	const business = await Business.findOne({
		where: {
			id: req.params.businessId,
			status: "active",
		},
	});

	if (!business) {
		throw new AppError("Business not found", 404);
	}

	if (business.walletAddress !== req.user?.walletAddress) {
		throw new AppError("Only the business owner can request verification", 403);
	}

	await business.update({ verificationStatus: "pending" });

	res.status(200).json({
		status: "success",
		message: "Verification request submitted successfully",
	});
});

exports.getVerificationStatus = catchAsync(async (req, res) => {
	const business = await Business.findOne({
		where: {
			id: req.params.businessId,
			status: "active",
		},
	});

	if (!business) {
		throw new AppError("Business not found", 404);
	}

	res.status(200).json({
		status: "success",
		data: {
			status: business.verificationStatus,
		},
	});
});

// Categories
exports.getProductCategories = catchAsync(async (req, res) => {
	res.status(200).json({
		status: "success",
		data: [
			"Fashion & Apparel",
			"Electronics",
			"Home & Garden",
			"Beauty & Personal Care",
			"Sports & Outdoors",
			"Books & Media",
			"Food & Beverages",
			"Health & Wellness",
			"Art & Collectibles",
			"Other",
		],
	});
});

exports.getServiceCategories = catchAsync(async (req, res) => {
	res.status(200).json({
		status: "success",
		data: [
			"Consulting",
			"Marketing",
			"Design",
			"Development",
			"Training",
			"Healthcare",
			"Legal",
			"Financial",
			"Education",
			"Other",
		],
	});
});
