const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const productCartController = require("../controllers/cartController");

// Get user's product cart
router.get("/", protect, productCartController.getCart);

// Add product to cart
router.post("/items", protect, productCartController.addItemToCart);

// Update product cart item quantity
router.put(
	"/items/:itemId",
	protect,
	productCartController.updateCartItemQuantity
);

// Remove product from cart
router.delete(
	"/items/:itemId",
	protect,
	productCartController.removeItemFromCart
);

// Update cart
router.put("/:cartId", protect, productCartController.updateCart);

// Update shipping address
router.put(
	"/shipping-address",
	protect,
	productCartController.updateShippingAddress
);

// Clear product cart
router.delete("/", protect, productCartController.clearCart);

// Apply coupon to product cart
router.post("/coupon", protect, productCartController.applyCoupon);

module.exports = router;
