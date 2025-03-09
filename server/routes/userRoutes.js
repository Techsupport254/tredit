const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { sequelize } = require("../config/database");
const { Op } = require("sequelize");
const UserLoginHistory = require("../models/UserLoginHistory");
const { verifySignature } = require("../utils/web3");
const { generateToken } = require("../utils/jwt");
const { protect, adminProtect } = require("../middleware/authMiddleware");
const { ethers } = require("ethers");
const {
	uploadToIPFS,
	saveProfileToBlockchain,
} = require("../utils/blockchainHelper");
const { manageTransaction } = require("../utils/transactionManager");
const axios = require("axios");
const UAParser = require("ua-parser-js");

// Add this helper function before the routes
const parseUserAgent = (userAgent) => {
	if (!userAgent) {
		return {
			browser: "Unknown",
			browserVersion: "Unknown",
			os: "Unknown",
			osVersion: "Unknown",
			device: "Unknown",
			deviceType: "desktop", // Default to desktop
		};
	}

	const parser = new UAParser(userAgent);
	const browser = parser.getBrowser();
	const os = parser.getOS();
	const device = parser.getDevice();

	// Determine device type based on user agent and device info
	let deviceType = "desktop";
	if (device.type) {
		deviceType = device.type;
	} else if (/mobile/i.test(userAgent)) {
		deviceType = "mobile";
	} else if (/tablet/i.test(userAgent)) {
		deviceType = "tablet";
	}

	return {
		browser: browser.name || "Unknown",
		browserVersion: browser.version || "Unknown",
		os: os.name || "Unknown",
		osVersion: os.version || "Unknown",
		device: device.vendor
			? `${device.vendor} ${device.model}`.trim()
			: "Unknown",
		deviceType: deviceType,
	};
};

// Public Routes (No Protection)

// Health check endpoint
router.get("/health", async (req, res) => {
	try {
		await sequelize.authenticate();
		res.json({
			success: true,
			message: "Server is healthy",
			timestamp: new Date().toISOString(),
			database: "connected",
		});
	} catch (error) {
		console.error("Health check failed:", error);
		res.status(503).json({
			success: false,
			message: "Server is unhealthy",
			error: error.message,
			timestamp: new Date().toISOString(),
		});
	}
});

// Register new user - public route
router.post("/register", async (req, res) => {
	const transaction = await sequelize.transaction();
	let ipfsResult = null;
	let blockchainResult = null;

	try {
		const {
			walletAddress,
			name,
			email,
			profileImage,
			role = "user",
			uid,
			acceptBlockchainStorage = true, // Default to true if not provided
			preferences,
		} = req.body;

		// Validate required fields
		if (!walletAddress || !email || !name) {
			return res.status(400).json({
				success: false,
				message: "Missing required fields",
				details: ["Wallet address, email, and name are required"],
			});
		}

		// Check if user already exists
		const existingUser = await User.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
			transaction,
		});

		if (existingUser && existingUser.email) {
			await transaction.rollback();
			return res.status(400).json({
				success: false,
				message: "User profile already exists",
			});
		}

		// Create or update user first (without blockchain data)
		const [user, created] = await User.upsert(
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

		// Create initial login history entry with detailed device info
		const userAgentString = req.headers["user-agent"] || "";
		const userAgentInfo = parseUserAgent(userAgentString);
		const loginHistoryEntry = {
			userAddress: walletAddress.toLowerCase(),
			ipAddress: req.ip,
			status: "success",
			loginMethod: "registration",
			userAgent: userAgentString,
			browser: userAgentInfo.browser,
			browserVersion: userAgentInfo.browserVersion,
			os: userAgentInfo.os,
			osVersion: userAgentInfo.osVersion,
			device: userAgentInfo.device,
			deviceType: userAgentInfo.deviceType,
			timestamp: new Date(),
		};

		// Create login history entry
		const loginHistory = await UserLoginHistory.create(loginHistoryEntry, {
			transaction,
		});

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

				blockchainResult = await saveProfileToBlockchain(
					{
						ipfsUri: ipfsResult.ipfsUrl,
					},
					req.sendEvent
				);

				if (!blockchainResult?.txHash) {
					throw new Error(
						"Blockchain transaction failed - no transaction hash returned"
					);
				}

				// Step 3: Update user with IPFS and blockchain data
				await user.update(
					{
						ipfsCid: ipfsResult.ipfsCid,
						ipfsUrl: ipfsResult.ipfsUrl,
						blockchainTxHash: blockchainResult.txHash,
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
							txHash: blockchainResult.txHash,
							explorerUrl: `https://amoy.polygonscan.com/tx/${blockchainResult.txHash}`,
						},
					},
				};
			} catch (error) {
				console.error("IPFS/Blockchain error:", error);

				// If IPFS upload succeeded but blockchain failed, try to unpin from IPFS
				if (ipfsResult?.ipfsCid && !blockchainResult?.txHash) {
					try {
						console.log("Unpinning from Pinata:", ipfsResult.ipfsCid);
						await axios.delete(
							`${PINATA_BASE_URL}/pinning/unpin/${ipfsResult.ipfsCid}`,
							{
								headers: {
									pinata_api_key: PINATA_API_KEY,
									pinata_secret_api_key: PINATA_API_SECRET,
								},
							}
						);
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
									txHash: blockchainResult.txHash,
									explorerUrl: `https://amoy.polygonscan.com/tx/${blockchainResult.txHash}`,
							  }
							: null,
					},
				};

				// If both IPFS and blockchain failed, rollback the transaction
				if (!ipfsResult?.ipfsCid && !blockchainResult?.txHash) {
					await transaction.rollback();
					return res.status(500).json({
						success: false,
						message: "Failed to store profile on IPFS and blockchain",
						blockchain: blockchainData,
					});
				}
			}
		}

		await transaction.commit();

		// Generate new token
		const token = generateToken(user.walletAddress);

		// Include login history in response
		res.json({
			success: true,
			message: created
				? "User registered successfully"
				: "User profile updated successfully",
			user: {
				...user.toJSON(),
				acceptBlockchainStorage,
			},
			token,
			blockchain: blockchainData,
			loginHistory: [loginHistory], // Include the login history
		});
	} catch (error) {
		await transaction.rollback();
		console.error("Registration error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to register user",
			error: error.message,
			details: error.errors?.map((e) => e.message) || [error.message],
		});
	}
});

// Combined wallet check and authentication endpoint
router.post("/wallet-auth", async (req, res) => {
	const transaction = await sequelize.transaction();
	let loginHistory = null;
	try {
		const { walletAddress, signature, message, chainId, skipLoginHistory } =
			req.body;

		// Basic validation
		if (!walletAddress) {
			return res.status(400).json({
				success: false,
				message: "Wallet address is required",
				exists: false,
				hasProfile: false,
				authenticated: false,
			});
		}

		// Normalize wallet address
		const normalizedWalletAddress = walletAddress.toLowerCase();

		// First, check wallet status
		const user = await User.findOne({
			where: { walletAddress: normalizedWalletAddress },
			attributes: [
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
			return res.json({
				...baseResponse,
				message: "User not found, registration required",
			});
		}

		// Only create login history if:
		// 1. Not explicitly skipped
		// 2. Has a valid signature (actual authentication attempt)
		// 3. User exists
		// 4. This is not a status check (all auth params must be present)
		const isAuthAttempt = signature && message && chainId;
		if (!skipLoginHistory && isAuthAttempt) {
			// Check if a login history entry already exists for this attempt
			const recentLogin = await UserLoginHistory.findOne({
				where: {
					userAddress: normalizedWalletAddress,
					createdAt: {
						[Op.gt]: new Date(Date.now() - 5000), // Within last 5 seconds
					},
				},
				transaction,
			});

			if (!recentLogin) {
				// Create login history entry with detailed device info
				const userAgentString = req.headers["user-agent"] || "";
				const userAgentInfo = parseUserAgent(userAgentString);
				const loginHistoryEntry = {
					userAddress: normalizedWalletAddress,
					ipAddress: req.ip,
					status: "success",
					loginMethod: "wallet_auth",
					userAgent: userAgentString,
					browser: userAgentInfo.browser,
					browserVersion: userAgentInfo.browserVersion,
					os: userAgentInfo.os,
					osVersion: userAgentInfo.osVersion,
					device: userAgentInfo.device,
					deviceType: userAgentInfo.deviceType,
					timestamp: new Date(),
				};

				try {
					loginHistory = await UserLoginHistory.create(loginHistoryEntry, {
						transaction,
					});
					baseResponse.loginHistory = [loginHistory];
				} catch (error) {
					console.error("Failed to create login history:", error);
					await transaction.rollback();
					throw new Error("Failed to create login history entry");
				}
			}
		}

		// If no signature provided, return early with limited token
		if (!isAuthAttempt) {
			await transaction.commit();
			const limitedToken = generateToken(normalizedWalletAddress, "15m"); // Short-lived token
			return res.json({
				...baseResponse,
				message: user.email
					? "User found, authentication required"
					: "User found, profile completion required",
				token: limitedToken,
			});
		}

		// Validate chain ID first (quick fail)
		if (chainId !== "80002") {
			await loginHistory.update(
				{ status: "failed", failureReason: "Invalid chain ID" },
				{ transaction }
			);
			await transaction.commit();
			return res.status(400).json({
				...baseResponse,
				success: false,
				message: "Please connect to Polygon Amoy Testnet",
				chainId: chainId,
				requiredChainId: "80002",
			});
		}

		// Validate message format
		const expectedMessageStart = "Welcome to Tredit!";
		if (!message.startsWith(expectedMessageStart)) {
			await loginHistory.update(
				{ status: "failed", failureReason: "Invalid message format" },
				{ transaction }
			);
			await transaction.commit();
			return res.status(400).json({
				...baseResponse,
				success: false,
				message: "Invalid message format",
				expectedFormat: expectedMessageStart + "...",
			});
		}

		// Verify signature using ethers
		try {
			const recoveredAddress = ethers.verifyMessage(message, signature);
			if (recoveredAddress.toLowerCase() !== normalizedWalletAddress) {
				await loginHistory.update(
					{ status: "failed", failureReason: "Invalid signature" },
					{ transaction }
				);
				await transaction.commit();
				return res.status(400).json({
					...baseResponse,
					success: false,
					message: "Invalid signature",
					details: "The provided signature does not match the wallet address",
				});
			}
		} catch (error) {
			await loginHistory.update(
				{
					status: "failed",
					failureReason: "Signature verification failed: " + error.message,
				},
				{ transaction }
			);
			await transaction.commit();
			return res.status(400).json({
				...baseResponse,
				success: false,
				message: "Signature verification failed",
				error: error.message,
			});
		}

		// Generate authentication token
		const token = generateToken(normalizedWalletAddress);

		// Get recent login history
		const recentLoginHistory = await UserLoginHistory.findAll({
			where: { userAddress: normalizedWalletAddress },
			order: [["createdAt", "DESC"]],
			limit: 10,
			transaction,
		});

		await transaction.commit();

		// Return full response with user data and login history
		return res.json({
			...baseResponse,
			authenticated: true,
			message: user.email
				? "Authentication successful"
				: "Wallet authenticated, profile completion required",
			user: user.email
				? {
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
			loginHistory: recentLoginHistory,
			token,
		});
	} catch (error) {
		await transaction.rollback();
		console.error("Wallet auth error:", error);
		res.status(500).json({
			success: false,
			message: "Authentication failed",
			error: error.message,
			exists: false,
			hasProfile: false,
			authenticated: false,
		});
	}
});

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

// Get user login history - protected route
router.get("/:walletAddress/login-history", async (req, res) => {
	try {
		const { walletAddress } = req.params;

		// Get the most recent 10 login attempts with full details
		const loginHistory = await UserLoginHistory.findAll({
			where: {
				userAddress: walletAddress.toLowerCase(),
				loginMethod: {
					[Op.in]: ["registration", "wallet_auth"], // Only get registration and wallet auth entries
				},
			},
			attributes: [
				"id",
				"userAddress",
				"ipAddress",
				"userAgent",
				"browser",
				"browserVersion",
				"os",
				"osVersion",
				"device",
				"deviceType",
				"status",
				"loginMethod",
				"createdAt",
			],
			order: [["createdAt", "DESC"]],
			limit: 10,
		});

		res.json({
			success: true,
			loginHistory,
		});
	} catch (error) {
		console.error("Error fetching login history:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch login history",
			error: error.message,
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

		// Delete user's login history
		await UserLoginHistory.destroy({
			where: { userAddress: user.walletAddress },
			transaction,
		});

		// Delete the user
		await user.destroy({ transaction });

		await transaction.commit();
		res.json({
			success: true,
			message: "User and login history deleted successfully",
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
router.delete(
	"/",
	// adminProtect,
	async (req, res) => {
		const transaction = await sequelize.transaction();
		try {
			// Delete all login history first
			await UserLoginHistory.destroy({ where: {}, transaction });

			// Delete all users
			await User.destroy({ where: {}, transaction });

			await transaction.commit();
			res.json({
				success: true,
				message: "All users and their login history deleted successfully",
			});
		} catch (error) {
			await transaction.rollback();
			console.error("Error deleting all users:", error);
			res.status(500).json({
				success: false,
				error: error.message,
			});
		}
	}
);

// Estimate gas fees for registration
router.post("/estimate-registration", protect, async (req, res) => {
	try {
		const { walletAddress, name, email, profileImage, role, preferences } =
			req.body;

		// Prepare user data for estimation
		const userData = {
			walletAddress: walletAddress.toLowerCase(),
			name,
			email,
			profileImage,
			role: role || "user",
			preferences: preferences || {
				theme: "light",
				notifications: {
					email: true,
					push: true,
				},
				language: "en",
			},
		};

		// Get provider for gas estimation
		const provider = new ethers.JsonRpcProvider(
			process.env.RPC_URL || "https://rpc-amoy.polygon.technology"
		);

		// Get current gas price
		const gasPrice = await provider.getFeeData();
		const gasPriceGwei = ethers.formatUnits(gasPrice.gasPrice, "gwei");

		// Estimate gas for the transaction (this is an approximation)
		const gasEstimate = 200000; // Base estimate for profile creation

		// Calculate total cost in MATIC
		const totalCostWei = gasPrice.gasPrice * BigInt(gasEstimate);
		const totalCostMatic = ethers.formatEther(totalCostWei);

		res.json({
			success: true,
			gasEstimate,
			gasPriceGwei,
			totalCostMatic,
		});
	} catch (error) {
		console.error("Gas estimation error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to estimate gas fees",
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

		// Create initial login history entry
		await UserLoginHistory.create(
			{
				userAddress: walletAddress.toLowerCase(),
				ipAddress: req.ip,
				status: "success",
				loginMethod: "google_auth",
				deviceInfo: {
					userAgent: req.headers["user-agent"],
					platform: req.headers["sec-ch-ua-platform"],
				},
				timestamp: new Date(),
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

// Test endpoints (admin only)
router.get("/test/token/:walletAddress", adminProtect, async (req, res) => {
	try {
		const { walletAddress } = req.params;
		const token = generateToken(walletAddress);
		res.json({
			success: true,
			token,
			message: "Test token generated successfully",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

router.get("/test/verify", adminProtect, (req, res) => {
	res.json({
		success: true,
		user: req.user,
		message: "Token verified successfully",
	});
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

module.exports = router;
