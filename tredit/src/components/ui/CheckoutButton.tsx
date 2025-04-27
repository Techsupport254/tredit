"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { LoadingSpinner } from "./LoadingSpinner";

interface CheckoutButtonProps {
	cartItems: Array<{
		id: string;
		name: string;
		price: number;
		quantity: number;
	}>;
	businessId: string;
	onSuccess?: () => void;
	onError?: (error: string) => void;
}

export function CheckoutButton({
	cartItems,
	businessId,
	onSuccess,
	onError,
}: CheckoutButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleCheckout = async () => {
		try {
			setIsLoading(true);

			// Calculate total amount
			const totalAmount = cartItems.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0
			);

			// Create order
			const response = await fetch("/api/orders", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					businessId,
					items: cartItems,
					totalAmount,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to create order");
			}

			const order = await response.json();

			// Initialize payment
			const paymentResponse = await fetch("/api/payments/initialize", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					orderId: order.id,
					amount: totalAmount,
					businessId,
				}),
			});

			if (!paymentResponse.ok) {
				const error = await paymentResponse.json();
				throw new Error(error.message || "Failed to initialize payment");
			}

			const payment = await paymentResponse.json();

			// Redirect to payment page
			router.push(`/payment/${payment.id}`);

			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			console.error("Checkout error:", error);
			if (onError) {
				onError(error instanceof Error ? error.message : "An error occurred");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			onClick={handleCheckout}
			disabled={isLoading || cartItems.length === 0}
			className="w-full"
		>
			{isLoading ? (
				<LoadingSpinner className="w-5 h-5" />
			) : (
				"Proceed to Checkout"
			)}
		</Button>
	);
}
