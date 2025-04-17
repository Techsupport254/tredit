import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
	const cookieStore = cookies();

	// Clear the auth cookie
	cookieStore.set({
		name: "auth-token",
		value: "",
		httpOnly: true,
		expires: new Date(0), // Immediately expire
		path: "/",
		sameSite: "lax",
	});

	return NextResponse.json({ message: "Logged out successfully" });
}
