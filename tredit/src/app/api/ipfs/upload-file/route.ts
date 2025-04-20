import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Convert File to Buffer
		const buffer = Buffer.from(await file.arrayBuffer());

		// Create form data for Pinata
		const pinataFormData = new FormData();
		pinataFormData.append("file", buffer, {
			filename: file.name,
			contentType: file.type,
		});

		// Upload to Pinata
		const response = await axios.post(PINATA_API_URL, pinataFormData, {
			headers: {
				Authorization: `Bearer ${PINATA_JWT}`,
				...pinataFormData.getHeaders(),
			},
			maxContentLength: Infinity,
		});

		return NextResponse.json({ hash: response.data.IpfsHash });
	} catch (error) {
		console.error("Error uploading file to IPFS:", error);
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 }
		);
	}
}
