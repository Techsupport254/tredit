const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { Op } = require("sequelize");
const { verifySignature } = require("../utils/web3");
const { generateToken } = require("../utils/jwt");
const { protect, adminProtect } = require("../middleware/authMiddleware");
const { ethers } = require("ethers");
const { manageTransaction } = require("../utils/transactionManager");
const { sequelize } = require("../models");
const {
	successResponse,
	errorResponse,
	ResponseCodes,
} = require("../utils/responseHelper");
const catchAsync = require("../utils/catchAsync");
const axios = require("axios");
const UAParser = require("ua-parser-js");
const {
	uploadToIPFS,
	createOrUpdateUserProfile,
	unpinFromPinata,
} = require("../utils/blockchainHelper");

// Public Routes (No Protection)

// Health check endpoint
router.get(
	"/health",
	catchAsync(async (req, res) => {
		await sequelize.authenticate();
		res.json(
			successResponse(
				{
					timestamp: new Date().toISOString(),
					database: "connected",
				},
				"Server is healthy"
			)
		);
	})
);

// Register new user - public route
router.post(
	"/register",
	catchAsync(async (req, res) => {
		const transaction = await sequelize.transaction();
		let ipfsResult = null;
		let blockchainResult = null;
		let user = null;

		try {
			const {
				walletAddress,
				name,
				email,
				profileImage,
				role = "user",
				uid,
				acceptBlockchainStorage = true,
				preferences,
			} = req.body;

			// Validate required fields
			if (!walletAddress || !email || !name) {
				await transaction.rollback();
				return res.status(400).json(
					errorResponse(
						"Missing required fields",
						ResponseCodes.VALIDATION_ERROR,
						{
							details: ["Wallet address, email, and name are required"],
						}
					)
				);
			}

			// Check if user already exists
			const existingUser = await User.findOne({
				where: { walletAddress: walletAddress.toLowerCase() },
				transaction,
			});

			if (existingUser && existingUser.email) {
				await transaction.rollback();
				return res
					.status(400)
					.json(
						errorResponse(
							"User profile already exists",
							ResponseCodes.RESOURCE_EXISTS
						)
					);
			}

			// Create or update user first (without blockchain data)
			const [createdUser, created] = await User.upsert(
				{
					walletAddress: walletAddress.toLowerCase(),
					name,
					email,
					profileImage,
					role,
					uid,
					preferences: preferences || {
						theme: "light",
						notifications: {
							email: true,
							push: true,
						},
						language: "en",
					},
					isVerified: false,
					acceptBlockchainStorage,
				},
				{ transaction }
			);

			user = createdUser;

			// Upload to IPFS if blockchain storage is accepted
			let blockchainData = null;
			if (acceptBlockchainStorage) {
				try {
					// Step 1: Upload to IPFS
					req.sendEvent?.({
						type: "ipfs",
						status: "uploading",
						message: "Uploading profile to IPFS...",
						progress: 0,
						state: "UPLOADING",
					});

					ipfsResult = await uploadToIPFS(
						{
							walletAddress: user.walletAddress,
							name: user.name,
							email: user.email,
							profileImage: user.profileImage,
							role: user.role,
							createdAt: user.createdAt,
						},
						req.sendEvent
					);

					if (!ipfsResult?.ipfsCid) {
						throw new Error("IPFS upload failed - no CID returned");
					}

					// Step 2: Save to Blockchain
					req.sendEvent?.({
						type: "blockchain",
						status: "preparing",
						message: "Preparing blockchain transaction...",
						progress: 0,
						state: "PREPARING",
					});

					blockchainResult = await createOrUpdateUserProfile(
						user.walletAddress,
						ipfsResult.ipfsUrl
					);

					if (!blockchainResult?.hash) {
						throw new Error(
							"Blockchain transaction failed - no transaction hash returned"
						);
					}

					// Step 3: Update user with IPFS and blockchain data
					await user.update(
						{
							ipfsCid: ipfsResult.ipfsCid,
							ipfsUrl: ipfsResult.ipfsUrl,
							blockchainTxHash: blockchainResult.hash,
							lastBlockchainUpdate: new Date(),
						},
						{ transaction }
					);

					blockchainData = {
						ipfs: {
							status: "success",
							state: "COMPLETED",
							message: "IPFS upload completed successfully",
							progress: 100,
							data: {
								cid: ipfsResult.ipfsCid,
								url: ipfsResult.ipfsUrl,
							},
						},
						blockchain: {
							status: "success",
							state: "COMPLETED",
							message: "Blockchain transaction completed successfully",
							progress: 100,
							data: {
								txHash: blockchainResult.hash,
								explorerUrl: `https://amoy.polygonscan.com/tx/${blockchainResult.hash}`,
							},
						},
					};

					await transaction.commit();

					// Generate new token
					const token = generateToken(user.walletAddress);

					// Return success response
					return res.status(201).json(
						successResponse(
							{
								user: {
									...user.toJSON(),
									acceptBlockchainStorage,
								},
								token,
								blockchain: blockchainData,
							},
							created
								? "User registered successfully"
								: "User profile updated successfully"
						)
					);
				} catch (error) {
					console.error("IPFS/Blockchain error:", error);

					// If IPFS upload succeeded but blockchain failed, try to unpin from IPFS
					if (ipfsResult?.ipfsCid && !blockchainResult?.hash) {
						try {
							await unpinFromPinata(ipfsResult.ipfsCid);
							console.log("Successfully unpinned from Pinata");
						} catch (unpinError) {
							console.error("Error unpinning from Pinata:", unpinError);
						}
					}

					// Set error data based on which step failed
					blockchainData = {
						ipfs: {
							status: ipfsResult ? "success" : "error",
							state: ipfsResult ? "COMPLETED" : "ERROR",
							message: ipfsResult
								? "IPFS upload completed successfully"
								: "IPFS upload failed",
							progress: ipfsResult ? 100 : 0,
							error: !ipfsResult ? error.message : null,
							data: ipfsResult
								? {
										cid: ipfsResult.ipfsCid,
										url: ipfsResult.ipfsUrl,
								  }
								: null,
						},
						blockchain: {
							status: blockchainResult ? "success" : "error",
							state: blockchainResult ? "COMPLETED" : "ERROR",
							message: blockchainResult
								? "Blockchain transaction completed successfully"
								: "Blockchain transaction failed",
							progress: blockchainResult ? 100 : 0,
							error: !blockchainResult ? error.message : null,
							data: blockchainResult
								? {
										txHash: blockchainResult.hash,
										explorerUrl: `https://amoy.polygonscan.com/tx/${blockchainResult.hash}`,
								  }
								: null,
						},
					};

					// Always rollback the transaction if there's an error with IPFS or blockchain
					await transaction.rollback();
					return res.status(500).json(
						errorResponse(
							"Failed to store profile on IPFS and blockchain",
							ResponseCodes.BLOCKCHAIN_ERROR,
							{
								blockchain: blockchainData,
							}
						)
					);
				}
			}

			await transaction.commit();

			// Generate new token
			const token = generateToken(user.walletAddress);

			// Return success response
			return res.status(201).json(
				successResponse(
					{
						user: {
							...user.toJSON(),
							acceptBlockchainStorage,
						},
						token,
						blockchain: blockchainData,
					},
					created
						? "User registered successfully"
						: "User profile updated successfully"
				)
			);
		} catch (error) {
			console.error("Registration error:", error);

			// Only attempt rollback if transaction exists and hasn't been committed/rolled back
			if (transaction && !transaction.finished) {
				await transaction.rollback();
			}

			return res.status(500).json(
				errorResponse("Failed to register user", ResponseCodes.INTERNAL_ERROR, {
					details: error.errors?.map((e) => e.message) || [error.message],
				})
			);
		}
	})
);

// Combined wallet check and authentication endpoint
router.post(
	"/wallet-auth",
	catchAsync(async (req, res) => {
		const transaction = await sequelize.transaction();
		try {
			const { walletAddress, signature, message, chainId } = req.body;

			// Basic validation
			if (!walletAddress) {
				await transaction.rollback();
				return res.status(400).json(
					errorResponse(
						"Wallet address is required",
						ResponseCodes.VALIDATION_ERROR,
						{
							exists: false,
							hasProfile: false,
							authenticated: false,
						}
					)
				);
			}

			// Normalize wallet address
			const normalizedWalletAddress = walletAddress.toLowerCase();

			// First, check wallet status
			const user = await User.findOne({
				where: { walletAddress: normalizedWalletAddress },
				attributes: [
					"id",
					"walletAddress",
					"email",
					"name",
					"profileImage",
					"role",
					"blockchainTxHash",
					"ipfsUrl",
					"acceptBlockchainStorage",
				],
				transaction,
			});

			// Base response structure
			const baseResponse = {
				success: true,
				exists: !!user,
				hasProfile: !!user?.email,
				authenticated: false,
			};

			// If user doesn't exist, return early
			if (!user) {
				await transaction.commit();
				return res.json(
					successResponse(baseResponse, "User not found, registration required")
				);
			}

			// Generate token if we have a valid signature
			let token = null;
			if (signature && message && chainId) {
				// Verify signature here if needed
				token = generateToken(normalizedWalletAddress);
				baseResponse.authenticated = true;
			}

			await transaction.commit();

			// Return full response with user data
			return res.json(
				successResponse(
					{
						...baseResponse,
						user: user.email
							? {
									id: user.id,
									walletAddress: user.walletAddress,
									name: user.name,
									email: user.email,
									profileImage: user.profileImage,
									role: user.role,
									blockchainTxHash: user.blockchainTxHash,
									ipfsUrl: user.ipfsUrl,
									acceptBlockchainStorage: user.acceptBlockchainStorage,
							  }
							: null,
						...(token && { token }),
					},
					user.email
						? "Authentication successful"
						: "Wallet authenticated, profile completion required"
				)
			);
		} catch (error) {
			// Only attempt rollback if transaction exists and hasn't been committed/rolled back
			if (transaction && !transaction.finished) {
				await transaction.rollback();
			}
			console.error("Wallet auth error:", error);
			return res.status(500).json(
				errorResponse("Authentication failed", ResponseCodes.INTERNAL_ERROR, {
					exists: false,
					hasProfile: false,
					authenticated: false,
					error: error.message,
				})
			);
		}
	})
);

// Protected Routes (Need Authentication)

// Get user profile by wallet address
router.get("/:walletAddress", async (req, res) => {
	try {
		const { walletAddress } = req.params;

		// Normalize the wallet address
		const normalizedWalletAddress = walletAddress.toLowerCase();

		// Find the user with all fields
		const user = await User.findOne({
			where: { walletAddress: normalizedWalletAddress },
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
				code: "USER_NOT_FOUND",
			});
		}

		return res.json({
			success: true,
			user,
		});
	} catch (error) {
		console.error("Error fetching user:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch user data",
			error: error.message,
			code: "FETCH_ERROR",
		});
	}
});

// Update user profile - protected route
router.patch("/profile/:walletAddress", async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		const { walletAddress } = req.params;
		const {
			name,
			email,
			phoneNumber,
			bio,
			gender,
			dob,
			location,
			profileImage,
			preferences,
			store,
			acceptBlockchainStorage,
		} = req.body;

		// Find existing user
		const user = await User.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
			transaction,
		});

		if (!user) {
			await transaction.rollback();
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Validate email format if provided
		if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
			await transaction.rollback();
			return res.status(400).json({
				success: false,
				message: "Invalid email format",
			});
		}

		// Validate phone number format if provided
		if (phoneNumber && !phoneNumber.match(/^\+?[\d\s-()]{8,}$/)) {
			await transaction.rollback();
			return res.status(400).json({
				success: false,
				message: "Invalid phone number format",
			});
		}

		// Validate date of birth if provided
		if (dob) {
			const dobDate = new Date(dob);
			if (isNaN(dobDate.getTime())) {
				await transaction.rollback();
				return res.status(400).json({
					success: false,
					message: "Invalid date of birth format",
				});
			}
		}

		// Prepare update data
		const updateData = {
			...(name && { name }),
			...(email && { email }),
			...(phoneNumber && { phoneNumber }),
			...(bio && { bio }),
			...(gender && { gender }),
			...(dob && { dob }),
			...(location && { location }),
			...(profileImage && { profileImage }),
			...(preferences && { preferences }),
			...(typeof acceptBlockchainStorage === "boolean" && {
				acceptBlockchainStorage,
			}),
			updatedAt: new Date(),
		};

		// If store details are provided, update or create store
		if (store) {
			updateData.store = {
				...(user.store || {}),
				...store,
				updatedAt: new Date(),
			};
		}

		// Update user with new data
		const updatedUser = await user.update(updateData, { transaction });

		await transaction.commit();

		// Return updated user data
		res.json({
			success: true,
			message: "Profile updated successfully",
			user: {
				walletAddress: updatedUser.walletAddress,
				name: updatedUser.name,
				email: updatedUser.email,
				phoneNumber: updatedUser.phoneNumber,
				bio: updatedUser.bio,
				gender: updatedUser.gender,
				dob: updatedUser.dob,
				location: updatedUser.location,
				profileImage: updatedUser.profileImage,
				role: updatedUser.role,
				store: updatedUser.store,
				preferences: updatedUser.preferences,
				ipfsCid: updatedUser.ipfsCid,
				ipfsUrl: updatedUser.ipfsUrl,
				blockchainTxHash: updatedUser.blockchainTxHash,
				lastBlockchainUpdate: updatedUser.lastBlockchainUpdate,
				acceptBlockchainStorage: updatedUser.acceptBlockchainStorage,
				createdAt: updatedUser.createdAt,
				updatedAt: updatedUser.updatedAt,
			},
		});
	} catch (error) {
		await transaction.rollback();
		console.error("Error updating profile:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update profile",
			error: error.message,
		});
	}
});

// Delete specific user - protected route
router.delete("/:walletAddress", protect, async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		const { walletAddress } = req.params;

		// Find the user
		const user = await User.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
			transaction,
		});

		if (!user) {
			await transaction.rollback();
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Delete the user
		await user.destroy({ transaction });

		await transaction.commit();
		res.json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (error) {
		await transaction.rollback();
		console.error("Error deleting user:", error);
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// Admin Routes

// Get all users (admin only)
router.get("/", async (req, res) => {
	try {
		const users = await User.findAll();
		res.json(users);
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

// Delete all users (admin only)
router.delete("/", adminProtect, async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		// First delete all business team members
		await sequelize.models.BusinessTeamMember.destroy({
			where: {},
			force: true,
			transaction,
		});

		// Then delete all businesses
		await sequelize.models.Business.destroy({
			where: {},
			force: true,
			transaction,
		});

		// Finally delete all users
		await User.destroy({ where: {}, force: true, transaction });

		await transaction.commit();
		res.json({
			success: true,
			message: "All users, businesses, and team members deleted successfully",
		});
	} catch (error) {
		await transaction.rollback();
		console.error("Error deleting all users:", error);
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// Complete user profile with Google data
router.post("/complete-profile", protect, async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		const { walletAddress, email, displayName, photoURL, uid } = req.body;

		// Validate required fields
		if (!walletAddress || !email || !uid) {
			await transaction.rollback();
			return res.status(400).json({
				success: false,
				message: "Missing required fields",
				details: ["Wallet address, email, and uid are required"],
			});
		}

		// Check if user already exists with completed profile
		const existingUser = await User.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
			transaction,
		});

		if (existingUser?.email) {
			await transaction.rollback();
			return res.status(400).json({
				success: false,
				message: "User profile already exists",
			});
		}

		// Create or update user with Google data
		const [user, created] = await User.upsert(
			{
				walletAddress: walletAddress.toLowerCase(),
				name: displayName,
				email,
				profileImage: photoURL,
				role: "user",
				uid,
				preferences: {
					theme: "light",
					notifications: {
						email: true,
						push: true,
					},
					language: "en",
				},
				isVerified: true, // Verified because they signed in with Google
			},
			{ transaction }
		);

		await transaction.commit();

		// Generate new token
		const token = generateToken(user.walletAddress);

		res.json({
			success: true,
			message: created
				? "Profile created successfully"
				: "Profile updated successfully",
			user,
			token,
		});
	} catch (error) {
		await transaction.rollback();
		console.error("Profile completion error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to complete profile",
			error: error.message,
			details: error.errors?.map((e) => e.message) || [error.message],
		});
	}
});

// Profile setup events endpoint
router.get("/profile-setup-events", (req, res) => {
	// Set headers for SSE
	res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
	});

	// Helper function to send events
	const sendEvent = (data) => {
		res.write(`data: ${JSON.stringify(data)}\n\n`);
	};

	// Store the client's response object in the request
	req.on("close", () => {
		res.end();
	});

	// Store the sendEvent function in the request for use in other middleware
	req.sendEvent = sendEvent;

	// Keep the connection alive
	const keepAlive = setInterval(() => {
		res.write(": keepalive\n\n");
	}, 20000);

	req.on("close", () => {
		clearInterval(keepAlive);
	});
});

// Add a router-level error handler
router.use((err, req, res, next) => {
	console.error("User route error:", err);

	// Handle validation errors
	if (
		err.name === "ValidationError" ||
		err.name === "SequelizeValidationError"
	) {
		return res.status(400).json(
			errorResponse("Validation error", ResponseCodes.VALIDATION_ERROR, {
				details: err.errors?.map((e) => e.message) || [err.message],
			})
		);
	}

	// Handle unique constraint errors
	if (err.name === "SequelizeUniqueConstraintError") {
		return res.status(409).json(
			errorResponse("Resource already exists", ResponseCodes.RESOURCE_EXISTS, {
				details: err.errors?.map((e) => e.message) || [err.message],
			})
		);
	}

	// Handle blockchain errors
	if (err.message.includes("blockchain") || err.message.includes("IPFS")) {
		return res
			.status(500)
			.json(errorResponse(err.message, ResponseCodes.BLOCKCHAIN_ERROR));
	}

	// Default error response
	res
		.status(500)
		.json(errorResponse("Internal server error", ResponseCodes.INTERNAL_ERROR));
});

module.exports = router;
