"use client";

import Image from "next/image";
import {
	Card,
	Row,
	Col,
	Button,
	Typography,
	Tag,
	Rate,
	Divider,
	Input,
	Badge,
	Dropdown,
	Avatar as AntAvatar,
	MenuProps,
	Space,
} from "antd";
import {
	ShoppingCartOutlined,
	HeartOutlined,
	ShareAltOutlined,
	ArrowLeftOutlined,
	SearchOutlined,
	UserOutlined,
	BellOutlined,
	MessageOutlined,
	DownOutlined,
} from "@ant-design/icons";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

// IPFS Gateway URL
const IPFS_GATEWAY =
	process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

// Helper function to convert IPFS hash to URL
function getIpfsUrl(hash: string | null | undefined): string | null {
	if (!hash) return null;

	// If it's already a full URL, return it
	if (hash.startsWith("http")) return hash;

	// If it's an IPFS hash, convert it to a gateway URL
	if (hash.startsWith("ipfs://")) {
		return `${IPFS_GATEWAY}${hash.replace("ipfs://", "")}`;
	}

	// If it's just a hash, assume it's an IPFS hash
	return `${IPFS_GATEWAY}${hash}`;
}

// Helper function to format enum values
const formatEnumValue = (value: string) => {
	return value
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
};

interface StorePageClientProps {
	business: {
		id: string;
		name: string;
		description: string | null;
		logo: string | null;
		coverImage: string | null;
		type: string;
		status: string;
		products: Array<{
			id: string;
			name: string;
			description: string | null;
			price: number;
			stock: number;
			media: Array<{
				url: string;
				type: string;
				order: number;
			}>;
		}>;
	};
}

export default function StorePageClient({ business }: StorePageClientProps) {
	const { data: session } = useSession();
	const [isMessagesOpen, setIsMessagesOpen] = useState(false);
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const messagesRef = useRef<HTMLDivElement>(null);
	const notificationsRef = useRef<HTMLDivElement>(null);

	// Handle click outside for dropdowns
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				messagesRef.current &&
				!messagesRef.current.contains(event.target as Node)
			) {
				setIsMessagesOpen(false);
			}
			if (
				notificationsRef.current &&
				!notificationsRef.current.contains(event.target as Node)
			) {
				setIsNotificationsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const coverImageUrl = getIpfsUrl(business.coverImage);
	const logoUrl = getIpfsUrl(business.logo);

	const userMenuItems: MenuProps["items"] = [
		{
			key: "profile",
			label: "My Profile",
			icon: <UserOutlined />,
		},
		{
			key: "orders",
			label: "My Orders",
			icon: <ShoppingCartOutlined />,
		},
		{
			key: "wishlist",
			label: "Wishlist",
			icon: <HeartOutlined />,
		},
		{
			key: "messages",
			label: "Messages",
			icon: <MessageOutlined />,
		},
		{
			type: "divider",
		},
		{
			key: "settings",
			label: "Settings",
			type: "item",
		},
		{
			key: "logout",
			label: "Logout",
			type: "item",
			danger: true,
		},
	];

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Modern Clean Navbar */}
			<div className="bg-white border-b border-gray-100 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						{/* Left Section - Logo and Back */}
						<div className="flex items-center gap-6">
							<Link
								href="/"
								className="flex items-center text-gray-500 hover:text-gray-900 transition-colors group"
							>
								<ArrowLeftOutlined className="text-lg group-hover:-translate-x-0.5 transition-transform" />
								<span className="ml-2 hidden sm:inline">Marketplace</span>
							</Link>

							{/* Search - Only visible on larger screens */}
							<div className="hidden md:block relative w-64 lg:w-80">
								<Input
									placeholder="Search in store..."
									prefix={<SearchOutlined className="text-gray-400" />}
									className="rounded-full bg-gray-50 hover:bg-white focus-within:bg-white border-0 hover:border-gray-200 focus-within:border-gray-200 transition-all"
									size="middle"
								/>
							</div>
						</div>

						{/* Center Section - Navigation (hidden on mobile) */}
						<div className="hidden lg:flex items-center gap-1">
							<Button
								type="text"
								className="text-gray-600 hover:text-blue-500 px-4 py-1 rounded-lg transition-colors"
							>
								Home
							</Button>
							<Button
								type="text"
								className="text-gray-600 hover:text-blue-500 px-4 py-1 rounded-lg transition-colors"
							>
								About
							</Button>
							<Button
								type="text"
								className="text-gray-600 hover:text-blue-500 px-4 py-1 rounded-lg transition-colors"
							>
								Contact
							</Button>
						</div>

						{/* Right Section - Actions */}
						<div className="flex items-center gap-3">
							{/* Mobile Search Button */}
							<Button
								type="text"
								icon={<SearchOutlined style={{ fontSize: "20px" }} />}
								className="md:hidden text-gray-500 hover:text-blue-500"
							/>

							{/* Action Buttons with Badges */}
							<Badge count={2} size="small" color="#3b82f6">
								<Button
									type="text"
									shape="circle"
									icon={<ShoppingCartOutlined style={{ fontSize: "20px" }} />}
									className="text-gray-500 hover:text-blue-500"
								/>
							</Badge>

							<Badge dot color="#3b82f6">
								<Button
									type="text"
									shape="circle"
									icon={<BellOutlined style={{ fontSize: "20px" }} />}
									className="text-gray-500 hover:text-blue-500"
								/>
							</Badge>

							{/* User Profile Dropdown */}
							{session?.user ? (
								<Dropdown
									menu={{ items: userMenuItems }}
									trigger={["click"]}
									placement="bottomRight"
									overlayClassName="min-w-[200px]"
								>
									<Button
										type="text"
										className="flex items-center gap-2 ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
									>
										<AntAvatar
											src={session.user.image}
											icon={<UserOutlined style={{ fontSize: "20px" }} />}
											size="default"
											className="border border-gray-200"
										/>
										<span className="hidden xl:inline-flex flex-col items-start">
											<span className="text-sm font-medium text-gray-900 leading-none">
												{session.user.name}
											</span>
											<span className="text-xs text-gray-500 mt-0.5">
												{formatEnumValue(session.user.role || "USER")}
											</span>
										</span>
										<DownOutlined className="hidden xl:block w-3 h-3 text-gray-400 ml-1" />
									</Button>
								</Dropdown>
							) : (
								<Link href="/login" className="ml-2">
									<Button
										type="primary"
										className="px-4 py-1.5 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-sm"
									>
										Sign In
									</Button>
								</Link>
							)}
						</div>
					</div>

					{/* Mobile Search Bar (hidden by default) */}
					<div className="md:hidden mt-2 pb-2">
						<Input
							placeholder="Search in store..."
							prefix={<SearchOutlined className="text-gray-400" />}
							className="rounded-full bg-gray-50 border-0"
							size="middle"
						/>
					</div>
				</div>
			</div>

			{/* Hero Section */}
			<div className="relative h-[400px] bg-gradient-to-r from-blue-600 to-purple-600">
				{coverImageUrl ? (
					<>
						<Image
							src={coverImageUrl}
							alt={`${business.name} cover`}
							fill
							className="object-cover mix-blend-overlay"
							priority
						/>
						<div className="absolute inset-0 bg-black/20" />
					</>
				) : (
					<div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90" />
				)}

				<div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col justify-center h-full max-w-2xl">
						<div className="flex items-center gap-4 mb-6">
							<Avatar
								src={logoUrl}
								alt={business.name}
								size="lg"
								className="border-4 border-white bg-white"
							/>
							<Tag color="blue" className="border-0">
								Verified Store
							</Tag>
						</div>
						<h1 className="text-4xl font-bold text-white mb-4">
							{business.name}
						</h1>
						<p className="text-lg text-white/90 mb-8 line-clamp-2">
							{business.description}
						</p>
						<div className="flex flex-wrap items-center gap-4">
							<div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
								<Rate
									disabled
									defaultValue={4.5}
									className="text-yellow-400 text-sm"
								/>
								<span className="text-white/90">(128 reviews)</span>
							</div>
							<Tag color="success" className="border-0 text-sm px-3 py-1">
								Active Store
							</Tag>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Store Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
					<div className="bg-white p-6 rounded-xl border border-gray-100">
						<h3 className="text-gray-500 text-sm mb-1">Total Products</h3>
						<p className="text-2xl font-semibold text-gray-900">
							{business.products?.length || 0}
						</p>
					</div>
					<div className="bg-white p-6 rounded-xl border border-gray-100">
						<h3 className="text-gray-500 text-sm mb-1">Average Rating</h3>
						<p className="text-2xl font-semibold text-gray-900">4.5</p>
					</div>
					<div className="bg-white p-6 rounded-xl border border-gray-100">
						<h3 className="text-gray-500 text-sm mb-1">Orders</h3>
						<p className="text-2xl font-semibold text-gray-900">2.4k+</p>
					</div>
					<div className="bg-white p-6 rounded-xl border border-gray-100">
						<h3 className="text-gray-500 text-sm mb-1">Response Time</h3>
						<p className="text-2xl font-semibold text-gray-900">2h avg</p>
					</div>
				</div>

				{/* Products Section */}
				<div className="space-y-8">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100">
						<div>
							<h2 className="text-2xl font-semibold text-gray-900 mb-1">
								Our Products
							</h2>
							<p className="text-gray-500">
								Explore our collection of unique items
							</p>
						</div>
						<div className="flex gap-2">
							<Button
								icon={<ShareAltOutlined />}
								className="hidden sm:inline-flex hover:text-blue-500 hover:border-blue-500"
							>
								Share Store
							</Button>
							<Dropdown
								menu={{
									items: [
										{ key: "price-low", label: "Price: Low to High" },
										{ key: "price-high", label: "Price: High to Low" },
										{ key: "popular", label: "Most Popular" },
										{ key: "newest", label: "Newest Arrivals" },
									],
								}}
								trigger={["click"]}
							>
								<Button className="hover:text-blue-500 hover:border-blue-500">
									Sort By <DownOutlined className="ml-2" />
								</Button>
							</Dropdown>
						</div>
					</div>

					<Row gutter={[24, 24]}>
						{business.products?.map((product) => {
							const productImageUrl = getIpfsUrl(product.media?.[0]?.url);
							return (
								<Col xs={24} sm={12} lg={8} xl={6} key={product.id}>
									<Card
										hoverable
										className="h-full flex flex-col overflow-hidden rounded-xl border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all"
										cover={
											<div className="relative h-56 bg-gray-50">
												{productImageUrl ? (
													<Image
														src={productImageUrl}
														alt={product.name}
														fill
														className="object-cover"
													/>
												) : (
													<div className="w-full h-full bg-gray-100 flex items-center justify-center">
														<span className="text-gray-400">No image</span>
													</div>
												)}
												{product.stock <= 0 && (
													<div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
														<Tag color="error" className="border-0">
															Out of Stock
														</Tag>
													</div>
												)}
											</div>
										}
										actions={[
											<Button
												type="text"
												icon={<ShareAltOutlined />}
												key="share"
												className="text-gray-500 hover:text-blue-500"
											/>,
											<Button
												type="primary"
												icon={<ShoppingCartOutlined />}
												key="cart"
												disabled={product.stock <= 0}
												className="bg-blue-500 hover:bg-blue-600 mx-4"
											>
												Add to Cart
											</Button>,
										]}
									>
										<Card.Meta
											title={
												<div className="flex justify-between items-start mb-2">
													<Typography.Title
														level={5}
														className="m-0 line-clamp-1"
													>
														{product.name}
													</Typography.Title>
													<Typography.Title
														level={5}
														className="m-0 text-blue-500"
													>
														$
														{typeof product.price === "number"
															? product.price.toFixed(2)
															: "0.00"}
													</Typography.Title>
												</div>
											}
											description={
												<div>
													<Typography.Paragraph
														ellipsis={{ rows: 2 }}
														className="text-gray-600 text-sm mb-3"
													>
														{product.description}
													</Typography.Paragraph>
													<div className="flex justify-between items-center">
														<Tag
															color={product.stock > 0 ? "success" : "error"}
															className="border-0"
														>
															{product.stock > 0
																? `${product.stock} in stock`
																: "Out of stock"}
														</Tag>
														<Rate
															disabled
															defaultValue={4}
															className="text-sm"
														/>
													</div>
												</div>
											}
										/>
									</Card>
								</Col>
							);
						})}
					</Row>
				</div>
			</div>
		</div>
	);
}
