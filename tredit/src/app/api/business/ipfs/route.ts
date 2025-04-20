import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import axios from "axios";

// Load Pinata configuration from environment variables
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_URL = process.env.PINATA_BASE_URL;
const PINATA_GATEWAY_URL = process.env.PINATA_GATEWAY_URL;

// Business IPFS schema validation
const businessIpfsSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	bio: z.string().optional(),
	type: z.enum(["PRODUCT", "SERVICE"]),
	category: z.string(),
	productCategories: z.array(z.string()).optional(),
	serviceCategories: z.array(z.string()).optional(),
	businessModel: z.string(),
	operationMode: z.string(),
	businessHours: z.record(z.any()),
	businessId: z.string(),
	txHash: z.string(),
});

export async function POST(req: Request) {
	try {
		const session = await getServerSession();
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const validatedData = businessIpfsSchema.parse(body);

		// Prepare metadata for IPFS
		const metadata = {
			...validatedData,
			owner: session.user.id,
			createdAt: new Date().toISOString(),
			version: "1.0.0",
		};

		// Upload to IPFS via Pinata
		const response = await axios.post(
			`${PINATA_API_URL}/pinning/pinJSONToIPFS`,
			metadata,
			{
				headers: {
					Authorization: `Bearer ${PINATA_JWT}`,
				},
			}
		);

		const { IpfsHash } = response.data;
		const ipfsUrl = `${PINATA_GATEWAY_URL}/ipfs/${IpfsHash}`;

		return NextResponse.json({
			ipfsUrl,
			ipfsHash: IpfsHash,
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.errors },
				{ status: 400 }
			);
		}

		if (axios.isAxiosError(error)) {
			console.error("Pinata API error:", error.response?.data);
			return NextResponse.json(
				{ error: "IPFS upload failed" },
				{ status: error.response?.status || 500 }
			);
		}

		console.error("Error uploading to IPFS:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
