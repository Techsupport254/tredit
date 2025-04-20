import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

if (!PINATA_JWT) {
	console.error("Missing PINATA_JWT environment variable");
}

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const files = [];

		// Get logo file
		const logo = formData.get("logo") as File;
		if (logo) {
			files.push({ name: "logo", file: logo });
		}

		// Get cover image file
		const coverImage = formData.get("coverImage") as File;
		if (coverImage) {
			files.push({ name: "coverImage", file: coverImage });
		}

		if (files.length === 0) {
			return NextResponse.json({ error: "No files provided" }, { status: 400 });
		}

		// Create form data for Pinata
		const pinataFormData = new FormData();

		// Add files to form data
		for (const { name, file } of files) {
			const buffer = Buffer.from(await file.arrayBuffer());
			pinataFormData.append("file", buffer, {
				filename: file.name,
				contentType: file.type,
			});
		}

		// Add metadata
		pinataFormData.append(
			"pinataMetadata",
			JSON.stringify({
				name: "Business_Files",
				keyvalues: {
					type: "business_media",
					timestamp: new Date().toISOString(),
				},
			})
		);

		// Upload to Pinata
		const response = await axios.post(PINATA_API_URL, pinataFormData, {
			headers: {
				Authorization: `Bearer ${PINATA_JWT}`,
				...pinataFormData.getHeaders(),
			},
			maxContentLength: Infinity,
		});

		return NextResponse.json({ ipfsHash: response.data.IpfsHash });
	} catch (error) {
		console.error("Error uploading to IPFS:", error);

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
