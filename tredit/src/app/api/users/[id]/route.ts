import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/userService";
import { handleError } from "@/lib/errors";
import { ApiResponse, UpdateUserRequest } from "@/types/api";

const userService = new UserService();

// Get user by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
	try {
		const user = await userService.getUserById(params.id);
		return NextResponse.json({
			success: true,
			data: user,
		});
	} catch (error) {
		const apiError = handleError(error);
		return NextResponse.json(
			{ success: false, error: apiError },
			{ status: getStatusCode(apiError.code) }
		);
	}
}

// Update user
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
	try {
		const data = (await request.json()) as UpdateUserRequest;
		const user = await userService.updateUser(params.id, data);
		return NextResponse.json({
			success: true,
			data: user,
			message: "User updated successfully",
		});
	} catch (error) {
		const apiError = handleError(error);
		return NextResponse.json(
			{ success: false, error: apiError },
			{ status: getStatusCode(apiError.code) }
		);
	}
}

// Delete user
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
	try {
		await userService.deleteUser(params.id);
		return NextResponse.json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (error) {
		const apiError = handleError(error);
		return NextResponse.json(
			{ success: false, error: apiError },
			{ status: getStatusCode(apiError.code) }
		);
	}
}

// Helper function to map error codes to HTTP status codes
function getStatusCode(errorCode: string): number {
	switch (errorCode) {
		case "VALIDATION_ERROR":
			return 400;
		case "NOT_FOUND":
			return 404;
		case "UNAUTHORIZED":
			return 401;
		case "FORBIDDEN":
			return 403;
		case "CONFLICT":
			return 409;
		default:
			return 500;
	}
}
