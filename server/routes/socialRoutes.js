const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const SocialAccount = require("../models/SocialAccount");
const { OAuth2Client } = require("google-auth-library");
const { google } = require("googleapis");

// Initialize OAuth clients
const youtubeClient = new OAuth2Client({
	clientId: process.env.YOUTUBE_CLIENT_ID,
	clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
	redirectUri: `${process.env.BACKEND_URL}/api/social/youtube/callback`,
});

// @desc    Get all connected social accounts
// @route   GET /api/social
// @access  Private
router.get("/", protect, async (req, res) => {
	try {
		const accounts = await SocialAccount.findAll({
			where: { userId: req.user.id, isActive: true },
		});
		res.json(accounts);
	} catch (error) {
		console.error("Error fetching social accounts:", error);
		res.status(500).json({ message: "Error fetching social accounts" });
	}
});

// @desc    Connect YouTube account
// @route   GET /api/social/youtube/connect
// @access  Private
router.get("/youtube/connect", protect, (req, res) => {
	try {
		const authUrl = youtubeClient.generateAuthUrl({
			access_type: "offline",
			scope: [
				"https://www.googleapis.com/auth/youtube.readonly",
				"https://www.googleapis.com/auth/youtube.force-ssl",
			],
		});
		res.json({ url: authUrl });
	} catch (error) {
		console.error("Error generating YouTube auth URL:", error);
		res.status(500).json({ message: "Error generating YouTube auth URL" });
	}
});

// @desc    YouTube OAuth callback
// @route   GET /api/social/youtube/callback
// @access  Public
router.get("/youtube/callback", async (req, res) => {
	try {
		const { code } = req.query;
		const { tokens } = await youtubeClient.getToken(code);

		// Store tokens in session temporarily
		req.session.youtubeTokens = tokens;

		res.redirect(`${process.env.FRONTEND_URL}/settings?youtube=success`);
	} catch (error) {
		console.error("Error in YouTube callback:", error);
		res.redirect(`${process.env.FRONTEND_URL}/settings?youtube=error`);
	}
});

// @desc    Save YouTube tokens
// @route   POST /api/social/youtube/save-tokens
// @access  Private
router.post("/youtube/save-tokens", protect, async (req, res) => {
	try {
		if (!req.session.youtubeTokens) {
			return res
				.status(400)
				.json({ message: "No YouTube tokens found in session" });
		}

		const tokens = req.session.youtubeTokens;

		// Get YouTube channel info
		youtubeClient.setCredentials(tokens);
		const youtube = google.youtube("v3");
		const response = await youtube.channels.list({
			part: "snippet",
			mine: true,
		});

		const channelData = response.data.items[0];

		// Save or update social account
		await SocialAccount.upsert({
			userId: req.user.id,
			platform: "YouTube",
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
			platformUserId: channelData.id,
			username: channelData.snippet.title,
			profileUrl: `https://youtube.com/channel/${channelData.id}`,
			isActive: true,
		});

		// Clear session tokens
		delete req.session.youtubeTokens;

		res.json({ message: "YouTube account connected successfully" });
	} catch (error) {
		console.error("Error saving YouTube tokens:", error);
		res.status(500).json({ message: "Error saving YouTube tokens" });
	}
});

// @desc    Disconnect social account
// @route   DELETE /api/social/:platform
// @access  Private
router.delete("/:platform", protect, async (req, res) => {
	try {
		const { platform } = req.params;
		await SocialAccount.update(
			{ isActive: false },
			{
				where: {
					userId: req.user.id,
					platform: platform,
				},
			}
		);
		res.json({ message: `${platform} account disconnected successfully` });
	} catch (error) {
		console.error("Error disconnecting account:", error);
		res.status(500).json({ message: "Error disconnecting account" });
	}
});

// @desc    Sync social account stats
// @route   POST /api/social/:platform/sync
// @access  Private
router.post("/:platform/sync", protect, async (req, res) => {
	try {
		const { platform } = req.params;
		const account = await SocialAccount.findOne({
			where: {
				userId: req.user.id,
				platform: platform,
				isActive: true,
			},
		});

		if (!account) {
			return res.status(404).json({ message: "Social account not found" });
		}

		// Implement platform-specific stat syncing here
		// For now, just update lastSynced
		await account.update({
			lastSynced: new Date(),
		});

		res.json({ message: "Stats synced successfully" });
	} catch (error) {
		console.error("Error syncing stats:", error);
		res.status(500).json({ message: "Error syncing stats" });
	}
});

module.exports = router;
