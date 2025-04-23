import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const code = searchParams.get("code");
	const state = searchParams.get("state"); // This is the business ID
	const error = searchParams.get("error");
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

	if (error) {
		console.error("Google OAuth error:", error);
		return NextResponse.redirect(
			`${baseUrl}/dashboard/businesses/${state}?error=${error}`
		);
	}

	if (!code || !state) {
		return NextResponse.redirect(
			`${baseUrl}/dashboard/businesses/${state}?error=invalid_callback`
		);
	}

	try {
		// Exchange the authorization code for access and refresh tokens
		const tokenResponse = await axios.post(
			"https://oauth2.googleapis.com/token",
			{
				client_id: process.env.YOUTUBE_CLIENT_ID,
				client_secret: process.env.YOUTUBE_CLIENT_SECRET,
				code,
				redirect_uri: process.env.YOUTUBE_REDIRECT_URI,
				grant_type: "authorization_code",
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		const { access_token, refresh_token, expires_in } = tokenResponse.data;

		// Get the YouTube channel info
		const channelResponse = await axios.get(
			"https://www.googleapis.com/youtube/v3/channels",
			{
				params: {
					part: "snippet",
					mine: true,
				},
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			}
		);

		if (!channelResponse.data.items?.[0]) {
			throw new Error("No YouTube channel found");
		}

		const channel = channelResponse.data.items[0];

		// Use upsert to either create a new connection or update an existing one
		await prisma.socialMediaConnection.upsert({
			where: {
				businessId_platform: {
					businessId: state,
					platform: "YOUTUBE",
				},
			},
			update: {
				accessToken: access_token,
				refreshToken: refresh_token,
				expiresAt: new Date(Date.now() + expires_in * 1000),
				channelId: channel.id,
				connected: true,
			},
			create: {
				businessId: state,
				platform: "YOUTUBE",
				accessToken: access_token,
				refreshToken: refresh_token,
				expiresAt: new Date(Date.now() + expires_in * 1000),
				channelId: channel.id,
				connected: true,
			},
		});

		// Redirect back to the business details page with success message
		return NextResponse.redirect(
			`${baseUrl}/dashboard/businesses/${state}?connected=youtube`
		);
	} catch (error: any) {
		console.error("YouTube OAuth error:", error.response?.data || error);
		const errorMessage =
			error.response?.data?.error?.message ||
			error.message ||
			"Failed to connect YouTube account";
		// Redirect back to the specific business page with error
		return NextResponse.redirect(
			`${baseUrl}/dashboard/businesses/${state}?error=${encodeURIComponent(
				errorMessage
			)}`
		);
	}
}
