import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { IPFSService } from "@/lib/services/ipfs.service";
import { createYouTubeAPI } from "@/lib/youtube";
import prisma from "@/lib/prisma";
import { ProductService } from "@/lib/services/product.service";
import { DatabaseService } from "@/lib/services/database.service";

const ipfsService = IPFSService.getInstance();
const prismaInstance = DatabaseService.getInstance().getPrisma();

// Flag to control YouTube uploads
const SKIP_YOUTUBE_UPLOAD = false; // Set to false to enable YouTube uploads

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");
		const businessId = searchParams.get("businessId");

		if (id) {
			// Fetch a specific product by ID
			const product = await prismaInstance.product.findUnique({
				where: { id },
				include: {
					variants: true,
					media: {
						orderBy: { order: "asc" },
					},
					seo: true,
				},
			});

			if (!product) {
				return NextResponse.json(
					{ success: false, message: "Product not found" },
					{ status: 404 }
				);
			}

			// Process media into images and videos arrays for the frontend
			const images: string[] = [];
			const videos: string[] = [];

			product.media.forEach((media) => {
				if (media.type.toLowerCase() === "image") {
					images.push(media.url);
				} else if (media.type.toLowerCase() === "video") {
					videos.push(media.url);
				}
			});

			// Format the product data for the frontend
			const formattedProduct = {
				...product,
				images,
				videos,
			};

			return NextResponse.json(formattedProduct);
		} else if (businessId) {
			// Fetch all products for a business
			const products = await prismaInstance.product.findMany({
				where: { businessId },
				include: {
					variants: true,
					media: {
						orderBy: { order: "asc" },
					},
				},
				orderBy: { createdAt: "desc" },
			});

			return NextResponse.json(products);
		} else {
			// If no ID or businessId is provided, return a bad request
			return NextResponse.json(
				{ success: false, message: "Missing id or businessId parameter" },
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error("Error fetching product(s):", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch product(s)",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		const data = await request.json();
		const productService = ProductService.getInstance();

		// Log the received data
		console.log(
			"API received product data:",
			JSON.stringify(
				{
					...data,
					variants: data.variants?.length || 0,
					images: data.images?.length || 0,
					youtubeData: data.youtubeData
						? {
								videoId: data.youtubeData.videoId,
								videoUrl: data.youtubeData.videoUrl,
						  }
						: null,
				},
				null,
				2
			)
		);

		// Create the main product with variants
		const product = await productService.createProduct({
			businessId: data.businessId,
			name: data.name,
			description: data.description,
			variants: data.variants,
			status: data.status,
			ipfsHash: data.ipfsHash,
			youtubeVideoId:
				data.youtubeVideoId || data.youtubeData?.videoId || undefined,
		});

		// Create SEO entry if provided
		if (data.seo && Object.keys(data.seo).length > 0) {
			// Ensure keywords is an array
			let keywords: string[] = [];
			if (typeof data.seo.keywords === "string") {
				keywords = data.seo.keywords
					.split(",")
					.map((k: string) => k.trim())
					.filter(Boolean);
			} else if (Array.isArray(data.seo.keywords)) {
				keywords = data.seo.keywords;
			}

			await prismaInstance.productSEO.create({
				data: {
					productId: product.id,
					title: data.seo.title,
					description: data.seo.description,
					keywords: keywords,
				},
			});
		}

		// Create media entries for images with unique order values
		if (data.media && data.media.length > 0) {
			console.log(
				`Processing ${data.media.length} media entries for product ${product.id}`
			);

			try {
				// First, delete all existing media entries for this product
				const deletedCount = await prismaInstance.productMedia.deleteMany({
					where: {
						productId: product.id,
					},
				});
				console.log(
					`Deleted ${deletedCount.count} existing media entries for product ${product.id}`
				);

				// Then create new media entries with sequential order numbers
				for (let index = 0; index < data.media.length; index++) {
					const media = data.media[index];
					try {
						// Determine if this is a YouTube video
						const isYouTubeVideo =
							media.type === "VIDEO" || media.type === "video";
						const videoId =
							media.metadata?.videoId ||
							(media.url && media.url.includes("youtube.com")
								? new URL(media.url).searchParams.get("v")
								: null);

						const mediaData = {
							productId: product.id,
							type: media.type,
							url:
								typeof media.url === "string"
									? media.url
									: media.url.gatewayUrl,
							order: index + 1, // Use sequential order numbers starting from 1
						};

						console.log(
							`Creating media entry ${index + 1}/${data.media.length}:`,
							JSON.stringify(mediaData)
						);

						const createdMedia = await prismaInstance.productMedia.create({
							data: mediaData,
						});

						console.log(`Created media entry with ID: ${createdMedia.id}`);

						// If this is a YouTube video, update the product's youtubeVideoId
						if (isYouTubeVideo && videoId) {
							await prismaInstance.product.update({
								where: { id: product.id },
								data: { youtubeVideoId: videoId },
							});
							console.log(`Updated product with YouTube video ID: ${videoId}`);
						}
					} catch (error) {
						console.error(`Failed to create media entry ${index + 1}:`, error);
						// Continue with other media entries even if one fails
					}
				}
			} catch (error) {
				console.error(
					`Error handling media entries for product ${product.id}:`,
					error
				);
				// Continue product creation even if media entries fail
			}
		} else {
			console.log(`No media entries to process for product ${product.id}`);
		}

		// Update the product with the IPFS hash if it wasn't set during creation
		if (data.ipfsHash && !product.ipfsHash) {
			await prismaInstance.product.update({
				where: { id: product.id },
				data: { ipfsHash: data.ipfsHash },
			});
		}

		// Fetch the complete product with all relations
		const completeProduct = await prismaInstance.product.findUnique({
			where: { id: product.id },
			include: {
				variants: true,
				media: true,
				seo: true,
			},
		});

		// Log the complete product data being returned
		console.log(
			"Returning product data with media:",
			JSON.stringify(
				{
					id: completeProduct?.id,
					name: completeProduct?.name,
					youtubeVideoId: completeProduct?.youtubeVideoId,
					mediaCount: completeProduct?.media?.length || 0,
					mediaTypes: completeProduct?.media?.map((m) => m.type) || [],
					variantsCount: completeProduct?.variants?.length || 0,
				},
				null,
				2
			)
		);

		return NextResponse.json({
			success: true,
			message: "Product created successfully",
			data: completeProduct,
		});
	} catch (error) {
		console.error("Error creating product:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to create product",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
