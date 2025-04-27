import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pinataSDK from "@pinata/sdk";
import { Readable } from "stream";

// Ensure environment variables are set
if (!process.env.PINATA_API_KEY || !process.env.PINATA_API_SECRET) {
	console.error(
		"Error: Pinata API Key or Secret not found in environment variables."
	);
	// Optionally throw an error or handle appropriately
}

const pinata = new pinataSDK({
	pinataApiKey: process.env.PINATA_API_KEY,
	pinataSecretApiKey: process.env.PINATA_API_SECRET,
});

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const formData = await req.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Convert Buffer to Readable Stream for Pinata SDK
		const buffer = Buffer.from(await file.arrayBuffer());
		const stream = Readable.from(buffer);

		// Set filename for Pinata (optional but recommended)
		// Pinata SDK stream type requires 'path' property on the stream object
		(stream as any).path = file.name;

		const options = {
			pinataMetadata: {
				name: file.name,
				// Add any other metadata you want here, e.g., userId
				// keyvalues: { userId: session.user.id }
			},
			pinataOptions: {
				cidVersion: 0 as const, // Or 1 depending on your preference
			},
		};

		console.log(`[API Upload] Uploading ${file.name} to Pinata...`);
		const result = await pinata.pinFileToIPFS(stream, options);
		console.log(`[API Upload] Pinata upload successful:`, result);

		// Construct the gateway URL
		const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

		return NextResponse.json({
			ipfsHash: result.IpfsHash,
			url: gatewayUrl,
			pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`, // Alias for clarity
			name: file.name,
			type: file.type,
			size: file.size,
		});
	} catch (error) {
		console.error("[API Upload] Error uploading file to Pinata:", error);
		// Check if error is from Pinata SDK for more specific messages if needed
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 }
		);
	}
}
