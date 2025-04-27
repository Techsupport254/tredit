"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface PaymentPageProps {
	params: {
		id: string;
	};
}

export default function PaymentPage({ params }: PaymentPageProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const initializePayment = async () => {
			try {
				const response = await fetch(`/api/payments/${params.id}`);

				if (!response.ok) {
					throw new Error("Failed to get payment details");
				}

				const payment = await response.json();

				if (payment.authorizationUrl) {
					window.location.href = payment.authorizationUrl;
				} else {
					setError("Payment initialization failed");
				}
			} catch (error) {
				console.error("Payment initialization error:", error);
				setError("An error occurred while initializing payment");
			} finally {
				setIsLoading(false);
			}
		};

		initializePayment();
	}, [params.id]);

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

	return null;
}
