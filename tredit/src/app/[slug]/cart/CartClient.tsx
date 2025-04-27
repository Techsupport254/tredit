"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	Button,
	Input,
	InputNumber,
	Table,
	Empty,
	Divider,
	Space,
	Badge,
	Spin,
	Card,
} from "antd";
import {
	DeleteOutlined,
	ShoppingOutlined,
	ShoppingCartOutlined,
	ArrowLeftOutlined,
	MessageOutlined,
} from "@ant-design/icons";
import { useCart } from "@/lib/context/CartContext";
import { message } from "antd";
import { useRouter, useParams } from "next/navigation";
import { generateShareableLink } from "@/lib/utils/url";
import { CartItem } from "@/lib/context/CartContext";

// IPFS Gateway URL
const IPFS_GATEWAY =
	process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

// Helper function to convert IPFS hash to URL
function getIpfsUrl(hash: string | null | undefined): string | null {
	if (!hash) return null;
	if (hash.startsWith("http")) return hash;
	if (hash.startsWith("ipfs://")) {
		return `${IPFS_GATEWAY}${hash.replace("ipfs://", "")}`;
	}
	return `${IPFS_GATEWAY}${hash}`;
}

// Helper function to format currency
function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-KE", {
		style: "currency",
		currency: "KES",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

interface Business {
	id: string;
	name: string;
	description: string | null;
	logo: string | null;
	type: string;
	status: string;
}

interface ShippingAddress {
	address: string;
}

interface CartClientProps {
	business: Business;
}

export default function CartClient({ business }: CartClientProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [isSavingAddress, setIsSavingAddress] = useState(false);
	const {
		items,
		cartId,
		removeFromCart,
		updateQuantity,
		getCartTotal,
		isLoading,
		shippingAddress,
		updateShippingAddress,
		shippingFee,
		updateShippingFee,
	} = useCart();

	// Add debugging logs
	useEffect(() => {
		console.log("CartClient - Cart items:", items);
		items.forEach((item) => {
			console.log("CartClient - Cart item:", {
				id: item.id,
				product: item.product,
				variant: item.variant,
				quantity: item.quantity,
			});
		});
	}, [items]);

	// Fetch shipping fee when component mounts
	useEffect(() => {
		const fetchShippingFee = async () => {
			if (cartId) {
				try {
					const response = await fetch(`/api/carts/${cartId}`);
					if (response.ok) {
						const data = await response.json();
						if (data.shippingFee !== undefined) {
							updateShippingFee(data.shippingFee);
						}
					}
				} catch (error) {
					console.error("Error fetching shipping fee:", error);
				}
			}
		};

		fetchShippingFee();
	}, [cartId, updateShippingFee]);

	const router = useRouter();
	const params = useParams();
	const slug = params.slug as string;
	const businessPagePath = `/${slug}`;

	// Calculate cart summary
	const cartSubtotal = getCartTotal();
	const cartTotal = cartSubtotal + (shippingFee || 0);

	// Generate business URL
	const businessUrl = generateShareableLink(
		business.id,
		business.name,
		business.type
	);

	// Table columns configuration
	const columns = [
		{
			title: "Product",
			dataIndex: "product",
			key: "product",
			render: (_: any, record: CartItem) => {
				const productName = record.product?.name || "Product not found";
				const variantName = record.variant?.name;
				const variantValue = record.variant?.value;
				const imageMedia = (record.product as any)?.media?.[0];

				return (
					<div className="flex items-center gap-4">
						<div className="relative h-16 w-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border">
							{imageMedia ? (
								<Image
									src={getIpfsUrl(imageMedia.url) || ""}
									alt={productName}
									fill
									className="object-cover"
								/>
							) : (
								<div className="h-full w-full flex items-center justify-center">
									<ShoppingOutlined className="text-2xl text-gray-300" />
								</div>
							)}
						</div>
						<div>
							<h3 className="font-semibold text-gray-800">{productName}</h3>
							{variantName && variantValue && (
								<p className="text-sm text-gray-500 mt-1">
									{variantName}: {variantValue}
								</p>
							)}
						</div>
					</div>
				);
			},
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			render: (_: any, record: CartItem) => {
				let price = 0;
				if (
					record.variant &&
					typeof record.variant.price !== "undefined" &&
					record.variant.price !== null
				) {
					price = Number(record.variant.price);
				} else if (
					record.product &&
					typeof record.product.price !== "undefined" &&
					record.product.price !== null
				) {
					price = Number(record.product.price);
				}

				return (
					<span className="font-medium text-gray-700">
						{formatCurrency(price)}
					</span>
				);
			},
		},
		{
			title: "Quantity",
			dataIndex: "quantity",
			key: "quantity",
			render: (_: any, record: CartItem) => (
				<div className="flex items-center gap-2">
					<InputNumber
						min={1}
						max={record.variant?.stock ?? record.product?.stock ?? 10}
						value={record.quantity}
						onChange={(value) => handleQuantityChange(record.id!, value || 1)}
						className="w-20"
						size="middle"
					/>
				</div>
			),
		},
		{
			title: "Total",
			dataIndex: "total",
			key: "total",
			render: (_: any, record: CartItem) => {
				let price = 0;
				if (
					record.variant &&
					typeof record.variant.price !== "undefined" &&
					record.variant.price !== null
				) {
					price = Number(record.variant.price);
				} else if (
					record.product &&
					typeof record.product.price !== "undefined" &&
					record.product.price !== null
				) {
					price = Number(record.product.price);
				}

				return (
					<span className="font-bold text-blue-600">
						{formatCurrency(price * record.quantity)}
					</span>
				);
			},
		},
		{
			title: "",
			key: "action",
			render: (_: any, record: CartItem) => (
				<Button
					type="text"
					danger
					icon={<DeleteOutlined />}
					onClick={() => handleRemoveItem(record.id!)}
					className="hover:bg-red-50"
				/>
			),
		},
	];

	// Update handler signatures to accept cartItemId
	const handleQuantityChange = (cartItemId: string, quantity: number) => {
		updateQuantity(cartItemId, quantity);
	};

	const handleRemoveItem = (cartItemId: string) => {
		removeFromCart(cartItemId);
		message.success("Item removed from cart");
	};

	const handleAddressChange = (value: string) => {
		updateShippingAddress(value);
	};

	const handleSaveAddress = async () => {
		try {
			setIsSavingAddress(true);
			const response = await fetch("/api/user/shipping-address", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ shippingAddress }),
			});

			if (!response.ok) {
				throw new Error("Failed to save shipping address");
			}

			message.success("Shipping address saved successfully");
		} catch (error) {
			console.error("Error saving shipping address:", error);
			message.error("Failed to save shipping address");
		} finally {
			setIsSavingAddress(false);
		}
	};

	const renderCartContent = () => {
		if (isLoading) {
			return (
				<div className="flex items-center justify-center h-64">
					<Spin size="large" />
				</div>
			);
		}

		if (items.length === 0) {
			return (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description="Your cart is empty"
				>
					<Link href={businessPagePath}>
						<Button type="primary" icon={<ShoppingOutlined />}>
							Continue Shopping
						</Button>
					</Link>
				</Empty>
			);
		}

		return (
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Cart Items Table */}
				<div className="lg:col-span-2">
					<Table
						dataSource={items}
						columns={columns}
						rowKey="id"
						pagination={false}
						className="cart-table"
					/>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Order Summary
					</h3>
					<div className="space-y-3">
						<div className="flex justify-between">
							<span className="text-gray-600">Subtotal</span>
							<span className="font-medium text-gray-900">
								{formatCurrency(cartSubtotal)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Shipping</span>
							<span className="font-medium text-gray-900">
								{shippingFee !== null
									? formatCurrency(shippingFee)
									: "To be determined"}
							</span>
						</div>
						<Divider className="my-4" />
						<div className="flex justify-between">
							<span className="text-lg font-semibold text-gray-900">Total</span>
							<span className="text-xl font-bold text-blue-600">
								{formatCurrency(cartTotal)}
							</span>
						</div>
					</div>

					<div className="mt-6 space-y-3">
						<Link href={businessPagePath} className="block w-full">
							<Button
								icon={<ArrowLeftOutlined />}
								className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0"
							>
								Continue Shopping
							</Button>
						</Link>
						<Link
							href={`${businessPagePath}/chat?cartId=${cartId}`}
							className="block w-full"
						>
							<Button
								type="primary"
								icon={<MessageOutlined />}
								className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-0 text-base font-semibold"
							>
								Proceed to Chat
							</Button>
						</Link>
						<Link
							href={`${businessPagePath}/checkout`}
							className="block w-full"
						>
							<Button
								type="primary"
								icon={<ShoppingOutlined />}
								className="w-full h-12 bg-green-600 hover:bg-green-700 border-0 text-base font-semibold"
								disabled={shippingFee === null}
							>
								{shippingFee === null
									? "Waiting for Shipping Fee"
									: "Proceed to Checkout"}
							</Button>
						</Link>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="bg-white rounded-lg shadow-sm p-6">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
					<Badge count={items.length} showZero>
						<ShoppingCartOutlined className="text-2xl text-gray-400" />
					</Badge>
				</div>

				{renderCartContent()}
			</div>
		</div>
	);
}
