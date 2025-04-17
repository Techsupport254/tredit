import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwtToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("auth-token")?.value;

		if (!token) {
			return NextResponse.json({ user: null }, { status: 401 });
		}

		// Verify token
		const decoded = await verifyJwtToken(token);
		if (!decoded || !decoded.id) {
			return NextResponse.json({ user: null }, { status: 401 });
		}

		// Get user from database (without password)
		const user = await prisma.user.findUnique({
			where: { id: decoded.id },
			select: {
				id: true,
				email: true,
				name: true,
				walletAddress: true,
				role: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!user) {
			return NextResponse.json({ user: null }, { status: 401 });
		}

		return NextResponse.json({ user });
	} catch (error) {
		console.error("Session error:", error);
		return NextResponse.json({ user: null }, { status: 401 });
	}
}
