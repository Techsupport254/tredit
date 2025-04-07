const YouTubeService = require("../services/youtubeService");
const { db } = require("../models");
const { Business } = db;
const { asyncHandler } = require("../utils/errorHandler");

const youtubeController = {
	// Get YouTube OAuth URL
	getAuthUrl: asyncHandler(async (req, res) => {
		const { businessId } = req.query;
		if (!businessId) {
			return res.status(400).json({
				success: false,
				message: "Business ID is required",
			});
		}

		const authUrl = YouTubeService.getAuthUrl(businessId);
		res.json({
			success: true,
			data: { authUrl },
		});
	}),

	// Handle OAuth callback
	handleCallback: asyncHandler(async (req, res) => {
		const { code, state: businessId } = req.query;

		if (!code || !businessId) {
			return res.status(400).json({
				success: false,
				message: "Authorization code and business ID are required",
			});
		}

		try {
			// Get tokens from YouTube
			const tokens = await YouTubeService.getTokens(code);

			// Get channel information
			const channelInfo = await YouTubeService.getChannelInfo(
				tokens.access_token
			);

			// Update business with YouTube data
			const business = await Business.findByPk(businessId);
			if (!business) {
				return res.redirect(
					`${
						process.env.FRONTEND_URL
					}/businesses/${businessId}?youtube=error&message=${encodeURIComponent(
						"Business not found"
					)}`
				);
			}

			// Skip ownership verification in development mode
			if (process.env.NODE_ENV !== "development" && req.user) {
				// Verify business ownership
				if (
					business.ownerAddress?.toLowerCase() !==
					req.user.walletAddress?.toLowerCase()
				) {
					return res.redirect(
						`${
							process.env.FRONTEND_URL
						}/businesses/${businessId}?youtube=error&message=${encodeURIComponent(
							"Not authorized to update this business"
						)}`
					);
				}
			}

			// Format token expiry as ISO string
			const tokenExpiry = tokens.expiry_date
				? new Date(tokens.expiry_date).toISOString()
				: new Date(Date.now() + 3600 * 1000).toISOString(); // Default 1 hour expiry

			// Update social media data
			const socialMedia = {
				...(business.socialMedia || {}),
				youtube: {
					isConnected: true,
					accessToken: tokens.access_token,
					refreshToken: tokens.refresh_token,
					tokenExpiry,
					metadata: channelInfo,
				},
			};

			await business.update({ socialMedia });

			// Redirect to the business page with success message
			res.redirect(
				`${process.env.FRONTEND_URL}/businesses/${businessId}?youtube=connected`
			);
		} catch (error) {
			console.error("YouTube callback error:", error);

			// Handle specific OAuth errors
			let errorMessage = "Failed to connect YouTube account. ";
			if (error.message.includes("invalid_grant")) {
				errorMessage +=
					"Please try connecting again as the authorization has expired.";
			} else if (error.response?.data?.error_description) {
				errorMessage += error.response.data.error_description;
			} else {
				errorMessage += error.message;
			}

			res.redirect(
				`${
					process.env.FRONTEND_URL
				}/businesses/${businessId}?youtube=error&message=${encodeURIComponent(
					errorMessage
				)}`
			);
		}
	}),

	// Disconnect YouTube
	disconnect: asyncHandler(async (req, res) => {
		const { businessId } = req.params;
		const business = await Business.findByPk(businessId);

		if (!business) {
			return res.status(404).json({
				success: false,
				message: "Business not found",
			});
		}

		const socialMedia = {
			...(business.socialMedia || {}),
			youtube: {
				isConnected: false,
				metadata: {},
			},
		};

		await business.update({ socialMedia });

		res.json({
			success: true,
			message: "YouTube account disconnected successfully",
		});
	}),

	// Refresh channel data
	refreshChannelData: asyncHandler(async (req, res) => {
		const { businessId } = req.params;
		const business = await Business.findByPk(businessId);

		if (!business) {
			return res.status(404).json({
				success: false,
				message: "Business not found",
			});
		}

		const youtubeData = business.socialMedia?.youtube;
		if (!youtubeData?.isConnected) {
			return res.status(400).json({
				success: false,
				message: "YouTube account not connected",
			});
		}

		// Check if token is valid
		const isValid = await YouTubeService.validateToken(youtubeData.accessToken);
		let accessToken = youtubeData.accessToken;

		// If token is invalid, refresh it
		if (!isValid && youtubeData.refreshToken) {
			const newTokens = await YouTubeService.refreshAccessToken(
				youtubeData.refreshToken
			);
			accessToken = newTokens.access_token;

			// Update tokens in database
			const socialMedia = {
				...business.socialMedia,
				youtube: {
					...youtubeData,
					accessToken: newTokens.access_token,
					tokenExpiry: newTokens.expiry_date,
				},
			};
			await business.update({ socialMedia });
		}

		// Get updated channel information
		const channelInfo = await YouTubeService.getChannelInfo(accessToken);

		// Update channel metadata
		const socialMedia = {
			...business.socialMedia,
			youtube: {
				...youtubeData,
				metadata: channelInfo,
			},
		};
		await business.update({ socialMedia });

		res.json({
			success: true,
			data: { channelInfo },
		});
	}),
};

module.exports = youtubeController;
