const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

// Create order from cart
router.post("/user/:userId/cart", protect, orderController.createFromCart);

module.exports = router;
