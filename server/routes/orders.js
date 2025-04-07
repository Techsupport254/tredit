const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { checkBusinessOwnership } = require("../middleware/business");
const { validateAddress } = require("../utils/orderUtils");
const ProductCart = require("../models/ProductCart");

// Middleware to validate order data
const validateOrderData = (req, res, next) => {
	try {
		const { items, shippingAddress, billingAddress } = req.body;

		// Validate items
		if (!items || !Array.isArray(items) || items.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Order must contain at least one item",
			});
		}

		// Validate each item
		for (const item of items) {
			if (!item.productId || !item.quantity || item.quantity < 1) {
				return res.status(400).json({
					success: false,
					message: "Invalid item data",
				});
			}
		}

		// Validate addresses as strings
		if (
			!shippingAddress ||
			typeof shippingAddress !== "string" ||
			shippingAddress.trim() === ""
		) {
			return res.status(400).json({
				success: false,
				message: "Shipping address must be a non-empty string",
			});
		}

		if (shippingAddress.length < 10) {
			return res.status(400).json({
				success: false,
				message: "Shipping address is too short",
			});
		}

		if (billingAddress) {
			if (typeof billingAddress !== "string" || billingAddress.trim() === "") {
				return res.status(400).json({
					success: false,
					message: "Billing address must be a non-empty string if provided",
				});
			}

			if (billingAddress.length < 10) {
				return res.status(400).json({
					success: false,
					message: "Billing address is too short",
				});
			}
		}

		next();
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error.message,
		});
	}
};

// Create order from cart
router.post(
	"/create-from-cart/:cartId",
	protect,
	async (req, res, next) => {
		try {
			const { cartId } = req.params;
			const cart = await ProductCart.findByPk(cartId);

			if (!cart) {
				return res.status(404).json({
					success: false,
					message: "Cart not found",
				});
			}

			if (cart.status !== "active") {
				return res.status(400).json({
					success: false,
					message: "Cart is not active",
				});
			}

			if (!cart.shippingAddress) {
				return res.status(400).json({
					success: false,
					message: "Shipping address is required",
				});
			}

			next();
		} catch (error) {
			res.status(500).json({
				success: false,
				message: error.message,
			});
		}
	},
	orderController.createFromCart
);

// Get user's orders
router.get("/user/:userId", protect, orderController.getUserOrders);

// Get order details
router.get("/:orderId", protect, orderController.getOrderDetails);

// Get order timeline
router.get("/:orderId/timeline", protect, orderController.getOrderTimeline);

// Update order status
router.put("/:orderId/status", protect, orderController.updateStatus);

// Cancel order
router.post("/:orderId/cancel", protect, orderController.cancel);

// Get all orders for a business
router.get(
	"/business/:businessId",
	protect,
	checkBusinessOwnership,
	orderController.getAllByBusiness
);

module.exports = router;
