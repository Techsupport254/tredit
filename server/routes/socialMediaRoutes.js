const express = require("express");
const router = express.Router();
const SocialMediaController = require("../controllers/socialMediaController");
const { protect } = require("../middleware/authMiddleware");

// Health check
router.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// Protected routes
router.use(protect);

// Content management routes
router.post("/content", SocialMediaController.createContent);
router.get("/content/:id", SocialMediaController.getContent);
router.get(
	"/product/:productId/content",
	SocialMediaController.getProductContent
);
router.get(
	"/service/:serviceId/content",
	SocialMediaController.getServiceContent
);
router.get(
	"/platform/:platform/content",
	SocialMediaController.getContentByPlatform
);
router.put("/content/:id", SocialMediaController.updateContent);
router.delete("/content/:id", SocialMediaController.deleteContent);

// Scheduling routes
router.post("/content/:id/schedule", SocialMediaController.scheduleContent);
router.get("/scheduled", SocialMediaController.getScheduledContent);

// Analytics routes
router.put("/content/:id/metrics", SocialMediaController.updateMetrics);
router.get("/analytics", SocialMediaController.getAnalytics);

module.exports = router;
