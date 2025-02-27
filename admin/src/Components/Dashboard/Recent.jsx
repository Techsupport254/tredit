import React from "react";
import {
	Card,
	Col,
	Row,
	Statistic,
	Table,
	Avatar,
	List,
	Skeleton,
	Tag,
	Badge,
	Typography,
} from "antd";
import {
	ShoppingCartOutlined,
	NotificationOutlined,
	ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// ✅ Transaction Data with Status Colors
const columns = [
	{ title: "Product", dataIndex: "product", key: "product" },
	{ title: "Category", dataIndex: "category", key: "category" },
	{ title: "Sales", dataIndex: "sales", key: "sales" },
	{
		title: "Status",
		dataIndex: "status",
		key: "status",
		render: (status) => {
			if (status === "In Stock") return <Tag color="green">{status}</Tag>;
			if (status === "Out of Stock") return <Tag color="red">{status}</Tag>;
			return <Tag color="orange">{status}</Tag>;
		},
	},
];

const tableData = [
	{
		key: "1",
		product: "Product A",
		category: "Electronics",
		sales: "$1,200",
		status: "In Stock",
	},
	{
		key: "2",
		product: "Product B",
		category: "Fashion",
		sales: "$900",
		status: "Out of Stock",
	},
	{
		key: "3",
		product: "Product C",
		category: "Home & Garden",
		sales: "$1,500",
		status: "In Stock",
	},
];

// ✅ Notifications with Icons & Styling
const notifications = [
	{
		title: "New Order Placed",
		description: "Order #12345 has been placed successfully.",
		icon: <ShoppingCartOutlined style={{ color: "#1890ff" }} />,
	},
	{
		title: "Stock Alert",
		description: "Product B is running low on stock.",
		icon: <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />,
	},
	{
		title: "New Message",
		description: "You received a message from a customer.",
		icon: <NotificationOutlined style={{ color: "#52c41a" }} />,
	},
];

const Recent = () => {
	return (
		<div className="w-full py-4 px-2 sm:px-4 lg:px-8">
			<Row gutter={[24, 24]} justify="center">
				{/* Recent Transactions Section */}
				<Col xs={24} md={16}>
					<Card
						title={
							<Title level={4} className="m-0">
								Recent Transactions
							</Title>
						}
						className="rounded-xl shadow-lg border border-gray-200"
						bodyStyle={{ padding: "20px" }}
					>
						<Table
							dataSource={tableData}
							columns={columns}
							pagination={{ pageSize: 5 }}
							scroll={{ x: true }}
							className="rounded-lg"
						/>
					</Card>
				</Col>

				{/* Notifications Section */}
				<Col xs={24} md={8}>
					<Card
						title={
							<Title level={4} className="m-0">
								Notifications
							</Title>
						}
						className="rounded-xl shadow-lg border border-gray-200"
						bodyStyle={{ padding: "20px" }}
					>
						<List
							dataSource={notifications}
							renderItem={(item) => (
								<List.Item className="border-b border-gray-100 last:border-none pb-3">
									<List.Item.Meta
										avatar={<Avatar size={40} icon={item.icon} />}
										title={
											<Text strong className="text-gray-700">
												{item.title}
											</Text>
										}
										description={
											<Text type="secondary" className="text-gray-500">
												{item.description}
											</Text>
										}
									/>
								</List.Item>
							)}
						/>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default Recent;
