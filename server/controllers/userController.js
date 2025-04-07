const { db, sequelize } = require("../models");
const { Op } = require("sequelize");
const { generateToken } = require("../utils/jwt");
const {
	uploadToIPFS,
	createOrUpdateUserProfile,
	unpinFromPinata,
} = require("../utils/blockchainHelper");
const { USER_CONSTANTS } = require("../config/constants");

// Create user profile
const createUser = async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		const {
			walletAddress,
			name,
			email,
			profileImage,
			bio,
			gender,
			dob,
			location,
			phoneNumber,
			preferences,
			uid,
			role,
		} = req.body;

		// Validate required fields
		if (!walletAddress) {
			await transaction.rollback();
			return res.status(400).json({
				success: false,
				message: "Wallet address is required",
			});
		}

		// Validate wallet address format
		if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
			await transaction.rollback();
			return res.status(400).json({
				success: false,
				message: "Invalid wallet address format",
			});
		}

		// Check if user exists by wallet address
		const existingWallet = await db.User.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
			transaction,
		});

		if (existingWallet) {
			await transaction.rollback();
			return res.status(409).json({
				success: false,
				message: "User with this wallet address already exists",
				user: existingWallet,
			});
		}

		// Validate and check email if provided
		if (email) {
			if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
				await transaction.rollback();
				return res.status(400).json({
					success: false,
					message: "Invalid email format",
				});
			}

			// Check if email is already in use
			const existingEmail = await db.User.findOne({
				where: { email: email.toLowerCase() },
				transaction,
			});

			if (existingEmail) {
				await transaction.rollback();
				return res.status(409).json({
					success: false,
					message: "Email already in use",
				});
			}
		}

		// Validate phone number if provided
		if (phoneNumber) {
			const phoneRegex = /^\+?[1-9]\d{1,14}$/;
			if (!phoneRegex.test(phoneNumber)) {
				await transaction.rollback();
				return res.status(400).json({
					success: false,
					message: "Invalid phone number format",
				});
			}

			// Check if phone number is already in use
			const existingPhone = await db.User.findOne({
				where: { phoneNumber },
				transaction,
			});

			if (existingPhone) {
				await transaction.rollback();
				return res.status(409).json({
					success: false,
					message: "Phone number already in use",
				});
			}
		}

		// Check if UID exists and is already associated with another user
		if (uid) {
			const existingUid = await db.User.findOne({
				where: { uid },
				transaction,
			});

			if (existingUid) {
				await transaction.rollback();
				return res.status(409).json({
					success: false,
					message: "UID already associated with another account",
				});
			}
		}

		// Create user in database
		const user = await db.User.create(
			{
				walletAddress: walletAddress.toLowerCase(),
				name: name || "Anonymous User",
				email: email?.toLowerCase() || null,
				profileImage: profileImage || "",
				bio: bio || "",
				gender: gender || "prefer_not_to_say",
				dob: dob || new Date(),
				location: location || {
					country: "",
					state: "",
					city: "",
					address: "",
					postalCode: "",
					coordinates: {
						latitude: null,
						longitude: null,
					},
				},
				phoneNumber: phoneNumber || "",
				preferences: preferences || {
					theme: "light",
					notifications: {
						email: true,
						push: true,
					},
					language: "en",
				},
				uid: uid || null,
				role: role || USER_CONSTANTS.ROLES.USER,
				isVerified: false,
			},
			{ transaction }
		);

		await transaction.commit();

		// Generate auth token
		const token = generateToken(user);

		res.status(201).json({
			success: true,
			message: "User created successfully",
			user,
			token,
		});
	} catch (error) {
		await transaction.rollback();
		console.error("Error creating user:", error);
		res.status(500).json({
			success: false,
			message: "Error creating user",
			error: error.message,
		});
	}
};

// Get user profile
const getUserProfile = async (req, res) => {
	try {
		const { walletAddress } = req.params;

		const user = await db.User.findOne({
			where: sequelize.where(
				sequelize.fn("LOWER", sequelize.col("walletAddress")),
				sequelize.fn("LOWER", walletAddress)
			),
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.json({
			success: true,
			user: user.toJSON(),
		});
	} catch (error) {
		console.error("Error fetching user:", error);
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

// Update user profile
const updateUserProfile = async (req, res) => {
	const t = await sequelize.transaction();
	let ipfsResult = null;
	let blockchainResult = null;

	try {
		const { walletAddress } = req.params;
		const updateData = req.body;

		// Find the user with case-insensitive comparison
		const user = await db.User.findOne({
			where: sequelize.where(
				sequelize.fn("LOWER", sequelize.col("walletAddress")),
				sequelize.fn("LOWER", walletAddress)
			),
		});

		if (!user) {
			await t.rollback();
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Prepare data for IPFS
		const ipfsData = {
			walletAddress: user.walletAddress,
			...updateData,
			updatedAt: new Date().toISOString(),
		};

		// Upload to IPFS
		console.log("Starting IPFS upload with data:", ipfsData);
		ipfsResult = await uploadToIPFS(ipfsData);

		if (!ipfsResult?.success || !ipfsResult?.ipfsUrl) {
			throw new Error("IPFS upload failed - no URL returned");
		}

		// Update blockchain
		console.log("Updating blockchain with IPFS URL:", ipfsResult.ipfsUrl);
		blockchainResult = await createOrUpdateUserProfile(
			user.walletAddress,
			ipfsResult.ipfsUrl
		);

		if (!blockchainResult?.success) {
			// If blockchain update fails, unpin from IPFS and rollback
			if (ipfsResult?.ipfsCid) {
				await unpinFromPinata(ipfsResult.ipfsCid);
			}
			throw new Error(
				`Blockchain transaction failed: ${
					blockchainResult?.error || "Unknown error"
				}`
			);
		}

		// Update user in database
		const updatedUser = await user.update(
			{
				...updateData,
				ipfsUrl: ipfsResult.ipfsUrl,
				blockchainTxHash: blockchainResult.hash,
				hasProfile: true, // Mark as having a profile after successful blockchain update
			},
			{ transaction: t }
		);

		// Commit transaction
		await t.commit();

		// Generate new token with updated user data
		const token = generateToken(updatedUser.toJSON());

		return res.json({
			success: true,
			message: "Profile updated successfully",
			data: {
				user: updatedUser,
				token,
				blockchain: {
					hash: blockchainResult.hash,
					ipfsUrl: ipfsResult.ipfsUrl,
					event: blockchainResult.event,
					explorerUrl: `${process.env.BLOCKCHAIN_EXPLORER_URL}/tx/${blockchainResult.hash}`,
				},
			},
		});
	} catch (error) {
		console.error("Profile update error:", error);

		// Rollback transaction
		await t.rollback();

		// If we have an IPFS result but blockchain failed, clean up IPFS
		if (ipfsResult?.ipfsCid && !blockchainResult?.success) {
			try {
				await unpinFromPinata(ipfsResult.ipfsCid);
			} catch (unpinError) {
				console.error("Failed to unpin from IPFS:", unpinError);
			}
		}

		// Handle specific error cases
		let errorMessage = error.message;
		let statusCode = 500;

		if (error.message.includes("insufficient funds")) {
			errorMessage =
				"Insufficient funds for gas fees. Please ensure you have enough AMOY tokens.";
			statusCode = 402;
		} else if (error.message.includes("InvalidIpfsUri")) {
			errorMessage = "Invalid IPFS URI provided";
			statusCode = 400;
		}

		return res.status(statusCode).json({
			success: false,
			message: "Failed to update profile",
			error: errorMessage,
			details: blockchainResult?.details || {},
		});
	}
};

const walletAuth = async (req, res) => {
	let transaction;
	try {
		const { walletAddress, chainId } = req.body;

		// Validate required fields
		if (!walletAddress) {
			return res.status(400).json({
				success: false,
				error: "Wallet address is required",
				code: "VALIDATION_ERROR",
			});
		}

		// Validate wallet address format
		if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
			return res.status(400).json({
				success: false,
				error: "Invalid wallet address format",
				code: "VALIDATION_ERROR",
			});
		}

		console.log("Attempting to find user with wallet address:", walletAddress);

		// Find user by wallet address with case-insensitive comparison
		const user = await db.User.findOne({
			where: sequelize.where(
				sequelize.fn("LOWER", sequelize.col("walletAddress")),
				sequelize.fn("LOWER", walletAddress)
			),
		});

		console.log("User search result:", user ? "Found" : "Not found");

		if (!user) {
			return res.status(404).json({
				success: false,
				error: "User not found",
				code: "NOT_FOUND",
				exists: false,
			});
		}

		// Generate JWT token
		const token = generateToken(user);

		// Create standardized response
		return res.json({
			success: true,
			message: "Authentication successful",
			data: {
				token,
				user: {
					id: user.id,
					walletAddress: user.walletAddress,
					name: user.name,
					email: user.email,
					profileImage: user.profileImage,
					role: user.role,
					isVerified: user.isVerified,
					hasProfile: user.hasProfile,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				},
			},
			exists: true,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Wallet auth error:", error);
		console.error("Error stack:", error.stack);

		// Determine appropriate status code
		let statusCode = 500;
		let errorCode = "INTERNAL_ERROR";

		if (error.name === "SequelizeConnectionError") {
			errorCode = "DATABASE_ERROR";
		} else if (error.name === "SequelizeValidationError") {
			statusCode = 400;
			errorCode = "VALIDATION_ERROR";
		}

		return res.status(statusCode).json({
			success: false,
			error: error.message || "Failed to authenticate wallet",
			code: errorCode,
			details: process.env.NODE_ENV === "development" ? error.stack : undefined,
			timestamp: new Date().toISOString(),
		});
	}
};

// Get all users
const getAllUsers = async (req, res) => {
	try {
		const users = await db.User.findAll({
			attributes: [
				"id",
				"name",
				"email",
				"walletAddress",
				"phoneNumber",
				"role",
				"status",
				"createdAt",
				"updatedAt",
			],
			order: [["createdAt", "DESC"]],
		});

		res.json({
			success: true,
			count: users.length,
			users,
		});
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({
			success: false,
			message: "Error fetching users",
			error: error.message,
		});
	}
};

// Update user role
const updateUserRole = async (req, res) => {
	try {
		const { userId } = req.params;
		const { role } = req.body;

		// Validate role
		if (!Object.values(USER_CONSTANTS.ROLES).includes(role)) {
			return res.status(400).json({
				success: false,
				message: "Invalid role",
			});
		}

		const user = await db.User.findByPk(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		await user.update({ role });

		res.json({
			success: true,
			message: "User role updated successfully",
			user,
		});
	} catch (error) {
		console.error("Error updating user role:", error);
		res.status(500).json({
			success: false,
			message: "Error updating user role",
			error: error.message,
		});
	}
};

module.exports = {
	createUser,
	getUserProfile,
	updateUserProfile,
	walletAuth,
	getAllUsers,
	updateUserRole,
};
