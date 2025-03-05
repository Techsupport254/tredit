const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const SocialAccount = require("../models/SocialAccount");
const { OAuth2Client } = require("google-auth-library");
const { google } = require("googleapis");
const { Store } = require("../models/Store");
const User = require("../models/User");

// Initialize OAuth clients
const youtubeClient = new OAuth2Client({
	clientId: process.env.YOUTUBE_CLIENT_ID,
	clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
	redirectUri: `${process.env.BACKEND_URL}/api/social/youtube/callback`,
});

// Initialize YouTube OAuth2 client
const oauth2Client = new google.auth.OAuth2(
	process.env.YOUTUBE_CLIENT_ID,
	process.env.YOUTUBE_CLIENT_SECRET,
	process.env.YOUTUBE_REDIRECT_URI
);

// Initialize YouTube API
const youtube = google.youtube({
	version: "v3",
	auth: oauth2Client,
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
router.get("/youtube/connect", protect, async (req, res) => {
	try {
		const scopes = [
			"https://www.googleapis.com/auth/youtube.readonly",
			"https://www.googleapis.com/auth/youtube.force-ssl",
		];

		const url = oauth2Client.generateAuthUrl({
			access_type: "offline",
			scope: scopes,
			include_granted_scopes: true,
		});

		res.json({ success: true, url });
	} catch (error) {
		console.error("Error generating YouTube auth URL:", error);
		res
			.status(500)
			.json({ success: false, message: "Failed to generate auth URL" });
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
		const { code } = req.body;
		if (!code) {
			return res
				.status(400)
				.json({ success: false, message: "No code provided" });
		}

		// Exchange code for tokens
		const { tokens } = await oauth2Client.getToken(code);
		oauth2Client.setCredentials(tokens);

		// Get channel info
		const response = await youtube.channels.list({
			part: "snippet",
			mine: true,
		});

		const channel = response.data.items[0];
		if (!channel) {
			throw new Error("No YouTube channel found");
		}

		// Save or update social account
		const [socialAccount] = await SocialAccount.upsert({
			userId: req.user.id,
			platform: "youtube",
			platformUserId: channel.id,
			platformUsername: channel.snippet.title,
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
			tokenExpiry: new Date(tokens.expiry_date),
			metadata: {
				channelId: channel.id,
				title: channel.snippet.title,
				description: channel.snippet.description,
				thumbnails: channel.snippet.thumbnails,
			},
			isActive: true,
		});

		// Update store settings
		if (req.user.store) {
			await Store.update(
				{
					settings: {
						...req.user.store.settings,
						enableYouTubeIntegration: true,
					},
				},
				{ where: { id: req.user.store.id } }
			);
		}

		res.json({ success: true, account: socialAccount });
	} catch (error) {
		console.error("Error saving YouTube tokens:", error);
		res.status(500).json({ success: false, message: "Failed to save tokens" });
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

// @desc    Disconnect YouTube
// @route   POST /api/social/youtube/disconnect
// @access  Private
router.post("/youtube/disconnect", protect, async (req, res) => {
	try {
		await SocialAccount.update(
			{ isActive: false },
			{
				where: {
					userId: req.user.id,
					platform: "youtube",
				},
			}
		);

		// Update store settings
		if (req.user.store) {
			await Store.update(
				{
					settings: {
						...req.user.store.settings,
						enableYouTubeIntegration: false,
					},
				},
				{ where: { id: req.user.store.id } }
			);
		}

		res.json({ success: true });
	} catch (error) {
		console.error("Error disconnecting YouTube:", error);
		res.status(500).json({ success: false, message: "Failed to disconnect" });
	}
});

// @desc    Get connected social accounts
// @route   GET /api/social/accounts
// @access  Private
router.get("/accounts", protect, async (req, res) => {
	try {
		const accounts = await SocialAccount.findAll({
			where: {
				userId: req.user.id,
				isActive: true,
			},
		});

		res.json({ success: true, accounts });
	} catch (error) {
		console.error("Error fetching social accounts:", error);
		res
			.status(500)
			.json({ success: false, message: "Failed to fetch accounts" });
	}
});

module.exports = router;
