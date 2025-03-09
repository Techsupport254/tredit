const { OAuth2Client } = require("google-auth-library");
const { google } = require("googleapis");
const SocialAccount = require("../models/SocialAccount");

const oauth2Client = new OAuth2Client(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI
);

// Initialize YouTube API
const youtube = google.youtube({ version: "v3", auth: oauth2Client });

/**
 * Get a valid access token for a user's YouTube account
 * @param {string} walletAddress - The user's wallet address
 * @returns {Promise<{accessToken: string, youtube: any}>} The valid access token and YouTube API client
 */
async function getYouTubeToken(walletAddress) {
	const account = await SocialAccount.findOne({
		where: {
			userAddress: walletAddress.toLowerCase(),
			platform: "youtube",
			isActive: true,
		},
	});

	if (!account) {
		throw new Error("No YouTube account found for this user");
	}

	// Check if token is expired or will expire in the next 5 minutes
	const now = new Date();
	const tokenExpiry = new Date(account.tokenExpiry);
	const isExpired = tokenExpiry <= new Date(now.getTime() + 5 * 60000);

	let accessToken = account.accessToken;

	if (isExpired && account.refreshToken) {
		try {
			// Set credentials to use refresh token
			oauth2Client.setCredentials({
				refresh_token: account.refreshToken,
			});

			// Refresh the access token
			const { credentials } = await oauth2Client.refreshAccessToken();

			// Update the account with new tokens
			await account.update({
				accessToken: credentials.access_token,
				tokenExpiry: new Date(credentials.expiry_date),
			});

			accessToken = credentials.access_token;
		} catch (error) {
			console.error("Error refreshing token:", error);
			throw new Error("Failed to refresh YouTube access token");
		}
	}

	// Set up YouTube client with the token
	oauth2Client.setCredentials({ access_token: accessToken });
	const youtubeClient = google.youtube({ version: "v3", auth: oauth2Client });

	return {
		accessToken,
		youtube: youtubeClient,
	};
}

/**
 * Example function to get channel info using stored token
 * @param {string} walletAddress - The user's wallet address
 */
async function getChannelInfo(walletAddress) {
	const { youtube } = await getYouTubeToken(walletAddress);

	const response = await youtube.channels.list({
		part: "snippet,statistics,contentDetails",
		mine: true,
	});

	return response.data.items[0];
}

module.exports = {
	getYouTubeToken,
	getChannelInfo,
};
