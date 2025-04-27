import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that require authentication
const protectedPaths = [
	"/dashboard",
	"/settings",
	"/api/business",
	"/api/user",
	"/api/notifications",
];

// Paths that are only accessible to non-authenticated users
const authPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if the path is protected
	const isProtectedPath = protectedPaths.some((path) =>
		pathname.startsWith(path)
	);
	const isAuthPath = authPaths.some((path) => pathname === path);

	// Get the token using NextAuth.js
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	// Redirect authenticated users away from auth pages
	if (isAuthPath && token) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// Redirect unauthenticated users to login from protected pages
	if (isProtectedPath && !token) {
		const searchParams = new URLSearchParams({
			callbackUrl: pathname,
		});
		return NextResponse.redirect(
			new URL(`/login?${searchParams}`, request.url)
		);
	}

	// For API routes that require authentication
	if (pathname.startsWith("/api") && isProtectedPath && !token) {
		return NextResponse.json(
			{ error: "Authentication required" },
			{ status: 401 }
		);
	}

	// If trying to access protected pages while not logged in, redirect to login with callback
	if (!token && (pathname.includes("/profile") || pathname.includes("/cart"))) {
		const callbackUrl = encodeURIComponent(pathname + request.nextUrl.hash);
		return NextResponse.redirect(
			new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
		);
	}

	return NextResponse.next();
}

// Configure paths that trigger the middleware
export const config = {
	matcher: [
		/*
		 * Match all paths except:
		 * 1. /api/auth (NextAuth.js routes)
		 * 2. /_next (Next.js internals)
		 * 3. /static (static files)
		 * 4. /favicon.ico, /robots.txt (static files)
		 */
		"/((?!api/auth|_next|static|favicon.ico|robots.txt).*)",
		"/login",
		"/register",
		"/:path*/profile/:path*",
		"/:path*/profile#:path*",
		"/:path*/cart",
	],
};
