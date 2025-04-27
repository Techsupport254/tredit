import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const { fee } = await request.json();

		if (typeof fee !== "number" || fee < 0) {
			return NextResponse.json(
				{ message: "Invalid shipping fee" },
				{ status: 400 }
			);
		}

		// Update cart with shipping fee
		const cart = await prisma.cart.update({
			where: {
				userId: session.user.id,
			},
			data: {
				shippingFee: fee,
			},
		});

		return NextResponse.json(cart);
	} catch (error) {
		console.error("Error updating shipping fee:", error);
		return NextResponse.json(
			{ message: "Failed to update shipping fee" },
			{ status: 500 }
		);
	}
}
