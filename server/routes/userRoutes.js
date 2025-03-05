const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Store = require("../models/Store");
const { sequelize } = require("../config/database");
const {
	createIPNSKey,
	uploadToIPFS,
	saveProfileToBlockchain,
} = require("../utils/blockchainHelper");
const { Op } = require("sequelize");
const UserLoginHistory = require("../models/UserLoginHistory");
const jwt = require("jsonwebtoken");
const ethers = require("ethers");

// ✅ Check if a wallet is registered
router.get("/check-wallet/:walletAddress", async (req, res) => {
	try {
		const { walletAddress } = req.params;
		const user = await User.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
		});

		if (user) {
			return res.json({ exists: true, user });
		} else {
			return res.json({ exists: false, message: "Wallet not registered" });
		}
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

// ✅ Register User (Only if not already registered)
router.post("/register", async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		const {
			walletAddress,
			role,
			name,
			email,
			phoneNumber,
			profileImage,
			gender,
			dob,
			bio,
			location,
			socialMedias,
		} = req.body;

		console.log("Received registration data:", {
			walletAddress,
			role,
			name,
			email,
			phoneNumber,
			gender,
			dob,
			location,
			bio,
			socialMedias,
		});

		// Check if user already exists
		const existingUser = await User.findOne({
			where: { walletAddress: walletAddress?.toLowerCase() },
			transaction,
		});

		if (existingUser) {
			await transaction.rollback();
			return res.status(400).json({
				success: false,
				message: "Wallet already registered",
				user: existingUser,
			});
		}

		// Prepare user data for IPFS
		const userData = {
			walletAddress: walletAddress.toLowerCase(),
			name,
			email,
			phoneNumber,
			profileImage,
			gender,
			dob,
			bio,
			location,
			socialMedias,
			timestamp: new Date().toISOString(),
		};

		// Upload to IPFS
		const { ipfsCid, ipfsUrl } = await uploadToIPFS(userData);

		// Create user in database
		const user = await User.create(
			{
				walletAddress: walletAddress.toLowerCase(),
				role,
				name,
				email,
				phoneNumber,
				profileImage,
				gender,
				dob,
				bio,
				location,
				socialMedias,
				ipfsCid,
				ipfsUrl,
			},
			{ transaction }
		);

		// Save IPFS URI to blockchain
		const blockchainResult = await saveProfileToBlockchain({
			...userData,
			ipfsUrl: ipfsCid,
		});

		await transaction.commit();
		res.json({
			success: true,
			user,
			ipfs: {
				cid: ipfsCid,
				url: ipfsUrl,
			},
		});
	} catch (error) {
		await transaction.rollback();
		console.error("Registration error:", error);
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// ✅ Update User Profile
router.put("/update/:walletAddress", async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		const { walletAddress } = req.params;
		const {
			name,
			email,
			phoneNumber,
			profileImage,
			gender,
			dob,
			bio,
			location,
		} = req.body;

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

		// Prepare updated user data for IPFS
		const userData = {
			walletAddress: user.walletAddress,
			name,
			email,
			phoneNumber,
			profileImage,
			gender,
			dob,
			bio,
			location,
			socialMedias: user.socialMedias,
			timestamp: new Date().toISOString(),
		};

		// Upload to IPFS
		const { ipfsCid, ipfsUrl } = await uploadToIPFS(userData);

		// Update user in database
		await user.update(
			{
				name,
				email,
				phoneNumber,
				profileImage,
				gender,
				dob,
				bio,
				location,
				ipfsCid,
				ipfsUrl,
			},
			{ transaction }
		);

		await transaction.commit();
		res.json({
			success: true,
			message: "Profile updated",
			user,
			ipfs: {
				cid: ipfsCid,
				url: ipfsUrl,
			},
		});
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// ✅ Add Social Media Account
router.post("/add-social/:walletAddress", async (req, res) => {
	try {
		const { walletAddress } = req.params;
		const { platform, accessToken } = req.body;

		const user = await User.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
		});

		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		// Update social media list
		let socialMedias = user.socialMedias || [];

		// Check if the platform already exists
		const existingIndex = socialMedias.findIndex(
			(media) => media.platform === platform
		);
		if (existingIndex !== -1) {
			socialMedias[existingIndex].accessToken = accessToken; // Update token
		} else {
			socialMedias.push({ platform, accessToken }); // Add new platform
		}

		await user.update({ socialMedias });

		res.json({ success: true, message: `${platform} account added`, user });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

// ✅ Get All Users
router.get("/", async (req, res) => {
	try {
		const users = await User.findAll();
		res.json(users);
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

// Get user by wallet address
router.get("/:walletAddress", async (req, res) => {
	try {
		const { walletAddress } = req.params;
		const user = await User.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
		});

		if (user) {
			return res.json({ success: true, user }); // ✅ Corrected JSON response
		} else {
			return res
				.status(404)
				.json({ success: false, message: "User not found" }); // ✅ Added `success: false`
		}
	} catch (error) {
		console.error("Error fetching user:", error); // ✅ Debugging log
		res.status(500).json({ success: false, error: error.message });
	}
});

// delete all users
router.delete("/", async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		// First delete all stores
		await Store.destroy({ where: {}, transaction });

		// Then delete all users
		await User.destroy({ where: {}, transaction });

		await transaction.commit();
		res.json({ success: true, message: "All users and their stores deleted" });
	} catch (error) {
		await transaction.rollback();
		console.error("Error deleting users:", error);
		res.status(500).json({ success: false, error: error.message });
	}
});

// Link Google Profile and Create Store
router.post("/link-google", async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		const {
			walletAddress,
			name,
			email,
			profileImage,
			role,
			ipfsURI,
			ipfsUrl,
			ipfsCid,
			ipfsMetadata,
		} = req.body;
		console.log("Received data:", req.body);

		// First check if email exists with a different wallet
		const emailCheck = await User.findOne({
			where: {
				email: email,
				walletAddress: {
					[Op.ne]: walletAddress.toLowerCase(),
				},
			},
			transaction,
		});

		if (emailCheck) {
			await transaction.rollback();
			return res.status(400).json({
				success: false,
				message: "Email already linked to another wallet",
				details: [
					"This email is already associated with a different wallet address",
				],
			});
		}

		// Find user by wallet address
		let user = await User.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
			include: [{ model: Store, as: "stores" }],
			transaction,
		});

		const userData = {
			walletAddress: walletAddress.toLowerCase(),
			role: role || "vendor",
			name,
			email,
			profileImage,
			ipfsURI,
			ipfsUrl,
			ipfsCid,
			ipfsMetadata,
		};

		if (!user) {
			// Create new user
			user = await User.create(userData, { transaction });
		} else {
			// Update existing user
			await user.update(userData, { transaction });
		}

		// Create store if it doesn't exist
		if (!user.stores || user.stores.length === 0) {
			await Store.create(
				{
					userId: user.id,
					name: `${name}'s Store`,
					description: `Welcome to ${name}'s store!`,
					category: "digital",
					logo: profileImage,
					settings: {
						enableYouTubeIntegration: false,
						enableSocialSharing: true,
						allowComments: true,
					},
				},
				{ transaction }
			);
		}

		await transaction.commit();

		// Return updated user with stores
		const updatedUser = await User.findOne({
			where: { id: user.id },
			include: [{ model: Store, as: "stores" }],
		});

		res.json({
			success: true,
			message: "Account created successfully",
			user: updatedUser,
		});
	} catch (error) {
		await transaction.rollback();
		console.error("Account creation error:", error);

		// Handle specific error types
		if (error.name === "SequelizeUniqueConstraintError") {
			return res.status(400).json({
				success: false,
				message: "Email already in use",
				details: ["This email address is already registered"],
			});
		}

		res.status(500).json({
			success: false,
			message: "Failed to create account",
			details: error.errors?.map((e) => e.message) || [error.message],
		});
	}
});

// Update Store Settings
router.put("/store/:walletAddress", async (req, res) => {
	try {
		const { walletAddress } = req.params;
		const {
			storeName,
			storeDescription,
			storeCategory,
			storeLogo,
			storeSettings,
			socialMedias,
		} = req.body;

		const user = await User.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		if (user.role !== "vendor") {
			return res.status(403).json({
				success: false,
				message: "Only vendors can update store settings",
			});
		}

		await user.update({
			storeName,
			storeDescription,
			storeCategory,
			storeLogo,
			storeSettings: {
				...user.storeSettings,
				...storeSettings,
			},
			socialMedias: socialMedias || user.socialMedias,
		});

		res.json({
			success: true,
			message: "Store settings updated successfully",
			user,
		});
	} catch (error) {
		console.error("Store update error:", error);
		res.status(500).json({
			success: false,
			error: error.message,
			details: error.errors?.map((e) => e.message),
		});
	}
});

// Get user login history
router.get("/:walletAddress/login-history", async (req, res) => {
	try {
		const { walletAddress } = req.params;
		const user = await User.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		const loginHistory = await UserLoginHistory.findAll({
			where: { userId: user.id },
			order: [["createdAt", "DESC"]],
			limit: 10, // Get last 10 logins
		});

		res.json({
			success: true,
			loginHistory,
		});
	} catch (error) {
		console.error("Error fetching login history:", error);
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// Wallet Authentication
router.post("/wallet-auth", async (req, res) => {
	try {
		const { address, signature, message, chainId, userAgent, deviceInfo } =
			req.body;

		// Verify the signature
		const recoveredAddress = ethers.verifyMessage(message, signature);

		if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
			return res.status(401).json({
				success: false,
				message: "Invalid signature",
			});
		}

		// Find or create user
		let user = await User.findOne({
			where: { walletAddress: address.toLowerCase() },
		});

		if (!user) {
			user = await User.create({
				walletAddress: address.toLowerCase(),
				role: "user",
			});
		}

		// Generate JWT token
		const token = jwt.sign(
			{ id: user.id, walletAddress: user.walletAddress },
			process.env.JWT_SECRET,
			{ expiresIn: "30d" }
		);

		// Determine device type based on user agent
		let deviceType = "desktop"; // default to desktop
		const ua = userAgent.toLowerCase();
		if (ua.includes("mobile")) {
			deviceType = "mobile";
		} else if (ua.includes("tablet")) {
			deviceType = "tablet";
		}

		// Log login attempt
		await UserLoginHistory.create({
			userId: user.id,
			ipAddress: req.ip || req.connection.remoteAddress,
			userAgent,
			browser: deviceInfo?.browser,
			browserVersion: deviceInfo?.browserVersion,
			os: deviceInfo?.platform,
			osVersion: deviceInfo?.osVersion,
			device: deviceInfo?.vendor,
			deviceType,
			status: "success",
			loginMethod: "wallet",
			chainId: chainId,
		});

		res.json({
			success: true,
			token,
			user: {
				id: user.id,
				walletAddress: user.walletAddress,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Wallet authentication error:", error);
		res.status(500).json({
			success: false,
			message: "Authentication failed",
			error: error.message,
		});
	}
});

module.exports = router;
