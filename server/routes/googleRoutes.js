const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");
const { sequelize } = require("../config/database");
const {
	uploadToIPFS,
	saveProfileToBlockchain,
} = require("../utils/blockchainHelper");
const { verifySignature } = require("../utils/web3");

// Initialize OAuth2 client
const client = new OAuth2Client(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI
);

// Google OAuth callback (unprotected - needs to be public for OAuth flow)
router.get("/callback", async (req, res) => {
	const { code } = req.query;
	try {
		const { tokens } = await client.getToken(code);
		const ticket = await client.verifyIdToken({
			idToken: tokens.id_token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();

		// Store tokens in session
		req.session.tokens = tokens;
		req.session.googleId = payload.sub;

		res.redirect(`${process.env.FRONTEND_URL}/auth/google/success`);
	} catch (error) {
		console.error("Google callback error:", error);
		res.redirect(`${process.env.FRONTEND_URL}/auth/google/error`);
	}
});

// Get Google OAuth URL (unprotected - needs to be public for OAuth flow)
router.get("/url", (req, res) => {
	const url = client.generateAuthUrl({
		access_type: "offline",
		scope: [
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/userinfo.email",
		],
	});
	res.json({ url });
});

// Get user info from Google
router.get("/userinfo", protect, async (req, res) => {
	try {
		const { tokens } = req.session;
		if (!tokens) {
			return res.status(401).json({
				success: false,
				message: "No Google tokens found",
			});
		}

		client.setCredentials(tokens);
		const ticket = await client.verifyIdToken({
			idToken: tokens.id_token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();

		res.json({
			success: true,
			userInfo: {
				googleId: payload.sub,
				email: payload.email,
				name: payload.name,
				picture: payload.picture,
			},
		});
	} catch (error) {
		console.error("Error getting user info:", error);
		res.status(500).json({
			success: false,
			message: "Failed to get user info",
			error: error.message,
		});
	}
});

// Revoke Google access
router.post("/revoke", protect, async (req, res) => {
	try {
		const { tokens } = req.session;
		if (!tokens) {
			return res.status(401).json({
				success: false,
				message: "No Google tokens found",
			});
		}

		await client.revokeToken(tokens.access_token);
		req.session.tokens = null;
		req.session.googleId = null;

		res.json({
			success: true,
			message: "Google access revoked successfully",
		});
	} catch (error) {
		console.error("Error revoking access:", error);
		res.status(500).json({
			success: false,
			message: "Failed to revoke access",
			error: error.message,
		});
	}
});

module.exports = router;
