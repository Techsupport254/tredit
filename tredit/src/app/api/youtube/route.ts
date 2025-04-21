import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createYouTubeAPI } from "@/lib/youtube";

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

		if (
			!connection ||
			!connection.accessToken ||
			!connection.refreshToken ||
			!connection.channelId
		) {
			return NextResponse.json(
				{ error: "YouTube not connected" },
				{ status: 404 }
			);
		}

		console.log("Creating YouTube API with connection:", {
			id: connection.id,
			channelId: connection.channelId,
			hasAccessToken: !!connection.accessToken,
			hasRefreshToken: !!connection.refreshToken,
		});

		const youtube = createYouTubeAPI(
			connection.accessToken,
			connection.refreshToken,
			connection.channelId,
			async (newAccessToken, newExpiresAt) => {
				await updateTokenInDatabase(
					connection.id,
					newAccessToken,
					newExpiresAt
				);
			}
		);

		switch (action) {
			case "channel":
				const channelData = await youtube.getChannelDetails();
				return NextResponse.json(channelData);

			case "recent-videos":
				const maxResults = Number(searchParams.get("maxResults")) || 5;
				const videos = await youtube.getRecentVideos(maxResults);
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

		if (
			!connection ||
			!connection.accessToken ||
			!connection.refreshToken ||
			!connection.channelId
		) {
			return NextResponse.json(
				{ error: "YouTube not connected" },
				{ status: 404 }
			);
		}

		console.log("Creating YouTube API for video upload with connection:", {
			id: connection.id,
			channelId: connection.channelId,
			hasAccessToken: !!connection.accessToken,
			hasRefreshToken: !!connection.refreshToken,
		});

		const youtube = createYouTubeAPI(
			connection.accessToken,
			connection.refreshToken,
			connection.channelId,
			async (newAccessToken, newExpiresAt) => {
				await updateTokenInDatabase(
					connection.id,
					newAccessToken,
					newExpiresAt
				);
			}
		);

		// Upload video
		const videoId = await youtube.uploadVideo(videoFile, {
			title: metadata.title,
			description: metadata.description,
			tags: metadata.tags,
			categoryId: metadata.categoryId,
			privacyStatus: metadata.privacyStatus,
			publishAt: metadata.publishAt,
		});

		return NextResponse.json({ videoId });
	} catch (error: any) {
		console.error("YouTube upload error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to upload video" },
			{ status: 500 }
		);
	}
}
