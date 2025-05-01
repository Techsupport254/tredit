"use client";

import { useEffect, useState } from "react";
import {
	Spin,
	Alert,
	Table,
	Tag,
	Typography,
	Input,
	Button,
	Modal,
	Select,
	message,
	Card,
	Statistic,
	Row,
	Col,
	Collapse,
	List,
	Image,
	Form,
	DatePicker,
	Tooltip,
} from "antd";
import {
	CheckCircleOutlined,
	SyncOutlined,
	ClockCircleOutlined,
	SearchOutlined,
	EditOutlined,
	ShoppingOutlined,
	CarOutlined,
	CheckSquareOutlined,
	CloseCircleOutlined,
	ExclamationCircleOutlined,
	DollarOutlined,
	ShoppingCartOutlined,
	DownOutlined,
	UpOutlined,
} from "@ant-design/icons";
import { Container } from "@/components/ui/Container";
import { format } from "date-fns";
import { OrdersByStatus } from "@/components/dashboard/OrdersByStatus";

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

const STATUS_TABS = [
	{ key: "ALL", label: "All Orders" },
	{ key: "PENDING", label: "Pending" },
	{ key: "PROCESSING", label: "Processing" },
	{ key: "SHIPPED", label: "Shipped" },
	{ key: "DELIVERED", label: "Delivered" },
	{ key: "COMPLETED", label: "Completed" },
	{ key: "CANCELLED", label: "Cancelled" },
	{ key: "DISPUTED", label: "Disputed" },
];

const STATUS_CONFIG = {
	PENDING: {
		icon: <ClockCircleOutlined />,
		color: "#fbbf24",
		bgColor: "#fef9c3",
		textColor: "#b45309",
		label: "Pending",
	},
	PROCESSING: {
		icon: <SyncOutlined spin />,
		color: "#3b82f6",
		bgColor: "#e6f0fd",
		textColor: "#2563eb",
		label: "Processing",
	},
	SHIPPED: {
		icon: <CarOutlined />,
		color: "#8b5cf6",
		bgColor: "#ede9fe",
		textColor: "#6d28d9",
		label: "Shipped",
	},
	DELIVERED: {
		icon: <ShoppingOutlined />,
		color: "#10b981",
		bgColor: "#d1fae5",
		textColor: "#059669",
		label: "Delivered",
	},
	COMPLETED: {
		icon: <CheckSquareOutlined />,
		color: "#22c55e",
		bgColor: "#e7fbe9",
		textColor: "#15803d",
		label: "Completed",
	},
	CANCELLED: {
		icon: <CloseCircleOutlined />,
		color: "#ef4444",
		bgColor: "#fee2e2",
		textColor: "#b91c1c",
		label: "Cancelled",
	},
	DISPUTED: {
		icon: <ExclamationCircleOutlined />,
		color: "#f97316",
		bgColor: "#ffedd5",
		textColor: "#c2410c",
		label: "Disputed",
	},
};

const statusTag = (statusObj: any) => {
	// If statusObj is an array, get the latest status
	const status = Array.isArray(statusObj)
		? statusObj[statusObj.length - 1]?.status
		: typeof statusObj === "object"
		? statusObj.status
		: statusObj;

	// Parse the status if it's a string
	const cleanStatus =
		typeof status === "string" ? status.replace(/^"|"$/g, "") : status;

	const statusConfig =
		STATUS_CONFIG[cleanStatus as keyof typeof STATUS_CONFIG] ||
		STATUS_CONFIG.PENDING;
	return (
		<Tag
			icon={statusConfig.icon}
			color={statusConfig.color}
			style={{
				borderRadius: 999,
				fontWeight: 600,
				padding: "0 16px",
				background: statusConfig.bgColor,
				color: statusConfig.textColor,
				border: "none",
			}}
		>
			{statusConfig.label}
		</Tag>
	);
};

const getStatusColor = (status: string) => {
	switch (status) {
		case "PENDING":
			return "bg-yellow-100 text-yellow-800";
		case "PROCESSING":
			return "bg-blue-100 text-blue-800";
		case "SHIPPED":
			return "bg-purple-100 text-purple-800";
		case "DELIVERED":
			return "bg-green-100 text-green-800";
		case "CANCELLED":
			return "bg-red-100 text-red-800";
		default:
			return "bg-gray-100 text-gray-800";
	}
};

// Helper to get status history as an array
const getStatusHistoryArray = (order: any) => {
	if (Array.isArray(order.statusHistory)) return order.statusHistory;
	if (order.statusHistory && typeof order.statusHistory.push === "object")
		return [order.statusHistory.push];
	return [];
};

const getLatestStatus = (order: any) => {
	if (!order) {
		return { status: "PENDING" };
	}

	// First try to get status from statusHistory
	if (
		order.statusHistory &&
		Array.isArray(order.statusHistory) &&
		order.statusHistory.length > 0
	) {
		const latest = order.statusHistory[order.statusHistory.length - 1];
		if (latest && latest.status) {
			return latest;
		}
	}

	// Fallback to currentStatus
	return {
		status: order.currentStatus || "PENDING",
		timestamp: order.createdAt,
		note: "Current status",
	};
};

export default function DashboardOrdersPage() {
	const [orders, setOrders] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("ALL");
	const [search, setSearch] = useState("");
	const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<any>(null);
	const [newStatus, setNewStatus] = useState<string>("");
	const [updatingStatus, setUpdatingStatus] = useState(false);
	const [form] = Form.useForm();

	useEffect(() => {
		const fetchOrders = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch("/api/dashboard/orders/all");
				if (!res.ok) throw new Error("Failed to fetch orders");
				const data = await res.json();
				setOrders(data.orders || []);
			} catch (err: any) {
				setError(err.message || "Failed to load orders");
			} finally {
				setLoading(false);
			}
		};
		fetchOrders();
	}, []);

	const handleStatusChange = async () => {
		if (!selectedOrder) return;

		try {
			const values = await form.validateFields();
			setUpdatingStatus(true);

			const statusUpdate = {
				status: newStatus.replace(/^"|"$/g, ""),
				note: values.note || `Status updated to ${newStatus}`,
			};

			const res = await fetch(
				`/api/dashboard/orders/${selectedOrder.id}/status`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(statusUpdate),
				}
			);

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Failed to update order status");
			}

			const updatedOrder = await res.json();

			setOrders((prev) =>
				prev.map((order) =>
					order.id === updatedOrder.id
						? {
								...updatedOrder,
								statusHistory: getStatusHistoryArray(updatedOrder),
						  }
						: order
				)
			);

			message.success("Order status updated successfully");
			setIsStatusModalVisible(false);
			form.resetFields();
		} catch (err: any) {
			console.error("Error updating status:", err);
			message.error(err.message || "Failed to update order status");
		} finally {
			setUpdatingStatus(false);
		}
	};

	// Calculate analytics
	const totalOrders = orders.length;
	const totalRevenue = orders.reduce(
		(sum, order) => sum + Number(order.totalAmount),
		0
	);
	const completedOrders = orders.filter((order) => {
		const latestStatus = getLatestStatus(order);
		return latestStatus.status === "COMPLETED";
	}).length;

	const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
	const processingOrders = orders.filter((order) => {
		const latestStatus = getLatestStatus(order);
		return latestStatus.status === "PROCESSING";
	}).length;

	const shippedOrders = orders.filter((order) => {
		const latestStatus = getLatestStatus(order);
		return latestStatus.status === "SHIPPED";
	}).length;

	const filteredOrders = orders.filter((order) => {
		const matchesSearch = search
			? order.id.toLowerCase().includes(search.toLowerCase())
			: true;
		const matchesStatus =
			activeTab === "ALL" || order.currentStatus?.toUpperCase() === activeTab;
		return matchesSearch && matchesStatus;
	});

	const columns = [
		{
			title: <span className="font-semibold text-gray-700">#</span>,
			key: "index",
			width: 60,
			render: (_: any, __: any, index: number) => (
				<span className="text-gray-500">{index + 1}</span>
			),
		},
		{
			title: <span className="font-semibold text-gray-700">Order ID</span>,
			dataIndex: "id",
			key: "id",
			render: (id: string) => (
				<span className="font-mono text-base font-semibold text-gray-700">
					{id.slice(0, 8)}...
				</span>
			),
		},
		{
			title: <span className="font-semibold text-gray-700">Date</span>,
			dataIndex: "createdAt",
			key: "createdAt",
			render: (date: string) => (
				<span className="text-gray-600">
					{format(new Date(date), "MMM d, yyyy 'at' h:mm a")}
				</span>
			),
		},
		{
			title: <span className="font-semibold text-gray-700">Status</span>,
			dataIndex: "currentStatus",
			key: "status",
			render: (_: any, record: any) => {
				const latestStatus = getLatestStatus(record);
				return (
					<div className="flex items-center gap-2">
						{statusTag(latestStatus)}
						<Tooltip title="Update Status" placement="top">
							<Button
								type="text"
								icon={<EditOutlined />}
								onClick={() => {
									setSelectedOrder(record);
									setNewStatus(record.currentStatus);
									setIsStatusModalVisible(true);
								}}
								className="text-gray-500 hover:text-blue-500"
							/>
						</Tooltip>
					</div>
				);
			},
		},
		{
			title: <span className="font-semibold text-gray-700">Total</span>,
			dataIndex: "totalAmount",
			key: "totalAmount",
			render: (amount: number) => (
				<span className="font-semibold text-gray-800">
					KES {amount.toLocaleString()}
				</span>
			),
		},
	];

	const expandedRowRender = (record: any) => {
		const statusTimeline = getStatusHistoryArray(record);
		return (
			<div className="flex flex-col md:flex-row gap-8 p-4 bg-gray-50">
				<div className="flex-1 min-w-0">
					<Title level={5} className="mb-4">
						Order Items
					</Title>
					<List
						itemLayout="horizontal"
						dataSource={record.items}
						renderItem={(item: any) => (
							<List.Item>
								<List.Item.Meta
									avatar={
										<Image
											src={item.product?.media?.[0]?.url || "/placeholder.png"}
											alt={
												item.product?.name || item.service?.name || "Product"
											}
											width={64}
											height={64}
											className="rounded-lg object-cover"
										/>
									}
									title={
										<div className="flex justify-between">
											<span className="font-medium">
												{item.product?.name ||
													item.service?.name ||
													"Unknown Item"}
											</span>
											<span className="text-gray-600">
												KES {item.price?.toLocaleString()}
											</span>
										</div>
									}
									description={
										<div className="flex justify-between text-sm text-gray-500">
											<span>Quantity: {item.quantity}</span>
											<span>
												Subtotal: KES{" "}
												{(item.price * item.quantity).toLocaleString()}
											</span>
										</div>
									}
								/>
							</List.Item>
						)}
					/>
				</div>
				<div className="w-full md:w-80 flex-shrink-0">
					{statusTimeline.length > 0 && (
						<div className="mb-6">
							<Title level={5}>Status History</Title>
							<List
								dataSource={statusTimeline}
								renderItem={(status: any) => (
									<List.Item>
										<div className="flex flex-col">
											<div className="flex items-center gap-2">
												{statusTag(status)}
												<span className="text-sm text-gray-500">
													{format(
														new Date(status.timestamp),
														"MMM d, yyyy 'at' h:mm a"
													)}
												</span>
											</div>
											{status.note && (
												<p className="text-sm text-gray-600 mt-1">
													{status.note}
												</p>
											)}
										</div>
									</List.Item>
								)}
							/>
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<Container maxWidth="full" className="py-6">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<Title level={2} className="text-2xl font-bold text-gray-900 mb-2">
							Orders
						</Title>
						<p className="text-gray-500">
							Manage and track your business orders
						</p>
					</div>
				</div>

				{/* Analytics Cards */}
				<Row gutter={[16, 16]}>
					<Col xs={24} sm={12} lg={6}>
						<Card className="hover:shadow-md transition-shadow">
							<Statistic
								title="Total Orders"
								value={totalOrders}
								prefix={<ShoppingCartOutlined />}
								valueStyle={{ color: "#3b82f6" }}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<Card className="hover:shadow-md transition-shadow">
							<Statistic
								title="Total Revenue"
								value={totalRevenue}
								prefix={<DollarOutlined />}
								precision={2}
								valueStyle={{ color: "#10b981" }}
								suffix="KES"
							/>
						</Card>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<Card className="hover:shadow-md transition-shadow">
							<Statistic
								title="Completed Orders"
								value={completedOrders}
								prefix={<CheckCircleOutlined />}
								valueStyle={{ color: "#22c55e" }}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<Card className="hover:shadow-md transition-shadow">
							<Statistic
								title="Active Orders"
								value={processingOrders + shippedOrders}
								prefix={<SyncOutlined />}
								valueStyle={{ color: "#8b5cf6" }}
							/>
						</Card>
					</Col>
				</Row>

				{/* Orders Board */}
				<div className="bg-white rounded-lg shadow-sm p-4">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex flex-row gap-2 overflow-x-auto">
							{STATUS_TABS.map((tab) => (
								<button
									key={tab.key}
									onClick={() => setActiveTab(tab.key)}
									className={`px-4 py-2 rounded-full font-medium transition-colors duration-150 text-sm focus:outline-none ${
										activeTab === tab.key
											? "bg-blue-600 text-white"
											: "bg-transparent text-gray-600 hover:bg-blue-50"
									}`}
								>
									{tab.label}
								</button>
							))}
						</div>
						<div className="flex flex-row gap-2 items-center mt-2 sm:mt-0">
							<Input
								placeholder="Search Order ID"
								prefix={<SearchOutlined />}
								allowClear
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="w-56"
								size="middle"
							/>
						</div>
					</div>
					{loading ? (
						<div className="flex justify-center items-center h-40">
							<Spin size="large" />
						</div>
					) : error ? (
						<Alert type="error" message={error} />
					) : filteredOrders.length === 0 ? (
						<div className="flex flex-col items-center py-12">
							<svg
								width="120"
								height="120"
								fill="none"
								viewBox="0 0 64 64"
								className="mb-6 opacity-80"
								style={{ maxWidth: "100%", height: "auto" }}
							>
								<rect
									x="8"
									y="20"
									width="48"
									height="32"
									rx="6"
									fill="#e0e7ef"
								/>
								<rect
									x="16"
									y="28"
									width="32"
									height="16"
									rx="3"
									fill="#b6c6e3"
								/>
								<path
									d="M20 44V36a4 4 0 014-4h16a4 4 0 014 4v8"
									stroke="#3b82f6"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<circle cx="24" cy="48" r="2" fill="#3b82f6" />
								<circle cx="40" cy="48" r="2" fill="#3b82f6" />
							</svg>
							<Title level={4} className="mb-2 text-gray-700 font-semibold">
								No orders found.
							</Title>
							<p className="text-gray-500 text-base text-center max-w-md">
								No orders match your filters.
							</p>
						</div>
					) : (
						<Table
							dataSource={filteredOrders}
							columns={columns}
							rowKey="id"
							pagination={{ pageSize: 10 }}
							className="modern-orders-table"
							expandable={{
								expandedRowRender,
								expandIcon: ({ expanded, onExpand, record }) =>
									expanded ? (
										<UpOutlined onClick={(e) => onExpand(record, e)} />
									) : (
										<DownOutlined onClick={(e) => onExpand(record, e)} />
									),
							}}
						/>
					)}
				</div>
			</div>

			{/* Status Update Modal */}
			<Modal
				title="Update Order Status"
				open={isStatusModalVisible}
				onOk={handleStatusChange}
				onCancel={() => {
					setIsStatusModalVisible(false);
					form.resetFields();
				}}
				confirmLoading={updatingStatus}
				okText="Update"
				cancelText="Cancel"
			>
				<Form form={form} layout="vertical">
					<Form.Item label="Current Status">
						{selectedOrder && statusTag(getLatestStatus(selectedOrder))}
					</Form.Item>
					<Form.Item
						name="status"
						label="New Status"
						rules={[{ required: true, message: "Please select a status" }]}
					>
						<Select
							value={newStatus}
							onChange={setNewStatus}
							className="w-full"
							placeholder="Select new status"
						>
							{STATUS_TABS.filter(
								(tab) =>
									tab.key !== "ALL" &&
									tab.key !== "CANCELLED" &&
									tab.key !== "DISPUTED"
							).map((tab) => (
								<Option key={tab.key} value={tab.key}>
									{tab.label}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						name="note"
						label="Status Note"
						rules={[
							{
								required: true,
								message: "Please add a note for the status change",
							},
						]}
					>
						<TextArea
							placeholder="Add a note explaining the status change"
							rows={4}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</Container>
	);
}
