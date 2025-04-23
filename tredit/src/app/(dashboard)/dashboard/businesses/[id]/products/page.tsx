"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	Button,
	Row,
	Col,
	Typography,
	Tag,
	Spin,
	message,
	theme,
	Empty,
} from "antd";
import {
	ShopOutlined,
	PlusOutlined,
	ArrowLeftOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

interface Media {
	id: string;
	url: string;
	type: string;
	order: number;
}

interface Variant {
	id: string;
	name: string;
	value: string;
	price: string;
	stock: number;
}

interface Product {
	id: string;
	name: string;
	description: string;
	price: string;
	stock: number;
	status: string;
	ipfsHash: string | null;
	media: Media[];
	variants: Variant[];
}

export default function BusinessProductsPage({
	params,
}: {
	params: { id: string };
}) {
	const router = useRouter();
	const { token } = theme.useToken();
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchProducts();
	}, [params.id]);

	const fetchProducts = async () => {
		try {
			const response = await axios.get(`/api/business/${params.id}/products`, {
				params: {
					include: ["media", "variants"],
				},
			});
			console.log("Fetched products data:", response.data);
			setProducts(response.data);
		} catch (error: any) {
			message.error(error.response?.data?.error || "Failed to fetch products");
			console.error("Error fetching products:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddProduct = () => {
		router.push(`/dashboard/businesses/${params.id}/products/new`);
	};

	const getTotalStock = (product: Product) => {
		// First check the product's own stock
		if (product.stock > 0) {
			return product.stock;
		}

		// If no product stock, check variants
		if (!product.variants || !Array.isArray(product.variants)) {
			return 0;
		}

		return product.variants.reduce((total, variant) => {
			if (!variant || typeof variant.stock !== "number") {
				return total;
			}
			return total + variant.stock;
		}, 0);
	};

	const getFirstImageUrl = (product: Product) => {
		if (
			!product.media ||
			!Array.isArray(product.media) ||
			product.media.length === 0
		) {
			return null;
		}

		// Sort media by order and get the first one
		const sortedMedia = [...product.media].sort((a, b) => a.order - b.order);
		const firstImage = sortedMedia[0];

		// If the URL is an IPFS URL, ensure it's using the correct gateway
		if (firstImage.url.includes("ipfs")) {
			return firstImage.url.replace(
				"ipfs://",
				"https://gateway.pinata.cloud/ipfs/"
			);
		}

		return firstImage.url;
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div>
			<div className="flex gap-4 mb-4 d-flex justify-between">
				<Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
					Back
				</Button>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={handleAddProduct}
					className="bg-blue-500"
				>
					Add Product
				</Button>
			</div>

			{products.length === 0 ? (
				<Card className="text-center">
					<Empty
						image={
							<ShopOutlined
								style={{ fontSize: 64, color: token.colorPrimary }}
							/>
						}
						description={
							<div>
								<Title level={4}>No products yet</Title>
								<Text type="secondary">
									Get started by adding your first product
								</Text>
								<div className="mt-4">
									<Button
										type="primary"
										onClick={handleAddProduct}
										className="bg-blue-500"
									>
										Add your first product
									</Button>
								</div>
							</div>
						}
					/>
				</Card>
			) : (
				<Row gutter={[24, 24]}>
					{products.map((product) => (
						<Col xs={24} sm={12} md={8} lg={6} key={product.id}>
							<Card
								hoverable
								className="h-full flex flex-col border-0 shadow-sm hover:shadow-md transition-all overflow-hidden"
								bodyStyle={{ padding: "16px", flex: 1 }}
								onClick={() =>
									router.push(
										`/dashboard/businesses/${params.id}/products/${product.id}`
									)
								}
								cover={
									<div className="aspect-square relative overflow-hidden bg-white">
										{getFirstImageUrl(product) ? (
											<img
												src={getFirstImageUrl(product) || ""}
												alt={product.name}
												className="w-full h-full object-contain"
												onError={(e) => {
													const target = e.target as HTMLImageElement;
													target.onerror = null;
													target.style.display = "none";
													target.parentElement!.innerHTML = `
														<div class="w-full h-full flex items-center justify-center">
															<ShopOutlined style={{ fontSize: '3rem', color: '#d9d9d9' }} />
														</div>
													`;
												}}
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center">
												<ShopOutlined
													style={{ fontSize: "3rem", color: "#d9d9d9" }}
												/>
											</div>
										)}
										{product.status === "DRAFT" && (
											<div className="absolute top-3 right-3">
												<Tag color="warning" className="shadow-sm">
													Draft
												</Tag>
											</div>
										)}
									</div>
								}
							>
								<div className="flex flex-col gap-2">
									<div className="text-lg font-medium line-clamp-1">
										{product.name}
									</div>
									<div className="text-gray-500 text-sm line-clamp-2">
										{product.description}
									</div>
									<div className="flex justify-between items-center pt-1">
										<Typography.Text strong className="text-lg">
											KES {product.price}
										</Typography.Text>
										<Tag
											color={getTotalStock(product) > 0 ? "success" : "error"}
										>
											{getTotalStock(product) > 0
												? `${getTotalStock(product)} in stock`
												: "Out of stock"}
										</Tag>
									</div>
									{product.variants && product.variants.length > 0 && (
										<div>
											<Text type="secondary" className="text-xs">
												{product.variants.length} variants available
											</Text>
										</div>
									)}
								</div>
							</Card>
						</Col>
					))}
				</Row>
			)}
		</div>
	);
}
