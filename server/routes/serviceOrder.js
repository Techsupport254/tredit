const express = require("express");
const router = express.Router();
const serviceOrderController = require("../controllers/serviceOrderController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected
router.use(protect);

// Create service order from cart
router.post("/cart/:cartId", serviceOrderController.create);

// Get all orders for a business
router.get("/business/:businessId", serviceOrderController.getAllByBusiness);

// Get all orders for a user
router.get("/user", serviceOrderController.getAllByUser);

// Get single order
router.get("/:orderId", serviceOrderController.getOne);

// Update milestone status
router.put(
	"/:orderId/milestones/:milestoneOrder/status",
	serviceOrderController.updateMilestoneStatus
);

// Update order status
router.put("/:orderId/status", serviceOrderController.updateStatus);

// Add payment to order
router.post("/:orderId/payments", serviceOrderController.addPayment);

module.exports = router;
