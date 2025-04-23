import { NextResponse } from "next/server";
import { IPFSService } from "@/lib/services/ipfs.service";

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const files = formData.getAll("files") as File[];
		const productName = formData.get("productName") as string;

		if (!files || files.length === 0) {
			return NextResponse.json({ error: "No files provided" }, { status: 400 });
		}

		if (!productName) {
			return NextResponse.json(
				{ error: "Product name is required" },
				{ status: 400 }
			);
		}

		console.log("Starting upload to Pinata...");
		const ipfsService = IPFSService.getInstance();

		const results = await Promise.all(
			files.map(async (file, index) => {
				const result = await ipfsService.uploadFiles(
					[{ name: file.name, file }],
					{
						name: `Product_${productName}_Image_${index + 1}`,
						type: "product_image",
						keyvalues: {
							productName,
							timestamp: new Date().toISOString(),
						},
					}
				);
				return {
					hash: result,
					ipfsUrl: `ipfs://${result}`,
					gatewayUrl: `${process.env.PINATA_GATEWAY_URL}/ipfs/${result}`,
				};
			})
		);

		console.log("Upload completed:", results);

		return NextResponse.json({
			success: true,
			message: "Files uploaded successfully",
			data: results,
		});
	} catch (error: any) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to upload files",
				error: error.message,
			},
			{ status: 500 }
		);
	}
}
