const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Purchase Product (MetaMask signs transaction)
router.post("/purchase", async (req, res) => {
	try {
		const { productId, buyerAddress, transactionHash } = req.body;
		const product = await Product.findByPk(productId);

		if (!product)
			return res
				.status(404)
				.json({ success: false, message: "Product not found" });

		// Store transaction details in the database
		await product.update({ available: false }); // Mark product as sold

		res.json({
			success: true,
			message: "Purchase recorded successfully!",
			transactionHash,
		});
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

module.exports = router;
