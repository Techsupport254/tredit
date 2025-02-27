const express = require("express");
const router = express.Router();
const Store = require("../models/Store");

// Register Store
router.post("/register", async (req, res) => {
	try {
		const { ownerAddress, storeData } = req.body;
		const store = await Store.create({ ownerAddress, storeData });
		res.json({ success: true, store });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

// Get All Stores
router.get("/", async (req, res) => {
	const stores = await Store.findAll();
	res.json(stores);
});

module.exports = router;
