import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/userService";
import { handleError } from "@/lib/errors";
import { ApiResponse } from "@/types/api";
import { signIn } from "next-auth/react";
import { z } from "zod";

const userService = new UserService();

// Login schema
const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export async function POST(
	request: NextRequest
): Promise<NextResponse<ApiResponse>> {
	try {
		const data = await request.json();

		// Validate request data
		const validatedData = await loginSchema.parseAsync(data);

		// Authenticate user
		const user = await userService.authenticateUser(
			validatedData.email,
			validatedData.password
		);

		return NextResponse.json({
			success: true,
			data: { user },
			message: "Login successful",
		});
	} catch (error) {
		const apiError = handleError(error);
		return NextResponse.json(
			{ success: false, error: apiError },
			{ status: getStatusCode(apiError.code) }
		);
	}
}

function getStatusCode(errorCode: string): number {
	switch (errorCode) {
		case "VALIDATION_ERROR":
			return 400;
		case "NOT_FOUND":
			return 404;
		case "UNAUTHORIZED":
			return 401;
		default:
			return 500;
	}
}
