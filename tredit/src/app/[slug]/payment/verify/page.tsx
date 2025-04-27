"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Spin, message } from "antd";

export default function PaymentVerifyPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const [verifying, setVerifying] = useState(true);

	useEffect(() => {
		const verifyPayment = async () => {
			const reference = searchParams.get("reference");
			if (!reference) {
				message.error("No payment reference found");
				setVerifying(false);
				return;
			}

			try {
				const response = await fetch(`/api/payment?reference=${reference}`);
				const result = await response.json();

				if (result.status === "success") {
					message.success("Payment successful! Your order has been confirmed.");
					// Redirect to summary/thank-you page after 2 seconds
					setTimeout(() => {
						if (result.ordersUrl) {
							router.push(result.ordersUrl);
						} else if (result.verifyUrl) {
							router.push(result.verifyUrl);
						} else {
							message.info("Order verified, but no redirect URL provided.");
						}
					}, 2000);
				} else {
					message.error(
						result.error ||
							"Payment verification failed. Please contact support."
					);
					const slug = pathname.split("/")[1];
					router.push(`/${slug}/checkout`);
				}
			} catch (error) {
				message.error("Failed to verify payment. Please contact support.");
				const slug = pathname.split("/")[1];
				router.push(`/${slug}/checkout`);
			} finally {
				setVerifying(false);
			}
		};

		verifyPayment();
	}, [router, searchParams, pathname]);

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
