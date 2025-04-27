"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Form, Input, Select, message, Divider, Checkbox } from "antd";
import { ArrowLeftOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "@/lib/context/CartContext";
import { Route } from "next";

// Helper function to format currency
function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-KE", {
		style: "currency",
		currency: "KES",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

const IPFS_GATEWAY =
	process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

function getIpfsUrl(hash: string | null | undefined): string | null {
	if (!hash) return null;
	if (hash.startsWith("http")) return hash;
	if (hash.startsWith("ipfs://")) {
		return `${IPFS_GATEWAY}${hash.replace("ipfs://", "")}`;
	}
	return `${IPFS_GATEWAY}${hash}`;
}

interface Business {
	id: string;
	name: string;
	description: string | null;
	logo: string | null;
	type: string;
	status: string;
	paymentMethods: string[];
	shippingPolicy?: string;
}

interface CheckoutClientProps {
	business: Business;
}

export default function CheckoutClient({ business }: CheckoutClientProps) {
	const router = useRouter();
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const { items, getCartTotal, clearCart, shippingAddress, shippingFee } =
		useCart();
	const [selectedMethod, setSelectedMethod] = useState<string>("DISCUSSED");
	const [selectedPaymentMethod, setSelectedPaymentMethod] =
		useState<string>("");

	// Initialize form with default values
	useEffect(() => {
		if (shippingFee !== null) {
			setSelectedMethod("DISCUSSED");
			form.setFieldsValue({
				shippingMethod: "DISCUSSED",
			});
		}
	}, [shippingFee, form]);

	console.log(
		"CheckoutClient rendering. Shipping Address from useCart:",
		shippingAddress
	);

	// Calculate order summary
	const cartSubtotal = getCartTotal();
	const tax = cartSubtotal * 0.05; // 5% tax rate
	const cartTotal =
		cartSubtotal +
		(selectedMethod === "PICKUP_ONLY" ? 0 : shippingFee || 0) +
		tax;

	// Payment method display names and descriptions
	const paymentMethodInfo = {
		MPESA: {
			title: "M-Pesa",
			description: "Pay with M-Pesa mobile money",
		},
		CARD: {
			title: "Credit/Debit Card",
			description: "Pay with Visa, Mastercard, or other cards",
		},
		BANK_TRANSFER: {
			title: "Bank Transfer",
			description: "Pay directly from your bank account",
		},
		CASH: {
			title: "Cash on Delivery",
			description: "Pay with cash when you receive your order",
		},
		CRYPTO: {
			title: "Cryptocurrency",
			description: "Pay with Bitcoin, Ethereum, or other cryptocurrencies",
		},
	};

	// Shipping method display names and descriptions
	const shippingMethodInfo = {
		LOCAL_DELIVERY: {
			title: "Local Delivery",
			description: "Delivery within your city",
			price: 500,
		},
		NATIONWIDE: {
			title: "Nationwide Delivery",
			description: "Delivery across the country",
			price: 1500,
		},
		INTERNATIONAL: {
			title: "International Delivery",
			description: "Delivery to international locations",
			price: 5000,
		},
		PICKUP_ONLY: {
			title: "Pickup Only",
			description: "Collect from our store",
			price: 0,
		},
		DISCUSSED: {
			title: "Discussed",
			description: "Shipping fee discussed with seller",
			price: shippingFee || 0,
		},
	};

	// Memoize the shipping method options to prevent unnecessary re-renders
	const shippingMethodOptions = useMemo(() => {
		return Object.entries(shippingMethodInfo).map(([method, info]) => {
			const isPickupOnly = method === "PICKUP_ONLY";
			const isDiscussed = method === "DISCUSSED";
			const isEnabled = isPickupOnly || isDiscussed;
			return {
				method,
				info,
				isEnabled,
			};
		});
	}, [shippingMethodInfo]);

	// Memoize the payment method options to prevent unnecessary re-renders
	const paymentMethodOptions = useMemo(() => {
		return Object.entries(paymentMethodInfo).map(([method, info]) => {
			const isAccepted = business.paymentMethods.includes(method);
			const isCashOnDelivery = method === "CASH";
			const isEnabled =
				isAccepted && (!isCashOnDelivery || selectedMethod === "PICKUP_ONLY");
			return {
				method,
				info,
				isAccepted,
				isEnabled,
			};
		});
	}, [paymentMethodInfo, business.paymentMethods, selectedMethod]);

	const handleShippingMethodSelect = (method: string) => {
		setSelectedMethod(method);
		form.setFieldsValue({ shippingMethod: method });
		// Clear payment method if it was cash on delivery and shipping method is not pickup
		if (selectedPaymentMethod === "CASH" && method !== "PICKUP_ONLY") {
			setSelectedPaymentMethod("");
		}
	};

	const handlePaymentMethodSelect = (method: string) => {
		setSelectedPaymentMethod(method);
	};

	const handleSubmit = async (values: any) => {
		try {
			setLoading(true);

			// Prepare payment data (do NOT create order yet)
			const paymentData = {
				businessId: business.id,
				items: items.map((item) => ({
					id: item.product.id,
					variantId: item.variant?.id,
					quantity: item.quantity,
					price: Number(item.product.price),
					variant: item.variant
						? {
								id: item.variant.id,
								name: item.variant.name,
								price: Number(item.variant.price),
						  }
						: null,
				})),
				totalAmount: cartTotal,
				shippingAddress: shippingAddress,
				paymentMethod: selectedPaymentMethod,
				shippingMethod: selectedMethod,
				shippingFee: shippingFee,
				subtotal: cartSubtotal,
				tax: tax,
				metadata: {
					cart: {
						items: items.map((item) => ({
							product: {
								id: item.product.id,
								name: item.product.name,
								price: Number(item.product.price),
								media: (item.product as any).media,
							},
							variant: item.variant
								? {
										id: item.variant.id,
										name: item.variant.name,
										price: Number(item.variant.price),
								  }
								: null,
							quantity: item.quantity,
						})),
						subtotal: cartSubtotal,
						shippingFee: shippingFee,
						tax: tax,
						total: cartTotal,
					},
				},
			};

			// Log payment data
			console.log(
				"Payment data being sent:",
				JSON.stringify(paymentData, null, 2)
			);

			// Initialize payment
			const paymentResponse = await fetch("/api/payment", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(paymentData),
			});

			if (!paymentResponse.ok) {
				const errorData = await paymentResponse.json();
				console.error("Payment initialization failed:", errorData);
				throw new Error(errorData.message || "Failed to initialize payment");
			}

			const payment = await paymentResponse.json();
			console.log("Payment initialized successfully:", payment);

			// Handle payment based on type
			if (payment.type === "fiat") {
				// Redirect to Paystack payment page
				window.location.href = payment.authorizationUrl;
			} else if (payment.type === "crypto") {
				// Show crypto payment instructions
				message.info(
					"Please complete the crypto payment to finalize your order"
				);
				// TODO: Implement crypto payment UI
			}

			// Do NOT show order success message here
			// Do NOT redirect to order confirmation page here
		} catch (error) {
			console.error("Error placing order:", error);
			message.error(
				error instanceof Error
					? error.message
					: "Failed to place order. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	const logoUrl = getIpfsUrl(business.logo);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Header */}
				<div className="mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
						<p className="text-lg text-gray-600 mt-2">Complete your purchase</p>
					</div>
				</div>

				{items.length > 0 ? (
					<div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
						{/* Cart Summary - 60% width */}
						<div className="lg:col-span-3">
							<div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 sticky top-4">
								<h3 className="text-xl font-bold text-gray-900 mb-6">
									Order Summary
								</h3>

								{/* Order Items */}
								<div className="space-y-4 mb-6">
									{items.map((item) => (
										<div
											key={`${item.product.id}-${
												item.variant?.id || "no-variant"
											}`}
											className="flex items-center gap-4"
										>
											<div className="relative h-16 w-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
												{(item.product as any).media?.[0] ? (
													<Image
														src={
															getIpfsUrl((item.product as any).media[0].url) ||
															""
														}
														alt={item.product.name}
														fill
														sizes="(max-width: 768px) 64px, 64px"
														className="object-cover"
													/>
												) : (
													<div className="h-full w-full flex items-center justify-center">
														<ShoppingCartOutlined className="text-2xl text-gray-300" />
													</div>
												)}
											</div>
											<div className="flex-grow">
												<h4 className="font-medium text-gray-900">
													{item.product.name}
												</h4>
												<p className="text-sm text-gray-500">
													Quantity: {item.quantity}
												</p>
											</div>
											<span className="font-semibold text-gray-900">
												{formatCurrency(
													Number(item.product.price) * item.quantity
												)}
											</span>
										</div>
									))}
								</div>

								<Divider />

								{/* Order Totals */}
								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<span className="text-gray-600">Subtotal</span>
										<span className="font-semibold text-gray-900">
											{formatCurrency(cartSubtotal)}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-gray-600">Shipping</span>
										<span className="font-semibold text-gray-900">
											{selectedMethod === "PICKUP_ONLY"
												? "Free"
												: formatCurrency(shippingFee || 0)}
										</span>
									</div>
									{shippingAddress && (
										<div className="flex justify-between items-start pt-4 border-t border-gray-200 mt-4">
											<span className="text-gray-600">Shipping Address</span>
											<span className="font-semibold text-gray-900 text-right whitespace-pre-wrap">
												{shippingAddress}
											</span>
										</div>
									)}
									<div className="flex justify-between items-center">
										<span className="text-gray-600">Tax (5%)</span>
										<span className="font-semibold text-gray-900">
											{formatCurrency(tax)}
										</span>
									</div>
									<Divider className="my-4" />
									<div className="flex justify-between items-center">
										<span className="text-lg font-bold text-gray-900">
											Total
										</span>
										<span className="text-2xl font-bold text-blue-600">
											{formatCurrency(cartTotal)}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Payment Form - 40% width */}
						<div className="lg:col-span-2">
							<Form
								form={form}
								layout="vertical"
								onFinish={handleSubmit}
								className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
							>
								<h2 className="text-xl font-bold text-gray-900 mb-6">
									Payment Information
								</h2>

								<div className="space-y-6">
									{/* Shipping Method Selection */}
									<Form.Item
										name="shippingMethod"
										label="Shipping Method"
										rules={[
											{
												required: true,
												message: "Please select a shipping method",
											},
										]}
									>
										<div className="space-y-3">
											{shippingMethodOptions.map(
												({ method, info, isEnabled }) => (
													<div
														key={method}
														className={`p-4 border rounded-lg ${
															isEnabled
																? "cursor-pointer hover:border-blue-500 transition-colors"
																: "cursor-not-allowed opacity-50"
														}`}
														onClick={() =>
															isEnabled && handleShippingMethodSelect(method)
														}
													>
														<div className="flex items-center justify-between">
															<div>
																<h4 className="font-medium text-gray-900">
																	{info.title}
																</h4>
																<p className="text-sm text-gray-500">
																	{info.description}
																</p>
															</div>
															<div className="flex items-center">
																<span className="text-gray-900 font-medium">
																	{method === "PICKUP_ONLY"
																		? "Free"
																		: formatCurrency(info.price)}
																</span>
																<div
																	className={`ml-3 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
																		selectedMethod === method
																			? "border-blue-600 bg-blue-600"
																			: "border-gray-300"
																	}`}
																>
																	{selectedMethod === method && (
																		<div className="h-2.5 w-2.5 rounded-full bg-white" />
																	)}
																</div>
															</div>
														</div>
													</div>
												)
											)}
										</div>
									</Form.Item>

									{/* Payment Method Selection */}
									<div className="space-y-3">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Payment Method
										</label>
										{paymentMethodOptions.map(
											({ method, info, isAccepted, isEnabled }) => (
												<div
													key={method}
													className={`p-4 border rounded-lg ${
														isEnabled
															? "cursor-pointer hover:border-blue-500 transition-colors"
															: "opacity-50 cursor-not-allowed"
													}`}
													onClick={() =>
														isEnabled && handlePaymentMethodSelect(method)
													}
												>
													<div className="flex items-center gap-3">
														<div
															className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
																selectedPaymentMethod === method
																	? "border-blue-500 bg-blue-500"
																	: "border-gray-300"
															}`}
														>
															{selectedPaymentMethod === method && (
																<div className="w-2 h-2 rounded-full bg-white"></div>
															)}
														</div>
														<div>
															<h3 className="font-medium text-gray-900">
																{info.title}
															</h3>
															<p className="text-sm text-gray-500">
																{info.description}
															</p>
															{!isEnabled && (
																<p className="text-sm text-red-500 mt-1">
																	{method === "CASH"
																		? "Only available for pickup orders"
																		: "Not available for this business"}
																</p>
															)}
														</div>
													</div>
												</div>
											)
										)}
									</div>
								</div>

								{/* Service Agreement */}
								<Form.Item
									name="serviceAgreement"
									valuePropName="checked"
									rules={[
										{
											validator: (_, value) =>
												value
													? Promise.resolve()
													: Promise.reject(
															new Error("Please accept the service agreement")
													  ),
										},
									]}
									style={{ marginTop: 24, marginBottom: 0 }}
								>
									<Checkbox>
										<span className="font-semibold text-gray-900">
											I agree to the service terms and conditions
										</span>
										<div className="text-gray-500 text-sm mt-1">
											By checking this box, you agree to our service terms and
											conditions, including payment processing and delivery
											policies.
										</div>
									</Checkbox>
								</Form.Item>

								<Button
									type="primary"
									htmlType="submit"
									size="large"
									loading={loading}
									className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-0 text-base font-semibold rounded-lg mt-6"
								>
									Place Order
								</Button>
							</Form>
						</div>
					</div>
				) : (
					<div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
						<div className="mb-8">
							<ShoppingCartOutlined className="text-6xl text-gray-300" />
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Your cart is empty
						</h2>
						<p className="text-gray-600 mb-8">
							Please add items to your cart before proceeding to checkout.
						</p>
						<Link href={`/${business.id}`}>
							<Button
								type="primary"
								size="large"
								className="bg-blue-600 hover:bg-blue-700 border-0 h-12 px-8 text-base font-semibold rounded-lg"
							>
								Start Shopping
							</Button>
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
