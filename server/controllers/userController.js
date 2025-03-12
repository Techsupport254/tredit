const { User } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../models");
const { verifySignature } = require("../utils/web3");
const { generateToken } = require("../utils/jwt");
const {
	uploadToIPFS,
	createOrUpdateUserProfile,
	getUserProfile: getUserProfileFromChain,
} = require("../utils/blockchainHelper");

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
		} = req.body;

		// Validate required fields
		if (!walletAddress) {
			return res.status(400).json({
				success: false,
				message: "Wallet address is required",
			});
		}

		// Check if user exists
		const existingUser = await User.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
			transaction,
		});

		if (existingUser) {
			await transaction.rollback();
			return res.status(400).json({
				success: false,
				message: "User already exists",
				user: existingUser,
			});
		}

		// Prepare user data for IPFS
		const userData = {
			walletAddress: walletAddress.toLowerCase(),
			name,
			email,
			profileImage,
			bio,
			gender,
			dob,
			location,
			phoneNumber,
			preferences: preferences || {
				theme: "light",
				notifications: {
					email: true,
					push: true,
				},
				language: "en",
			},
			timestamp: new Date().toISOString(),
		};

		try {
			// Upload to IPFS first
			const { ipfsCid, ipfsUrl } = await uploadToIPFS(userData);

			// Save to blockchain using the IPFS URL
			const blockchainTx = await createOrUpdateUserProfile(
				walletAddress.toLowerCase(),
				ipfsUrl
			);

			// Create user in database
			const user = await User.create(
				{
					walletAddress: walletAddress.toLowerCase(),
					name,
					email,
					profileImage,
					bio,
					gender,
					dob,
					location,
					phoneNumber,
					preferences: userData.preferences,
					role: "user",
					isVerified: false,
					ipfsCid,
					ipfsUrl,
					metadata: {
						lastIPFSUpdate: new Date().toISOString(),
						blockchainTxHash: blockchainTx.hash,
					},
				},
				{ transaction }
			);

			await transaction.commit();

			// Generate auth token
			const token = generateToken(user.walletAddress);

			res.status(201).json({
				success: true,
				message: "User created successfully",
				user,
				token,
				ipfs: {
					cid: ipfsCid,
					url: ipfsUrl,
				},
				blockchain: {
					transactionHash: blockchainTx.hash,
				},
			});
		} catch (error) {
			// If any of IPFS or blockchain operations fail, rollback the transaction
			await transaction.rollback();
			throw new Error(`Failed to create user: ${error.message}`);
		}
	} catch (error) {
		await transaction.rollback();
		console.error("User creation error:", error);

		// Handle specific errors
		if (error.name === "SequelizeUniqueConstraintError") {
			return res.status(400).json({
				success: false,
				message: "Email already in use",
				details: ["This email address is already registered"],
			});
		}

		res.status(500).json({
			success: false,
			message: "Failed to create user",
			error: error.message,
		});
	}
};

// Get user profile
const getUserProfile = async (req, res) => {
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

		// Get blockchain data
		const blockchainData = await getUserProfileFromChain(
			walletAddress.toLowerCase()
		);

		res.json({
			success: true,
			user: {
				...user.toJSON(),
				blockchain: blockchainData,
			},
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
	const transaction = await sequelize.transaction();
	try {
		const { walletAddress } = req.params;
		const { name, email, profileImage, bio, preferences } = req.body;

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
		const updatedData = {
			...user.toJSON(),
			name,
			email,
			profileImage,
			bio,
			preferences: {
				...user.preferences,
				...preferences,
			},
			updatedAt: new Date().toISOString(),
		};

		// Upload updated data to IPFS
		const { ipfsCid, ipfsUrl } = await uploadToIPFS(updatedData);

		// Update on blockchain using the IPFS URL
		const blockchainTx = await createOrUpdateUserProfile(
			walletAddress.toLowerCase(),
			ipfsUrl
		);

		// Update user in database
		await user.update(
			{
				name,
				email,
				profileImage,
				bio,
				preferences: updatedData.preferences,
				ipfsCid,
				ipfsUrl,
				metadata: {
					...user.metadata,
					lastIPFSUpdate: new Date().toISOString(),
					blockchainTxHash: blockchainTx.hash,
				},
			},
			{ transaction }
		);

		await transaction.commit();

		res.json({
			success: true,
			message: "Profile updated successfully",
			user: {
				...user.toJSON(),
				ipfs: {
					cid: ipfsCid,
					url: ipfsUrl,
				},
				blockchain: {
					transactionHash: blockchainTx.hash,
				},
			},
		});
	} catch (error) {
		await transaction.rollback();
		console.error("Profile update error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update profile",
			error: error.message,
		});
	}
};

module.exports = {
	createUser,
	getUserProfile,
	updateUserProfile,
};
