const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const { protect } = require("../middleware/authMiddleware");
const { User, sequelize } = require("../models");
const {
	uploadToIPFS,
	saveProfileToBlockchain,
} = require("../utils/blockchainHelper");
const { verifySignature } = require("../utils/web3");
const {
	successResponse,
	errorResponse,
	ResponseCodes,
} = require("../utils/responseHelper");
const catchAsync = require("../utils/catchAsync");

// Initialize OAuth2 client
const client = new OAuth2Client(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI
);

// Google OAuth callback (unprotected - needs to be public for OAuth flow)
router.get(
	"/callback",
	catchAsync(async (req, res) => {
		const { code } = req.query;

		if (!code) {
			return res.redirect(
				`${
					process.env.FRONTEND_URL
				}/auth/google/error?error=${encodeURIComponent(
					"Authorization code missing"
				)}`
			);
		}

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
			res.redirect(
				`${
					process.env.FRONTEND_URL
				}/auth/google/error?error=${encodeURIComponent(error.message)}`
			);
		}
	})
);

// Get Google OAuth URL (unprotected - needs to be public for OAuth flow)
router.get(
	"/url",
	catchAsync(async (req, res) => {
		try {
			const url = client.generateAuthUrl({
				access_type: "offline",
				scope: [
					"https://www.googleapis.com/auth/userinfo.profile",
					"https://www.googleapis.com/auth/userinfo.email",
				],
			});
			res.json(successResponse({ url }, "OAuth URL generated successfully"));
		} catch (error) {
			res
				.status(500)
				.json(
					errorResponse(
						"Failed to generate OAuth URL",
						ResponseCodes.INTERNAL_ERROR
					)
				);
		}
	})
);

// Get user info from Google
router.get(
	"/userinfo",
	protect,
	catchAsync(async (req, res) => {
		const { tokens } = req.session;

		if (!tokens) {
			return res
				.status(401)
				.json(
					errorResponse("No Google tokens found", ResponseCodes.UNAUTHORIZED)
				);
		}

		try {
			client.setCredentials(tokens);
			const ticket = await client.verifyIdToken({
				idToken: tokens.id_token,
				audience: process.env.GOOGLE_CLIENT_ID,
			});
			const payload = ticket.getPayload();

			res.json(
				successResponse(
					{
						googleId: payload.sub,
						email: payload.email,
						name: payload.name,
						picture: payload.picture,
					},
					"User info retrieved successfully"
				)
			);
		} catch (error) {
			console.error("Error getting user info:", error);

			if (error.message.includes("Token expired")) {
				return res
					.status(401)
					.json(
						errorResponse("Google token expired", ResponseCodes.TOKEN_EXPIRED)
					);
			}

			res
				.status(500)
				.json(
					errorResponse("Failed to get user info", ResponseCodes.INTERNAL_ERROR)
				);
		}
	})
);

// Revoke Google access
router.post(
	"/revoke",
	protect,
	catchAsync(async (req, res) => {
		const { tokens } = req.session;

		if (!tokens) {
			return res
				.status(401)
				.json(
					errorResponse("No Google tokens found", ResponseCodes.UNAUTHORIZED)
				);
		}

		try {
			await client.revokeToken(tokens.access_token);
			req.session.tokens = null;
			req.session.googleId = null;

			res.json(successResponse(null, "Google access revoked successfully"));
		} catch (error) {
			console.error("Error revoking access:", error);

			if (error.message.includes("Token expired")) {
				// If token is expired, we can still clear the session
				req.session.tokens = null;
				req.session.googleId = null;
				return res.json(successResponse(null, "Session cleared successfully"));
			}

			res
				.status(500)
				.json(
					errorResponse("Failed to revoke access", ResponseCodes.INTERNAL_ERROR)
				);
		}
	})
);

// Error handler for this router
router.use((err, req, res, next) => {
	console.error("Google route error:", err);

	// Handle OAuth specific errors
	if (err.name === "OAuth2Error") {
		return res
			.status(401)
			.json(errorResponse(err.message, ResponseCodes.INVALID_TOKEN));
	}

	// Handle token verification errors
	if (err.message.includes("Token verification failed")) {
		return res
			.status(401)
			.json(errorResponse("Invalid token", ResponseCodes.INVALID_TOKEN));
	}

	// Default error response
	res
		.status(500)
		.json(errorResponse("Internal server error", ResponseCodes.INTERNAL_ERROR));
});

module.exports = router;
