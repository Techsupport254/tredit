"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Form, Input, Select, message, Divider } from "antd";
import { ArrowLeftOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "@/lib/context/CartContext";
import { Route } from "next";

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
}

interface CheckoutClientProps {
	business: Business;
}

export default function CheckoutClient({ business }: CheckoutClientProps) {
	const router = useRouter();
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const { items, getCartTotal, clearCart, shippingAddress } = useCart();

	console.log(
		"CheckoutClient rendering. Shipping Address from useCart:",
		shippingAddress
	);

	// Calculate order summary
	const cartSubtotal = getCartTotal();
	const shipping = items.length > 0 ? 9.99 : 0;
	const tax = cartSubtotal * 0.05; // 5% tax rate
	const cartTotal = cartSubtotal + shipping + tax;

	const handleSubmit = async (values: any) => {
		try {
			setLoading(true);

			// Create order
			const response = await fetch("/api/orders", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					shippingAddress: values.address,
					paymentMethod: values.paymentMethod,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to create order");
			}

			const order = await response.json();

			// Clear cart after successful order
			clearCart();

			// Show success message
			message.success("Order placed successfully!");

			// Redirect to order confirmation page with type casting
			router.push(`/${business.id}/orders/${order.id}` as Route);
		} catch (error) {
			console.error("Error placing order:", error);
			message.error("Failed to place order. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const logoUrl = getIpfsUrl(business.logo);

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

			<main className="flex-grow flex flex-col min-h-[calc(100vh-64px)]">
				<div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
					{/* Header with back button */}
					<div className="mb-8 flex items-center gap-4">
						<Link href={`/${business.id}/cart`}>
							<Button
								icon={<ArrowLeftOutlined />}
								className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
							>
								Back to Cart
							</Button>
						</Link>
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
							<p className="text-lg text-gray-600 mt-2">
								Complete your purchase
							</p>
						</div>
					</div>

					{items.length > 0 ? (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{/* Checkout Form */}
							<div className="lg:col-span-2">
								<Form
									form={form}
									layout="vertical"
									onFinish={handleSubmit}
									className="bg-white rounded-lg p-6"
								>
									<h2 className="text-xl font-bold text-gray-900 mb-6">
										Shipping Information
									</h2>

									<Form.Item
										name="address"
										label="Shipping Address"
										rules={[
											{
												required: true,
												message: "Please enter your shipping address",
											},
										]}
									>
										<Input.TextArea
											rows={4}
											placeholder="Enter your full shipping address"
										/>
									</Form.Item>

									<Form.Item
										name="paymentMethod"
										label="Payment Method"
										rules={[
											{
												required: true,
												message: "Please select a payment method",
											},
										]}
									>
										<Select placeholder="Select payment method">
											<Select.Option value="credit_card">
												Credit Card
											</Select.Option>
											<Select.Option value="paypal">PayPal</Select.Option>
											<Select.Option value="bank_transfer">
												Bank Transfer
											</Select.Option>
										</Select>
									</Form.Item>

									<Button
										type="primary"
										htmlType="submit"
										size="large"
										loading={loading}
										className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-0 text-base font-semibold"
									>
										Place Order
									</Button>
								</Form>
							</div>

							{/* Order Summary */}
							<div className="lg:col-span-1">
								<div className="bg-gray-50 rounded-lg p-6 sticky top-4">
									<h3 className="text-xl font-bold text-gray-900 mb-6">
										Order Summary
									</h3>

									{/* Order Items */}
									<div className="space-y-4 mb-6">
										{items.map((item) => (
											<div
												key={item.product.id}
												className="flex items-center gap-4"
											>
												<div className="relative h-16 w-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
													{(item.product as any).media?.[0] ? (
														<Image
															src={
																getIpfsUrl(
																	(item.product as any).media[0].url
																) || ""
															}
															alt={item.product.name}
															fill
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
													$
													{(Number(item.product.price) * item.quantity).toFixed(
														2
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
												${cartSubtotal.toFixed(2)}
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-gray-600">Shipping</span>
											<span className="font-semibold text-gray-900">
												${shipping.toFixed(2)}
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
												${tax.toFixed(2)}
											</span>
										</div>
										<Divider className="my-4" />
										<div className="flex justify-between items-center">
											<span className="text-lg font-bold text-gray-900">
												Total
											</span>
											<span className="text-2xl font-bold text-blue-600">
												${cartTotal.toFixed(2)}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="text-center py-16">
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
									className="bg-blue-600 hover:bg-blue-700 border-0 h-12 px-8 text-base font-semibold"
								>
									Start Shopping
								</Button>
							</Link>
						</div>
					)}
				</div>
			</main>

			<Footer business={business} logoUrl={logoUrl} />
		</div>
	);
}
