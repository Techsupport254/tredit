import { google } from "googleapis";
import config from "@/config";
import { Readable } from "stream";
import prisma from "@/lib/prisma";

export class YouTubeService {
	private youtube: any;
	private oauth2Client: any;

	constructor(refreshToken: string) {
		this.oauth2Client = new google.auth.OAuth2(
			config.youtube.clientId,
			config.youtube.clientSecret,
			config.youtube.redirectUri
		);

		this.oauth2Client.setCredentials({
			refresh_token: refreshToken,
		});

		this.youtube = google.youtube({
			version: "v3",
			auth: this.oauth2Client,
		});
	}

	private async refreshTokenIfNeeded() {
		try {
			const { credentials } = await this.oauth2Client.refreshAccessToken();
			this.oauth2Client.setCredentials(credentials);

			// Update the token in the database
			await prisma.socialMediaConnection.updateMany({
				where: {
					platform: "YOUTUBE",
					connected: true,
				},
				data: {
					accessToken: credentials.access_token,
					expiresAt: new Date(
						Date.now() + (credentials.expiry_date || 3600000)
					),
				},
			});

			return credentials;
		} catch (error) {
			console.error("Error refreshing YouTube token:", error);
			throw new Error("Failed to refresh YouTube token");
		}
	}

	async uploadVideo(
		videoFile: Blob,
		metadata: {
			title: string;
			description: string;
			tags?: string[];
			categoryId?: string;
			privacyStatus?: "private" | "unlisted" | "public";
		}
	): Promise<{ videoId: string; videoUrl: string }> {
		try {
			// Refresh token if needed
			await this.refreshTokenIfNeeded();

			// Convert Blob to Buffer
			const buffer = Buffer.from(await videoFile.arrayBuffer());

			// Create a readable stream from the buffer
			const stream = new Readable();
			stream.push(buffer);
			stream.push(null);

			// Upload video
			const response = await this.youtube.videos.insert({
				part: "snippet,status",
				requestBody: {
					snippet: {
						title: metadata.title,
						description: metadata.description,
						tags: metadata.tags || [],
						categoryId: metadata.categoryId || "22", // Default to "People & Blogs"
					},
					status: {
						privacyStatus: metadata.privacyStatus || "private",
					},
				},
				media: {
					body: stream,
				},
			});

			const videoId = response.data.id;
			const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

			return {
				videoId,
				videoUrl,
			};
		} catch (error) {
			console.error("YouTube upload error:", error);
			throw new Error(
				error instanceof Error
					? error.message
					: "Failed to upload video to YouTube"
			);
		}
	}

	async getVideoDetails(videoId: string): Promise<any> {
		try {
			// Refresh token if needed
			await this.refreshTokenIfNeeded();

			const response = await this.youtube.videos.list({
				part: "snippet,contentDetails,statistics",
				id: [videoId],
			});

			return response.data.items[0];
		} catch (error) {
			console.error("YouTube fetch error:", error);
			throw new Error("Failed to fetch video details from YouTube");
		}
	}

	async updateVideoPrivacy(
		videoId: string,
		privacyStatus: "private" | "unlisted" | "public"
	): Promise<void> {
		try {
			// Refresh token if needed
			await this.refreshTokenIfNeeded();

			await this.youtube.videos.update({
				part: "status",
				requestBody: {
					id: videoId,
					status: {
						privacyStatus,
					},
				},
			});
		} catch (error) {
			console.error("YouTube update error:", error);
			throw new Error("Failed to update video privacy on YouTube");
		}
	}

	async getChannelDetails(): Promise<any> {
		try {
			// Refresh token if needed
			await this.refreshTokenIfNeeded();

			const response = await this.youtube.channels.list({
				part: "snippet,contentDetails,statistics",
				mine: true,
			});

			return response.data.items[0];
		} catch (error) {
			console.error("YouTube channel fetch error:", error);
			throw new Error("Failed to fetch channel details from YouTube");
		}
	}
}
