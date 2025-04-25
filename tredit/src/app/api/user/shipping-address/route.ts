import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { shippingAddress: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({ shippingAddress: user.shippingAddress });
	} catch (error) {
		console.error("Error fetching shipping address:", error);
		return NextResponse.json(
			{ error: "Failed to fetch shipping address" },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { shippingAddress } = await request.json();

		if (!shippingAddress) {
			return NextResponse.json(
				{ error: "Shipping address is required" },
				{ status: 400 }
			);
		}

		const user = await prisma.user.update({
			where: { id: session.user.id },
			data: { shippingAddress },
			select: { shippingAddress: true },
		});

		return NextResponse.json({ shippingAddress: user.shippingAddress });
	} catch (error) {
		console.error("Error updating shipping address:", error);
		return NextResponse.json(
			{ error: "Failed to update shipping address" },
			{ status: 500 }
		);
	}
}
