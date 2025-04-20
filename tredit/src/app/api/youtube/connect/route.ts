import { NextResponse } from "next/server";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
	process.env.YOUTUBE_CLIENT_ID,
	process.env.YOUTUBE_CLIENT_SECRET,
	process.env.YOUTUBE_REDIRECT_URI
);

export async function GET(request: Request) {
	try {
		const url = oauth2Client.generateAuthUrl({
			access_type: "offline",
			scope: [
				"https://www.googleapis.com/auth/youtube.readonly",
				"https://www.googleapis.com/auth/youtube.force-ssl",
			],
			include_granted_scopes: true,
		});

		return NextResponse.json({ url });
	} catch (error) {
		console.error("Error generating auth URL:", error);
		return NextResponse.json(
			{ error: "Failed to generate authentication URL" },
			{ status: 500 }
		);
	}
}
