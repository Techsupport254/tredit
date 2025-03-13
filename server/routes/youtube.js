const express = require("express");
const router = express.Router();
const youtubeController = require("../controllers/youtubeController");
const { authenticateToken } = require("../middleware/auth");

// Get YouTube OAuth URL
router.get("/auth-url", authenticateToken, youtubeController.getAuthUrl);

// Handle OAuth callback
router.get("/callback", authenticateToken, youtubeController.handleCallback);

// Disconnect YouTube account
router.delete(
	"/:businessId/disconnect",
	authenticateToken,
	youtubeController.disconnect
);

// Refresh channel data
router.post(
	"/:businessId/refresh",
	authenticateToken,
	youtubeController.refreshChannelData
);

module.exports = router;
