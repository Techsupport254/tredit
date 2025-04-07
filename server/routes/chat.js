const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

// Get or create chat session
router.get(
	"/session/:businessId",
	protect,
	chatController.getOrCreateChatSession
);

// Send message
router.post("/:chatSessionId/message", protect, chatController.sendMessage);

// Get chat history
router.get("/:chatSessionId/history", protect, chatController.getChatHistory);

module.exports = router;
