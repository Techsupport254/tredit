"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
	InputNumber,
	Button,
	Tag,
	Space,
	Typography,
	message,
	Radio,
	Divider,
	Card,
	Descriptions,
} from "antd";
import {
	ShoppingCartOutlined,
	ShareAltOutlined,
	ArrowLeftOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	PlayCircleOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { useCart } from "@/lib/context/CartContext";
import { useRouter, useParams } from "next/navigation";
import {
	Business as PrismaBusiness,
	Product as PrismaProduct,
	ProductVariant as PrismaProductVariant,
	ProductMedia as PrismaProductMedia,
} from "@prisma/client";
import Link from "next/link";
import { Prisma } from "@prisma/client";

const { Title, Paragraph, Text } = Typography;

// Update IPFS Gateway to use a more reliable gateway
const IPFS_GATEWAY =
	process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

function getIpfsUrl(hash: string | null | undefined): string | null {
	if (!hash) return null;
	if (hash.startsWith("http")) return hash;
	if (hash.startsWith("ipfs://")) {
		return `${IPFS_GATEWAY}${hash.replace("ipfs://", "")}`;
	}
	return `${IPFS_GATEWAY}${hash}`;
}

function formatPrice(price: string | number): string {
	const numericPrice = Number(price);
	return new Intl.NumberFormat("en-KE", {
		style: "currency",
		currency: "KES",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(numericPrice);
}

// Base interfaces from Prisma (or define explicitly if needed)
interface BaseProduct
	extends Omit<PrismaProduct, "price" | "createdAt" | "updatedAt"> {
	price: string;
	createdAt: string; // Dates are now strings
	updatedAt: string;
}
interface BaseVariant
	extends Omit<PrismaProductVariant, "price" | "createdAt" | "updatedAt"> {
	price: string;
	createdAt: string;
	updatedAt: string;
}
interface BaseMedia
	extends Omit<PrismaProductMedia, "createdAt" | "updatedAt"> {
	// Assuming PrismaProductMedia exists
	createdAt: string;
	updatedAt: string;
	// Ensure type is included if it wasn't in PrismaProductMedia
	type: string;
}

// Interfaces matching serialized data from page.tsx
interface ProductVariant extends BaseVariant {}
interface ProductMedia extends BaseMedia {}

interface Product extends BaseProduct {
	media: ProductMedia[];
	variants: ProductVariant[];
	// Ensure fields from prisma are included
	ipfsHash: string | null;
	youtubeVideoId?: string | null;
}

// Define Business interface to handle serialized properties
interface SerializedBusiness
	extends Omit<PrismaBusiness, "revenue" | "createdAt" | "updatedAt"> {
	revenue: string;
	createdAt: string;
	updatedAt: string;
}

interface ProductDetailClientProps {
	business: SerializedBusiness;
	product: Product;
}

export default function ProductDetailClient({
	business,
	product,
}: ProductDetailClientProps) {
	// Log the product and business objects to see their structure
	console.log("Product details:", JSON.stringify(product, null, 2));
	console.log("Media array:", product?.media);

	// Log YouTube video information
	console.log("YouTube Video ID:", product?.youtubeVideoId);
	console.log(
		"Media types:",
		product?.media?.map((m) => m.type)
	);
	console.log(
		"Media URLs:",
		product?.media?.map((m) => m.url)
	);

	const [selectedVariantId, setSelectedVariantId] = useState<
		string | undefined
	>(undefined);
	const [quantity, setQuantity] = useState<number>(1);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const { addToCart } = useCart();
	const router = useRouter();
	const params = useParams();
	const { data: session } = useSession();

	if (!product) {
		return <div className="text-center p-10">Product not found.</div>;
	}

	const selectedVariant = useMemo(
		() => product.variants.find((v) => v.id === selectedVariantId),
		[product.variants, selectedVariantId]
	);

	const displayPrice = selectedVariant ? selectedVariant.price : product.price;
	const displayStock = selectedVariant ? selectedVariant.stock : product.stock;
	const hasVariants = product.variants.length > 0;
	const canAddToCart = hasVariants ? !!selectedVariant : true;
	const currentMedia = product.media[currentImageIndex];
	const currentMediaUrl = currentMedia ? getIpfsUrl(currentMedia.url) : null;

	const variantsByName = useMemo(
		() =>
			product.variants.reduce((acc, variant) => {
				if (!acc[variant.name]) {
					acc[variant.name] = [];
				}
				acc[variant.name].push(variant);
				return acc;
			}, {} as Record<string, ProductVariant[]>),
		[product.variants]
	);

	const handleVariantChange = (variantId: string) => {
		setSelectedVariantId(variantId);
		setQuantity(1);
	};

	const handleQuantityChange = (value: number | null) => {
		setQuantity(value || 1);
	};

	const handleAddToCart = async () => {
		if (!canAddToCart) {
			message.error("Please select product options.");
			return;
		}
		if (quantity > displayStock) {
			message.error("Selected quantity exceeds available stock.");
			return;
		}

		setIsAddingToCart(true);
		try {
			// Reconstruct a temporary object closer to Prisma types if needed by CartContext
			// Ensure ALL fields expected by the CartContext's use of Product are present
			const productForContext = {
				...product,
				price: new Prisma.Decimal(product.price),
				// Convert dates back if they were serialized and are needed as Date objects
				createdAt: new Date(product.createdAt),
				updatedAt: new Date(product.updatedAt),
				variants: product.variants.map((v) => ({
					...v,
					price: new Prisma.Decimal(v.price),
					createdAt: new Date(v.createdAt),
					updatedAt: new Date(v.updatedAt),
				})),
				// Make sure media structure matches expectations if CartContext uses it
				media: product.media.map((m) => ({ ...m })), // Simple clone for now
			};

			// Type assertion needed as we manually reconstructed the type
			await addToCart(productForContext as any, selectedVariantId, quantity);
			message.success(
				`${product.name} ${
					selectedVariant ? `(${selectedVariant.value}) ` : ""
				}added to cart!`
			);
		} catch (error) {
			console.error("Error adding to cart:", error);
		} finally {
			setIsAddingToCart(false);
		}
	};

	const handleThumbnailClick = (index: number) => {
		setCurrentImageIndex(index);
	};

	const formatDate = (dateString: string) => {
		try {
			return new Date(dateString).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		} catch (e) {
			return "Invalid Date";
		}
	};

	// Add video error handling function
	const handleVideoError = (
		e: React.SyntheticEvent<HTMLVideoElement, Event>
	) => {
		console.error("Video Error:", e);
		const videoElement = e.currentTarget;

		// Try with alternative gateway if the current one fails
		if (videoElement.src.includes("pinata")) {
			videoElement.src = videoElement.src.replace(
				"gateway.pinata.cloud",
				"cloudflare-ipfs.com"
			);
		} else if (!videoElement.src.includes("cloudflare")) {
			videoElement.src = `https://cloudflare-ipfs.com/ipfs/${
				videoElement.src.split("/ipfs/")[1]
			}`;
		}

		// Add fallback message if video still fails
		videoElement.onerror = () => {
			const parent = videoElement.parentElement;
			if (parent) {
				videoElement.style.display = "none";
				const fallback = document.createElement("div");
				fallback.className =
					"flex items-center justify-center w-full h-full bg-gray-100 text-gray-500";
				fallback.innerHTML =
					'<div class="text-center p-4"><div class="text-3xl mb-2">⚠️</div><p>Video could not be loaded</p></div>';
				parent.appendChild(fallback);
			}
		};
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="w-full">
				{/* Main content */}
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="bg-white rounded-lg shadow-sm overflow-hidden">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
							{/* Left column - Media */}
							<div className="flex flex-col gap-6 p-6">
								{/* Images Section */}
								<div className="space-y-4">
									<div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
										{currentMedia &&
										currentMediaUrl &&
										!currentMedia.type.toUpperCase().includes("VIDEO") ? (
											<Image
												src={currentMediaUrl}
												alt={product.name}
												fill
												className="object-contain"
												priority={currentImageIndex === 0}
												sizes="(max-width: 768px) 100vw, 50vw"
											/>
										) : (
											<ShoppingCartOutlined className="text-6xl text-gray-300" />
										)}
									</div>
									{product.media.filter(
										(m) => !m.type.toUpperCase().includes("VIDEO")
									).length > 1 && (
										<div className="flex space-x-2 overflow-x-auto pb-2">
											{product.media
												.filter((m) => !m.type.toUpperCase().includes("VIDEO"))
												.map((mediaItem, index) => (
													<button
														key={mediaItem.id}
														onClick={() => handleThumbnailClick(index)}
														aria-label={`View media ${index + 1}`}
														className={`relative w-20 h-20 border-2 rounded-md overflow-hidden flex-shrink-0 transition-all duration-200 ${
															index === currentImageIndex
																? "border-blue-500 ring-2 ring-blue-300 ring-offset-2"
																: "border-transparent hover:border-gray-300"
														}`}
													>
														<div className="w-full h-full bg-gray-100 flex items-center justify-center">
															<Image
																src={
																	getIpfsUrl(mediaItem.url) ||
																	"/placeholder.png"
																}
																alt={`Thumbnail ${index + 1}`}
																fill
																className="object-cover"
																sizes="80px"
															/>
														</div>
													</button>
												))}
										</div>
									)}
								</div>

								{/* Video Section */}
								{product.youtubeVideoId && (
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<PlayCircleOutlined className="text-red-600 text-xl" />
											<h3 className="text-lg font-semibold">Product Video</h3>
										</div>
										<div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden shadow-inner">
											<iframe
												src={`https://www.youtube.com/embed/${product.youtubeVideoId}`}
												title={product.name}
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
												allowFullScreen
												className="w-full h-full"
											/>
										</div>
									</div>
								)}
							</div>

							{/* Right column - Product Info */}
							<div className="flex flex-col gap-6 p-6">
								<div>
									<Title level={2} className="!mb-2">
										{product.name}
									</Title>
									<Paragraph type="secondary" className="!mt-0 !mb-4">
										{product.description}
									</Paragraph>

									<div className="flex items-baseline gap-3 flex-wrap">
										<Text className="text-3xl font-bold text-blue-600">
											{formatPrice(displayPrice)}
										</Text>
										{hasVariants &&
											selectedVariantId &&
											product.price !== displayPrice && (
												<Text delete type="secondary" className="text-lg">
													{formatPrice(product.price)}
												</Text>
											)}
									</div>

									<Tag
										color={displayStock > 0 ? "success" : "error"}
										icon={
											displayStock > 0 ? (
												<CheckCircleOutlined />
											) : (
												<CloseCircleOutlined />
											)
										}
										className="text-sm mt-2"
									>
										{displayStock > 0
											? `${displayStock} in stock`
											: "Out of stock"}
									</Tag>
								</div>

								<Divider className="!my-2" />

								{Object.entries(variantsByName).map(([name, variants]) => (
									<div key={name} className="mb-4">
										<Text strong className="block mb-2 text-base">
											{name}:{" "}
											{selectedVariant?.name === name && (
												<Text type="secondary" className="ml-1">
													{selectedVariant?.value}
												</Text>
											)}
										</Text>
										<Radio.Group
											onChange={(e) => handleVariantChange(e.target.value)}
											value={selectedVariantId}
											optionType="button"
											buttonStyle="solid"
											className="flex flex-wrap gap-2"
										>
											{variants.map((variant) => (
												<Radio.Button
													key={variant.id}
													value={variant.id}
													disabled={variant.stock <= 0}
													className={`product-variant-radio ${
														variant.stock <= 0 ? "out-of-stock" : ""
													}`}
												>
													<div className="flex flex-col items-start">
														<span>{variant.value}</span>
														<span className="text-xs">
															{formatPrice(variant.price)}
															{variant.stock <= 0 ? (
																<span className="text-red-500 ml-1">
																	(Out of stock)
																</span>
															) : (
																<span className="text-green-500 ml-1">
																	({variant.stock} in stock)
																</span>
															)}
														</span>
													</div>
												</Radio.Button>
											))}
										</Radio.Group>
									</div>
								))}

								<div className="flex items-center gap-4 mt-4 pt-4 border-t">
									<div className="flex flex-col items-start">
										<Text type="secondary" className="text-xs mb-1">
											Quantity
										</Text>
										<InputNumber
											aria-label="Quantity"
											min={1}
											max={displayStock > 0 ? displayStock : 1}
											value={quantity}
											onChange={handleQuantityChange}
											disabled={displayStock <= 0}
											className="w-20"
											size="middle"
										/>
									</div>
									<Button
										type="primary"
										size="large"
										icon={<ShoppingCartOutlined />}
										onClick={handleAddToCart}
										loading={isAddingToCart}
										disabled={
											!canAddToCart ||
											displayStock <= 0 ||
											quantity > displayStock
										}
										className="flex-grow h-11 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
									>
										{isAddingToCart ? "Adding..." : "Add to Cart"}
									</Button>
								</div>
								{!canAddToCart && hasVariants && (
									<Text type="danger" className="text-xs">
										Please select options.
									</Text>
								)}
								{displayStock <= 0 && (
									<Text type="danger" className="text-xs">
										Out of stock.
									</Text>
								)}

								<Divider className="!my-4" />

								<Descriptions
									title="Product Information"
									bordered
									size="small"
									column={1}
									className="bg-gray-50"
								>
									<Descriptions.Item label="Business">
										{business.name}
									</Descriptions.Item>
									<Descriptions.Item label="Added">
										{formatDate(product.createdAt)}
									</Descriptions.Item>
									<Descriptions.Item label="Last Updated">
										{formatDate(product.updatedAt)}
									</Descriptions.Item>
									{product.ipfsHash && (
										<Descriptions.Item label="IPFS Hash">
											<Text copyable className="font-mono text-xs">
												{product.ipfsHash}
											</Text>
										</Descriptions.Item>
									)}
								</Descriptions>
							</div>
						</div>
					</div>
				</div>
			</div>

			<style jsx global>{`
				.product-variant-radio {
					min-width: 120px;
					height: auto;
					padding: 8px 12px;
					text-align: left;
				}
				.product-variant-radio.out-of-stock {
					opacity: 0.5;
					cursor: not-allowed;
				}
				.product-variant-radio.ant-radio-button-wrapper-checked {
					background-color: #1890ff;
					color: white;
				}
				.product-variant-radio.ant-radio-button-wrapper-checked .text-xs {
					color: rgba(255, 255, 255, 0.8);
				}
			`}</style>
		</div>
	);
}
