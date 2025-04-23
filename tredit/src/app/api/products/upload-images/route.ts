import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { IPFSService } from "@/lib/services/ipfs.service";

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
		console.log("\n=== PARSING FORM DATA ===");
		const formData = await req.formData();
		const productName = formData.get("productName") as string;
		const images = formData.getAll("images") as File[];

		console.log("Product Name:", productName);
		console.log("Image Count:", images.length);
		console.log("===========================\n");

		if (!productName) {
			throw new Error("Product name is required");
		}

		if (images.length === 0) {
			throw new Error("No images provided");
		}

		// Initialize IPFS service
		const ipfsService = new IPFSService();

		// Upload images
		console.log("\n=== UPLOADING IMAGES TO PINATA ===");
		const imageHashes = await Promise.all(
			images.map(async (image, index) => {
				await sendProgress({
					type: "progress",
					stage: "images",
					current: index + 1,
					total: images.length,
					progress: 0,
					message: `Uploading image ${index + 1}/${images.length}`,
				});

				const result = await ipfsService.uploadFiles(
					[{ name: image.name, file: image }],
					{
						name: `Product_${productName}_Image_${index + 1}`,
						type: "product_image",
						keyvalues: {
							productName,
							timestamp: new Date().toISOString(),
						},
					}
				);

				await sendProgress({
					type: "progress",
					stage: "images",
					current: index + 1,
					total: images.length,
					progress: 100,
					message: `Image ${index + 1} uploaded successfully`,
				});

				return {
					hash: result,
					ipfsUrl: `ipfs://${result}`,
					gatewayUrl: `${process.env.PINATA_GATEWAY_URL}/ipfs/${result}`,
				};
			})
		);

		console.log("All images uploaded successfully:", imageHashes);
		console.log("===========================\n");

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
		console.error("\n=== OPERATION FAILED ===");
		console.error("Error:", error);
		console.error("===========================\n");

		// Close the writer in case of error
		if (writer) {
			await writer.close();
		}

		// Return detailed error response
		return NextResponse.json(
			{
				error: "Failed to upload images",
				details: {
					message: error.message,
					timestamp: new Date().toISOString(),
				},
			},
			{ status: 500 }
		);
	}
}
