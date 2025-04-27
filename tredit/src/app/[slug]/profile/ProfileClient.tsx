"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
	Tabs,
	Avatar,
	Button,
	Typography,
	Card,
	Form,
	Input,
	Divider,
	Badge,
	Table,
	Tag,
	Menu,
	Empty,
	Space,
	Input as AntInput,
} from "antd";
import {
	UserOutlined,
	ShoppingOutlined,
	MessageOutlined,
	CreditCardOutlined,
	SettingOutlined,
	BellOutlined,
	EditOutlined,
	ShoppingCartOutlined,
	SearchOutlined,
	RocketOutlined,
	CheckCircleOutlined,
} from "@ant-design/icons";
import MessagesClient from "../messages/MessagesClient";

const { Title, Text } = Typography;
const { Search } = AntInput;

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

interface Business {
	id: string;
	name: string;
	description: string | null;
	logo: string | null;
	type: string;
	status: string;
}

interface ProfileClientProps {
	business: Business;
}

// Sample cart items for demonstration
const mockCartItems = [
	{
		id: "1",
		name: "Wireless Headphones",
		image: null,
		price: 79.99,
		quantity: 1,
		total: 79.99,
	},
	{
		id: "2",
		name: "Smart Watch",
		image: null,
		price: 199.99,
		quantity: 1,
		total: 199.99,
	},
	{
		id: "3",
		name: "Bluetooth Speaker",
		image: null,
		price: 59.99,
		quantity: 2,
		total: 119.98,
	},
];

// Sample order data
const mockOrders = [
	{
		id: "12345",
		date: "2023-06-15",
		items: [
			{ id: "item1", name: "Wireless Headphones", quantity: 1, price: 79.99 },
			{ id: "item2", name: "Smart Watch", quantity: 1, price: 199.99 },
		],
		totalAmount: 279.98,
		status: "shipped",
		shippingInfo: {
			address: "123 Main St",
			city: "New York",
			zip: "10001",
		},
		unread: 2,
	},
	{
		id: "10987",
		date: "2023-06-10",
		items: [
			{ id: "item4", name: "Smartphone Case", quantity: 1, price: 24.99 },
		],
		totalAmount: 24.99,
		status: "delivered",
		shippingInfo: {
			address: "456 Oak Ave",
			city: "Chicago",
			zip: "60601",
		},
		unread: 0,
	},
];

export default function ProfileClient({ business }: ProfileClientProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("messages");
	const [sidebarTab, setSidebarTab] = useState("messages");
	const pathname = usePathname();
	const router = useRouter();

	// Use effect to handle hash navigation
	useEffect(() => {
		// Check for hash in URL
		const hash = window.location.hash.replace("#", "");

		if (hash) {
			setActiveTab(hash);
			setSidebarTab(hash);
		} else {
			// If no hash is present, add #messages to URL without navigation
			window.history.pushState({}, "", `${pathname}#messages`);
		}
	}, [pathname]);

	// Handle tab change
	const handleTabChange = (key: string) => {
		setActiveTab(key);
		setSidebarTab(key);
		// Update URL hash without full navigation
		window.history.pushState({}, "", `${pathname}#${key}`);
	};

	// Sample user data
	const userData = {
		name: "John Doe",
		email: "john.doe@example.com",
		phone: "+1 (555) 123-4567",
		address: "123 Main St, New York, NY 10001",
		avatar: null,
	};

	// Get status tag
	const getStatusTag = (status: string) => {
		switch (status) {
			case "cart":
				return <Tag color="blue">Cart</Tag>;
			case "processing":
				return <Tag color="orange">Processing</Tag>;
			case "shipped":
				return <Tag color="purple">Shipped</Tag>;
			case "delivered":
				return <Tag color="green">Delivered</Tag>;
			default:
				return <Tag color="default">Unknown</Tag>;
		}
	};

	const renderProfileContent = () => (
		<div className="w-full">
			<div className="flex flex-col md:flex-row gap-8">
				<div className="flex flex-col items-center">
					<Avatar
						size={120}
						icon={<UserOutlined />}
						src={userData.avatar}
						className="border-4 border-gray-100 shadow-sm"
					/>
					<Button type="default" icon={<EditOutlined />} className="mt-4">
						Change Photo
					</Button>
				</div>

				<div className="flex-grow">
					<Form layout="vertical" initialValues={userData} className="max-w-xl">
						<Form.Item label="Full Name" name="name">
							<Input size="large" />
						</Form.Item>

						<Form.Item label="Email Address" name="email">
							<Input size="large" type="email" />
						</Form.Item>

						<Form.Item label="Phone Number" name="phone">
							<Input size="large" />
						</Form.Item>

						<Form.Item label="Address" name="address">
							<Input.TextArea rows={3} size="large" />
						</Form.Item>

						<Form.Item>
							<Button
								type="primary"
								size="large"
								className="bg-blue-600 hover:bg-blue-700 border-0"
							>
								Save Changes
							</Button>
						</Form.Item>
					</Form>
				</div>
			</div>
		</div>
	);

	const renderCartContent = () => (
		<div className="w-full">
			<div className="p-0">
				<div className="flex justify-between items-center mb-6">
					<Title level={4} className="m-0">
						Your Cart
					</Title>
					<Text type="secondary">{mockCartItems.length} items</Text>
				</div>

				{mockCartItems.length > 0 ? (
					<div className="space-y-4">
						{mockCartItems.map((item) => (
							<div
								key={item.id}
								className="flex justify-between items-center p-4 border border-gray-100 rounded-lg"
							>
								<div className="flex items-center gap-4">
									<div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
										<ShoppingOutlined
											style={{ fontSize: 24 }}
											className="text-gray-400"
										/>
									</div>
									<div>
										<Text strong className="block text-base">
											{item.name}
										</Text>
										<Text className="text-gray-500">
											Quantity: {item.quantity}
										</Text>
									</div>
								</div>
								<div className="text-right">
									<Text strong className="block text-lg">
										${item.total.toFixed(2)}
									</Text>
									<Text className="text-gray-500">
										${item.price.toFixed(2)} each
									</Text>
								</div>
							</div>
						))}

						<div className="mt-6 p-4 bg-gray-50 rounded-lg">
							<div className="flex justify-between mb-2">
								<Text>Subtotal:</Text>
								<Text strong>
									$
									{mockCartItems
										.reduce((sum, item) => sum + item.total, 0)
										.toFixed(2)}
								</Text>
							</div>
							<div className="mt-4">
								<Button
									type="primary"
									size="large"
									block
									className="bg-blue-600 hover:bg-blue-700 border-0"
								>
									Checkout
								</Button>
							</div>
						</div>
					</div>
				) : (
					<div className="text-center py-8">
						<ShoppingCartOutlined
							style={{ fontSize: 48 }}
							className="text-gray-300 mb-4"
						/>
						<Text type="secondary" className="block mb-4">
							Your cart is empty
						</Text>
						<Button
							type="primary"
							className="bg-blue-600 hover:bg-blue-700 border-0"
						>
							Shop Now
						</Button>
					</div>
				)}
			</div>
		</div>
	);

	const renderOrdersContent = () => (
		<div className="w-full">
			<div className="mb-6">
				<Title level={4} className="m-0">
					My Orders
				</Title>
				<Text type="secondary">Track and manage your purchase history</Text>
			</div>

			<div className="mb-4">
				<Search
					placeholder="Search orders"
					allowClear
					enterButton={<SearchOutlined />}
					size="large"
					style={{ maxWidth: "400px" }}
				/>
			</div>

			{mockOrders.length > 0 ? (
				<div className="space-y-4">
					{mockOrders.map((order) => (
						<div
							key={order.id}
							className="border border-gray-100 rounded-lg overflow-hidden"
						>
							<div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-100">
								<div className="flex items-center gap-2">
									<Badge count={order.unread} offset={[5, 0]}>
										<Text strong className="text-base">
											Order #{order.id}
										</Text>
									</Badge>
									<Text type="secondary" className="ml-4">
										{new Date(order.date).toLocaleDateString()}
									</Text>
								</div>

								<div className="flex items-center gap-3">
									{getStatusTag(order.status)}
									<Text strong>${order.totalAmount.toFixed(2)}</Text>
								</div>
							</div>

							<div className="p-4">
								<div className="mb-4">
									<Text type="secondary">Items:</Text>
									<div className="mt-2 space-y-2">
										{order.items.map((item) => (
											<div key={item.id} className="flex justify-between">
												<Text>
													{item.name} × {item.quantity}
												</Text>
												<Text>${(item.price * item.quantity).toFixed(2)}</Text>
											</div>
										))}
									</div>
								</div>

								<div className="flex justify-between mt-4">
									<Button type="default">Track Order</Button>
									<Button
										type="primary"
										className="bg-blue-600 hover:bg-blue-700 border-0"
									>
										View Details
									</Button>
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<Empty
					description="You haven't placed any orders yet"
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				/>
			)}
		</div>
	);

	const renderMessagesContent = () => <MessagesClient business={business} />;

	const renderNotificationsContent = () => (
		<div className="w-full">
			<div className="mb-6">
				<Title level={4} className="m-0">
					Notifications
				</Title>
				<Text type="secondary">Stay updated on your orders and activity</Text>
			</div>

			<div className="text-center py-8">
				<BellOutlined style={{ fontSize: 48 }} className="text-gray-300 mb-4" />
				<Text type="secondary" className="block mb-4">
					No new notifications
				</Text>
				<Button type="default">Mark all as read</Button>
			</div>
		</div>
	);

	const renderPaymentsContent = () => (
		<div className="w-full">
			<div className="mb-6">
				<Title level={4} className="m-0">
					Payment Methods
				</Title>
				<Text type="secondary">Manage your payment options</Text>
			</div>

			<div className="text-center py-8">
				<CreditCardOutlined
					style={{ fontSize: 48 }}
					className="text-gray-300 mb-4"
				/>
				<Text type="secondary" className="block mb-4">
					No payment methods added yet
				</Text>
				<Button
					type="primary"
					className="bg-blue-600 hover:bg-blue-700 border-0"
				>
					Add Payment Method
				</Button>
			</div>
		</div>
	);

	const renderSettingsContent = () => (
		<div className="w-full">
			<div className="mb-6">
				<Title level={4} className="m-0">
					Account Settings
				</Title>
				<Text type="secondary">Manage your account preferences</Text>
			</div>

			<div className="space-y-6">
				<Card title="Notification Preferences" className="border-gray-100">
					<Form layout="vertical">
						<Form.Item name="emailNotifications" valuePropName="checked">
							<div className="flex justify-between items-center">
								<div>
									<Text strong className="block">
										Email Notifications
									</Text>
									<Text type="secondary">Receive order updates via email</Text>
								</div>
								<div>
									<Button
										type="primary"
										className="bg-blue-600 hover:bg-blue-700 border-0"
									>
										Enable
									</Button>
								</div>
							</div>
						</Form.Item>

						<Divider />

						<Form.Item name="pushNotifications" valuePropName="checked">
							<div className="flex justify-between items-center">
								<div>
									<Text strong className="block">
										Push Notifications
									</Text>
									<Text type="secondary">
										Get real-time updates on your device
									</Text>
								</div>
								<div>
									<Button type="default">Disable</Button>
								</div>
							</div>
						</Form.Item>
					</Form>
				</Card>

				<Card title="Privacy Settings" className="border-gray-100">
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<div>
								<Text strong className="block">
									Account Visibility
								</Text>
								<Text type="secondary">Control who can see your profile</Text>
							</div>
							<div>
								<Button type="default">Manage</Button>
							</div>
						</div>

						<Divider />

						<div className="flex justify-between items-center">
							<div>
								<Text strong className="block">
									Data Usage
								</Text>
								<Text type="secondary">Manage how your data is used</Text>
							</div>
							<div>
								<Button type="default">Settings</Button>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);

	// Render content based on active tab
	const renderActiveTabContent = () => {
		switch (activeTab) {
			case "profile":
				return renderProfileContent();
			case "cart":
				return renderCartContent();
			case "orders":
				return renderOrdersContent();
			case "messages":
				return renderMessagesContent();
			case "notifications":
				return renderNotificationsContent();
			case "payments":
				return renderPaymentsContent();
			case "settings":
				return renderSettingsContent();
			default:
				return renderProfileContent();
		}
	};

	return (
		<div className="flex flex-col h-full min-h-screen">
			<div className="flex-grow flex flex-col">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full w-full">
					<div className="flex flex-col md:flex-row gap-8 h-full">
						{/* Sidebar */}
						<div className="w-full md:w-64 flex-shrink-0">
							<Card className="shadow-sm h-full">
								<Menu
									mode="inline"
									selectedKeys={[sidebarTab]}
									onClick={({ key }) => handleTabChange(key)}
									items={[
										{
											key: "profile",
											icon: <UserOutlined />,
											label: "My Profile",
										},
										{
											key: "orders",
											icon: <ShoppingOutlined />,
											label: "My Orders",
										},
										{
											key: "messages",
											icon: <MessageOutlined />,
											label: "Messages",
										},
										{
											key: "notifications",
											icon: <BellOutlined />,
											label: "Notifications",
										},
										{
											key: "payments",
											icon: <CreditCardOutlined />,
											label: "Payments",
										},
										{
											key: "settings",
											icon: <SettingOutlined />,
											label: "Settings",
										},
									]}
								/>
							</Card>
						</div>

						{/* Main Content */}
						<div className="flex-grow">
							<Card className="shadow-sm h-full">
								{renderActiveTabContent()}
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
