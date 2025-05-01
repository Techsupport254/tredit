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
import { useParams } from "next/navigation";

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

const DISPUTE_REASONS = [
	{ value: "ITEM_NOT_RECEIVED", label: "Item Not Received" },
	{ value: "ITEM_DAMAGED", label: "Item Damaged" },
	{ value: "ITEM_NOT_AS_DESCRIBED", label: "Item Not As Described" },
	{ value: "WRONG_ITEM", label: "Wrong Item Received" },
	{ value: "QUALITY_ISSUE", label: "Quality Issue" },
	{ value: "DELIVERY_DELAY", label: "Delivery Exceeded Expected Date" },
	{ value: "SERVICE_NOT_PROVIDED", label: "Service Not Provided" },
	{ value: "OTHER", label: "Other" },
];

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

	const statusConfig = {
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

	const config =
		statusConfig[cleanStatus as keyof typeof statusConfig] ||
		statusConfig.PENDING;
	return (
		<Tag
			icon={config.icon}
			color={config.color}
			style={{
				borderRadius: 999,
				fontWeight: 600,
				padding: "0 16px",
				background: config.bgColor,
				color: config.textColor,
				border: "none",
			}}
		>
			{config.label}
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
	// Use currentStatus for the main status
	return {
		status: order.currentStatus || "PENDING",
		note: "",
		timestamp: "",
	};
};

async function fetchProduct(productId: string) {
	const res = await fetch(`/api/products/${productId}`);
	if (!res.ok) return null;
	return await res.json();
}

async function fetchService(serviceId: string) {
	const res = await fetch(`/api/services/${serviceId}`);
	if (!res.ok) return null;
	return await res.json();
}

const isOrderEligibleForDispute = (order: any) => {
	const latestStatus = getLatestStatus(order);
	return latestStatus.status !== "DISPUTED";
};

export default function OrdersPage() {
	const { slug } = useParams();
	const safeSlug = Array.isArray(slug) ? slug[0] : slug;
	const [orders, setOrders] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("ALL");
	const [search, setSearch] = useState("");
	const [isDisputeModalVisible, setIsDisputeModalVisible] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<any>(null);
	const [disputeNote, setDisputeNote] = useState("");
	const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
	const [form] = Form.useForm();

	useEffect(() => {
		const fetchOrders = async () => {
			setLoading(true);
			setError(null);
			try {
				console.log("Fetching orders for slug:", safeSlug);
				const url = `/api/orders?slug=${encodeURIComponent(safeSlug)}`;
				console.log("Request URL:", url);
				const res = await fetch(url, {
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
				});
				console.log("Response status:", res.status);
				if (!res.ok) {
					const errorText = await res.text();
					console.error("Fetch error response:", errorText);
					throw new Error("Failed to fetch orders");
				}
				const data = await res.json();
				console.log("Fetched orders data:", data);
				let ordersWithDetails = data.orders || [];
				// For each order, fetch product/service details for each item if needed
				for (const order of ordersWithDetails) {
					for (const item of order.items) {
						if (!item.product && item.productId) {
							item.product = await fetchProduct(item.productId);
						}
						if (!item.service && item.serviceId) {
							item.service = await fetchService(item.serviceId);
						}
					}
				}
				setOrders(ordersWithDetails);
			} catch (err: any) {
				console.error("Error loading orders:", err);
				setError(err.message || "Failed to load orders");
			} finally {
				setLoading(false);
			}
		};
		if (safeSlug) fetchOrders();
	}, [safeSlug]);

	const handleDispute = async () => {
		try {
			setIsSubmittingDispute(true);
			const values = await form.validateFields();
			const response = await fetch(`/api/orders/${selectedOrder.id}/dispute`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					reason: values.reason,
					description: values.description,
				}),
			});
			if (!response.ok) throw new Error("Failed to dispute order");
			setOrders((prev) =>
				prev.map((order) =>
					order.id === selectedOrder.id
						? {
								...order,
								status: [
									...(order.status || []),
									{
										status: "DISPUTED",
										note: values.description,
										updatedAt: new Date().toISOString(),
									},
								],
						  }
						: order
				)
			);
			setIsDisputeModalVisible(false);
			setDisputeNote("");
			form.resetFields();
			message.success("Dispute submitted successfully");
		} catch (err: any) {
			setError(err.message || "Failed to dispute order");
			message.error(err.message || "Failed to dispute order");
		} finally {
			setIsSubmittingDispute(false);
		}
	};

	const filteredOrders = orders.filter((order) => {
		const latestStatus = getLatestStatus(order);
		const matchesStatus =
			activeTab === "ALL" ? true : latestStatus.status === activeTab;
		const matchesSearch =
			search.trim() === "" ||
			order.id.toLowerCase().includes(search.toLowerCase());
		return matchesStatus && matchesSearch;
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
				const isEligible = isOrderEligibleForDispute(record);
				return (
					<div className="flex items-center gap-2">
						{statusTag(latestStatus)}
						<Tooltip
							title={
								isEligible
									? "Dispute Order"
									: "This order has already been disputed"
							}
							placement="top"
						>
							<Button
								type="text"
								icon={<EditOutlined />}
								onClick={() => {
									if (isEligible) {
										setSelectedOrder(record);
										setIsDisputeModalVisible(true);
									}
								}}
								className={`text-gray-500 hover:text-orange-500 ${
									!isEligible ? "opacity-50 cursor-not-allowed" : ""
								}`}
								disabled={!isEligible}
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
					{(record.shippingMethod ||
						record.trackingNumber ||
						record.estimatedDeliveryDate) && (
						<div>
							<Title level={5}>Shipping Information</Title>
							<List>
								<List.Item>
									<div className="flex flex-col">
										{record.shippingMethod && (
											<div className="flex items-center gap-2">
												<span className="font-medium">Method:</span>
												<span className="text-gray-600">
													{record.shippingMethod}
												</span>
											</div>
										)}
										{record.trackingNumber && (
											<div className="flex items-center gap-2 mt-1">
												<span className="font-medium">Tracking Number:</span>
												<span className="text-gray-600">
													{record.trackingNumber}
												</span>
											</div>
										)}
										{record.estimatedDeliveryDate && (
											<div className="flex items-center gap-2 mt-1">
												<span className="font-medium">Estimated Delivery:</span>
												<span className="text-gray-600">
													{format(
														new Date(record.estimatedDeliveryDate),
														"MMM d, yyyy 'at' h:mm a"
													)}
												</span>
											</div>
										)}
									</div>
								</List.Item>
							</List>
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<Container className="py-6">
			<div className="space-y-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<Title level={2} className="text-2xl font-bold text-gray-900 mb-2">
						Your Orders
					</Title>
				</div>
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
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
				</div>
				<div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
				<Modal
					title={
						<div className="flex items-center gap-2">
							<ExclamationCircleOutlined className="text-orange-500" />
							<span>Dispute Order</span>
						</div>
					}
					open={isDisputeModalVisible}
					onOk={handleDispute}
					onCancel={() => {
						setIsDisputeModalVisible(false);
						setDisputeNote("");
						form.resetFields();
					}}
					okText={isSubmittingDispute ? "Submitting..." : "Submit Dispute"}
					cancelText="Cancel"
					okButtonProps={{
						className: "bg-orange-500 hover:bg-orange-600 border-none",
						loading: isSubmittingDispute,
						disabled: isSubmittingDispute,
					}}
					cancelButtonProps={{
						disabled: isSubmittingDispute,
					}}
					width={600}
					closable={!isSubmittingDispute}
					maskClosable={!isSubmittingDispute}
				>
					<Form form={form} layout="vertical" className="mt-4">
						<Form.Item
							name="reason"
							label={
								<div className="flex items-center gap-2">
									<span className="font-medium">Reason for Dispute</span>
									<span className="text-gray-400 text-sm">(Required)</span>
								</div>
							}
							rules={[
								{
									required: true,
									message: "Please select a reason for disputing this order",
								},
							]}
						>
							<Select
								placeholder="Select a reason"
								className="w-full"
								options={DISPUTE_REASONS}
								onChange={(value) => form.setFieldsValue({ reason: value })}
								disabled={isSubmittingDispute}
							/>
						</Form.Item>

						<Form.Item
							name="description"
							label={
								<div className="flex items-center gap-2">
									<span className="font-medium">Description</span>
									<span className="text-gray-400 text-sm">(Required)</span>
								</div>
							}
							rules={[
								{
									required: true,
									message: "Please provide details about your dispute",
								},
								{
									min: 20,
									message: "Description must be at least 20 characters",
								},
							]}
						>
							<TextArea
								placeholder="Please provide detailed information about your dispute. Include any relevant details that will help us understand and resolve your issue."
								rows={6}
								value={disputeNote}
								onChange={(e) => setDisputeNote(e.target.value)}
								className="resize-none"
								disabled={isSubmittingDispute}
							/>
						</Form.Item>

						<div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mt-4">
							<div className="flex items-start gap-3">
								<ExclamationCircleOutlined className="text-orange-500 mt-1" />
								<div>
									<h4 className="text-orange-800 font-medium mb-1">
										Important Information
									</h4>
									<p className="text-orange-700 text-sm">
										Please provide as much detail as possible about your
										dispute. This will help us investigate and resolve your
										issue more effectively. You may be asked to provide
										additional evidence or documentation to support your claim.
									</p>
								</div>
							</div>
						</div>
					</Form>
				</Modal>
			</div>
		</Container>
	);
}
