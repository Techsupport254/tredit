"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams } from "next/navigation";
import {
	Button,
	Badge,
	Dropdown,
	Input,
	Avatar as AntAvatar,
	MenuProps,
	Divider,
	Space,
} from "antd";
import {
	ShoppingCartOutlined,
	SearchOutlined,
	BellOutlined,
	UserOutlined,
	ArrowLeftOutlined,
	SettingOutlined,
	LogoutOutlined,
	ShoppingOutlined,
	DownOutlined,
	CreditCardOutlined,
	MessageOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/auth/AuthContext";

interface NavbarProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
}

export default function Navbar({ searchQuery, setSearchQuery }: NavbarProps) {
	const { data: session } = useSession();
	const { logout } = useAuth();
	const [showMobileSearch, setShowMobileSearch] = useState(false);
	const pathname = usePathname();
	const params = useParams();
	const storeSlug = params.slug as string;
	const { items } = useCart();

	const navigation = [
		{ name: "Home", href: `/${storeSlug}` },
		{ name: "Categories", href: `/${storeSlug}/categories` },
	];

	// Build user menu items
	const userMenuItems: MenuProps["items"] = [
		{
			key: "header",
			label: (
				<div className="px-4 py-3 border-b border-gray-100">
					<div className="flex items-center gap-3">
						<AntAvatar
							src={session?.user?.image}
							size={50}
							icon={<UserOutlined style={{ fontSize: 24 }} />}
							className="border border-gray-200"
						/>
						<div>
							<div className="font-medium text-gray-900 text-base">
								{session?.user?.name || "User"}
							</div>
							<div className="text-sm text-gray-500">
								{(session?.user as any)?.role || "Customer"}
							</div>
						</div>
					</div>
				</div>
			),
			disabled: true,
		},
		{
			type: "divider",
		},
		{
			key: "profile",
			label: <span className="text-base">My Profile</span>,
			icon: <UserOutlined style={{ fontSize: 22 }} className="text-blue-500" />,
		},
		{
			key: "orders",
			label: <span className="text-base">My Orders</span>,
			icon: (
				<ShoppingOutlined style={{ fontSize: 22 }} className="text-blue-500" />
			),
		},
		{
			key: "messages",
			label: <span className="text-base">Messages</span>,
			icon: (
				<MessageOutlined style={{ fontSize: 22 }} className="text-blue-500" />
			),
		},
		{
			key: "payments",
			label: <span className="text-base">Payments</span>,
			icon: (
				<CreditCardOutlined
					style={{ fontSize: 22 }}
					className="text-blue-500"
				/>
			),
		},
		{
			type: "divider",
		},
		{
			key: "settings",
			label: <span className="text-base">Settings</span>,
			icon: (
				<SettingOutlined style={{ fontSize: 22 }} className="text-blue-500" />
			),
		},
		{
			type: "divider",
		},
		{
			key: "logout",
			label: <span className="text-base">Logout</span>,
			icon: (
				<LogoutOutlined style={{ fontSize: 22 }} className="text-red-500" />
			),
			danger: true,
		},
	];

	return (
		<nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm py-2">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Mobile Search Bar (conditionally rendered) */}
				{showMobileSearch && (
					<div className="md:hidden py-3">
						<Input
							placeholder="Search products, brands..."
							prefix={<SearchOutlined className="text-gray-400 text-xl" />}
							className="rounded-full bg-gray-50 border-0 focus:ring-2 focus:ring-blue-500"
							size="large"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onBlur={() => {
								if (!searchQuery) setShowMobileSearch(false);
							}}
							autoFocus
						/>
					</div>
				)}

				<div className="flex items-center justify-between h-16">
					{/* Left Section - Logo and Back */}
					<div className="flex items-center gap-6">
						<Link
							href="/"
							className="flex items-center text-gray-500 hover:text-blue-600 transition-colors group"
						>
							<ArrowLeftOutlined
								style={{ fontSize: 28 }}
								className="group-hover:-translate-x-1 transition-transform"
							/>
							<span className="ml-2 hidden sm:inline font-medium text-base">
								Marketplace
							</span>
						</Link>

						{/* TredIt Logo */}
						<Link href="/" className="flex items-center group">
							<div className="relative w-14 h-14 group-hover:rotate-12 transition-transform">
								<Image
									src="/logo.svg"
									alt="TredIt Logo"
									fill
									sizes="(max-width: 768px) 56px, 56px"
									className="object-contain"
								/>
							</div>
							<span className="ml-2 font-bold text-2xl text-gray-900 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
								TredIt
							</span>
						</Link>

						{/* Search - Only visible on larger screens */}
						<div className="hidden md:flex relative w-64 lg:w-96">
							<Input
								placeholder="Search products, brands..."
								prefix={<SearchOutlined className="text-gray-400 text-xl" />}
								className="rounded-full h-12 bg-gray-50 hover:bg-white focus-within:bg-white border border-gray-200 hover:border-blue-300 focus-within:border-blue-400 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								allowClear
							/>
						</div>
					</div>

					{/* Right Section - Actions */}
					<div className="flex items-center gap-6">
						{/* Mobile Search Button */}
						<Button
							type="text"
							icon={
								<SearchOutlined
									style={{ fontSize: 28 }}
									className="text-gray-500 hover:text-blue-600"
								/>
							}
							className="md:hidden"
							onClick={() => setShowMobileSearch(!showMobileSearch)}
						/>

						{/* Navigation Links (desktop) */}
						<div className="hidden lg:flex items-center gap-4">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href as any}
									className={`px-5 py-2 rounded-full text-base font-medium transition-colors ${
										pathname === item.href
											? "text-blue-600 bg-blue-50"
											: "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
									}`}
								>
									{item.name}
								</Link>
							))}
						</div>

						{/* Action Buttons */}
						<Space size="large">
							<Link href={`/${storeSlug}/cart`}>
								<Badge
									count={items.length}
									size="default"
									color="#2563eb"
									offset={[-2, 5]}
								>
									<Button
										type="text"
										shape="circle"
										size="large"
										icon={
											<ShoppingCartOutlined
												style={{ fontSize: 28 }}
												className="text-gray-600 hover:text-blue-600"
											/>
										}
										className="hover:bg-gray-50"
									/>
								</Badge>
							</Link>

							<Link href={`/${storeSlug}/profile#notifications`}>
								<Badge dot color="#2563eb" offset={[-2, 5]}>
									<Button
										type="text"
										shape="circle"
										size="large"
										icon={
											<BellOutlined
												style={{ fontSize: 28 }}
												className="text-gray-600 hover:text-blue-600"
											/>
										}
										className="hover:bg-gray-50"
									/>
								</Badge>
							</Link>
						</Space>

						{/* User Profile Dropdown */}
						{session?.user ? (
							<Dropdown
								menu={{
									items: userMenuItems,
									onClick: ({ key }) => {
										// Handle dropdown menu item clicks
										if (key === "profile") {
											window.location.href = `/${storeSlug}/profile`;
										} else if (key === "orders") {
											window.location.href = `/${storeSlug}/profile#orders`;
										} else if (key === "messages") {
											window.location.href = `/${storeSlug}/profile#messages`;
										} else if (key === "payments") {
											window.location.href = `/${storeSlug}/profile#payments`;
										} else if (key === "settings") {
											window.location.href = `/${storeSlug}/profile#settings`;
										} else if (key === "logout") {
											try {
												console.log("Logout clicked in Navbar");
												logout();
											} catch (error) {
												console.error("Logout error in Navbar:", error);
											}
										}
									},
								}}
								trigger={["click"]}
								placement="bottomRight"
								overlayClassName="w-64 shadow-xl rounded-lg"
								overlayStyle={{ boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
							>
								<Button
									type="text"
									className="flex items-center gap-3 ml-1 p-1 rounded-full hover:bg-gray-50 transition-colors"
								>
									<AntAvatar
										src={session.user.image}
										icon={<UserOutlined style={{ fontSize: 24 }} />}
										size={46}
										className="border border-gray-200 shadow-sm"
									/>
									<div className="hidden sm:block text-left">
										<div className="text-base font-medium text-gray-900 leading-tight">
											{session.user.name?.split(" ")[0] || "User"}
										</div>
										<div className="text-sm text-gray-500 leading-tight">
											{(session.user as any)?.role || "Customer"}
										</div>
									</div>
									<DownOutlined className="text-sm text-gray-400 ml-1 hidden sm:block" />
								</Button>
							</Dropdown>
						) : (
							<Space size="middle">
								<Link href="/login">
									<Button
										type="text"
										className="hidden sm:inline-block text-gray-600 hover:text-blue-600 font-medium text-base"
									>
										Sign In
									</Button>
								</Link>
								<Link href="/register">
									<Button
										type="primary"
										className="bg-blue-600 hover:bg-blue-700 border-0 font-medium shadow-sm text-base py-1 px-5 h-auto"
										shape="round"
									>
										Join Free
									</Button>
								</Link>
							</Space>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
