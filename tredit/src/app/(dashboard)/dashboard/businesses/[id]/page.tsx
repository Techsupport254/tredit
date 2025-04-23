"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	Button,
	Row,
	Col,
	Typography,
	Rate,
	Tag,
	Spin,
	message,
	theme,
	Tabs,
	Descriptions,
	Divider,
	Space,
	Avatar,
	Progress,
	Statistic,
	Empty,
	List,
	Table,
} from "antd";
import {
	ShopOutlined,
	GlobalOutlined,
	PhoneOutlined,
	MailOutlined,
	TeamOutlined,
	AppstoreOutlined,
	TagOutlined,
	BankOutlined,
	EnvironmentOutlined,
	IdcardOutlined,
	FileTextOutlined,
	BarChartOutlined,
	StarOutlined,
	ArrowLeftOutlined,
	PlusOutlined,
	LinkOutlined,
	FacebookOutlined,
	InstagramOutlined,
	TikTokOutlined,
	YoutubeOutlined,
	InfoCircleOutlined,
	CheckCircleOutlined,
	DisconnectOutlined,
	UserOutlined,
	ClockCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { TabsProps } from "antd";
import OverviewTab from "./components/OverviewTab";
import TeamTab from "./components/TeamTab";
import SocialMediaTab from "./components/SocialMediaTab";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { useToken } = theme;

interface Business {
	id: string;
	name: string;
	type: "PRODUCT" | "SERVICE";
	category: string;
	description: string;
	email: string;
	phone: string;
	city: string;
	country: string;
	employeeCount: number;
	averageRating: number;
	reviewCount: number;
}

interface TeamMember {
	id: string;
	name: string;
	role: "OWNER" | "ADMIN" | "MANAGER" | "MEMBER";
	email: string;
	image?: string;
	status: "active" | "inactive";
}

interface ChannelData {
	channelName: string;
	channelId: string;
	accountImage: string;
}

interface SocialMediaConnection {
	id: string;
	platform: string;
	connected: boolean;
	channelId?: string;
	accessToken?: string;
	refreshToken?: string;
	expiresAt?: Date;
	businessId: string;
	createdAt: Date;
	updatedAt: Date;
}

interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	stock: number;
	status: string;
	media?: { url: string }[];
}

interface Service {
	id: string;
	name: string;
	description: string;
	price: number;
	duration: number;
	status: string;
}

interface OrderItem {
	id: string;
	quantity: number;
	price: number;
	product?: Product;
	service?: Service;
}

interface Order {
	id: string;
	status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
	paymentStatus: "PENDING" | "PAID" | "FAILED";
	totalAmount: number;
	items: OrderItem[];
	createdAt: string;
}

export default function BusinessDetailsPage({
	params,
}: {
	params: { id: string };
}) {
	const router = useRouter();
	const { token } = theme.useToken();
	const [business, setBusiness] = useState<Business>({
		id: params.id,
		name: "Loading...",
		type: "PRODUCT",
		category: "",
		description: "",
		email: "",
		phone: "",
		city: "",
		country: "",
		employeeCount: 0,
		averageRating: 0,
		reviewCount: 0,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [connections, setConnections] = useState<SocialMediaConnection[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [services, setServices] = useState<Service[]>([]);
	const [orders, setOrders] = useState<Order[]>([]);
	const [channelData, setChannelData] = useState<
		Record<string, ChannelData | null>
	>({});

	useEffect(() => {
		fetchBusinessDetails();
		if (business?.type === "PRODUCT") {
			fetchProducts();
		} else if (business?.type === "SERVICE") {
			fetchServices();
		}
		fetchOrders();
	}, [params.id, business?.type]);

	useEffect(() => {
		const fetchAllChannelData = async () => {
			const data: Record<string, ChannelData | null> = {};
			for (const connection of connections) {
				if (connection.connected && connection.channelId) {
					try {
						if (connection.platform === "YOUTUBE") {
							const response = await fetch(
								`/api/youtube?businessId=${params.id}&action=channel`
							);

							if (!response.ok) {
								console.error(
									"Failed to fetch YouTube data:",
									await response.text()
								);
								data[connection.platform] = null;
								continue;
							}

							const channelData = await response.json();
							data[connection.platform] = {
								channelName: channelData.snippet?.title || channelData.title,
								channelId: channelData.id,
								accountImage:
									channelData.snippet?.thumbnails?.default?.url ||
									channelData.thumbnails?.default?.url,
							};
						}
					} catch (error: any) {
						console.error(`Error fetching ${connection.platform} data:`, error);
						data[connection.platform] = null;
					}
				}
			}
			setChannelData(data);
		};

		if (connections.length > 0) {
			fetchAllChannelData();
		}
	}, [connections, params.id]);

	const fetchBusinessDetails = async () => {
		try {
			const response = await axios.get(`/api/business/${params.id}`);
			if (response.data) {
				setBusiness(response.data);
				// Set the owner as the first team member
				if (response.data.user) {
					setTeamMembers([
						{
							id: response.data.user.id,
							name: response.data.user.name,
							email: response.data.user.email,
							role: "OWNER",
							image: response.data.user.image,
							status: "active",
						},
					]);
				}
				// Fetch social media connections
				const connectionsResponse = await axios.get(
					`/api/business/${params.id}/social-media`
				);
				setConnections(connectionsResponse.data);
			}
		} catch (error: any) {
			message.error(
				error.response?.data?.error || "Failed to fetch business details"
			);
			console.error("Error fetching business details:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchProducts = async () => {
		try {
			const response = await axios.get(`/api/business/${params.id}/products`);
			setProducts(response.data);
		} catch (error) {
			console.error("Error fetching products:", error);
			message.error("Failed to fetch products");
		}
	};

	const fetchServices = async () => {
		try {
			const response = await axios.get(`/api/business/${params.id}/services`);
			setServices(response.data);
		} catch (error) {
			console.error("Error fetching services:", error);
			message.error("Failed to fetch services");
		}
	};

	const fetchOrders = async () => {
		try {
			const response = await axios.get(`/api/business/${params.id}/orders`);
			setOrders(response.data);
		} catch (error) {
			console.error("Error fetching orders:", error);
			message.error("Failed to fetch orders");
		}
	};

	const handleConnect = async (platform: string) => {
		try {
			if (platform.toLowerCase() === "youtube") {
				const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
				const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

				if (!clientId || !redirectUri) {
					message.error("YouTube API configuration is missing");
					return;
				}

				const authUrl =
					`https://accounts.google.com/o/oauth2/v2/auth?` +
					`client_id=${clientId}&` +
					`redirect_uri=${encodeURIComponent(redirectUri)}&` +
					`response_type=code&` +
					`scope=https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly&` +
					`access_type=offline&` +
					`state=${params.id}&` +
					`prompt=consent`;

				window.location.href = authUrl;
			}
		} catch (error) {
			console.error("Error connecting to social media:", error);
			message.error("Failed to connect social media account");
		}
	};

	const handleDisconnect = async (platform: string) => {
		try {
			const response = await fetch(
				`/api/business/${params.id}/social-media/disconnect`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ platform: platform.toUpperCase() }),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to disconnect");
			}

			message.success("Successfully disconnected social media account");
			// Refresh data
			fetchBusinessDetails();
		} catch (error) {
			console.error("Error disconnecting social media:", error);
			message.error("Failed to disconnect social media account");
		}
	};

	// Function to get initials from name
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	// Function to get role color
	const getRoleColor = (role: TeamMember["role"]) => {
		switch (role) {
			case "OWNER":
				return "gold";
			case "ADMIN":
				return "red";
			case "MANAGER":
				return "green";
			default:
				return "blue";
		}
	};

	const handleAddProduct = () => {
		router.push(`/dashboard/businesses/${params.id}/products/new` as any);
	};

	const handleAddService = () => {
		router.push(`/dashboard/businesses/${params.id}/services/new` as any);
	};

	const handleAddTeamMember = () => {
		// Implementation needed
	};

	const handleRemoveTeamMember = () => {
		// Implementation needed
	};

	const items = [
		{
			key: "1",
			label: (
				<span>
					<InfoCircleOutlined /> Overview
				</span>
			),
			children: (
				<OverviewTab
					business={business}
					products={products}
					services={services}
					orders={orders}
				/>
			),
		},
		{
			key: "2",
			label: (
				<span>
					<TeamOutlined /> Team
				</span>
			),
			children: (
				<TeamTab
					members={teamMembers}
					onAddMember={handleAddTeamMember}
					onRemoveMember={handleRemoveTeamMember}
				/>
			),
		},
		{
			key: "3",
			label: (
				<span>
					<LinkOutlined /> Social Media
				</span>
			),
			children: (
				<SocialMediaTab
					connections={connections}
					onConnect={handleConnect}
					onDisconnect={handleDisconnect}
					channelData={channelData}
				/>
			),
		},
		{
			key: "4",
			label: (
				<span>
					{business.type === "PRODUCT" ? (
						<ShopOutlined />
					) : (
						<AppstoreOutlined />
					)}{" "}
					{business.type === "PRODUCT" ? "Products" : "Services"}
				</span>
			),
			children: (
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<Typography.Title level={4} className="!mb-0">
							{business.type === "PRODUCT" ? "Products" : "Services"}
						</Typography.Title>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={
								business.type === "PRODUCT"
									? handleAddProduct
									: handleAddService
							}
							className="bg-blue-500 h-11"
						>
							Add {business.type === "PRODUCT" ? "Product" : "Service"}
						</Button>
					</div>
					{business.type === "PRODUCT" ? (
						products.length > 0 ? (
							<Table
								dataSource={products}
								rowKey="id"
								columns={[
									{
										title: "#",
										key: "index",
										width: 60,
										render: (_, __, index) => index + 1,
									},
									{
										title: "Preview",
										key: "preview",
										width: 80,
										render: (_, record) => {
											const firstImage = record.media?.[0]?.url;
											return (
												<div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
													{firstImage ? (
														<img
															src={firstImage}
															alt={record.name}
															className="w-full h-full object-contain"
															onError={(e) => {
																const target = e.target as HTMLImageElement;
																target.onerror = null;
																target.style.display = "none";
																target.parentElement!.innerHTML = `
																	<div class="w-full h-full flex items-center justify-center">
																		<ShopOutlined style={{ fontSize: '1.5rem', color: '#d9d9d9' }} />
																	</div>
																`;
															}}
														/>
													) : (
														<ShopOutlined className="text-xl text-gray-400" />
													)}
												</div>
											);
										},
									},
									{
										title: "Product",
										key: "product",
										render: (_, record) => (
											<div>
												<div className="font-medium">{record.name}</div>
												<div className="text-gray-500">
													KES {Number(record.price).toLocaleString()}
												</div>
											</div>
										),
									},
									{
										title: "Stock",
										dataIndex: "stock",
										key: "stock",
										width: 120,
										render: (stock) => (
											<Tag color={stock > 0 ? "green" : "red"}>
												{stock > 0 ? `${stock} in stock` : "Out of stock"}
											</Tag>
										),
									},
									{
										title: "Status",
										dataIndex: "status",
										key: "status",
										width: 100,
										render: (status) => (
											<Tag color={status === "active" ? "green" : "red"}>
												{status}
											</Tag>
										),
									},
									{
										title: "Actions",
										key: "actions",
										width: 120,
										render: (_, record) => (
											<Space>
												<Button type="link" size="small">
													Edit
												</Button>
												<Button type="link" size="small" danger>
													Delete
												</Button>
											</Space>
										),
									},
								]}
								pagination={false}
							/>
						) : (
							<Card>
								<Empty
									image={Empty.PRESENTED_IMAGE_SIMPLE}
									description={
										<Text type="secondary" className="text-sm">
											No products yet
										</Text>
									}
								/>
							</Card>
						)
					) : services.length > 0 ? (
						<Row gutter={[16, 16]}>
							{services.map((service) => (
								<Col xs={24} sm={12} md={8} key={service.id}>
									<Card
										hoverable
										className="h-full border-0 shadow-sm hover:shadow-md transition-all"
										cover={
											<div className="h-48 bg-gray-100 flex items-center justify-center">
												<AppstoreOutlined className="text-4xl text-gray-400" />
											</div>
										}
									>
										<Card.Meta
											title={service.name}
											description={
												<div>
													<div className="text-gray-500 mb-2">
														{service.description}
													</div>
													<div className="flex justify-between items-center">
														<Typography.Text strong>
															${service.price}
														</Typography.Text>
														<Tag color="blue">{service.duration} min</Tag>
													</div>
												</div>
											}
										/>
									</Card>
								</Col>
							))}
						</Row>
					) : (
						<Card>
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={
									<Text type="secondary" className="text-sm">
										No services yet
									</Text>
								}
							/>
						</Card>
					)}
				</div>
			),
		},
		{
			key: "5",
			label: (
				<span>
					<FileTextOutlined /> Orders
				</span>
			),
			children: (
				<div className="space-y-6">
					<Typography.Title level={4} className="!mb-6">
						Recent Orders
					</Typography.Title>
					<List
						dataSource={orders}
						renderItem={(order) => (
							<List.Item
								key={order.id}
								className="bg-white rounded-lg shadow-sm mb-4 p-4"
								actions={[
									<Button key="view" type="link">
										View Details
									</Button>,
								]}
							>
								<List.Item.Meta
									title={
										<div className="flex items-center justify-between">
											<Typography.Text strong>
												Order #{order.id.slice(0, 8)}
											</Typography.Text>
											<Tag
												color={
													order.status === "COMPLETED"
														? "green"
														: order.status === "PENDING"
														? "orange"
														: order.status === "CANCELLED"
														? "red"
														: "blue"
												}
											>
												{order.status}
											</Tag>
										</div>
									}
									description={
										<div>
											<div className="text-gray-500">
												Total: ${order.totalAmount}
											</div>
											<div className="text-gray-400 text-sm">
												{new Date(order.createdAt).toLocaleDateString()}
											</div>
										</div>
									}
								/>
							</List.Item>
						)}
					/>
				</div>
			),
		},
	] as TabsProps["items"];

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Spin size="large" />
			</div>
		);
	}

	if (!business) {
		return (
			<div className="p-6">
				<div className="flex justify-between items-center mb-8">
					<div>
						<Title level={2} className="!mb-1">
							Business Details
						</Title>
						<Text type="secondary">View and manage business information</Text>
					</div>
					<Button
						icon={<ArrowLeftOutlined />}
						onClick={() => router.back()}
						style={{ backgroundColor: token.colorBgContainer }}
					>
						Back to Businesses
					</Button>
				</div>
				<Card>
					<Empty
						image={
							<ShopOutlined
								style={{ fontSize: 64, color: token.colorPrimary }}
							/>
						}
						description={
							<div className="space-y-4 flex flex-col items-center">
								<Title level={4}>Business not found</Title>
								<Text type="secondary">
									The business you're looking for doesn't exist or you don't
									have access to it.
								</Text>
								<Button
									type="primary"
									onClick={() => router.push("/dashboard/businesses")}
									style={{ backgroundColor: token.colorPrimary }}
								>
									View All Businesses
								</Button>
							</div>
						}
					/>
				</Card>
			</div>
		);
	}

	return (
		<div>
			<div className="w-full">
				<Row gutter={[24, 24]} className="w-full">
					<Col xs={24} lg={16}>
						<div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
							<div className="flex items-center gap-6 mb-8">
								<div className="w-16 h-16 rounded-lg bg-blue-500/10 flex items-center justify-center">
									<ShopOutlined className="text-2xl text-blue-500" />
								</div>
								<div>
									<div className="flex items-center">
										<Text className="text-lg font-medium">{business.name}</Text>
										<Tag
											color="blue"
											className="rounded-full uppercase text-xs"
										>
											{business.type}
										</Tag>
									</div>
									<Text type="secondary">{business.category}</Text>
								</div>
							</div>

							<Row gutter={[16, 16]} className="mb-6">
								<Col xs={24} sm={8}>
									<Card className="text-center bg-gray-50 border border-gray-200">
										<Statistic
											title={<Text className="text-gray-600">Rating</Text>}
											value={business.averageRating || 0}
											precision={1}
											prefix={<StarOutlined className="text-yellow-500" />}
										/>
									</Card>
								</Col>
								<Col xs={24} sm={8}>
									<Card className="text-center bg-gray-50 border border-gray-200">
										<Statistic
											title={<Text className="text-gray-600">Reviews</Text>}
											value={business.reviewCount || 0}
											prefix={<FileTextOutlined className="text-blue-500" />}
										/>
									</Card>
								</Col>
								<Col xs={24} sm={8}>
									<Card className="text-center bg-gray-50 border border-gray-200">
										<Statistic
											title={<Text className="text-gray-600">Employees</Text>}
											value={business.employeeCount || 1}
											prefix={<TeamOutlined className="text-green-500" />}
										/>
									</Card>
								</Col>
							</Row>
						</div>

						<Tabs
							defaultActiveKey="overview"
							className="bg-white rounded-lg shadow-sm px-6 pt-4"
							items={items}
						/>
					</Col>

					<Col xs={24} lg={8}>
						<div className="sticky top-24 bg-white rounded-lg p-6 shadow-sm">
							<Title level={5} className="!mt-0 !mb-4">
								Quick Actions
							</Title>
							<div className="space-y-3">
								<Button
									block
									type="primary"
									size="large"
									icon={<ShopOutlined />}
									className="h-11 bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all duration-200"
								>
									View Store
								</Button>
								<Button
									block
									type="primary"
									size="large"
									icon={<BarChartOutlined />}
									className="h-11 bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all duration-200"
								>
									View Analytics
								</Button>
								<Button
									block
									type="primary"
									size="large"
									icon={<TeamOutlined />}
									className="h-11 bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all duration-200"
								>
									Manage Team
								</Button>
								<Button
									block
									type="primary"
									size="large"
									icon={<BankOutlined />}
									className="h-11 bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all duration-200"
								>
									Payment Settings
								</Button>
							</div>

							<Divider />

							<Title level={5} className="!mt-0 !mb-4">
								Business Status
							</Title>
							<div className="space-y-3">
								<div>
									<div className="flex justify-between mb-2">
										<Text className="text-gray-600">Profile Completion</Text>
										<Text strong>75%</Text>
									</div>
									<Progress
										percent={75}
										showInfo={false}
										className="!mb-0"
										strokeColor="#3B82F6"
									/>
								</div>
								<Text type="secondary" className="block text-sm">
									Last updated: {new Date().toLocaleDateString()}
								</Text>
							</div>

							<Divider />

							<Title level={5} className="!mt-0 !mb-4">
								Recent Activity
							</Title>
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={
									<Text type="secondary" className="text-sm">
										No recent activity
									</Text>
								}
							/>
						</div>
					</Col>
				</Row>
			</div>
		</div>
	);
}
