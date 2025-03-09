const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");

// Business CRUD Operations
router.post("/", businessController.createBusiness);
router.get("/", businessController.getBusinesses);
router.get("/my-businesses", businessController.getMyBusinesses);
router.get("/:businessId", businessController.getBusinessById);
router.put("/:businessId", businessController.updateBusiness);
router.delete("/:businessId", businessController.deleteBusiness);

// Business Team Management
router.post("/:businessId/team", businessController.addTeamMember);
router.get("/:businessId/team", businessController.getTeamMembers);
router.put("/:businessId/team/:memberId", businessController.updateTeamMember);
router.delete(
	"/:businessId/team/:memberId",
	businessController.removeTeamMember
);

// Business Verification
router.post("/:businessId/verify", businessController.requestVerification);
router.get(
	"/:businessId/verification-status",
	businessController.getVerificationStatus
);

// Categories
router.get("/categories/products", businessController.getProductCategories);
router.get("/categories/services", businessController.getServiceCategories);

module.exports = router;
