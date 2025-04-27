"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface PaymentVerificationPageProps {
	params: {
		orderId: string;
	};
}

export default function PaymentVerificationPage({
	params,
}: PaymentVerificationPageProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const reference = searchParams.get("reference");

	useEffect(() => {
		const verifyPayment = async () => {
			try {
				if (!reference) {
					throw new Error("Payment reference is missing");
				}

				const response = await fetch(`/api/payments/verify/${reference}`);

				if (!response.ok) {
					throw new Error("Failed to verify payment");
				}

				const payment = await response.json();

				if (payment.status === "COMPLETED") {
					setSuccess(true);
					// Redirect to order confirmation page after 3 seconds
					setTimeout(() => {
						router.push(`/orders/${params.orderId}`);
					}, 3000);
				} else {
					setError("Payment verification failed");
				}
			} catch (error) {
				console.error("Payment verification error:", error);
				setError("An error occurred while verifying payment");
			} finally {
				setIsLoading(false);
			}
		};

		verifyPayment();
	}, [reference, params.orderId, router]);

	if (isLoading) {
		return (
			<Container>
				<div className="flex items-center justify-center min-h-[60vh]">
					<LoadingSpinner className="w-8 h-8" />
				</div>
			</Container>
		);
	}

	if (error) {
		return (
			<Container>
				<div className="flex flex-col items-center justify-center min-h-[60vh]">
					<h1 className="text-2xl font-bold text-red-600 mb-4">
						Payment Error
					</h1>
					<p className="text-gray-600 mb-6">{error}</p>
					<button
						onClick={() => router.back()}
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Go Back
					</button>
				</div>
			</Container>
		);
	}

	if (success) {
		return (
			<Container>
				<div className="flex flex-col items-center justify-center min-h-[60vh]">
					<h1 className="text-2xl font-bold text-green-600 mb-4">
						Payment Successful!
					</h1>
					<p className="text-gray-600 mb-6">
						Your payment has been processed successfully. Redirecting to order
						details...
					</p>
				</div>
			</Container>
		);
	}

	return null;
}
