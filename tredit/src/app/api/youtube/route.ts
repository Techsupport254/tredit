import { NextResponse } from "next/server";
import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { YouTubeService } from "@/lib/services/youtube.service";

async function updateTokenInDatabase(
	connectionId: string,
	accessToken: string,
	expiresAt: Date
) {
	try {
		await prisma.socialMediaConnection.update({
			where: { id: connectionId },
			data: {
				accessToken,
				expiresAt,
			},
		});
		console.log("Updated token in database for connection:", connectionId);
	} catch (error) {
		console.error("Failed to update token in database:", error);
		throw error;
	}
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const businessId = searchParams.get("businessId");
		const action = searchParams.get("action");

		if (!businessId) {
			return NextResponse.json(
				{ error: "Business ID is required" },
				{ status: 400 }
			);
		}

		// Get YouTube connection
		const connection = await prisma.socialMediaConnection.findFirst({
			where: {
				businessId,
				platform: "YOUTUBE",
				connected: true,
			},
		});

		if (!connection || !connection.refreshToken) {
			return NextResponse.json(
				{ error: "YouTube not connected" },
				{ status: 404 }
			);
		}

		const youtubeService = new YouTubeService(connection.refreshToken);

		switch (action) {
			case "channel":
				const channelData = await youtubeService.getChannelDetails();
				return NextResponse.json(channelData);

			case "recent-videos":
				const maxResults = Number(searchParams.get("maxResults")) || 5;
				const videos = await youtubeService.getRecentVideos(maxResults);
				return NextResponse.json(videos);

			default:
				return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}
	} catch (error: any) {
		console.error("YouTube API error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to fetch YouTube data" },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const businessId = formData.get("businessId") as string;
		const videoFile = formData.get("video") as File;
		const metadata = JSON.parse(formData.get("metadata") as string);

		if (!businessId || !videoFile || !metadata) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Get YouTube connection
		const connection = await prisma.socialMediaConnection.findFirst({
			where: {
				businessId,
				platform: "YOUTUBE",
				connected: true,
			},
		});

		if (!connection || !connection.refreshToken) {
			return NextResponse.json(
				{
					error:
						"YouTube not connected. Please connect your YouTube account first.",
				},
				{ status: 404 }
			);
		}

		const youtubeService = new YouTubeService(connection.refreshToken);

		// Upload video
		const result = await youtubeService.uploadVideo(videoFile, {
			title: metadata.title,
			description: metadata.description,
			tags: metadata.tags,
			categoryId: metadata.categoryId,
			privacyStatus: metadata.privacyStatus,
		});

		console.log("Video uploaded successfully:", {
			videoId: result.videoId,
			title: metadata.title,
			visibility: metadata.privacyStatus,
		});

		return NextResponse.json(result);
	} catch (error: any) {
		console.error("Error uploading video to YouTube:", error);
		return NextResponse.json(
			{
				error: error.message || "Failed to upload video",
			},
			{ status: error.response?.status || 500 }
		);
	}
}
