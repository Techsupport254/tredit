import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import { IPFSService } from "@/lib/services/ipfs.service";
import { BlockchainService } from "@/lib/services/blockchain.service";
import config from "@/config";
import { Prisma } from "@prisma/client";
import axios from "axios";
import FormData from "form-data";

const prisma = new PrismaClient();
const ipfsService = IPFSService.getInstance();
const blockchainService = BlockchainService.getInstance();

export async function POST(req: Request) {
	try {
		// Check authentication
		const session = await getServerSession();
		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized: Please sign in to continue" },
				{ status: 401 }
			);
		}

		// Get user from database first
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json(
				{ success: false, error: "User not found" },
				{ status: 404 }
			);
		}

		// Parse form data
		const formData = await req.formData();
		const files: { name: string; file: Blob; type: string }[] = [];
		const data: Record<string, any> = {};

		// Extract files and form data
		for (const [key, value] of formData.entries()) {
			if (value instanceof Blob) {
				files.push({
					name: key,
					file: value,
					type: value.type || "application/octet-stream",
				});
			} else {
				try {
					data[key] = JSON.parse(value as string);
				} catch {
					data[key] = value;
				}
			}
		}

		// Upload files to IPFS first
		let logoIpfsHash = null;
		let coverImageIpfsHash = null;

		// Upload each file separately
		for (const file of files) {
			try {
				const pinataFormData = new FormData();
				const buffer = Buffer.from(await file.file.arrayBuffer());

				pinataFormData.append("file", buffer, {
					filename: file.name,
					contentType: file.type,
				});

				// Add metadata
				pinataFormData.append(
					"pinataMetadata",
					JSON.stringify({
						name: `Business_${data.name}_${file.name}`,
						keyvalues: {
							type: "business_media",
							businessName: data.name,
							fileType: file.name,
							timestamp: new Date().toISOString(),
						},
					})
				);

				// Upload to Pinata
				const response = await axios.post(
					`${config.ipfs.baseUrl}/pinning/pinFileToIPFS`,
					pinataFormData,
					{
						headers: {
							Authorization: `Bearer ${config.ipfs.jwt}`,
							...pinataFormData.getHeaders(),
						},
						maxContentLength: Infinity,
					}
				);

				// Store the hash based on file type
				if (file.name === "logo") {
					logoIpfsHash = response.data.IpfsHash;
				} else if (file.name === "coverImage") {
					coverImageIpfsHash = response.data.IpfsHash;
				}
			} catch (error) {
				console.error(`Failed to upload ${file.name}:`, error);
			}
		}

		// Upload business data to IPFS
		let ipfsHash: string;
		try {
			const businessData = {
				...data,
				logo: logoIpfsHash ? `ipfs://${logoIpfsHash}` : null,
				coverImage: coverImageIpfsHash ? `ipfs://${coverImageIpfsHash}` : null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				owner: user.id,
			};
			ipfsHash = await ipfsService.uploadJSON(businessData);
		} catch (error) {
			console.error("IPFS upload error:", error);
			return NextResponse.json(
				{ success: false, error: "Failed to upload business data to IPFS" },
				{ status: 500 }
			);
		}

		// Create business on blockchain
		let blockchainTxHash: string;
		try {
			const wallet = new ethers.Wallet(
				config.blockchain.privateKey,
				new ethers.JsonRpcProvider(config.blockchain.rpcUrl)
			);

			const businessContract = new ethers.Contract(
				config.blockchain.businessContract,
				config.blockchain.businessAbi,
				wallet
			);

			const tx = await businessContract.createBusiness(ipfsHash);
			const receipt = await tx.wait();
			blockchainTxHash = receipt.hash;
		} catch (error) {
			console.error("Blockchain error:", error);
			return NextResponse.json(
				{ success: false, error: "Failed to create business on blockchain" },
				{ status: 500 }
			);
		}

		// Save business data to database
		let savedBusiness;
		try {
			savedBusiness = await prisma.business.create({
				data: {
					userId: user.id,
					name: data.name,
					description: data.description || null,
					type: data.type,
					category: data.category,
					email: data.email,
					phone: data.phone,
					address: data.address,
					city: data.city,
					country: data.country || "Kenya",
					businessModel: data.businessModel,
					operationMode: data.operationMode,
					employeeCount: data.employeeCount || 1,
					paymentMethods: data.paymentMethods || [],
					blockchainTxHash: blockchainTxHash,
					ipfsUrl: ipfsHash,
					logo: logoIpfsHash ? `ipfs://${logoIpfsHash}` : null,
					coverImage: coverImageIpfsHash
						? `ipfs://${coverImageIpfsHash}`
						: null,
					status: "ACTIVE",
					verificationStatus: "PENDING",
					currency: data.currency || "KES",
					acceptedCurrencies: data.acceptedCurrencies || ["KES"],
					languages: data.languages || ["en"],
					timezone: data.timezone || "Africa/Nairobi",
				},
			});
		} catch (error) {
			console.error("Database error:", error);
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2002"
			) {
				return NextResponse.json(
					{ success: false, error: "A business with this name already exists" },
					{ status: 400 }
				);
			}
			return NextResponse.json(
				{ success: false, error: "Failed to create business in database" },
				{ status: 500 }
			);
		}

		// Return success response
		return NextResponse.json({
			success: true,
			business: {
				id: savedBusiness.id,
				txHash: blockchainTxHash,
				ipfsHash,
				ipfsUrl: `${config.ipfs.gatewayUrl}/ipfs/${ipfsHash}`,
				name: savedBusiness.name,
				logo: savedBusiness.logo,
				coverImage: savedBusiness.coverImage,
			},
		});
	} catch (error) {
		console.error("Error creating business:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Internal server error";
		return NextResponse.json(
			{ success: false, error: errorMessage },
			{ status: 500 }
		);
	}
}
