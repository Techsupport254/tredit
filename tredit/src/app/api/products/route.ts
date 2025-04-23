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

export async function POST(request: Request) {
	try {
		const data = await request.json();
		const productService = ProductService.getInstance();

		// Create the main product with variants
		const product = await productService.createProduct({
			businessId: data.businessId,
			name: data.name,
			description: data.description,
			variants: data.variants,
			status: data.status,
			ipfsHash: data.ipfsHash,
			youtubeVideoId:
				data.youtubeData?.videoId !== "skipped"
					? data.youtubeData?.videoId
					: undefined,
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
		if (data.images && data.images.length > 0) {
			// First, delete any existing media entries for this product
			await prismaInstance.productMedia.deleteMany({
				where: { productId: product.id },
			});

			// Then create new media entries
			await Promise.all(
				data.images.map(async (image: any, index: number) => {
					try {
						await prismaInstance.productMedia.create({
							data: {
								productId: product.id,
								type: "IMAGE",
								url: image.gatewayUrl,
								order: index + 1, // Use 1-based indexing to avoid 0
							},
						});
					} catch (error) {
						console.error(`Failed to create media entry ${index + 1}:`, error);
						// Continue with other media entries even if one fails
					}
				})
			);
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
