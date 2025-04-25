"use client";

import { Row, Col, Card, Button, Tag, Space, Tooltip, Dropdown, Menu, Drawer, Checkbox, Radio, RadioChangeEvent, Slider, Form } from "antd";
import {
	DownOutlined,
	ShoppingCartOutlined,
	ShareAltOutlined,
	PictureOutlined,
	LeftOutlined,
	RightOutlined,
	FilterOutlined,
	SortAscendingOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { useCart } from "@/lib/context/CartContext";
import { message } from "antd";
import { Product as PrismaProduct } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

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

// Format price to KES
function formatPrice(price: any): string {
	if (price === null || price === undefined) {
		return "N/A";
	}

	// Convert to numeric value if it's a string
	let numericPrice;
	if (typeof price === "string") {
		numericPrice = parseFloat(price);
	} else if (typeof price === "number") {
		numericPrice = price;
	} else if (
		typeof price === "object" &&
		price !== null &&
		typeof price.toString === "function"
	) {
		// For Decimal objects
		numericPrice = parseFloat(price.toString());
	} else {
		numericPrice = 0;
	}

	// Check if conversion resulted in a valid number
	if (isNaN(numericPrice)) {
		return "N/A";
	}

	return new Intl.NumberFormat("en-KE", {
		style: "currency",
		currency: "KES",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(numericPrice);
}

interface Product extends PrismaProduct {
	variants?: Array<{
		id: string;
		name: string;
		value: string;
		price: string;
		stock: number;
	}>;
	media: Array<{
		url: string;
		type: string;
		order: number;
	}>;
}

interface ProductGridProps {
	businessName: string;
	businessType: string;
	products: Product[];
	currentPage: number;
	setCurrentPage: (page: number) => void;
	totalPages: number;
}

// Helper function to calculate total stock from variants only
function getTotalStock(product: Product): number {
	let totalStock = 0; // Start with 0

	if (product.variants && Array.isArray(product.variants)) {
		totalStock = product.variants.reduce((total, variant) => {
			if (!variant || typeof variant.stock !== "number") {
				return total;
			}
			return total + variant.stock;
		}, 0);
	}

	return totalStock;
}

export default function ProductGrid({
	businessName,
	businessType,
	products,
	currentPage,
	setCurrentPage,
	totalPages,
}: ProductGridProps) {
	const { addToCart, items } = useCart();
	const router = useRouter();
	const params = useParams();
	const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
	const [sortOption, setSortOption] = useState<string>("featured");
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
	const [localProducts, setLocalProducts] = useState<Product[]>(products);

	useEffect(() => {
		applySort(sortOption, [...products]);
	}, [products, sortOption]);

	const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
		e.stopPropagation();
		setLoadingProductId(product.id);
		try {
			let variantId: string | undefined = undefined;
			if (product.variants && product.variants.length > 0) {
				const firstVariant = product.variants[0];
				if (firstVariant) variantId = firstVariant.id;
			}

			await addToCart(product, variantId);

			message.success(
				`${product.name} ${
					variantId
						? `(${product.variants?.find((v) => v.id === variantId)?.name})`
						: ""
				} added to cart`
			);
		} catch (error: any) {
			console.error("Error adding to cart (from ProductGrid):", error);
		} finally {
			setLoadingProductId(null);
		}
	};

	const handleProductClick = (product: Product) => {
		router.push(`/${params.slug}/products/${product.id}`);
	};

	const applySort = (option: string, productsList: Product[]) => {
		let sortedProducts = [...productsList];
		
		switch (option) {
			case "price-asc":
				sortedProducts.sort((a, b) => {
					const aPrice = parseFloat(a.price.toString());
					const bPrice = parseFloat(b.price.toString());
					return aPrice - bPrice;
				});
				break;
			case "price-desc":
				sortedProducts.sort((a, b) => {
					const aPrice = parseFloat(a.price.toString());
					const bPrice = parseFloat(b.price.toString());
					return bPrice - aPrice;
				});
				break;
			case "name-asc":
				sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case "name-desc":
				sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
				break;
			case "featured":
			default:
				// Keep original order
				break;
		}
		
		setLocalProducts(sortedProducts);
	};

	const sortMenu = (
		<Menu
			onClick={({ key }) => {
				setSortOption(key);
			}}
			selectedKeys={[sortOption]}
			items={[
				{
					key: "featured",
					label: "Featured",
				},
				{
					key: "price-asc",
					label: "Price: Low to High",
				},
				{
					key: "price-desc",
					label: "Price: High to Low",
				},
				{
					key: "name-asc",
					label: "Name: A to Z",
				},
				{
					key: "name-desc",
					label: "Name: Z to A",
				},
			]}
		/>
	);

	const handleFilterApply = () => {
		// Apply price range filter
		const filteredProducts = products.filter(product => {
			const price = parseFloat(product.price.toString());
			return price >= priceRange[0] && price <= priceRange[1];
		});
		
		applySort(sortOption, filteredProducts);
		setFilterDrawerOpen(false);
	};

	return (
		<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div className="flex justify-between items-center flex-wrap gap-4 mb-8">
				<h2 className="text-3xl font-bold text-gray-900">
					{businessType === "PRODUCT" ? "Products" : "Services"} from{" "}
					{businessName}
				</h2>
				<Space>
					<Dropdown overlay={sortMenu} trigger={["click"]}>
						<Button
							icon={<SortAscendingOutlined />}
							className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm"
						>
							Sort by
							<DownOutlined style={{ fontSize: '12px', marginLeft: 6 }} />
						</Button>
					</Dropdown>
					<Button
						icon={<FilterOutlined />}
						className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm"
						onClick={() => setFilterDrawerOpen(true)}
					>
						Filter
					</Button>
				</Space>
			</div>

			{/* Products Grid */}
			<Row gutter={[24, 24]}>
				{localProducts.map((product) => (
					<Col xs={24} sm={12} md={8} lg={6} key={product.id}>
						<Card
							hoverable
							className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col"
							bodyStyle={{ padding: "1rem", flex: "1 1 auto" }}
							onClick={() => handleProductClick(product)}
							cover={
								<div className="relative pt-[100%] bg-gray-50 rounded-t-xl overflow-hidden group">
									{product.media[0] ? (
										<Image
											src={getIpfsUrl(product.media[0].url) || ""}
											alt={product.name}
											fill
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
											className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
											priority={currentPage === 1}
										/>
									) : (
										<div className="absolute inset-0 flex items-center justify-center">
											<PictureOutlined className="text-4xl text-gray-300" />
										</div>
									)}
									<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200" />
								</div>
							}
							actions={[
								<Tooltip title="Add to cart" key="cart">
									<Button
										type="text"
										icon={<ShoppingCartOutlined className="text-blue-500" />}
										className="hover:bg-blue-50"
										aria-label="Add to cart"
										loading={loadingProductId === product.id}
										disabled={loadingProductId === product.id}
										onClick={(e) => handleAddToCart(product, e)}
									/>
								</Tooltip>,
								<Tooltip title="Share" key="share">
									<Button
										type="text"
										icon={<ShareAltOutlined className="text-green-500" />}
										className="hover:bg-green-50"
										aria-label="Share"
									/>
								</Tooltip>,
							]}
						>
							<Card.Meta
								title={
									<h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
										{product.name}
									</h3>
								}
								description={
									<>
										<p className="text-gray-500 text-sm line-clamp-2 mt-1 h-10">
											{product.description}
										</p>
										<div className="flex justify-between items-center mt-4">
											<div>
												<span className="text-blue-600 font-bold text-lg">
													{formatPrice(product.price)}
												</span>
												{product.variants && product.variants.length > 0 && (
													<span className="text-gray-500 text-sm ml-2">
														{product.variants.length} variants
													</span>
												)}
											</div>
											{businessType === "PRODUCT" && (
												<Tag
													color={getTotalStock(product) > 0 ? "green" : "red"}
													className="text-xs px-2 py-1 rounded-full"
												>
													{getTotalStock(product) > 0
														? `${getTotalStock(product)} in stock`
														: "Out of stock"}
												</Tag>
											)}
										</div>
									</>
								}
							/>
						</Card>
					</Col>
				))}
			</Row>

			{/* Empty state when no products */}
			{localProducts.length === 0 && (
				<div className="text-center py-16">
					<PictureOutlined className="text-5xl text-gray-300 mb-3" />
					<h3 className="text-xl font-medium text-gray-800 mb-1">No products found</h3>
					<p className="text-gray-500">Try adjusting your filters or search criteria.</p>
				</div>
			)}

			{/* Pagination */}
			{localProducts.length > 0 && (
				<div className="mt-12 flex justify-center">
					<Space size="small">
						<Button
							icon={<LeftOutlined />}
							disabled={currentPage === 1}
							onClick={() => setCurrentPage(currentPage - 1)}
							className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
						>
							Previous
						</Button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<Button
								key={page}
								type={currentPage === page ? "primary" : "default"}
								onClick={() => setCurrentPage(page)}
								className={
									currentPage === page
										? "bg-blue-600 hover:bg-blue-700 border-blue-600"
										: "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
								}
							>
								{page}
							</Button>
						))}
						<Button
							icon={<RightOutlined />}
							disabled={currentPage === totalPages || totalPages === 0}
							onClick={() => setCurrentPage(currentPage + 1)}
							className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
						>
							Next
						</Button>
					</Space>
				</div>
			)}

			{/* Filter Drawer */}
			<Drawer
				title="Filter Products"
				placement="right"
				onClose={() => setFilterDrawerOpen(false)}
				open={filterDrawerOpen}
				width={320}
				footer={
					<div className="flex justify-end space-x-2">
						<Button onClick={() => {
							setPriceRange([0, 20000]);
							setFilterDrawerOpen(false);
							setLocalProducts(products);
						}}>
							Reset
						</Button>
						<Button type="primary" onClick={handleFilterApply} className="bg-blue-600">
							Apply
						</Button>
					</div>
				}
			>
				<div className="space-y-6">
					<div>
						<h4 className="font-medium text-gray-800 mb-4">Price Range</h4>
						<Slider
							range
							min={0}
							max={20000}
							step={500}
							value={priceRange}
							onChange={(value) => setPriceRange(value as [number, number])}
							tipFormatter={(value) => `Ksh ${value}`}
							className="mb-6"
						/>
						<div className="flex justify-between text-sm text-gray-500">
							<span>Ksh {priceRange[0]}</span>
							<span>Ksh {priceRange[1]}</span>
						</div>
					</div>

					{businessType === "PRODUCT" && (
						<div>
							<h4 className="font-medium text-gray-800 mb-4">Availability</h4>
							<Radio.Group defaultValue="all" className="w-full flex flex-col space-y-2">
								<Radio value="all">All products</Radio>
								<Radio value="in-stock">In Stock</Radio>
								<Radio value="out-of-stock">Out of Stock</Radio>
							</Radio.Group>
						</div>
					)}
				</div>
			</Drawer>
		</section>
	);
}
