import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient, ProductStatus } from "@prisma/client";
import { IPFSService } from "@/lib/services/ipfs.service";
import FormData from "form-data";
import axios from "axios";
import config from "@/config";
import { z } from "zod";

const prisma = new PrismaClient();
const ipfsService = IPFSService.getInstance();

// Product schema validation
const productSchema = z.object({
	name: z.string().min(1, "Product name is required"),
	description: z.string().optional(),
	price: z.number().min(0, "Price must be a positive number"),
	stock: z.number().min(0, "Stock must be a positive number"),
	status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"] as const),
	youtubeVideoId: z.string().nullable().optional(),
	variants: z
		.array(
			z.object({
				name: z.string(),
				value: z.string(),
				price: z.number(),
				stock: z.number(),
			})
		)
		.optional(),
	youtubeTitle: z.string().optional(),
	youtubeDescription: z.string().optional(),
	youtubeTags: z.array(z.string()).optional(),
	youtubeVisibility: z.enum(["public", "private", "unlisted"]).optional(),
	youtubeCategory: z.string().optional(),
	youtubePublishAt: z.string().optional(),
});

export async function POST(req: Request) {
	let writer: WritableStreamDefaultWriter | null = null;
	try {
		// Create a TransformStream for progress updates
		const stream = new TransformStream();
		writer = stream.writable.getWriter();
		const encoder = new TextEncoder();

		// Function to send progress updates
		const sendProgress = async (data: any) => {
			if (writer) {
				await writer.write(encoder.encode(JSON.stringify(data) + "\n"));
			}
		};

		// Check authentication
		const session = await getServerSession();
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: "Unauthorized: Please sign in to continue" },
				{ status: 401 }
			);
		}

		// Parse form data
		const formData = await req.formData();
		const businessId = formData.get("businessId") as string;
		const productData = JSON.parse(formData.get("productData") as string);
		const images = formData.getAll("images") as File[];
		const youtubeVideo = formData.get("youtubeVideo") as File;

		// Validate product data
		const validatedData = productSchema.parse({
			...productData,
			price: Number(productData.price),
			stock: Number(productData.stock),
			variants: productData.variants?.map((variant: any) => ({
				...variant,
				price: Number(variant.price),
				stock: Number(variant.stock),
			})),
		});

		// Step 1: Upload images to IPFS
		console.log("Starting image uploads...");
		const imageHashes = await Promise.all(
			images.map(async (image, i) => {
				try {
					await sendProgress({
						type: "progress",
						stage: "images",
						current: i + 1,
						total: images.length,
						progress: 0,
					});

					const pinataFormData = new FormData();
					const buffer = Buffer.from(await image.arrayBuffer());

					pinataFormData.append("file", buffer, {
						filename: image.name,
						contentType: image.type,
						knownLength: buffer.length,
					});

					pinataFormData.append(
						"pinataMetadata",
						JSON.stringify({
							name: `Product_${validatedData.name}_Image_${i + 1}`,
							keyvalues: {
								type: "product_image",
								productName: validatedData.name,
								timestamp: new Date().toISOString(),
							},
						})
					);

					console.log(
						`Uploading Image (${i + 1}/${images.length}) to Pinata...`
					);

					const response = await axios.post(
						`${config.ipfs.baseUrl}/pinning/pinFileToIPFS`,
						pinataFormData,
						{
							headers: {
								Authorization: `Bearer ${config.ipfs.jwt}`,
								...pinataFormData.getHeaders(),
								"Content-Length": pinataFormData.getLengthSync(),
							},
							maxContentLength: Infinity,
							maxBodyLength: Infinity,
							onUploadProgress: async (progressEvent) => {
								const progress = Math.round(
									(progressEvent.loaded * 100) / (progressEvent.total || 100)
								);
								await sendProgress({
									type: "progress",
									stage: "images",
									current: i + 1,
									total: images.length,
									progress,
								});
							},
						}
					);

					const ipfsHash = response.data.IpfsHash;
					const ipfsUrl = `ipfs://${ipfsHash}`;
					const gatewayUrl = `${config.ipfs.gatewayUrl}/${ipfsHash}`;

					console.log(
						`\n=== Image Upload Success (${i + 1}/${images.length}) ===`
					);
					console.log(`File: ${image.name}`);
					console.log(`IPFS Hash: ${ipfsHash}`);
					console.log(`IPFS URL: ${ipfsUrl}`);
					console.log(`Gateway URL: ${gatewayUrl}`);
					console.log("===========================\n");

					await sendProgress({
						type: "progress",
						stage: "images",
						current: i + 1,
						total: images.length,
						progress: 100,
						url: gatewayUrl,
					});

					return {
						hash: ipfsHash,
						ipfsUrl,
						gatewayUrl,
					};
				} catch (error: any) {
					if (error.response) {
						console.error(
							`Failed to upload Image (${i + 1}/${images.length}) to Pinata:`,
							error.response.data || error.message
						);
					} else {
						console.error(
							`Failed to upload Image (${i + 1}/${images.length}) to Pinata:`,
							error
						);
					}
					throw error;
				}
			})
		);

		console.log("\n=== All Images Uploaded Successfully ===");
		imageHashes.forEach((image, index) => {
			console.log(`\nImage ${index + 1}:`);
			console.log(`- File: ${images[index].name}`);
			console.log(`- IPFS Hash: ${image.hash}`);
			console.log(`- IPFS URL: ${image.ipfsUrl}`);
			console.log(`- Gateway URL: ${image.gatewayUrl}`);
		});
		console.log("=====================================\n");

		// Step 2: Upload video to YouTube if present
		let youtubeVideoId = null;
		if (youtubeVideo && validatedData.youtubeTitle) {
			console.log("Starting YouTube video upload...");
			try {
				await sendProgress({
					type: "progress",
					stage: "youtube",
					progress: 0,
				});

				const youtubeConnection = await prisma.socialMediaConnection.findFirst({
					where: {
						businessId,
						platform: "YOUTUBE",
						connected: true,
					},
				});

				if (!youtubeConnection) {
					throw new Error("YouTube account not connected");
				}

				const videoMetadata = {
					snippet: {
						title: validatedData.youtubeTitle,
						description: validatedData.youtubeDescription,
						tags: validatedData.youtubeTags,
						categoryId: validatedData.youtubeCategory,
					},
					status: {
						privacyStatus: validatedData.youtubeVisibility,
						publishAt: validatedData.youtubePublishAt,
					},
				};

				const videoBuffer = Buffer.from(await youtubeVideo.arrayBuffer());
				const youtubeFormData = new FormData();
				youtubeFormData.append("video", videoBuffer, {
					filename: youtubeVideo.name,
					contentType: youtubeVideo.type,
				});
				youtubeFormData.append("metadata", JSON.stringify(videoMetadata));

				const youtubeResponse = await axios.post(
					"https://www.googleapis.com/upload/youtube/v3/videos",
					youtubeFormData,
					{
						params: {
							part: "snippet,status",
							uploadType: "multipart",
						},
						headers: {
							Authorization: `Bearer ${youtubeConnection.accessToken}`,
							...youtubeFormData.getHeaders(),
						},
						onUploadProgress: async (progressEvent) => {
							const progress = Math.round(
								(progressEvent.loaded * 100) / (progressEvent.total || 100)
							);
							await sendProgress({
								type: "progress",
								stage: "youtube",
								progress,
							});
						},
					}
				);

				youtubeVideoId = youtubeResponse.data.id;
				console.log("YouTube video uploaded successfully:", youtubeVideoId);

				await sendProgress({
					type: "progress",
					stage: "youtube",
					progress: 100,
				});
			} catch (error) {
				console.error("Failed to upload video to YouTube:", error);
				throw error;
			}
		}

		// Step 3: Upload product metadata to IPFS
		console.log("Starting product metadata upload to IPFS...");
		await sendProgress({
			type: "progress",
			stage: "ipfs",
			progress: 0,
		});

		const productMetadata = {
			...validatedData,
			images: imageHashes.map((image) => ({
				hash: image.hash,
				ipfsUrl: image.ipfsUrl,
				gatewayUrl: image.gatewayUrl,
			})),
			youtubeVideoId,
			youtubeMetadata: validatedData.youtubeTitle
				? {
						title: validatedData.youtubeTitle,
						description: validatedData.youtubeDescription,
						tags: validatedData.youtubeTags,
						visibility: validatedData.youtubeVisibility,
						category: validatedData.youtubeCategory,
						publishAt: validatedData.youtubePublishAt,
				  }
				: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const metadataHash = await ipfsService.uploadJSON(productMetadata);
		console.log(
			"Product metadata uploaded to IPFS successfully:",
			metadataHash
		);

		await sendProgress({
			type: "progress",
			stage: "ipfs",
			progress: 100,
		});

		// Step 4: Save product to database
		console.log("Saving product to database...");
		await sendProgress({
			type: "progress",
			stage: "database",
			progress: 0,
		});

		// Create product record with proper Prisma types
		const productRecord = {
			businessId,
			name: validatedData.name,
			description: validatedData.description,
			price: validatedData.price,
			stock: validatedData.stock,
			status: validatedData.status as ProductStatus,
			ipfsHash: metadataHash,
			youtubeVideoId: youtubeVideoId || null,
			media: {
				create: imageHashes.map((image, index) => ({
					type: "IMAGE",
					url: image.gatewayUrl,
					order: index,
				})),
			},
			variants: {
				create:
					validatedData.variants?.map((variant) => ({
						name: variant.name,
						value: variant.value,
						price: variant.price,
						stock: variant.stock,
					})) || [],
			},
			seo: {
				create: {
					title: validatedData.name,
					description: validatedData.description,
					keywords: validatedData.youtubeTags || [],
				},
			},
			analytics: {
				create: {
					views: 0,
					purchases: 0,
					revenue: 0,
				},
			},
		};

		console.log("\n=== DATABASE UPLOAD ===");
		console.log("Product Record:", JSON.stringify(productRecord, null, 2));

		// Create the product with proper typing
		const product = await prisma.product.create({
			data: productRecord,
		});

		console.log("Product saved to database successfully:", product.id);

		await sendProgress({
			type: "progress",
			stage: "database",
			progress: 100,
		});

		// Close the writer and send final response
		await writer.close();

		return new Response(stream.readable, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error: any) {
		console.error("Error creating product:", error);
		// Close the writer in case of error
		if (writer) {
			await writer.close();
		}
		return new Response(
			JSON.stringify({ error: error.message || "Failed to create product" }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
	}
}

// Test endpoint for image uploads only
export async function PUT(req: Request) {
	try {
		// Check authentication
		const session = await getServerSession();
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: "Unauthorized: Please sign in to continue" },
				{ status: 401 }
			);
		}

		// Parse form data
		const formData = await req.formData();
		const businessId = formData.get("businessId") as string;
		const productData = JSON.parse(formData.get("productData") as string);

		// Log the incoming data for debugging
		console.log("\n=== INCOMING PRODUCT DATA ===");
		console.log("Business ID:", businessId);
		console.log("Product Data:", JSON.stringify(productData, null, 2));

		// Validate product data
		const validatedData = productSchema.parse({
			...productData,
			price: Number(productData.price),
			stock: Number(productData.stock),
			variants: productData.variants?.create || [],
		});

		// Create product record with proper Prisma types
		const productRecord = {
			businessId,
			name: validatedData.name,
			description: validatedData.description,
			price: validatedData.price,
			stock: validatedData.stock,
			status: validatedData.status as ProductStatus,
			ipfsHash: productData.ipfsHash,
			youtubeVideoId: productData.youtubeVideoId,
			media: {
				create:
					productData.media?.create?.map((media: any) => ({
						type: media.type,
						url: media.url,
						order: media.order,
					})) || [],
			},
			variants: {
				create: (productData.variants?.create || []).map((variant: any) => ({
					name: variant.name,
					value: variant.value,
					price: Number(variant.price),
					stock: Number(variant.stock),
				})),
			},
			seo: {
				create: {
					title: productData.seo?.create?.title || validatedData.name,
					description:
						productData.seo?.create?.description || validatedData.description,
					keywords: productData.seo?.create?.keywords || [],
				},
			},
			analytics: {
				create: {
					views: 0,
					purchases: 0,
					revenue: 0,
				},
			},
		};

		console.log("\n=== TEST DATABASE UPLOAD ===");
		console.log("Product Record:", JSON.stringify(productRecord, null, 2));

		// Create the product with proper typing
		const product = await prisma.product.create({
			data: productRecord,
		});

		return NextResponse.json(product);
	} catch (error: any) {
		console.error("Error creating product:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to create product" },
			{ status: 500 }
		);
	}
}
