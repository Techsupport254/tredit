"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { message, Spin } from "antd";

export default function PaymentVerification() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [verifying, setVerifying] = useState(true);

	useEffect(() => {
		const verifyPayment = async () => {
			try {
				const reference = searchParams.get("reference");
				if (!reference) {
					throw new Error("No payment reference found");
				}

				const response = await fetch(`/api/payment?reference=${reference}`);
				if (!response.ok) {
					throw new Error("Payment verification failed");
				}

				const result = await response.json();
				if (result.status === "success") {
					message.success("Payment successful! Your order has been confirmed.");
					// Redirect to verifyUrl after 2 seconds
					setTimeout(() => {
						if (result.verifyUrl) {
							router.push(result.verifyUrl);
						} else {
							message.info("Order verified, but no redirect URL provided.");
						}
					}, 2000);
				} else {
					message.error("Payment verification failed. Please contact support.");
					router.push("/checkout");
				}
			} catch (error) {
				console.error("Payment verification error:", error);
				message.error("Failed to verify payment. Please contact support.");
				router.push("/checkout");
			} finally {
				setVerifying(false);
			}
		};

		verifyPayment();
	}, [router, searchParams]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="text-center">
				<Spin size="large" spinning={verifying} />
				<h1 className="text-2xl font-bold mt-4">
					{verifying ? "Verifying Payment..." : "Payment Verification Complete"}
				</h1>
				<p className="text-gray-600 mt-2">
					{verifying
						? "Please wait while we verify your payment"
						: "You will be redirected shortly"}
				</p>
			</div>
		</div>
	);
}
