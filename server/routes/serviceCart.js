const express = require("express");
const router = express.Router();
const serviceCartController = require("../controllers/serviceCartController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected
router.use(protect);

// Get or create service cart
router.post("/service/:serviceId", serviceCartController.getOrCreate);

// Update service cart
router.put("/:cartId", serviceCartController.update);

// Add milestone to cart
router.post("/:cartId/milestones", serviceCartController.addMilestone);

// Remove milestone from cart
router.delete(
	"/:cartId/milestones/:milestoneOrder",
	serviceCartController.removeMilestone
);

// Get user's service carts
router.get("/user", serviceCartController.getUserCarts);

// Delete service cart
router.delete("/:cartId", serviceCartController.delete);

module.exports = router;
