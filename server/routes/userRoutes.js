const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { sequelize } = require("../config/database");

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
			accessToken,
		} = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
		});

		if (existingUser) {
			await transaction.rollback();
			return res.status(400).json({
				success: false,
				message: "Wallet already registered",
				user: existingUser,
			});
		}

		// Prepare social media array
		const socialMedias = [];
		if (accessToken) {
			socialMedias.push({ platform: "youtube", accessToken });
		}

		// Create new user
		const user = await User.create(
			{
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
			},
			{ transaction }
		);

		await transaction.commit();
		res.json({ success: true, user });
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({ success: false, error: error.message });
	}
});

// ✅ Update User Profile
router.put("/update/:walletAddress", async (req, res) => {
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
		});

		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		// Update user profile fields
		await user.update({
			name,
			email,
			phoneNumber,
			profileImage,
			gender,
			dob,
			bio,
			location,
		});

		res.json({ success: true, message: "Profile updated", user });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
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
	try {
		await User.destroy({ where: {} });
		res.json({ success: true, message: "All users deleted" });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

module.exports = router;
