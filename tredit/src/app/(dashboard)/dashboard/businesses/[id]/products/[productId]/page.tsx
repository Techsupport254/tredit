"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	Card,
	Button,
	Tag,
	Divider,
	Typography,
	message,
	Carousel,
	Tabs,
	Modal,
	Tooltip,
	Dropdown,
	Space,
} from "antd";
import {
	ArrowLeftOutlined,
	EditOutlined,
	DeleteOutlined,
	YoutubeOutlined,
	ShoppingCartOutlined,
	EyeOutlined,
	MoreOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
} from "@ant-design/icons";
import { Skeleton } from "@/components/ui/Skeleton";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface ProductMedia {
	id: string;
	productId: string;
	type: string;
	url: string;
	order: number;
}

interface ProductVariant {
	id: string;
	productId: string;
	name: string;
	value: string;
	price: number;
	stock: number;
}

interface Product {
	id: string;
	businessId: string;
	name: string;
	description: string | null;
	price: number;
	stock: number;
	status: string;
	ipfsHash: string | null;
	youtubeVideoId: string | null;
	createdAt: string;
	updatedAt: string;
	variants: ProductVariant[];
	media: ProductMedia[];
	images: string[];
	videos: string[];
}

export default function ProductDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [previewVisible, setPreviewVisible] = useState(false);
	const [previewImage, setPreviewImage] = useState("");
	const [activeTab, setActiveTab] = useState("details");
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				setLoading(true);
				console.log(`Fetching product with ID: ${params.productId}`);
				const response = await fetch(`/api/products?id=${params.productId}`);

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || "Failed to fetch product");
				}

				const data = await response.json();
				console.log("Product data:", data);
				setProduct(data);
			} catch (err) {
				console.error("Error fetching product:", err);
				setError(
					err instanceof Error ? err.message : "Failed to fetch product"
				);
				message.error("Failed to load product details");
			} finally {
				setLoading(false);
			}
		};

		if (params.productId) {
			fetchProduct();
		}
	}, [params.productId]);

	const goBack = () => {
		router.push(`/dashboard/businesses/${params.id}/products`);
	};

	const handleEdit = () => {
		router.push(
			`/dashboard/businesses/${params.id}/products/edit/${params.productId}`
		);
	};

	const showDeleteConfirm = () => {
		setIsDeleting(true);
	};

	const handleDeleteCancel = () => {
		setIsDeleting(false);
	};

	const handleDeleteConfirm = async () => {
		try {
			message.loading({ content: "Deleting product...", key: "deleteProduct" });

			// Add actual delete implementation here
			// const response = await fetch(`/api/products?id=${params.productId}`, { method: 'DELETE' });

			message.success({
				content: "Product deleted successfully",
				key: "deleteProduct",
			});
			router.push(`/dashboard/businesses/${params.id}/products`);
		} catch (error) {
			message.error({
				content: "Failed to delete product",
				key: "deleteProduct",
			});
		} finally {
			setIsDeleting(false);
		}
	};

	const handlePreview = (image: string) => {
		setPreviewImage(image);
		setPreviewVisible(true);
	};

	const closePreview = () => {
		setPreviewVisible(false);
	};

	if (loading) {
		return (
			<div className="space-y-6 p-6 bg-gray-50">
				<div className="flex justify-between items-center">
					<Skeleton className="h-10 w-[120px]" />
					<Skeleton className="h-10 w-[100px]" />
				</div>
				<Skeleton className="h-10 w-[300px] mb-8" />
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="col-span-2">
						<Skeleton className="h-[400px] w-full rounded-lg" />
					</div>
					<div>
						<Skeleton className="h-[200px] w-full rounded-lg" />
						<div className="mt-6">
							<Skeleton className="h-[200px] w-full rounded-lg" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 bg-gray-50">
				<Button
					type="primary"
					onClick={goBack}
					icon={<ArrowLeftOutlined />}
					className="mb-4"
				>
					Back to Products
				</Button>
				<div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
					<h3 className="text-lg font-semibold">Error Loading Product</h3>
					<p>{error}</p>
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="p-6 bg-gray-50">
				<Button
					type="primary"
					onClick={goBack}
					icon={<ArrowLeftOutlined />}
					className="mb-4"
				>
					Back to Products
				</Button>
				<div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
					<h3 className="text-lg font-semibold">Product Not Found</h3>
					<p>The requested product could not be found.</p>
				</div>
			</div>
		);
	}

	// Extract images and YouTube videos
	const productImages = product.images || [];
	const productVideos = product.videos || [];
	const hasYoutubeVideo =
		product.youtubeVideoId ||
		productVideos.some(
			(url) => url.includes("youtube.com") || url.includes("youtu.be")
		);

	// More actions menu items
	const moreActions = [
		{
			key: "edit",
			label: "Edit Product",
			icon: <EditOutlined />,
			onClick: handleEdit,
		},
		{
			key: "delete",
			label: "Delete Product",
			icon: <DeleteOutlined />,
			danger: true,
			onClick: showDeleteConfirm,
		},
	];

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="p-6 w-full">
				<div className="flex items-center justify-between mb-6">
					<Button
						type="default"
						onClick={goBack}
						icon={<ArrowLeftOutlined />}
						className="bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
					>
						Back to Products
					</Button>
					<div className="flex space-x-2">
						<Tag
							color={product.status === "ACTIVE" ? "success" : "warning"}
							className="flex items-center px-3 py-1"
						>
							{product.status === "ACTIVE" ? (
								<CheckCircleOutlined className="mr-1" />
							) : (
								<ClockCircleOutlined className="mr-1" />
							)}
							{product.status}
						</Tag>
						<Button
							type="primary"
							icon={<EditOutlined />}
							onClick={handleEdit}
							className="bg-blue-600 hover:bg-blue-700 border-blue-600"
						>
							Edit Product
						</Button>
						<Dropdown
							menu={{ items: moreActions }}
							placement="bottomRight"
							trigger={["click"]}
						>
							<Button
								icon={<MoreOutlined />}
								className="bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
							/>
						</Dropdown>
					</div>
				</div>

				<Title level={2} className="mb-6">
					{product.name}
				</Title>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					{/* Left column - Media and Preview */}
					<div className="space-y-6">
						<Card className="overflow-hidden shadow-sm">
							{productImages.length > 0 ? (
								<div>
									<div className="relative aspect-video bg-gray-100 overflow-hidden rounded-lg mb-4">
										<Carousel autoplay className="product-carousel">
											{productImages.map((image, index) => (
												<div key={index} className="h-full">
													<div className="aspect-video flex items-center justify-center bg-gray-100 overflow-hidden">
														<img
															src={image}
															alt={`${product.name} - Image ${index + 1}`}
															className="object-contain max-h-full max-w-full"
														/>
													</div>
												</div>
											))}
										</Carousel>
									</div>

									<div className="grid grid-cols-5 gap-2">
										{productImages.map((image, index) => (
											<div
												key={index}
												className="cursor-pointer aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all flex items-center justify-center bg-gray-50"
												onClick={() => handlePreview(image)}
											>
												<img
													src={image}
													alt={`Thumbnail ${index + 1}`}
													className="object-contain max-h-full max-w-full"
												/>
											</div>
										))}
									</div>
								</div>
							) : (
								<div className="bg-gray-100 rounded-lg p-10 text-center">
									<Text type="secondary">No product images available</Text>
								</div>
							)}
						</Card>

						{/* YouTube Video */}
						{hasYoutubeVideo && (
							<Card
								title={
									<div className="flex items-center">
										<YoutubeOutlined className="mr-2 text-red-600" />
										<span>Product Video</span>
									</div>
								}
								className="shadow-sm"
							>
								<div className="aspect-video w-full overflow-hidden rounded-lg">
									{product.youtubeVideoId ? (
										<iframe
											src={`https://www.youtube.com/embed/${product.youtubeVideoId}`}
											title={product.name}
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowFullScreen
											className="w-full h-full"
										/>
									) : (
										productVideos.map((video, index) => {
											// Extract video ID if it's a YouTube URL
											const youtubeMatch = video.match(
												/(?:youtube\.com\/watch\?v=|youtu.be\/)([^&]+)/
											);
											const videoId = youtubeMatch ? youtubeMatch[1] : null;

											return videoId ? (
												<iframe
													key={index}
													src={`https://www.youtube.com/embed/${videoId}`}
													title={`${product.name} - Video ${index + 1}`}
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
													allowFullScreen
													className="w-full h-full"
												/>
											) : (
												<video
													key={index}
													src={video}
													controls
													className="w-full h-full"
													poster={productImages[0]}
												>
													Your browser does not support the video tag.
												</video>
											);
										})
									)}
								</div>
							</Card>
						)}
					</div>

					{/* Right column - Details */}
					<div>
						<Tabs
							activeKey={activeTab}
							onChange={setActiveTab}
							type="card"
							className="bg-white rounded-lg shadow-sm"
						>
							<TabPane tab="Details" key="details">
								<div className="p-4 space-y-4">
									<Card bordered={false} className="bg-gray-50">
										<div className="space-y-4">
											<div>
												<Text type="secondary">Price</Text>
												<div className="text-2xl font-bold text-blue-600">
													KES {product.price.toLocaleString()}
												</div>
											</div>

											<div>
												<Text type="secondary">Stock</Text>
												<div className="text-lg">
													{product.stock}{" "}
													{product.stock === 1 ? "unit" : "units"} available
												</div>
											</div>
										</div>
									</Card>

									<Card bordered={false} className="mt-4">
										<div>
											<Text strong>Description</Text>
											<Paragraph className="mt-2 text-gray-700 whitespace-pre-line">
												{product.description || "No description provided."}
											</Paragraph>
										</div>
									</Card>

									{/* Product Variants */}
									{product.variants && product.variants.length > 0 && (
										<Card bordered={false} className="mt-4">
											<Text strong className="block mb-2">
												Product Variants
											</Text>
											<div className="space-y-3">
												{product.variants.map((variant) => (
													<Card
														key={variant.id}
														size="small"
														className="bg-gray-50"
													>
														<div className="flex justify-between">
															<div>
																<div className="font-medium">
																	{variant.name}: {variant.value}
																</div>
																<div className="text-gray-500">
																	Stock: {variant.stock}
																</div>
															</div>
															<div className="text-blue-600 font-medium">
																KES {variant.price.toLocaleString()}
															</div>
														</div>
													</Card>
												))}
											</div>
										</Card>
									)}
								</div>
							</TabPane>

							<TabPane tab="Technical Info" key="technical">
								<div className="p-4">
									<Card bordered={false}>
										<div className="space-y-3">
											<div className="grid grid-cols-3 gap-2">
												<div className="col-span-1 text-gray-500">ID</div>
												<div className="col-span-2 font-mono text-xs">
													{product.id}
												</div>
											</div>
											<Divider className="my-2" />

											<div className="grid grid-cols-3 gap-2">
												<div className="col-span-1 text-gray-500">Created</div>
												<div className="col-span-2">
													{new Date(product.createdAt).toLocaleString()}
												</div>
											</div>
											<Divider className="my-2" />

											<div className="grid grid-cols-3 gap-2">
												<div className="col-span-1 text-gray-500">Updated</div>
												<div className="col-span-2">
													{new Date(product.updatedAt).toLocaleString()}
												</div>
											</div>

											{product.ipfsHash && (
												<>
													<Divider className="my-2" />
													<div className="grid grid-cols-3 gap-2">
														<div className="col-span-1 text-gray-500">
															IPFS Hash
														</div>
														<div className="col-span-2 font-mono text-xs break-all">
															{product.ipfsHash}
														</div>
													</div>
												</>
											)}

											{product.youtubeVideoId && (
												<>
													<Divider className="my-2" />
													<div className="grid grid-cols-3 gap-2">
														<div className="col-span-1 text-gray-500">
															YouTube ID
														</div>
														<div className="col-span-2 font-mono text-xs">
															<a
																href={`https://www.youtube.com/watch?v=${product.youtubeVideoId}`}
																target="_blank"
																rel="noopener noreferrer"
																className="text-blue-500 hover:underline"
															>
																{product.youtubeVideoId}
															</a>
														</div>
													</div>
												</>
											)}
										</div>
									</Card>
								</div>
							</TabPane>
						</Tabs>

						<div className="mt-6 flex space-x-2">
							<Button
								type="primary"
								icon={<EditOutlined />}
								size="large"
								block
								onClick={handleEdit}
								className="bg-blue-600 hover:bg-blue-700 border-blue-600"
							>
								Edit Product
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Image Preview Modal */}
			<Modal
				open={previewVisible}
				footer={null}
				onCancel={closePreview}
				width="80%"
				centered
				bodyStyle={{
					padding: "24px",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					maxHeight: "80vh",
					overflow: "auto",
				}}
			>
				<img
					alt="Preview"
					style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
					src={previewImage}
				/>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal
				title="Delete Product"
				open={isDeleting}
				onOk={handleDeleteConfirm}
				onCancel={handleDeleteCancel}
				okText="Yes, Delete"
				cancelText="Cancel"
				okButtonProps={{ danger: true, type: "primary" }}
			>
				<p>
					Are you sure you want to delete this product? This action cannot be
					undone.
				</p>
				<p className="mt-2 text-gray-500">Product: {product?.name}</p>
			</Modal>

			<style jsx global>{`
				.product-carousel .slick-dots {
					bottom: -25px;
				}
				.product-carousel .slick-dots li button {
					background: #d9d9d9;
					border-radius: 999px;
					opacity: 0.3;
				}
				.product-carousel .slick-dots li.slick-active button {
					opacity: 1;
					background: #1890ff;
				}
			`}</style>
		</div>
	);
}
