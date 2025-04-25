"use client";

import { useSearchParams } from "next/navigation";
import { Button, Result } from "antd";
import Link from "next/link";

export default function AuthErrorPage() {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");

	const getErrorMessage = (error: string | null) => {
		switch (error) {
			case "Configuration":
				return "There is a problem with the server configuration.";
			case "AccessDenied":
				return "You do not have permission to sign in.";
			case "Verification":
				return "The verification link may have expired or already been used.";
			default:
				return "An error occurred during authentication.";
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<Result
				status="error"
				title="Authentication Error"
				subTitle={getErrorMessage(error)}
				extra={[
					<Link href="/login" key="login">
						<Button type="primary">Back to Login</Button>
					</Link>,
					<Link href="/" key="home">
						<Button>Go to Home</Button>
					</Link>,
				]}
			/>
		</div>
	);
}
