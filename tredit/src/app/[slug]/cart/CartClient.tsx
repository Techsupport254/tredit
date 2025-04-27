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

	const router = useRouter();
	const params = useParams();
	const slug = params.slug as string;
	const businessPagePath = `/${slug}`;

	// Calculate cart summary
	const cartSubtotal = getCartTotal();
	const shipping = 0; // Will be determined after chat
	const cartTotal = cartSubtotal + shipping;

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

	const logoUrl = getIpfsUrl(business.logo);

	const [localShippingAddress, setLocalShippingAddress] =
		useState<ShippingAddress>({
			address: shippingAddress || "",
		});

	const handleAddressChange = (value: string) => {
		setLocalShippingAddress({ address: value });
	};

	const handleSaveAddress = async () => {
		try {
			setIsSavingAddress(true);
			await updateShippingAddress(localShippingAddress.address);
			message.success("Shipping address saved successfully");
		} catch (error) {
			message.error("Failed to save shipping address");
		} finally {
			setIsSavingAddress(false);
		}
	};

	// Render content based on loading state and cart items
	const renderCartContent = () => {
		if (isLoading) {
			return (
				<div className="flex items-center justify-center py-12">
					<Spin size="large" />
					<span className="ml-3 text-gray-600">Loading your cart...</span>
				</div>
			);
		}

		if (items.length === 0) {
			return (
				<div className="text-center py-16">
					<div className="mb-8">
						<ShoppingCartOutlined className="text-6xl text-gray-300" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Your cart is empty
					</h2>
					<p className="text-gray-600 mb-8">
						Looks like you haven't added any items to your cart yet.
					</p>
					<Link href={businessUrl as any}>
						<Button
							type="primary"
							size="large"
							className="bg-blue-600 hover:bg-blue-700 border-0 h-12 px-8 text-base font-semibold"
						>
							Start Shopping
						</Button>
					</Link>
				</div>
			);
		}

		return (
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Cart Items Table */}
				<div className="lg:col-span-2">
					<div className="bg-gray-50 rounded-lg p-4 mb-4">
						<div className="flex items-center gap-2 text-gray-600">
							<ShoppingCartOutlined className="text-xl" />
							<span className="font-medium">
								{items.length} items in your cart
							</span>
						</div>
					</div>
					<Table
						dataSource={items}
						columns={columns}
						rowKey={(record: CartItem) =>
							record.id ?? `${record.product.id}-${record.variantId}`
						}
						pagination={false}
						className="cart-table"
					/>
				</div>

				{/* Cart Summary */}
				<div className="lg:col-span-1">
					<div className="bg-gray-50 rounded-lg p-6 sticky top-4">
						<h3 className="text-xl font-bold text-gray-900 mb-6">
							Order Summary
						</h3>

						{/* Add Shipping Address Form */}
						<div className="mb-6">
							<h4 className="text-lg font-semibold text-gray-900 mb-4">
								Shipping Address
							</h4>
							<div className="space-y-4">
								<Input.TextArea
									placeholder="Enter your full shipping address"
									size="large"
									autoSize={{ minRows: 3 }}
									value={localShippingAddress.address}
									onChange={(e) => handleAddressChange(e.target.value)}
								/>
								<Button
									type="primary"
									size="large"
									block
									loading={isSavingAddress}
									onClick={handleSaveAddress}
									className="mt-4 h-12 bg-blue-600 hover:bg-blue-700 border-0 text-base font-semibold"
								>
									Save Shipping Address
								</Button>
							</div>
						</div>

						<Divider className="my-6" />

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
									To be determined
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
							<Divider className="my-4" />
							<div className="flex justify-between items-center">
								<span className="text-lg font-bold text-gray-900">Total</span>
								<span className="text-2xl font-bold text-blue-600">
									{formatCurrency(cartTotal)}
								</span>
							</div>
						</div>

						<div className="mt-8 space-y-4">
							<Button
								type="primary"
								size="large"
								block
								className="h-12 bg-blue-600 hover:bg-blue-700 border-0 text-base font-semibold"
								onClick={() => router.push(`/${business.id}/checkout`)}
								disabled={!shippingAddress || shipping === 0}
								title={
									!shippingAddress
										? "Please save your shipping address"
										: "Please discuss shipping with the seller"
								}
							>
								Proceed to Checkout
							</Button>
							<Link href={{ pathname: businessPagePath }}>
								<Button
									type="default"
									size="large"
									block
									className="h-12 text-base font-semibold"
								>
									Continue Shopping
								</Button>
							</Link>
							<Link
								href={{
									pathname: `/${slug}/chat`,
									query: cartId ? { cartId } : undefined,
								}}
							>
								<Button
									type="dashed"
									size="large"
									block
									icon={<MessageOutlined />}
									className="h-12 text-base font-semibold"
									disabled={!cartId}
								>
									Chat with {business.name}
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen flex flex-col">
			<div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
					<p className="text-lg text-gray-600 mt-2">
						Review and manage your selected items
					</p>
				</div>

				{renderCartContent()}
			</div>
		</div>
	);
}
