const { google } = require("googleapis");
const { OAuth2 } = google.auth;

class YouTubeService {
	constructor() {
		// Initialize with the fixed redirect URI
		this.oauth2Client = new OAuth2(
			process.env.YOUTUBE_CLIENT_ID,
			process.env.YOUTUBE_CLIENT_SECRET,
			process.env.YOUTUBE_REDIRECT_URI
		);

		this.youtube = google.youtube("v3");
	}

	getAuthUrl(businessId) {
		return this.oauth2Client.generateAuthUrl({
			access_type: "offline",
			scope: [
				"https://www.googleapis.com/auth/youtube",
				"https://www.googleapis.com/auth/youtube.upload",
				"https://www.googleapis.com/auth/youtube.force-ssl",
				"https://www.googleapis.com/auth/youtube.readonly",
				"https://www.googleapis.com/auth/youtube.channel-memberships.creator",
				"https://www.googleapis.com/auth/youtube.download",
			],
			state: businessId,
			include_granted_scopes: true,
			prompt: "consent",
		});
	}

	async getTokens(code) {
		try {
			const { tokens } = await this.oauth2Client.getToken(code);

			// Validate the tokens
			if (!tokens.access_token) {
				throw new Error("Failed to obtain access token");
			}

			// Set the credentials immediately
			this.oauth2Client.setCredentials(tokens);

			return tokens;
		} catch (error) {
			console.error("Error getting YouTube tokens:", error);
			if (error.message.includes("invalid_grant")) {
				throw new Error("Authorization expired. Please try connecting again.");
			}
			throw error;
		}
	}

	async getChannelInfo(accessToken) {
		this.oauth2Client.setCredentials({ access_token: accessToken });

		const response = await this.youtube.channels.list({
			auth: this.oauth2Client,
			part: "snippet,statistics,brandingSettings",
			mine: true,
		});

		const channel = response.data.items[0];
		return {
			channelId: channel.id,
			channelName: channel.snippet.title,
			channelUrl: `https://youtube.com/channel/${channel.id}`,
			subscriberCount: parseInt(channel.statistics.subscriberCount),
			videoCount: parseInt(channel.statistics.videoCount),
			viewCount: parseInt(channel.statistics.viewCount),
			isVerified: false, // YouTube API doesn't provide verification status
			customUrl: channel.snippet.customUrl || null,
			description: channel.snippet.description,
			publishedAt: channel.snippet.publishedAt,
			thumbnails: channel.snippet.thumbnails,
			country: channel.snippet.country,
			defaultLanguage: channel.snippet.defaultLanguage,
			bannerImageUrl: channel.brandingSettings?.image?.bannerExternalUrl,
			keywords: channel.brandingSettings?.channel?.keywords,
			featuredChannelsUrls:
				channel.brandingSettings?.channel?.featuredChannelsUrls,
		};
	}

	async refreshAccessToken(refreshToken) {
		this.oauth2Client.setCredentials({
			refresh_token: refreshToken,
		});

		const { credentials } = await this.oauth2Client.refreshAccessToken();
		return credentials;
	}

	async validateToken(accessToken) {
		try {
			this.oauth2Client.setCredentials({ access_token: accessToken });
			await this.youtube.channels.list({
				auth: this.oauth2Client,
				part: "snippet",
				mine: true,
			});
			return true;
		} catch (error) {
			return false;
		}
	}
}

module.exports = new YouTubeService();
