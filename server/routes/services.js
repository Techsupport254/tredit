const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { protect } = require("../middleware/authMiddleware");
const {
	checkBusinessOwnership,
	validateBusinessType,
} = require("../middleware/business");

// Create a new service
router.post(
	"/business/:businessId",
	protect,
	checkBusinessOwnership,
	validateBusinessType,
	serviceController.create
);

// Get all services for a business
router.get(
	"/business/:businessId",
	protect,
	serviceController.getAllByBusiness
);

// Get a single service by ID
router.get("/:serviceId", protect, serviceController.getOne);

// Update a service (PATCH)
router.patch(
	"/business/:businessId/:serviceId",
	protect,
	checkBusinessOwnership,
	serviceController.update
);

// Update a service (PUT)
router.put(
	"/business/:businessId/:serviceId",
	protect,
	checkBusinessOwnership,
	serviceController.update
);

// Delete a service
router.delete(
	"/business/:businessId/:serviceId",
	protect,
	checkBusinessOwnership,
	serviceController.delete
);

module.exports = router;
