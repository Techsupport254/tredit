const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");

// Initialize OAuth client
const oauth2Client = new google.auth.OAuth2(
	process.env.YOUTUBE_CLIENT_ID,
	process.env.YOUTUBE_CLIENT_SECRET,
	`${process.env.BACKEND_URL}/api/social/youtube/callback`
);

// Initialize YouTube API
const youtube = google.youtube({ version: "v3", auth: oauth2Client });

/**
 * Refresh token if expired
 * @param {Object} socialAccount - The social account record from database
 * @returns {Promise<string>} - Returns the valid access token
 */
async function refreshTokenIfNeeded(socialAccount) {
	if (
		!socialAccount.tokenExpiry ||
		new Date(socialAccount.tokenExpiry) <= new Date()
	) {
		try {
			oauth2Client.setCredentials({
				refresh_token: socialAccount.refreshToken,
			});

			const { credentials } = await oauth2Client.refreshAccessToken();

			// Update the social account with new tokens
			await socialAccount.update({
				accessToken: credentials.access_token,
				tokenExpiry: new Date(credentials.expiry_date),
			});

			return credentials.access_token;
		} catch (error) {
			console.error("Error refreshing token:", error);
			throw new Error("Failed to refresh YouTube token");
		}
	}
	return socialAccount.accessToken;
}

/**
 * Get channel details
 * @param {Object} socialAccount - The social account record from database
 * @returns {Promise<Object>} - Returns channel details
 */
async function getChannelDetails(socialAccount) {
	const accessToken = await refreshTokenIfNeeded(socialAccount);
	oauth2Client.setCredentials({ access_token: accessToken });

	const response = await youtube.channels.list({
		part: "snippet,statistics,contentDetails",
		mine: true,
	});

	if (!response.data.items || response.data.items.length === 0) {
		throw new Error("No channel found");
	}

	return response.data.items[0];
}

/**
 * Get recent videos from channel
 * @param {Object} socialAccount - The social account record from database
 * @param {number} maxResults - Maximum number of videos to return
 * @returns {Promise<Array>} - Returns array of video details
 */
async function getRecentVideos(socialAccount, maxResults = 50) {
	const accessToken = await refreshTokenIfNeeded(socialAccount);
	oauth2Client.setCredentials({ access_token: accessToken });

	const response = await youtube.search.list({
		part: "snippet",
		channelId: socialAccount.metadata.channelId,
		order: "date",
		type: "video",
		maxResults: Math.min(maxResults, 50), // YouTube API limit
	});

	return response.data.items;
}

/**
 * Get specific video details
 * @param {Object} socialAccount - The social account record from database
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Returns video details
 */
async function getVideoDetails(socialAccount, videoId) {
	const accessToken = await refreshTokenIfNeeded(socialAccount);
	oauth2Client.setCredentials({ access_token: accessToken });

	const response = await youtube.videos.list({
		part: "snippet,statistics,contentDetails",
		id: videoId,
	});

	if (!response.data.items || response.data.items.length === 0) {
		throw new Error("Video not found");
	}

	return response.data.items[0];
}

/**
 * Generate OAuth URL for YouTube authentication
 * @returns {string} - Returns the OAuth URL
 */
function generateAuthUrl() {
	const scopes = [
		"https://www.googleapis.com/auth/youtube.readonly",
		"https://www.googleapis.com/auth/youtube.force-ssl",
	];

	return oauth2Client.generateAuthUrl({
		access_type: "offline",
		scope: scopes,
		include_granted_scopes: true,
	});
}

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<Object>} - Returns tokens object
 */
async function getTokensFromCode(code) {
	const { tokens } = await oauth2Client.getToken(code);
	return tokens;
}

module.exports = {
	getChannelDetails,
	getRecentVideos,
	getVideoDetails,
	generateAuthUrl,
	getTokensFromCode,
	refreshTokenIfNeeded,
};
