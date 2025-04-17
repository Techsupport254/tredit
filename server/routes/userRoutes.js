const express = require("express");
const router = express.Router();
const { db, sequelize } = require("../models");
const { Op } = require("sequelize");
const { generateToken } = require("../utils/jwt");
const { protect, adminProtect } = require("../middleware/authMiddleware");
const { ethers } = require("ethers");
const { manageTransaction } = require("../utils/transactionManager");
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
const {
	getUserProfile,
	updateUserProfile,
	walletAuth,
	getAllUsers,
	updateUserRole,
} = require("../controllers/userController");
const { setupSSE } = require("../utils/sseHelper");
const { getUserAnalytics } = require("../controllers/userAnalyticsController");

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

// Enhanced middleware to validate registration data
const validateRegistration = async (req, res, next) => {
	const transaction = await sequelize.transaction();
	try {
		const { walletAddress, email, name, phoneNumber, uid } = req.body;

		// Validate required fields
		if (!walletAddress) {
			await transaction.rollback();
			return res.status(400).json(
				errorResponse(
					"Missing required fields",
					ResponseCodes.VALIDATION_ERROR,
					{
						details: ["Wallet address is required"],
					}
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
						ResponseCodes.VALIDATION_ERROR
					)
				);
		}

		// Check if wallet address exists
		const existingWallet = await db.User.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
			transaction,
		});

		if (existingWallet && existingWallet.email) {
			await transaction.rollback();
			return res
				.status(409)
				.json(
					errorResponse(
						"Wallet address already registered",
						ResponseCodes.RESOURCE_EXISTS
					)
				);
		}

		// Validate and check email if provided
		if (email) {
			if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
				await transaction.rollback();
				return res
					.status(400)
					.json(
						errorResponse(
							"Invalid email format",
							ResponseCodes.VALIDATION_ERROR
						)
					);
			}

			const existingEmail = await db.User.findOne({
				where: { email: email.toLowerCase() },
				transaction,
			});

			if (existingEmail) {
				await transaction.rollback();
				return res
					.status(409)
					.json(
						errorResponse(
							"Email already registered",
							ResponseCodes.RESOURCE_EXISTS
						)
					);
			}
		}

		// Validate phone number if provided
		if (phoneNumber) {
			const phoneRegex = /^\+?[1-9]\d{1,14}$/;
			if (!phoneRegex.test(phoneNumber)) {
				await transaction.rollback();
				return res
					.status(400)
					.json(
						errorResponse(
							"Invalid phone number format",
							ResponseCodes.VALIDATION_ERROR
						)
					);
			}

			const existingPhone = await db.User.findOne({
				where: { phoneNumber },
				transaction,
			});

			if (existingPhone) {
				await transaction.rollback();
				return res
					.status(409)
					.json(
						errorResponse(
							"Phone number already registered",
							ResponseCodes.RESOURCE_EXISTS
						)
					);
			}
		}

		// Check if UID exists and is already associated with another user
		if (uid) {
			const existingUid = await db.User.findOne({
				where: { uid },
				transaction,
			});

			if (
				existingUid &&
				existingUid.walletAddress !== walletAddress.toLowerCase()
			) {
				await transaction.rollback();
				return res
					.status(409)
					.json(
						errorResponse(
							"UID already associated with another account",
							ResponseCodes.RESOURCE_EXISTS
						)
					);
			}
		}

		// If all validations pass, commit transaction and continue
		await transaction.commit();
		next();
	} catch (error) {
		await transaction.rollback();
		console.error("Registration validation error:", error);
		return res.status(500).json(
			errorResponse("Validation check failed", ResponseCodes.INTERNAL_ERROR, {
				details: error.errors?.map((e) => e.message) || [error.message],
			})
		);
	}
};

// Register new user - public route
router.post(
	"/register",
	validateRegistration,
	catchAsync(async (req, res) => {
		const transaction = await sequelize.transaction();
		let user = null;
		let ipfsResult = null;
		let blockchainResult = null;

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
				acceptBlockchainStorage = true,
			} = req.body;

			// Create user in database
			user = await db.User.create(
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
					role: "user",
					isVerified: false,
					acceptBlockchainStorage,
				},
				{ transaction }
			);

			// Upload to IPFS and blockchain only if acceptBlockchainStorage is true
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

					const blockchainData = {
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
					const token = generateToken(user);

					// Return success response
					return res.status(201).json(
						successResponse(
							{
								user: {
									...user.toJSON(),
									acceptBlockchainStorage: true,
								},
								token,
								blockchain: blockchainData,
							},
							"User registered successfully"
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
					const blockchainData = {
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
			} else {
				await transaction.commit();

				// Generate new token
				const token = generateToken(user);

				// Return success response without blockchain data
				return res.status(201).json(
					successResponse(
						{
							user: {
								...user.toJSON(),
								acceptBlockchainStorage: false,
							},
							token,
						},
						"User registered successfully"
					)
				);
			}
		} catch (error) {
			await transaction.rollback();
			console.error("Error creating user:", error);
			return res.status(500).json(
				errorResponse("Error creating user", ResponseCodes.INTERNAL_ERROR, {
					details: error.errors?.map((e) => e.message) || [error.message],
				})
			);
		}
	})
);

// Public routes
router.post("/wallet-auth", walletAuth);

// Protected routes
router.get("/profile/:walletAddress", protect, getUserProfile);
router.patch("/profile/:walletAddress", protect, updateUserProfile);

// Admin Routes

// Get all users (protected route)
router.get("/", protect, adminProtect, getAllUsers);

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
		await db.User.destroy({ where: {}, force: true, transaction });

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
		const existingUser = await db.User.findOne({
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
		const [user, created] = await db.User.upsert(
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
		const token = generateToken(user);

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

// Profile-setup-events endpoint in user routes
router.get("/profile-setup-events", (req, res) => {
	// Extract token from query parameters
	const token = req.query.token;

	// Validate token if provided
	if (!token) {
		return res.status(401).json({
			success: false,
			message: "Authentication required",
		});
	}

	try {
		// Set response headers
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");
		res.setHeader("X-Accel-Buffering", "no"); // Disable buffering for nginx

		// Allow CORS
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Credentials", "true");

		// Set status code
		res.statusCode = 200;

		// Helper function to send events
		const sendEvent = (data) => {
			const event = data.type || "message";
			res.write(`event: ${event}\n`);
			res.write(`data: ${JSON.stringify(data)}\n\n`);
		};

		// Store the sendEvent function on the request for use in other middleware
		req.sendEvent = sendEvent;

		// Send initial connection established event
		sendEvent({
			type: "connection",
			status: "connected",
			message: "SSE connection established",
			timestamp: new Date().toISOString(),
		});

		// Send a test event after a short delay
		setTimeout(() => {
			sendEvent({
				type: "setup",
				status: "ready",
				message: "Ready to receive profile setup events",
				timestamp: new Date().toISOString(),
			});
		}, 1000);

		// Keep connection alive with keepalive messages
		const keepAlive = setInterval(() => {
			res.write(`: ${new Date().toISOString()}\n\n`);
		}, 15000);

		// Cleanup on connection close
		req.on("close", () => {
			clearInterval(keepAlive);
			console.log("SSE connection closed");
		});
	} catch (error) {
		console.error("Error setting up SSE:", error);
		if (!res.headersSent) {
			return res.status(500).json({
				success: false,
				message: "Failed to set up event stream",
				error: error.message,
			});
		}
	}
});

// Update user role (protected route)
router.patch("/:userId/role", protect, adminProtect, updateUserRole);

// Test registration route - skips blockchain storage
router.post(
	"/test-register",
	catchAsync(async (req, res) => {
		const transaction = await sequelize.transaction();
		try {
			const { walletAddress, name, email, phoneNumber } = req.body;

			// Create user in database
			const user = await db.User.create(
				{
					walletAddress: walletAddress.toLowerCase(),
					name: name || "Anonymous User",
					email: email?.toLowerCase() || null,
					phoneNumber: phoneNumber || "",
					role: "user",
					isVerified: false,
					acceptBlockchainStorage: false,
				},
				{ transaction }
			);

			await transaction.commit();

			// Generate new token
			const token = generateToken(user);

			// Return success response
			return res.status(201).json(
				successResponse(
					{
						user: {
							...user.toJSON(),
							acceptBlockchainStorage: false,
						},
						token,
					},
					"User registered successfully"
				)
			);
		} catch (error) {
			await transaction.rollback();
			console.error("Error creating user:", error);
			return res.status(500).json(
				errorResponse("Error creating user", ResponseCodes.INTERNAL_ERROR, {
					details: error.errors?.map((e) => e.message) || [error.message],
				})
			);
		}
	})
);

// User Analytics Route
router.get("/analytics", protect, getUserAnalytics);

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
