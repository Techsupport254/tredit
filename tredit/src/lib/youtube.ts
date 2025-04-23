import axios from "axios";

export interface YouTubeChannelData {
	id: string;
	title: string;
	description: string;
	customUrl: string;
	thumbnails: {
		default: { url: string };
		medium: { url: string };
		high: { url: string };
	};
	statistics: {
		viewCount: string;
		subscriberCount: string;
		videoCount: string;
	};
}

export interface YouTubeVideoUploadParams {
	title: string;
	description: string;
	tags: string[];
	categoryId: string;
	privacyStatus: "private" | "unlisted" | "public";
	publishAt?: string;
}

async function refreshAccessToken(
	refreshToken: string
): Promise<{ accessToken: string; expiresAt: Date }> {
	try {
		console.log("Refreshing token with:", refreshToken);
		const response = await axios.post(
			"https://oauth2.googleapis.com/token",
			{
				client_id: process.env.YOUTUBE_CLIENT_ID,
				client_secret: process.env.YOUTUBE_CLIENT_SECRET,
				refresh_token: refreshToken,
				grant_type: "refresh_token",
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		const { access_token, expires_in } = response.data;
		const expiresAt = new Date(Date.now() + expires_in * 1000);

		return {
			accessToken: access_token,
			expiresAt,
		};
	} catch (error: any) {
		console.error("Error refreshing token:", error.response?.data || error);
		throw new Error("Failed to refresh access token");
	}
}

export class YouTubeAPI {
	private accessToken: string;
	private refreshToken: string;
	private channelId: string;
	private onTokenRefresh?: (
		accessToken: string,
		expiresAt: Date
	) => Promise<void>;

	constructor(
		accessToken: string,
		refreshToken: string,
		channelId: string,
		onTokenRefresh?: (accessToken: string, expiresAt: Date) => Promise<void>
	) {
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
		this.channelId = channelId;
		this.onTokenRefresh = onTokenRefresh;
	}

	private async makeRequest<T>(endpoint: string, params: any = {}): Promise<T> {
		try {
			const response = await axios.get(
				`https://www.googleapis.com/youtube/v3/${endpoint}`,
				{
					params: {
						...params,
						key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
					},
					headers: {
						Authorization: `Bearer ${this.accessToken}`,
						Accept: "application/json",
					},
				}
			);
			return response.data;
		} catch (error: any) {
			if (error.response?.status === 401) {
				// Token expired, try to refresh
				try {
					console.log("Token expired, attempting refresh");
					const { accessToken, expiresAt } = await refreshAccessToken(
						this.refreshToken
					);
					this.accessToken = accessToken;

					// Notify caller about the new token
					if (this.onTokenRefresh) {
						await this.onTokenRefresh(accessToken, expiresAt);
					}

					// Retry the request with new token
					const retryResponse = await axios.get(
						`https://www.googleapis.com/youtube/v3/${endpoint}`,
						{
							params: {
								...params,
								key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
							},
							headers: {
								Authorization: `Bearer ${this.accessToken}`,
								Accept: "application/json",
							},
						}
					);
					return retryResponse.data;
				} catch (refreshError) {
					console.error("Failed to refresh token:", refreshError);
					throw new Error("Failed to refresh YouTube token");
				}
			}
			throw error;
		}
	}

	async getChannelDetails(): Promise<YouTubeChannelData> {
		const response = await this.makeRequest("channels", {
			part: "snippet,statistics",
			id: this.channelId,
		});

		if (!response.items?.[0]) {
			throw new Error("Channel not found");
		}

		const channel = response.items[0];
		return {
			id: channel.id,
			title: channel.snippet.title,
			description: channel.snippet.description,
			customUrl: channel.snippet.customUrl,
			thumbnails: channel.snippet.thumbnails,
			statistics: channel.statistics,
		};
	}

	async uploadVideo(
		file: File,
		params: YouTubeVideoUploadParams,
		onProgress?: (progress: number) => void
	): Promise<string> {
		try {
			// Create upload session
			const sessionResponse = await axios.post(
				"https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
				{
					snippet: {
						title: params.title,
						description: params.description,
						tags: params.tags,
						categoryId: params.categoryId,
					},
					status: {
						privacyStatus: params.privacyStatus,
						publishAt: params.publishAt,
					},
				},
				{
					headers: {
						Authorization: `Bearer ${this.accessToken}`,
						"Content-Type": "application/json",
						"X-Upload-Content-Length": file.size,
						"X-Upload-Content-Type": file.type,
					},
				}
			);

			const uploadUrl = sessionResponse.headers.location;
			if (!uploadUrl) {
				throw new Error("Failed to get upload URL");
			}

			// Upload the file
			const uploadResponse = await axios.put(uploadUrl, file, {
				headers: {
					"Content-Type": file.type,
					"Content-Length": file.size,
				},
				onUploadProgress: (progressEvent) => {
					const progress = Math.round(
						(progressEvent.loaded * 100) / (progressEvent.total || 100)
					);
					onProgress?.(progress);
				},
			});

			return uploadResponse.data.id;
		} catch (error: any) {
			console.error("YouTube upload error:", error.response?.data || error);
			throw new Error(
				error.response?.data?.error?.message || "Failed to upload video"
			);
		}
	}

	async getRecentVideos(maxResults = 5) {
		const response = await this.makeRequest("search", {
			part: "snippet",
			channelId: this.channelId,
			maxResults,
			order: "date",
			type: "video",
		});

		return response.items.map((item: any) => ({
			id: item.id.videoId,
			title: item.snippet.title,
			description: item.snippet.description,
			thumbnails: item.snippet.thumbnails,
			publishedAt: item.snippet.publishedAt,
		}));
	}

	async getVideoStatistics(videoId: string) {
		const response = await this.makeRequest("videos", {
			part: "statistics",
			id: videoId,
		});

		return response.items?.[0]?.statistics;
	}
}

export function createYouTubeAPI(
	accessToken: string,
	refreshToken: string,
	channelId: string,
	onTokenRefresh?: (accessToken: string, expiresAt: Date) => Promise<void>
) {
	return new YouTubeAPI(accessToken, refreshToken, channelId, onTokenRefresh);
}

// Helper function to convert File to Buffer for server-side operations
export async function fileToBuffer(file: File): Promise<Buffer> {
	const arrayBuffer = await file.arrayBuffer();
	return Buffer.from(arrayBuffer);
}
