import { NextResponse } from "next/server";
import axios from "axios";

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

// Validate Pinata configuration
if (!PINATA_JWT) {
	console.error("Missing PINATA_JWT environment variable");
}

// Create axios instance with timeout
const axiosInstance = axios.create({
	timeout: 30000, // 30 seconds timeout
	headers: {
		Authorization: `Bearer ${PINATA_JWT}`,
	},
});

export async function POST(req: Request) {
	try {
		const data = await req.json();

		if (!data) {
			return NextResponse.json({ error: "No data provided" }, { status: 400 });
		}

		// Upload to Pinata
		const response = await axiosInstance.post(PINATA_API_URL, {
			pinataContent: data,
			pinataMetadata: {
				name: `user-profile-${Date.now()}`,
			},
		});

		if (!response.data.IpfsHash) {
			throw new Error("No IPFS hash returned from Pinata");
		}

		return NextResponse.json({ ipfsHash: response.data.IpfsHash });
	} catch (error) {
		console.error("Error uploading to IPFS:", error);

		// Handle specific error cases
		if (axios.isAxiosError(error)) {
			if (error.code === "ECONNABORTED") {
				return NextResponse.json(
					{ error: "Upload timed out. Please try again." },
					{ status: 504 }
				);
			}

			if (error.response?.status === 401) {
				return NextResponse.json(
					{ error: "Invalid Pinata credentials" },
					{ status: 401 }
				);
			}
		}

		return NextResponse.json(
			{ error: "Failed to upload to IPFS" },
			{ status: 500 }
		);
	}
}
