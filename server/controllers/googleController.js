const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const { errorResponse, successResponse } = require("../utils/responseHelper");

// Initialize OAuth2 client
const client = new OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI
);

class GoogleController {
	// Handle OAuth callback
	async handleCallback(req, res) {
		try {
			const { code } = req.query;
			if (!code) {
				return res.status(400).json({
					success: false,
					error: "Authorization code is required",
				});
			}

			const { tokens } = await client.getToken(code);
			client.setCredentials(tokens);

			// Store tokens in session
			req.session.tokens = tokens;

			res.redirect("/auth/success");
		} catch (error) {
			console.error("OAuth callback error:", error);
			res.status(500).json({
				success: false,
				error: "Failed to handle OAuth callback",
			});
		}
	}

	// Get user info
	async getUserInfo(req, res) {
		try {
			const { tokens } = req.session;

			if (!tokens) {
				return res.status(401).json({
					success: false,
					error: "No Google tokens found",
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
				data: {
					googleId: payload.sub,
					email: payload.email,
					name: payload.name,
					picture: payload.picture,
				},
			});
		} catch (error) {
			console.error("Error getting user info:", error);

			if (error.message.includes("Token expired")) {
				return res.status(401).json({
					success: false,
					error: "Google token expired",
				});
			}

			res.status(500).json({
				success: false,
				error: "Failed to get user info",
			});
		}
	}
}

module.exports = new GoogleController();
