const express = require("express");
const router = express.Router();
const disputeController = require("../controllers/disputeController");
const { protect } = require("../middleware/authMiddleware");

// Create a new dispute
router.post("/order/:orderId", protect, disputeController.create);

// Get dispute by order ID
router.get("/order/:orderId", protect, disputeController.getDisputeByOrder);

// Get dispute details
router.get("/:disputeId", protect, disputeController.getDispute);

// Resolve dispute
router.put("/:disputeId/resolve", protect, disputeController.resolve);

// Close dispute
router.put("/:disputeId/close", protect, disputeController.close);

// List disputes for a business
router.get(
	"/business/:businessId",
	protect,
	disputeController.listBusinessDisputes
);

// List disputes for a user
router.get("/user/list", protect, disputeController.listUserDisputes);

module.exports = router;
