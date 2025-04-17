import React, { useState, useEffect } from "react";
import {
	Card,
	Row,
	Col,
	Typography,
	Skeleton,
	Statistic,
	Segmented,
	Button,
	Tooltip,
	Badge,
} from "antd";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip as RechartsTooltip,
} from "recharts";
import {
	UserOutlined,
	ShoppingOutlined,
	DollarOutlined,
	ArrowUpOutlined,
	ArrowDownOutlined,
	ReloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Sample data for sales dashboard
const salesData = [
	{ name: "Jan", value: 150000 },
	{ name: "Feb", value: 220000 },
	{ name: "Mar", value: 320000 },
	{ name: "Apr", value: 450000 },
	{ name: "May", value: 420000 },
	{ name: "Jun", value: 580000 },
];

const statsCards = [
	{
		title: "Total Revenue",
		value: 2140000,
		icon: <DollarOutlined />,
		change: 20.5,
		positive: true,
		color: "#1677ff",
	},
	{
		title: "Active Customers",
		value: 834,
		icon: <UserOutlined />,
		change: 8.2,
		positive: true,
		color: "#52c41a",
	},
	{
		title: "Orders",
		value: 1253,
		icon: <ShoppingOutlined />,
		change: -4.6,
		positive: false,
		color: "#f5222d",
	},
];

// Format as Kenyan Shilling
const formatKES = (value) => {
	return `KES ${value.toLocaleString()}`;
};

// Format as number with commas
const formatNumber = (value) => {
	return value.toLocaleString();
};

const CustomTooltip = ({ active, payload, label }) => {
	if (active && payload && payload.length) {
		return (
			<Card
				size="small"
				bordered={false}
				style={{
					background: "rgba(255, 255, 255, 0.95)",
					boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
				}}
			>
				<div className="font-medium">{label}</div>
				<div className="text-lg font-semibold text-blue-600">
					{formatKES(payload[0].value)}
				</div>
			</Card>
		);
	}
	return null;
};

const Sales = () => {
	const [loading, setLoading] = useState(true);
	const [activeView, setActiveView] = useState("sales");

	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	if (loading) {
		return (
			<div className="p-6">
				<Row gutter={[24, 24]}>
					<Col span={24}>
						<Skeleton active />
					</Col>
					<Col span={24}>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Skeleton active />
							<Skeleton active />
							<Skeleton active />
						</div>
					</Col>
				</Row>
			</div>
		);
	}

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<div className="mb-6">
				<div className="flex justify-between items-center">
					<Title level={4} style={{ margin: 0 }}>
						Sales Dashboard
					</Title>
					<Tooltip title="Refresh data">
						<Button
							type="text"
							icon={<ReloadOutlined />}
							onClick={() => {
								setLoading(true);
								setTimeout(() => setLoading(false), 1000);
							}}
						/>
					</Tooltip>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="mb-6">
				<Row gutter={[24, 24]}>
					{statsCards.map((stat, index) => (
						<Col xs={24} md={8} key={index}>
							<Card
								bordered={false}
								className="h-full shadow-sm hover:shadow-md transition-shadow"
							>
								<Statistic
									title={
										<div className="flex items-center">
											<span className="mr-2" style={{ color: stat.color }}>
												{stat.icon}
											</span>
											{stat.title}
										</div>
									}
									value={
										stat.title.includes("Revenue")
											? formatKES(stat.value)
											: formatNumber(stat.value)
									}
									valueStyle={{ color: "#262626" }}
								/>
								<div className="mt-2 flex items-center">
									{stat.positive ? (
										<ArrowUpOutlined style={{ color: "#52c41a" }} />
									) : (
										<ArrowDownOutlined style={{ color: "#f5222d" }} />
									)}
									<Text
										style={{
											color: stat.positive ? "#52c41a" : "#f5222d",
											marginLeft: 4,
										}}
									>
										{Math.abs(stat.change)}%
									</Text>
									<Text type="secondary" style={{ marginLeft: 8 }}>
										compared to last month
									</Text>
								</div>
							</Card>
						</Col>
					))}
				</Row>
			</div>

			{/* Chart Section */}
			<Card
				bordered={false}
				className="shadow-sm"
				title={
					<div className="flex justify-between items-center">
						<div className="flex-1">
							<Segmented
								options={[
									{ label: "Revenue", value: "sales" },
									{ label: "Orders", value: "orders" },
									{ label: "Customers", value: "customers" },
								]}
								value={activeView}
								onChange={setActiveView}
							/>
						</div>
						<div>
							<Badge color="#1677ff" text="This Year" className="mr-4" />
							<Badge
								color="#d9d9d9"
								text="Last Year"
								style={{ opacity: 0.5 }}
							/>
						</div>
					</div>
				}
			>
				<div style={{ height: 400, width: "100%" }}>
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={salesData}
							margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#f0f0f0"
							/>
							<XAxis dataKey="name" axisLine={false} tickLine={false} />
							<YAxis
								tickFormatter={(value) => `KES ${value / 1000}k`}
								axisLine={false}
								tickLine={false}
							/>
							<RechartsTooltip content={<CustomTooltip />} />
							<Line
								type="monotone"
								dataKey="value"
								stroke="#1677ff"
								strokeWidth={3}
								dot={{ r: 4, strokeWidth: 2, fill: "white" }}
								activeDot={{ r: 6, strokeWidth: 0, fill: "#1677ff" }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</Card>

			{/* Recent Activity */}
			<Row gutter={[24, 24]} className="mt-6">
				<Col xs={24} md={12}>
					<Card
						bordered={false}
						className="h-full shadow-sm"
						title="Regional Performance"
						extra={
							<Button type="link" size="small">
								View All
							</Button>
						}
					>
						<div className="space-y-4">
							{["Kenya", "Uganda", "Tanzania", "Rwanda"].map(
								(country, index) => (
									<div
										key={index}
										className="flex justify-between items-center py-2"
									>
										<div>
											<Text>{country}</Text>
										</div>
										<div className="flex items-center">
											<div className="w-32 h-2 bg-gray-100 rounded-full mr-3">
												<div
													className="h-full bg-blue-500 rounded-full"
													style={{ width: `${80 - index * 15}%` }}
												></div>
											</div>
											<Text strong>{80 - index * 15}%</Text>
										</div>
									</div>
								)
							)}
						</div>
					</Card>
				</Col>
				<Col xs={24} md={12}>
					<Card
						bordered={false}
						className="h-full shadow-sm"
						title="Sales by Category"
						extra={
							<Button type="link" size="small">
								View All
							</Button>
						}
					>
						<div className="space-y-4">
							{["Electronics", "Clothing", "Furniture", "Food"].map(
								(category, index) => (
									<div
										key={index}
										className="flex justify-between items-center py-2"
									>
										<div>
											<Text>{category}</Text>
										</div>
										<div className="flex items-center">
											<div className="w-32 h-2 bg-gray-100 rounded-full mr-3">
												<div
													className="h-full rounded-full"
													style={{
														width: `${90 - index * 17}%`,
														backgroundColor:
															index === 0
																? "#1677ff"
																: index === 1
																? "#52c41a"
																: index === 2
																? "#faad14"
																: "#f5222d",
													}}
												></div>
											</div>
											<Text strong>{formatKES((90 - index * 17) * 10000)}</Text>
										</div>
									</div>
								)
							)}
						</div>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default Sales;
