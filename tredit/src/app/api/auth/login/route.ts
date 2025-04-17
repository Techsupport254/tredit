import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { signJwtToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
	console.log("=== LOGIN API START ===");
	try {
		const body = await request.json();
		console.log("Request body:", {
			email: body.email,
			passwordLength: body.password?.length,
		});
		const { email, password } = body;

		if (!email || !password) {
			console.log("Missing credentials");
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 }
			);
		}

		// Find the user
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			console.log("User not found:", email);
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 }
			);
		}

		console.log("User found:", { email: user.email, id: user.id });

		// Check password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		console.log("Password validation:", isPasswordValid);

		if (!isPasswordValid) {
			console.log("Invalid password for user:", email);
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 }
			);
		}

		// Check if user is active
		if (user.status !== "ACTIVE") {
			console.log("Inactive account:", email);
			return NextResponse.json(
				{ error: "Account is inactive or suspended" },
				{ status: 403 }
			);
		}

		// Create JWT token
		const token = await signJwtToken({
			id: user.id,
			email: user.email,
			role: user.role,
		});
		console.log("JWT token created");

		// Set cookie
		const cookieStore = await cookies();
		await cookieStore.set({
			name: "auth-token",
			value: token,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24, // 1 day
			path: "/",
			sameSite: "lax",
		});
		console.log("Auth cookie set");

		// Return user info (without password)
		const { password: _, ...userWithoutPassword } = user;

		// Get the callback URL from the request URL
		const url = new URL(request.url);
		console.log("Request URL:", request.url);
		console.log("Full URL object:", {
			href: url.href,
			pathname: url.pathname,
			search: url.search,
		});

		const callbackUrl = url.searchParams.get("callbackUrl") || "/dashboard";
		console.log("Callback URL:", callbackUrl);

		const response = {
			message: "Login successful",
			user: userWithoutPassword,
			redirectUrl: callbackUrl,
		};
		console.log("=== LOGIN RESPONSE ===", response);

		return NextResponse.json(response);
	} catch (error) {
		console.error("=== LOGIN ERROR ===", error);
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 500 }
		);
	}
}
