import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ethers } from "ethers";
import { z } from "zod";

// Load contract ABI and address from environment variables
const BUSINESS_CONTRACT_ABI = JSON.parse(process.env.BUSINESS_ABI || "[]");
const BUSINESS_CONTRACT_ADDRESS = process.env.BUSINESS_CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Business schema validation for blockchain
const businessBlockchainSchema = z.object({
	name: z.string().min(2).max(100),
	description: z.string().optional(),
	type: z.enum(["PRODUCT", "SERVICE"]),
	category: z.string(),
});

export async function POST(req: Request) {
	try {
		const session = await getServerSession();
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const validatedData = businessBlockchainSchema.parse(body);

		// Create IPFS metadata object
		const metadata = {
			name: validatedData.name,
			description: validatedData.description,
			type: validatedData.type,
			category: validatedData.category,
			createdAt: new Date().toISOString(),
			owner: session.user.id,
		};

		// Convert metadata to JSON string
		const metadataString = JSON.stringify(metadata);

		// Initialize provider and signer
		const provider = new ethers.JsonRpcProvider(RPC_URL);
		const wallet = new ethers.Wallet(PRIVATE_KEY || "", provider);

		// Initialize contract
		const contract = new ethers.Contract(
			BUSINESS_CONTRACT_ADDRESS || "",
			BUSINESS_CONTRACT_ABI,
			wallet
		);

		// Create business on blockchain
		const tx = await contract.createBusiness(metadataString);
		const receipt = await tx.wait();

		// Get business ID from event logs
		const event = receipt.logs.find(
			(log: any) => log.eventName === "BusinessCreated"
		);

		if (!event) {
			throw new Error("Business creation event not found");
		}

		const [businessId, owner, ipfsHash, timestamp] = event.args;

		return NextResponse.json({
			businessId: businessId,
			txHash: receipt.hash,
			owner: owner,
			ipfsHash: ipfsHash,
			timestamp: timestamp,
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.errors },
				{ status: 400 }
			);
		}

		console.error("Error creating business on blockchain:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
