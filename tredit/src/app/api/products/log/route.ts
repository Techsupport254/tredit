import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const formData = await request.json();

		// Log the received data
		console.log("Received form data:", JSON.stringify(formData, null, 2));

		return NextResponse.json({
			success: true,
			message: "Form data received and logged successfully",
			data: formData,
		});
	} catch (error) {
		console.error("Error processing form data:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to process form data",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
