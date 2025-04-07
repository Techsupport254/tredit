const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const youtubeController = require("../controllers/youtubeController");

// Get YouTube auth URL
router.get("/auth-url", protect, youtubeController.getAuthUrl);

// Handle OAuth callback
router.get("/callback", youtubeController.handleCallback);

// Disconnect YouTube account
router.delete("/:businessId/disconnect", protect, youtubeController.disconnect);

// Refresh channel data
router.post(
	"/:businessId/refresh",
	protect,
	youtubeController.refreshChannelData
);

// Temporary placeholder route
router.get("/", (req, res) => {
	res.json({ message: "YouTube routes are under construction" });
});

module.exports = router;
