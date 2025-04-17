import React, { useState, useEffect } from "react";
import {
	Card,
	Row,
	Col,
	Statistic,
	Progress,
	Avatar,
	List,
	Timeline,
	Tag,
	Empty,
	Table,
	Divider,
	Space,
	Typography,
} from "antd";
import {
	UserOutlined,
	ClockCircleOutlined,
	ShoppingCartOutlined,
	CheckCircleOutlined,
	SyncOutlined,
	CloseCircleOutlined,
	WalletOutlined,
	LinkOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Create a formatter for currency values
const currencyFormatter = new Intl.NumberFormat("en-KE", {
	style: "currency",
	currency: "KES",
	minimumFractionDigits: 0,
	maximumFractionDigits: 0,
});

// Sample data for user analytics
const accountData = {
	username: "VictorQuaint",
	email: "kiruivictor097@gmail.com",
	registeredOn: "2023-03-15",
	lastActive: "2023-08-15 09:45:32",
	profileCompletion: 85,
	accountStatus: "Active",
};

const walletData = {
	address: "0x7a2f...3be9",
	balance: "0.24 ETH",
	transactions: 28,
	lastTransaction: "2023-08-12",
};

const orderStats = {
	total: 28,
	completed: 22,
	pending: 3,
	cancelled: 3,
	totalSpent: 124500,
	avgOrderValue: 4446,
};

const activityTimeline = [
	{ time: "2023-08-15 09:45", action: "Logged in", status: "success" },
	{
		time: "2023-08-14 16:30",
		action: "Updated profile picture",
		status: "success",
	},
	{
		time: "2023-08-12 10:15",
		action: "Placed order #12345",
		status: "success",
	},
	{ time: "2023-08-10 14:22", action: "Added item to cart", status: "info" },
	{
		time: "2023-08-08 11:30",
		action: "Viewed product details",
		status: "info",
	},
];

const categoryPreferences = [
	{ name: "Electronics", percentage: 45, color: "#1677ff" },
	{ name: "Clothing", percentage: 30, color: "#52c41a" },
	{ name: "Home & Kitchen", percentage: 15, color: "#faad14" },
	{ name: "Books", percentage: 10, color: "#ff4d4f" },
];

const recentOrders = [
	{ id: "ORD-12345", date: "2023-08-14", amount: 7500, status: "Pending" },
	{ id: "ORD-12344", date: "2023-08-12", amount: 3200, status: "Delivered" },
	{ id: "ORD-12343", date: "2023-08-10", amount: 5800, status: "Shipped" },
	{ id: "ORD-12342", date: "2023-08-08", amount: 4100, status: "Delivered" },
	{ id: "ORD-12341", date: "2023-08-05", amount: 9200, status: "Delivered" },
];

const UserAnalytics = () => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Simulate data loading
		const timer = setTimeout(() => {
			setLoading(false);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	const accountAge = () => {
		const registered = new Date(accountData.registeredOn);
		const today = new Date();
		const diffTime = Math.abs(today - registered);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

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
			title: "Amount",
			dataIndex: "amount",
			key: "amount",
			render: (amount) => currencyFormatter.format(amount),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status) => {
				let color = "green";
				let icon = <CheckCircleOutlined />;

				if (status === "Pending") {
					color = "gold";
					icon = <SyncOutlined spin />;
				} else if (status === "Shipped") {
					color = "blue";
					icon = <SyncOutlined />;
				} else if (status === "Cancelled") {
					color = "red";
					icon = <CloseCircleOutlined />;
				}

				return (
					<Tag color={color} icon={icon}>
						{status}
					</Tag>
				);
			},
		},
	];

	if (loading) {
		return (
			<Row gutter={[24, 24]}>
				<Col xs={24} lg={12}>
					<Card>
						<Empty description="Loading account data..." />
					</Card>
				</Col>
				<Col xs={24} lg={12}>
					<Card>
						<Empty description="Loading activity data..." />
					</Card>
				</Col>
			</Row>
		);
	}

	return (
		<div>
			<Row gutter={[24, 24]}>
				{/* Account Summary Card */}
				<Col xs={24} lg={12}>
					<Card
						title={<Title level={5}>Account Summary</Title>}
						className="shadow-sm"
					>
						<Row gutter={[16, 16]} align="middle">
							<Col xs={24} md={8} className="text-center">
								<Avatar
									size={80}
									icon={<UserOutlined />}
									className="mb-3"
									style={{ backgroundColor: "#1677ff" }}
								/>
								<div>
									<Text strong className="block">
										{accountData.username}
									</Text>
									<Text type="secondary" className="block">
										{accountData.email}
									</Text>
								</div>
								<Divider />
								<Progress
									type="circle"
									percent={accountData.profileCompletion}
									size={80}
									format={(percent) => `${percent}%`}
								/>
								<Text type="secondary" className="block mt-2">
									Profile Completion
								</Text>
							</Col>
							<Col xs={24} md={16}>
								<List
									itemLayout="horizontal"
									split={false}
									dataSource={[
										{
											title: "Account Age",
											value: `${accountAge()} days`,
										},
										{
											title: "Registered On",
											value: accountData.registeredOn,
										},
										{
											title: "Last Active",
											value: accountData.lastActive,
										},
										{
											title: "Account Status",
											value: (
												<Tag color="green">{accountData.accountStatus}</Tag>
											),
										},
									]}
									renderItem={(item) => (
										<List.Item>
											<Text className="mr-2">{item.title}:</Text>
											<Text strong>{item.value}</Text>
										</List.Item>
									)}
								/>
							</Col>
						</Row>
					</Card>
				</Col>

				{/* Wallet Information */}
				<Col xs={24} lg={12}>
					<Card
						title={<Title level={5}>Wallet Information</Title>}
						className="shadow-sm"
					>
						<Space direction="vertical" size="middle" className="w-full">
							<div className="flex justify-between items-center">
								<Text>Wallet Address:</Text>
								<Space>
									<Text code copyable>
										{walletData.address}
									</Text>
									<LinkOutlined className="text-blue-500" />
								</Space>
							</div>
							<div className="flex justify-between items-center">
								<Text>Balance:</Text>
								<Text strong>{walletData.balance}</Text>
							</div>
							<div className="flex justify-between items-center">
								<Text>Total Transactions:</Text>
								<Text strong>{walletData.transactions}</Text>
							</div>
							<div className="flex justify-between items-center">
								<Text>Last Transaction:</Text>
								<Text>{walletData.lastTransaction}</Text>
							</div>

							<Divider />

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<Card size="small" className="text-center">
									<WalletOutlined className="text-2xl text-blue-500 mb-2" />
									<Text className="block">View Transactions</Text>
								</Card>
								<Card size="small" className="text-center">
									<ShoppingCartOutlined className="text-2xl text-green-500 mb-2" />
									<Text className="block">Make Payment</Text>
								</Card>
								<Card size="small" className="text-center">
									<UserOutlined className="text-2xl text-purple-500 mb-2" />
									<Text className="block">Manage Wallet</Text>
								</Card>
							</div>
						</Space>
					</Card>
				</Col>

				{/* Activity Timeline */}
				<Col xs={24} lg={12}>
					<Card
						title={<Title level={5}>Activity Timeline</Title>}
						className="shadow-sm"
					>
						<Timeline
							items={activityTimeline.map((item) => ({
								children: (
									<div>
										<Text strong>{item.action}</Text>
										<div>
											<ClockCircleOutlined className="mr-1 text-gray-400" />
											<Text type="secondary">{item.time}</Text>
										</div>
									</div>
								),
								color: item.status === "success" ? "green" : "blue",
							}))}
						/>
					</Card>
				</Col>

				{/* Order Statistics */}
				<Col xs={24} lg={12}>
					<Card
						title={<Title level={5}>Order Statistics</Title>}
						className="shadow-sm"
					>
						<Row gutter={[16, 16]}>
							<Col xs={24} md={8}>
								<Statistic
									title="Total Orders"
									value={orderStats.total}
									prefix={<ShoppingCartOutlined />}
								/>
							</Col>
							<Col xs={24} md={8}>
								<Statistic
									title="Total Spent"
									value={currencyFormatter.format(orderStats.totalSpent)}
								/>
							</Col>
							<Col xs={24} md={8}>
								<Statistic
									title="Avg. Order Value"
									value={currencyFormatter.format(orderStats.avgOrderValue)}
								/>
							</Col>
						</Row>

						<Divider />

						<div>
							<Title level={5}>Order Status</Title>
							<Row gutter={[16, 16]} className="mt-4">
								<Col span={8}>
									<Progress
										type="circle"
										percent={Math.round(
											(orderStats.completed / orderStats.total) * 100
										)}
										format={() => orderStats.completed}
										strokeColor="#52c41a"
									/>
									<Text className="block text-center mt-2">Completed</Text>
								</Col>
								<Col span={8}>
									<Progress
										type="circle"
										percent={Math.round(
											(orderStats.pending / orderStats.total) * 100
										)}
										format={() => orderStats.pending}
										strokeColor="#faad14"
									/>
									<Text className="block text-center mt-2">Pending</Text>
								</Col>
								<Col span={8}>
									<Progress
										type="circle"
										percent={Math.round(
											(orderStats.cancelled / orderStats.total) * 100
										)}
										format={() => orderStats.cancelled}
										strokeColor="#ff4d4f"
									/>
									<Text className="block text-center mt-2">Cancelled</Text>
								</Col>
							</Row>
						</div>
					</Card>
				</Col>

				{/* Shopping Preferences */}
				<Col xs={24} lg={12}>
					<Card
						title={<Title level={5}>Shopping Preferences</Title>}
						className="shadow-sm"
					>
						{categoryPreferences.map((category, index) => (
							<div key={index} className="mb-4">
								<div className="flex justify-between mb-1">
									<Text>{category.name}</Text>
									<Text>{category.percentage}%</Text>
								</div>
								<Progress
									percent={category.percentage}
									strokeColor={category.color}
									showInfo={false}
									size="small"
								/>
							</div>
						))}
					</Card>
				</Col>

				{/* Recent Orders */}
				<Col xs={24} lg={12}>
					<Card
						title={<Title level={5}>Recent Orders</Title>}
						className="shadow-sm"
					>
						<Table
							dataSource={recentOrders}
							columns={orderColumns}
							pagination={false}
							size="small"
						/>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default UserAnalytics;
