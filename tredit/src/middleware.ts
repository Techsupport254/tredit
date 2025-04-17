import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/auth/jwt";

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/forgot-password", "/404", "/"];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Skip middleware for static files and API routes
	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api/") ||
		pathname.startsWith("/favicon.ico") ||
		pathname.includes(".") ||
		pathname.startsWith("/illustrations")
	) {
		return NextResponse.next();
	}

	// Allow access to public routes
	if (publicRoutes.includes(pathname)) {
		return NextResponse.next();
	}

	// Check for auth token
	const token = request.cookies.get("auth-token")?.value;

	if (!token) {
		// Redirect to login
		return NextResponse.redirect(new URL("/login", request.url));
	}

	try {
		// Verify token
		const decoded = await verifyJwtToken(token);
		if (!decoded) {
			throw new Error("Invalid token");
		}
		return NextResponse.next();
	} catch (error) {
		// Token is invalid, redirect to login
		return NextResponse.redirect(new URL("/login", request.url));
	}
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
