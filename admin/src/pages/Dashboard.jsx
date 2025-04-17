import React, { useState, useEffect } from "react";
import {
	Card,
	Row,
	Col,
	Button,
	Space,
	Progress,
	Badge,
	Avatar,
	List,
	Table,
	Tag,
	Typography,
	Empty,
	Segmented,
	Statistic,
	Tabs,
	Tooltip,
	Skeleton,
	Timeline,
} from "antd";
import {
	UserOutlined,
	ShoppingCartOutlined,
	DollarOutlined,
	BellOutlined,
	LineChartOutlined,
	CalendarOutlined,
	TeamOutlined,
	MessageOutlined,
	HeartOutlined,
	CustomerServiceOutlined,
	WalletOutlined,
	ClockCircleOutlined,
	CheckCircleOutlined,
	InfoCircleOutlined,
	ShopOutlined,
	WarningOutlined,
	FireOutlined,
	SafetyOutlined,
	BlockOutlined,
	CloseCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../Context/AuthContext";
import { useAccount } from "../Context/AccountContext";
import { Chart as ChartJS, registerables } from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(...registerables);

// Create a formatter for currency values
const currencyFormatter = new Intl.NumberFormat("en-KE", {
	style: "currency",
	currency: "KES",
	minimumFractionDigits: 0,
	maximumFractionDigits: 0,
});

const { Title, Text } = Typography;

const Dashboard = () => {
	const [loading, setLoading] = useState(true);
	const { user: authUser } = useAuth();
	const { user: accountUser } = useAccount();
	const [timeFrame, setTimeFrame] = useState("month");

	// Combine user data from both contexts
	const user = authUser || accountUser;

	// Simulate data loading
	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	// Handle page reload after registration
	useEffect(() => {
		const shouldReload = localStorage.getItem("should_reload");
		if (shouldReload) {
			localStorage.removeItem("should_reload");
			window.location.reload();
		}
	}, []);

	// Key Stats Data
	const stats = [
		{
			title: "Total Orders",
			value: 28,
			icon: <ShoppingCartOutlined />,
			color: "blue",
			change: "↑ 12.5%",
			changeColor: "success",
		},
		{
			title: "Escrow Balance",
			value: "0.85 ETH",
			icon: <WalletOutlined />,
			color: "purple",
			change: "↑ 5.2%",
			changeColor: "success",
		},
		{
			title: "Active Escrows",
			value: 12,
			icon: <CheckCircleOutlined />,
			color: "green",
			change: "↑ 3.1%",
			changeColor: "success",
		},
		{
			title: "Blockchain Transactions",
			value: 156,
			icon: <LineChartOutlined />,
			color: "cyan",
			change: "↑ 8.7%",
			changeColor: "success",
		},
	];

	// Order Statistics
	const orderStatusData = {
		labels: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
		datasets: [
			{
				label: "Orders",
				data: [3, 5, 2, 15, 1],
				backgroundColor: [
					"#faad14",
					"#1890ff",
					"#52c41a",
					"#13c2c2",
					"#ff4d4f",
				],
				borderWidth: 0,
			},
		],
	};

	// Monthly Spending
	const monthlySpendingData = {
		labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
		datasets: [
			{
				label: "Spending",
				data: [12000, 19000, 15000, 25000, 22000, 30000],
				fill: true,
				backgroundColor: "rgba(24, 144, 255, 0.1)",
				borderColor: "#1890ff",
				tension: 0.4,
			},
		],
	};

	// Shopping Behavior
	const businessCategoriesData = {
		labels: ["Technology", "Retail", "Services", "Manufacturing", "Other"],
		datasets: [
			{
				data: [45, 25, 15, 10, 5],
				backgroundColor: [
					"#1890ff",
					"#52c41a",
					"#722ed1",
					"#faad14",
					"#ff4d4f",
				],
				borderWidth: 0,
			},
		],
	};

	// Recent Orders
	const recentOrders = [
		{ id: "ORD-12345", date: "2023-08-14", total: 7500, status: "Pending" },
		{ id: "ORD-12344", date: "2023-08-12", total: 3200, status: "Delivered" },
		{ id: "ORD-12343", date: "2023-08-10", total: 5800, status: "Shipped" },
	];

	// Recent Activity
	const recentActivity = [
		{
			time: "2h ago",
			action: "Logged in from Nairobi, Kenya",
			type: "login",
		},
		{
			time: "1d ago",
			action: "Updated profile picture",
			type: "profile",
		},
		{
			time: "2d ago",
			action: "Placed order #12345",
			type: "order",
		},
		{
			time: "3d ago",
			action: "Added item to cart",
			type: "cart",
		},
	];

	// Upcoming Appointments
	const upcomingAppointments = [
		{
			id: "APT-001",
			service: "Consultation",
			provider: "Tech Solutions Inc",
			date: "2023-08-25",
			time: "10:00 AM",
		},
		{
			id: "APT-002",
			service: "Website Review",
			provider: "Digital Agency KE",
			date: "2023-08-30",
			time: "2:30 PM",
		},
	];

	// Business Engagement
	const businessEngagement = [
		{
			id: 1,
			name: "Tech Store Kenya",
			role: "Owner",
			status: "Active",
			members: 4,
		},
		{
			id: 2,
			name: "Digital Solutions Ltd",
			role: "Team Member",
			status: "Active",
			members: 12,
		},
	];

	// Support Activity
	const supportActivity = [
		{
			id: "TKT-001",
			issue: "Payment issue",
			status: "Open",
			date: "2023-08-10",
		},
		{
			id: "TKT-002",
			issue: "Delivery delay",
			status: "Resolved",
			date: "2023-08-02",
		},
	];

	// Column definition for recent orders
	const orderColumns = [
		{
			title: "Order ID",
			dataIndex: "id",
			key: "id",
		},
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
		},
		{
			title: "Total",
			dataIndex: "total",
			key: "total",
			render: (total) => `Ksh ${total.toLocaleString()}`,
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status) => {
				let color = "green";
				if (status === "Pending") color = "gold";
				else if (status === "Shipped") color = "blue";

				return <Tag color={color}>{status}</Tag>;
			},
		},
		{
			title: "Action",
			key: "action",
			render: () => <Button size="small">View</Button>,
		},
	];

	// Account Information
	const accountInfo = {
		accountAge: 145, // days
		lastLogin: "2023-08-15 14:30:45",
		accountStatus: "Active",
		walletAddress: "0x7a2f...3be9",
		role: "Vendor",
	};

	// Communication Stats
	const communicationStats = {
		totalChats: 18,
		unreadMessages: 3,
		activeConversations: 2,
	};

	// Chart options
	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	};

	// Doughnut chart options
	const doughnutOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "bottom",
				labels: {
					boxWidth: 12,
					padding: 15,
				},
			},
		},
		cutout: "70%",
	};

	// Function to get appropriate icon for activity type
	const getActivityIcon = (type) => {
		switch (type) {
			case "login":
				return <UserOutlined style={{ color: "#1890ff" }} />;
			case "profile":
				return <UserOutlined style={{ color: "#52c41a" }} />;
			case "order":
				return <ShoppingCartOutlined style={{ color: "#722ed1" }} />;
			case "cart":
				return <ShoppingCartOutlined style={{ color: "#faad14" }} />;
			default:
				return <InfoCircleOutlined />;
		}
	};

	// Generate timeline items from activity data
	const timelineItems = recentActivity.map((item, index) => ({
		key: index,
		dot: getActivityIcon(item.type),
		children: (
			<>
				<Text strong>{item.action}</Text>
				<div>
					<Text type="secondary">{item.time}</Text>
				</div>
			</>
		),
	}));

	// Generate tabs items
	const tabItems = [
		{
			key: "orders",
			label: (
				<span>
					<ShoppingCartOutlined /> Recent Orders
				</span>
			),
			children: (
				<Table
					dataSource={recentOrders.map((item) => ({ ...item, key: item.id }))}
					columns={orderColumns}
					pagination={{ pageSize: 5 }}
					size="middle"
					className="dashboard-table"
				/>
			),
		},
		{
			key: "appointments",
			label: (
				<span>
					<CalendarOutlined /> Upcoming Appointments
				</span>
			),
			children: (
				<List
					itemLayout="horizontal"
					dataSource={upcomingAppointments}
					renderItem={(item) => (
						<List.Item
							key={item.id}
							actions={[
								<Button key="reschedule" size="small" type="primary">
									Reschedule
								</Button>,
							]}
						>
							<List.Item.Meta
								avatar={
									<Avatar
										icon={<CalendarOutlined />}
										style={{ backgroundColor: "#1890ff" }}
									/>
								}
								title={<Text strong>{item.service}</Text>}
								description={
									<Space direction="vertical" size={1}>
										<Text>{item.provider}</Text>
										<Text type="secondary">
											{item.date} at {item.time}
										</Text>
									</Space>
								}
							/>
						</List.Item>
					)}
					locale={{ emptyText: "No upcoming appointments" }}
				/>
			),
		},
		{
			key: "business",
			label: (
				<span>
					<TeamOutlined /> Business Engagement
				</span>
			),
			children: (
				<List
					itemLayout="horizontal"
					dataSource={businessEngagement}
					renderItem={(item) => (
						<List.Item
							key={item.id}
							actions={[
								<Button key="manage" size="small">
									Manage
								</Button>,
							]}
						>
							<List.Item.Meta
								avatar={
									<Avatar
										icon={<ShopOutlined />}
										style={{ backgroundColor: "#722ed1" }}
									/>
								}
								title={<Text strong>{item.name}</Text>}
								description={
									<Space size={12}>
										<Tag color="blue">{item.role}</Tag>
										<Tag color="green">{item.status}</Tag>
										<Text type="secondary">{item.members} team members</Text>
									</Space>
								}
							/>
						</List.Item>
					)}
					locale={{ emptyText: "No business connections" }}
				/>
			),
		},
		{
			key: "support",
			label: (
				<span>
					<CustomerServiceOutlined /> Support Activity
				</span>
			),
			children: (
				<List
					itemLayout="horizontal"
					dataSource={supportActivity}
					renderItem={(item) => (
						<List.Item
							key={item.id}
							actions={[
								<Button key="view" size="small">
									View
								</Button>,
							]}
						>
							<List.Item.Meta
								avatar={
									<Avatar
										icon={<CustomerServiceOutlined />}
										style={{
											backgroundColor:
												item.status === "Open" ? "#faad14" : "#52c41a",
										}}
									/>
								}
								title={<Text strong>{item.issue}</Text>}
								description={
									<Space size={12}>
										<Tag color={item.status === "Open" ? "gold" : "green"}>
											{item.status}
										</Tag>
										<Text type="secondary">{item.date}</Text>
									</Space>
								}
							/>
						</List.Item>
					)}
					locale={{ emptyText: "No support tickets" }}
				/>
			),
		},
		{
			key: "communication",
			label: (
				<span>
					<MessageOutlined /> Communication
				</span>
			),
			children: (
				<Row gutter={[24, 24]}>
					<Col xs={24} lg={8}>
						<Statistic
							title="Total Chat Sessions"
							value={communicationStats.totalChats}
							prefix={<MessageOutlined />}
						/>
					</Col>
					<Col xs={24} lg={8}>
						<Statistic
							title="Unread Messages"
							value={communicationStats.unreadMessages}
							prefix={<Badge count={communicationStats.unreadMessages} />}
						/>
					</Col>
					<Col xs={24} lg={8}>
						<Statistic
							title="Active Conversations"
							value={communicationStats.activeConversations}
							prefix={<Badge status="processing" />}
						/>
					</Col>
					<Col span={24} className="mt-4">
						<Empty
							description="No active conversations"
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						/>
					</Col>
				</Row>
			),
		},
	];

	if (loading) {
		return (
			<div className="min-h-full bg-gray-50 px-4 py-6">
				<Row gutter={[24, 24]}>
					{[1, 2, 3, 4].map((item) => (
						<Col xs={24} sm={12} lg={6} key={item}>
							<Card className="shadow-sm">
								<div className="animate-pulse h-20 bg-gray-200 rounded"></div>
							</Card>
						</Col>
					))}
					<Col span={24}>
						<Card className="shadow-sm">
							<div className="animate-pulse h-64 bg-gray-200 rounded"></div>
						</Card>
					</Col>
				</Row>
			</div>
		);
	}

	return (
		<div className="min-h-full bg-gray-50 p-6">
			{/* Header with Time Frame Selector */}
			<div className="mb-8 flex flex-wrap items-center justify-between gap-4">
				<div>
					{user && (
						<div className="flex items-center gap-4 mb-3">
							<Avatar
								src={user.photoURL || user.profileImage}
								icon={<UserOutlined />}
								className="bg-blue-100 shadow-sm"
								size={48}
								crossOrigin="anonymous"
								referrerPolicy="no-referrer"
							/>
							<div>
								<Title level={3} style={{ margin: 0, fontWeight: 600 }}>
									Welcome, {user.name || "User"}
								</Title>
								<Text type="secondary" className="text-base">
									Here's an overview of your account
								</Text>
							</div>
						</div>
					)}
				</div>
				<Segmented
					options={[
						{ label: "Week", value: "week" },
						{ label: "Month", value: "month" },
						{ label: "Year", value: "year" },
						{ label: "All Time", value: "all" },
					]}
					value={timeFrame}
					onChange={setTimeFrame}
					className="bg-white shadow-sm rounded-lg"
				/>
			</div>

			{/* Key Stats */}
			<Row gutter={[24, 24]} className="mb-8">
				{stats.map((stat, index) => (
					<Col xs={24} sm={12} lg={6} key={index}>
						<Card
							className="h-full transition-all duration-300 hover:shadow-lg"
							styles={{
								body: { padding: "24px" },
								head: { border: "none" },
							}}
							hoverable
						>
							<div className="flex items-center justify-between mb-4">
								<Text type="secondary" className="text-base font-medium">
									{stat.title}
								</Text>
								<Avatar
									size="large"
									icon={stat.icon}
									style={{
										backgroundColor: `var(--ant-${stat.color}-1)`,
										color: `var(--ant-${stat.color}-6)`,
									}}
								/>
							</div>
							<Title
								level={2}
								style={{ margin: 0, marginBottom: "12px", fontWeight: 600 }}
							>
								{stat.value}
							</Title>
							{stat.change && (
								<Text type={stat.changeColor} className="text-base font-medium">
									{stat.change}
								</Text>
							)}
						</Card>
					</Col>
				))}
			</Row>

			{/* Account Summary & Monthly Spending */}
			<Row gutter={[24, 24]} className="mb-8">
				{/* Account Summary */}
				<Col xs={24} lg={8}>
					<Card
						title={
							<div className="flex items-center gap-2">
								<UserOutlined className="text-lg" />
								<span className="text-lg font-medium">Account Summary</span>
							</div>
						}
						className="h-full shadow-sm"
						styles={{ head: { borderBottom: "1px solid #f0f0f0" } }}
					>
						<div className="space-y-6">
							{/* Account Age & Status */}
							<div className="flex items-center justify-between">
								<div>
									<Text type="secondary" className="text-sm">
										Account Age
									</Text>
									<div className="flex items-center gap-2 mt-1">
										<ClockCircleOutlined className="text-blue-500" />
										<Text strong className="text-base">
											{accountInfo.accountAge} days
										</Text>
									</div>
								</div>
								<Tag color="green" className="px-3 py-1 rounded-full">
									{accountInfo.accountStatus}
								</Tag>
							</div>

							{/* Profile Completion */}
							<div>
								<div className="flex justify-between mb-2">
									<Text className="text-sm">Profile Completion</Text>
									<Text strong className="text-base">
										85%
									</Text>
								</div>
								<Progress
									percent={85}
									strokeColor="#1890ff"
									showInfo={false}
									size={8}
									className="mb-0"
								/>
							</div>

							{/* Last Login */}
							<div>
								<Text type="secondary" className="text-sm">
									Last Login
								</Text>
								<div className="mt-1">
									<Text className="text-base">{accountInfo.lastLogin}</Text>
								</div>
							</div>

							{/* Wallet & Role */}
							<div className="flex justify-between items-center pt-4 border-t border-gray-100">
								<div>
									<Text type="secondary" className="text-sm">
										Wallet
									</Text>
									<div className="mt-1">
										<Text copyable className="text-base">
											{accountInfo.walletAddress}
										</Text>
									</div>
								</div>
								<Tag color="blue" className="px-3 py-1 rounded-full">
									{accountInfo.role}
								</Tag>
							</div>
						</div>
					</Card>
				</Col>

				{/* Monthly Spending */}
				<Col xs={24} lg={16}>
					<Card
						title={
							<div className="flex items-center gap-2">
								<LineChartOutlined className="text-lg" />
								<span className="text-lg font-medium">Spending Over Time</span>
							</div>
						}
						className="h-full shadow-sm"
						styles={{ head: { borderBottom: "1px solid #f0f0f0" } }}
					>
						<div style={{ height: "300px" }}>
							<Line data={monthlySpendingData} options={chartOptions} />
						</div>
					</Card>
				</Col>
			</Row>

			{/* Order & Business Analytics */}
			<Row gutter={[24, 24]} className="mb-8">
				{/* Order Status */}
				<Col xs={24} lg={12}>
					<Card
						title={
							<div className="flex items-center gap-2">
								<ShoppingCartOutlined className="text-lg" />
								<span className="text-lg font-medium">Order Status</span>
							</div>
						}
						className="shadow-sm"
						styles={{ head: { borderBottom: "1px solid #f0f0f0" } }}
					>
						<div style={{ height: "300px" }}>
							<Bar data={orderStatusData} options={chartOptions} />
						</div>
						<div className="flex flex-wrap justify-center gap-3 mt-6">
							{orderStatusData.labels.map((label, index) => (
								<Tag
									key={index}
									color={orderStatusData.datasets[0].backgroundColor[index]}
									className="px-4 py-1 rounded-full text-white"
								>
									{label}: {orderStatusData.datasets[0].data[index]}
								</Tag>
							))}
						</div>
					</Card>
				</Col>

				{/* Business Categories */}
				<Col xs={24} lg={12}>
					<Card
						title={
							<div className="flex items-center gap-2">
								<ShopOutlined className="text-lg" />
								<span className="text-lg font-medium">Business Categories</span>
							</div>
						}
						className="shadow-sm"
						styles={{ head: { borderBottom: "1px solid #f0f0f0" } }}
					>
						<div style={{ height: "300px" }}>
							<Doughnut
								data={businessCategoriesData}
								options={doughnutOptions}
							/>
						</div>
						<div className="flex flex-wrap justify-center gap-3 mt-6">
							{businessCategoriesData.labels.map((label, index) => (
								<Tag
									key={index}
									color={
										businessCategoriesData.datasets[0].backgroundColor[index]
									}
									className="px-4 py-1 rounded-full text-white"
								>
									{label}: {businessCategoriesData.datasets[0].data[index]}%
								</Tag>
							))}
						</div>
					</Card>
				</Col>
			</Row>

			{/* Tabbed Sections */}
			<Card className="mb-8 shadow-sm">
				<Tabs
					defaultActiveKey="orders"
					items={tabItems}
					className="dashboard-tabs"
				/>
			</Card>

			{/* Escrow Transaction Status */}
			<div className="mb-8">
				<Card title="Escrow Transaction Status" className="shadow-sm">
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12} md={6}>
							<Statistic
								title="Pending Release"
								value={8}
								valueStyle={{ color: "#faad14" }}
								prefix={<ClockCircleOutlined />}
							/>
						</Col>
						<Col xs={24} sm={12} md={6}>
							<Statistic
								title="In Dispute"
								value={2}
								valueStyle={{ color: "#f5222d" }}
								prefix={<WarningOutlined />}
							/>
						</Col>
						<Col xs={24} sm={12} md={6}>
							<Statistic
								title="Completed"
								value={45}
								valueStyle={{ color: "#52c41a" }}
								prefix={<CheckCircleOutlined />}
							/>
						</Col>
						<Col xs={24} sm={12} md={6}>
							<Statistic
								title="Cancelled"
								value={3}
								valueStyle={{ color: "#bfbfbf" }}
								prefix={<CloseCircleOutlined />}
							/>
						</Col>
					</Row>
				</Card>
			</div>

			{/* Blockchain Analytics */}
			<div className="mb-8">
				<Card title="Blockchain Analytics" className="shadow-sm">
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12} md={8}>
							<Statistic
								title="Average Gas Price"
								value="45 Gwei"
								valueStyle={{ color: "#1890ff" }}
								prefix={<FireOutlined />}
							/>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Statistic
								title="Network Status"
								value="Stable"
								valueStyle={{ color: "#52c41a" }}
								prefix={<SafetyOutlined />}
							/>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Statistic
								title="Last Block"
								value="18,245,678"
								valueStyle={{ color: "#722ed1" }}
								prefix={<BlockOutlined />}
							/>
						</Col>
					</Row>
				</Card>
			</div>

			{/* Recent Activity */}
			<Row gutter={[24, 24]}>
				<Col xs={24} lg={12}>
					<Card
						title={
							<div className="flex items-center gap-2">
								<BellOutlined className="text-lg" />
								<span className="text-lg font-medium">Recent Activity</span>
							</div>
						}
						className="shadow-sm"
						styles={{ head: { borderBottom: "1px solid #f0f0f0" } }}
					>
						<Timeline items={timelineItems} className="dashboard-timeline" />
					</Card>
				</Col>
				<Col xs={24} lg={12}>
					<Card
						title={
							<div className="flex items-center gap-2">
								<InfoCircleOutlined className="text-lg" />
								<span className="text-lg font-medium">Summary</span>
							</div>
						}
						className="shadow-sm"
						styles={{ head: { borderBottom: "1px solid #f0f0f0" } }}
					>
						<Row gutter={[16, 16]}>
							<Col span={12}>
								<Card
									styles={{ body: { padding: "20px" } }}
									className="transition-all duration-300 hover:shadow-md"
								>
									<Statistic
										title="Avg. Order Value"
										value={4446}
										prefix="Ksh"
										precision={0}
										className="text-lg"
									/>
								</Card>
							</Col>
							<Col span={12}>
								<Card
									styles={{ body: { padding: "20px" } }}
									className="transition-all duration-300 hover:shadow-md"
								>
									<Statistic
										title="Total Spending"
										value={124500}
										prefix="Ksh"
										precision={0}
										className="text-lg"
									/>
								</Card>
							</Col>
							<Col span={12}>
								<Card
									styles={{ body: { padding: "20px" } }}
									className="transition-all duration-300 hover:shadow-md"
								>
									<Statistic
										title="Completed Orders"
										value={22}
										suffix="/ 28"
										className="text-lg"
									/>
									<Progress
										percent={Math.round((22 / 28) * 100)}
										size="small"
										className="mt-2"
									/>
								</Card>
							</Col>
							<Col span={12}>
								<Card
									styles={{ body: { padding: "20px" } }}
									className="transition-all duration-300 hover:shadow-md"
								>
									<Statistic
										title="Business Memberships"
										value={2}
										className="text-lg"
									/>
								</Card>
							</Col>
						</Row>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default Dashboard;

// Add this to your global CSS or component styles
/* 
.dashboard-table .ant-table-cell {
  padding: 12px 16px;
}

.ant-card {
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}

.ant-card:hover {
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}
*/
