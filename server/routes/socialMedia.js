const express = require("express");
const router = express.Router();
const SocialMediaController = require("../controllers/socialMediaController");
const socialMediaValidation = require("../middleware/socialMediaValidator");
const { validateRequest } = require("../middleware/validator");
const { protect } = require("../middleware/authMiddleware");

// Health check endpoint
router.get("/health", (req, res) => {
	res.status(200).json({ status: "ok" });
});

// Protected routes
router.use(protect);

// Create new social media content
router.post(
	"/",
	socialMediaValidation.createContent,
	validateRequest,
	SocialMediaController.createContent
);

// Get content by ID
router.get(
	"/:id",
	socialMediaValidation.getContent,
	validateRequest,
	SocialMediaController.getContent
);

// Get all content for a product
router.get(
	"/product/:productId",
	socialMediaValidation.getProductContent,
	validateRequest,
	SocialMediaController.getProductContent
);

// Get all content for a service
router.get(
	"/service/:serviceId",
	socialMediaValidation.getServiceContent,
	validateRequest,
	SocialMediaController.getServiceContent
);

// Get content by platform
router.get(
	"/platform/:platform",
	socialMediaValidation.getContentByPlatform,
	validateRequest,
	SocialMediaController.getContentByPlatform
);

// Update content
router.put(
	"/:id",
	socialMediaValidation.updateContent,
	validateRequest,
	SocialMediaController.updateContent
);

// Delete content
router.delete(
	"/:id",
	socialMediaValidation.getContent,
	validateRequest,
	SocialMediaController.deleteContent
);

// Schedule content
router.post(
	"/:id/schedule",
	socialMediaValidation.scheduleContent,
	validateRequest,
	SocialMediaController.scheduleContent
);

// Get scheduled content
router.get("/scheduled", SocialMediaController.getScheduledContent);

// Update metrics
router.put(
	"/:id/metrics",
	socialMediaValidation.updateMetrics,
	validateRequest,
	SocialMediaController.updateMetrics
);

// Get analytics
router.get(
	"/analytics",
	socialMediaValidation.getAnalytics,
	validateRequest,
	SocialMediaController.getAnalytics
);

// Social media routes
router.get("/accounts", SocialMediaController.getAccounts);
router.post("/accounts/connect", SocialMediaController.connectAccount);
router.delete("/accounts/:accountId", SocialMediaController.disconnectAccount);
router.get("/accounts/:accountId/posts", SocialMediaController.getPosts);
router.post("/accounts/:accountId/posts", SocialMediaController.createPost);

module.exports = router;
