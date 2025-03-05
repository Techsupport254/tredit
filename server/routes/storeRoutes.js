const express = require("express");
const router = express.Router();
const Store = require("../models/Store");
const User = require("../models/User");
const { sequelize } = require("../config/database");
const { saveProfileToBlockchain } = require("../utils/blockchainHelper");

// Create Store
router.post("/", async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		const {
			userId,
			name,
			description,
			category,
			logo,
			settings,
			socialMedias,
			youtubeChannel,
		} = req.body;

		// Find user and their existing stores
		const user = await User.findOne({
			where: { id: userId },
			include: [{ model: Store, as: "stores" }],
		});

		if (!user) {
			await transaction.rollback();
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Create new store
		const store = await Store.create(
			{
				userId: user.id,
				name,
				description,
				category,
				logo,
				settings: settings || {
					enableYouTubeIntegration: !!youtubeChannel,
					enableSocialSharing: true,
					allowComments: true,
				},
				socialMedias: socialMedias || [],
				youtubeChannel,
			},
			{ transaction }
		);

		// Update blockchain data with new store
		const blockchainData = {
			walletAddress: user.walletAddress,
			name: user.name,
			email: user.email,
			profileImage: user.profileImage,
			stores: [...user.stores.map((s) => s.id), store.id],
			stores: [...user.Stores.map((s) => s.id), store.id],
			updatedAt: new Date().toISOString(),
		};

		const { ipfsUrl } = await saveProfileToBlockchain(blockchainData);
		await user.update({ ipfsURI: ipfsUrl }, { transaction });

		await transaction.commit();

		// Return updated store with user info
		const updatedStore = await Store.findOne({
			where: { id: store.id },
			include: [{ model: User }],
		});

		res.json({
			success: true,
			store: updatedStore,
			message: "Store created successfully",
		});
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// Get All Stores for User
router.get("/user/:userId", async (req, res) => {
	try {
		const { userId } = req.params;
		const stores = await Store.findAll({
			where: { userId },
			include: [{ model: User }],
		});
		res.json({ success: true, stores });
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// Get All Stores (with pagination)
router.get("/", async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const offset = (page - 1) * limit;

		const { count, rows: stores } = await Store.findAndCountAll({
			limit: parseInt(limit),
			offset: parseInt(offset),
			include: [
				{
					model: User,
					as: "user",
					attributes: ["id", "name", "email", "profileImage"],
				},
			],
			order: [["createdAt", "DESC"]],
		});

		res.json({
			success: true,
			stores,
			totalPages: Math.ceil(count / limit),
			currentPage: parseInt(page),
			totalStores: count,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// Get store by ID
router.get("/:id", async (req, res) => {
	try {
		const store = await Store.findByPk(req.params.id, {
			include: [
				{
					model: User,
					as: "user",
					attributes: ["id", "name", "email", "profileImage"],
				},
			],
		});

		if (!store) {
			return res
				.status(404)
				.json({ success: false, message: "Store not found" });
		}

		res.json({ success: true, store });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

// Update store
router.put("/:id", async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		const { name, description, category, logo, settings, socialMedias } =
			req.body;
		const store = await Store.findByPk(req.params.id);

		if (!store) {
			await transaction.rollback();
			return res
				.status(404)
				.json({ success: false, message: "Store not found" });
		}

		await store.update(
			{
				name,
				description,
				category,
				logo,
				settings,
				socialMedias,
			},
			{ transaction }
		);

		await transaction.commit();

		// Fetch updated store with user details
		const updatedStore = await Store.findByPk(store.id, {
			include: [
				{
					model: User,
					as: "user",
					attributes: ["id", "name", "email", "profileImage"],
				},
			],
		});

		res.json({ success: true, store: updatedStore });
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({ success: false, error: error.message });
	}
});

// Delete store
router.delete("/:id", async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		const store = await Store.findByPk(req.params.id);

		if (!store) {
			await transaction.rollback();
			return res
				.status(404)
				.json({ success: false, message: "Store not found" });
		}

		await store.destroy({ transaction });
		await transaction.commit();

		res.json({ success: true, message: "Store deleted successfully" });
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({ success: false, error: error.message });
	}
});

// Test route to create sample data
router.post("/test-data", async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		// Create test user
		const user = await User.create(
			{
				walletAddress: "0x1234567890123456789012345678901234567890",
				role: "vendor",
				name: "Test Vendor",
				email: "test@example.com",
				profileImage: "https://example.com/profile.jpg",
			},
			{ transaction }
		);

		// Create test store
		const store = await Store.create(
			{
				userId: user.id,
				name: "Test Digital Store",
				description: "This is a test store selling digital products",
				category: "digital",
				logo: "https://example.com/store-logo.png",
				settings: {
					enableYouTubeIntegration: false,
					enableSocialSharing: true,
					allowComments: true,
				},
				socialMedias: [],
			},
			{ transaction }
		);

		await transaction.commit();

		res.json({
			success: true,
			message: "Test data created successfully",
			user,
			store,
		});
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

module.exports = router;
