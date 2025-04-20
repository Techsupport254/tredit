import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json(
			{ error: "This endpoint is not available in production" },
			{ status: 403 }
		);
	}

	try {
		// Delete all users
		await prisma.user.deleteMany();

		return NextResponse.json({ message: "All users deleted successfully" });
	} catch (error) {
		console.error("Error deleting users:", error);
		return NextResponse.json(
			{ error: "Failed to delete users" },
			{ status: 500 }
		);
	}
}
