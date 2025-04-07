import React, { useState, useEffect } from "react";
import {
	Table,
	Button,
	Space,
	Tag,
	Typography,
	Row,
	Col,
	Card,
	Select,
	DatePicker,
	Input,
	Badge,
	Progress,
	Avatar,
	Tooltip,
	Statistic,
	Empty,
	Skeleton,
	Dropdown,
} from "antd";
import {
	EyeOutlined,
	ClockCircleOutlined,
	DollarOutlined,
	UserOutlined,
	ShoppingOutlined,
	FileTextOutlined,
	CustomerServiceOutlined,
	DownOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useBusiness } from "../../Context/BusinessContext";
import storage from "../../utils/storage";
import { BUSINESS_CONSTANTS } from "../../constants/businessConstants";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const mockOrders = [
	// Product Order Example
	{
		id: "1",
		type: "product",
		orderNumber: "PO-2024-001",
		productName: "Premium Laptop",
		status: "processing",
		customerName: "John Smith",
		orderDate: "2024-03-25",
		totalAmount: 1299.99,
		paidAmount: 1299.99,
		quantity: 1,
		shippingStatus: "preparing",
		estimatedDelivery: "2024-03-28",
	},
	// Service Contract Example
	{
		id: "2",
		type: "service",
		orderNumber: "SC-2024-001",
		serviceName: "Web Development Service",
		status: "in_progress",
		customerName: "James Wilson",
		orderDate: "2024-03-25",
		totalAmount: 1299.97,
		paidAmount: 649.99,
		escrowAmount: 649.99,
		startDate: "2024-03-25",
		estimatedEndDate: "2024-04-08",
		milestones: [
			{
				name: "Planning",
				status: "completed",
				price: 259.99,
				released: true,
			},
			{
				name: "Design",
				status: "in_progress",
				price: 389.99,
				released: false,
			},
			{
				name: "Development",
				status: "pending",
				price: 389.99,
				released: false,
			},
			{
				name: "Testing",
				status: "pending",
				price: 259.99,
				released: false,
			},
		],
	},
];

const BusinessOrders = () => {
	const navigate = useNavigate();
	const {
		businesses,
		isLoading: loadingBusinesses,
		fetchAllBusinesses,
	} = useBusiness();
	const [selectedBusinessId, setSelectedBusinessId] = useState(
		storage.getItem("selectedBusinessId") || null
	);
	const [selectedBusiness, setSelectedBusiness] = useState(null);
	const [orders, setOrders] = useState(mockOrders);
	const [loading, setLoading] = useState(false);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Fetch businesses on component mount
	useEffect(() => {
		fetchAllBusinesses();
	}, [fetchAllBusinesses]);

	// Update useEffect for initial business selection
	useEffect(() => {
		if (businesses?.length > 0) {
			const storedBusinessId = storage.getItem("selectedBusinessId");

			if (!storedBusinessId) {
				const firstBusiness = businesses[0];
				setSelectedBusinessId(firstBusiness.id);
				setSelectedBusiness(firstBusiness);
				storage.setItem("selectedBusinessId", firstBusiness.id);
				storage.setItem("selectedBusiness", JSON.stringify(firstBusiness));
			} else {
				const storedBusiness = businesses.find(
					(b) => b.id === storedBusinessId
				);
				if (storedBusiness) {
					setSelectedBusinessId(storedBusinessId);
					setSelectedBusiness(storedBusiness);
					storage.setItem("selectedBusiness", JSON.stringify(storedBusiness));
				} else {
					const firstBusiness = businesses[0];
					setSelectedBusinessId(firstBusiness.id);
					setSelectedBusiness(firstBusiness);
					storage.setItem("selectedBusinessId", firstBusiness.id);
					storage.setItem("selectedBusiness", JSON.stringify(firstBusiness));
				}
			}
		}
	}, [businesses]);

	const handleBusinessChange = (businessId) => {
		const newSelectedBusiness = businesses.find((b) => b.id === businessId);
		if (newSelectedBusiness) {
			setSelectedBusinessId(businessId);
			setSelectedBusiness(newSelectedBusiness);
			storage.setItem("selectedBusinessId", businessId);
			storage.setItem("selectedBusiness", JSON.stringify(newSelectedBusiness));
		}
	};

	const renderBusinessHeader = () => {
		if (!selectedBusiness) return null;

		const businessTypeIcon =
			selectedBusiness.type === BUSINESS_CONSTANTS.TYPES.SERVICE ? (
				<CustomerServiceOutlined style={{ fontSize: 16 }} />
			) : (
				<ShoppingOutlined style={{ fontSize: 16 }} />
			);

		return (
			<Card className="mb-4">
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
					<Space size="middle" className="w-full md:w-auto">
						<Avatar
							size={48}
							src={selectedBusiness.logo}
							icon={businessTypeIcon}
							style={{
								background: selectedBusiness.logo ? "transparent" : "#f0f5ff",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						/>
						<div className="flex-1">
							<Space className="mb-2" align="center" size="small">
								<Title level={4} style={{ margin: 0 }}>
									{selectedBusiness.name}
								</Title>
								<Dropdown
									menu={{
										items: businesses.map((business) => ({
											key: business.id,
											icon:
												business.type === BUSINESS_CONSTANTS.TYPES.SERVICE ? (
													<CustomerServiceOutlined style={{ fontSize: 16 }} />
												) : (
													<ShoppingOutlined style={{ fontSize: 16 }} />
												),
											label: business.name,
											onClick: () => handleBusinessChange(business.id),
										})),
									}}
								>
									<Button
										type="text"
										size="small"
										icon={<DownOutlined />}
										className="ml-1"
									/>
								</Dropdown>
							</Space>
							<Space wrap size="small">
								<Tag color="blue" icon={businessTypeIcon}>
									{selectedBusiness.type}
								</Tag>
								<Tag color="cyan">{selectedBusiness.category}</Tag>
								<Tag color="purple">{selectedBusiness.operationMode}</Tag>
								{selectedBusiness.verificationStatus && (
									<Tag
										color={
											selectedBusiness.verificationStatus === "verified"
												? "success"
												: "warning"
										}
									>
										{selectedBusiness.verificationStatus}
									</Tag>
								)}
							</Space>
						</div>
					</Space>
				</div>
			</Card>
		);
	};

	const getStatusColor = (status) => {
		switch (status.toLowerCase()) {
			case "completed":
			case "delivered":
				return "success";
			case "processing":
			case "in_progress":
				return "processing";
			case "pending":
				return "default";
			case "cancelled":
				return "error";
			default:
				return "default";
		}
	};

	const getProgressPercentage = (order) => {
		if (order.type === "service") {
			const completed = order.milestones.filter(
				(m) => m.status === "completed"
			).length;
			return (completed / order.milestones.length) * 100;
		}
		return order.status === "completed"
			? 100
			: order.status === "processing"
			? 50
			: order.status === "pending"
			? 0
			: 0;
	};

	const getOrderTypeIcon = (type) => {
		return type === "product" ? (
			<ShoppingOutlined style={{ fontSize: "24px" }} />
		) : (
			<FileTextOutlined style={{ fontSize: "24px" }} />
		);
	};

	const columns = [
		{
			title: "Order Details",
			key: "orderDetails",
			render: (_, record) => (
				<Space>
					<Avatar size={40} icon={getOrderTypeIcon(record.type)} />
					<Space direction="vertical" size={0}>
						<Text strong>
							{record.type === "product"
								? record.productName
								: record.serviceName}
						</Text>
						<Space size={4}>
							<Tag color={getStatusColor(record.status)}>
								{record.status.replace("_", " ").toUpperCase()}
							</Tag>
							<Text type="secondary">{record.orderNumber}</Text>
						</Space>
					</Space>
				</Space>
			),
		},
		{
			title: "Progress",
			key: "progress",
			width: 200,
			render: (_, record) => (
				<Space direction="vertical" size={0}>
					<Progress
						percent={getProgressPercentage(record)}
						size="small"
						status="active"
					/>
					{record.type === "service" ? (
						<Text type="secondary">
							{record.milestones.filter((m) => m.status === "completed").length}{" "}
							of {record.milestones.length} milestones
						</Text>
					) : (
						<Text type="secondary">{record.shippingStatus?.toUpperCase()}</Text>
					)}
				</Space>
			),
		},
		{
			title: "Customer",
			key: "customer",
			render: (_, record) => (
				<Space>
					<UserOutlined />
					<Text>{record.customerName}</Text>
				</Space>
			),
		},
		{
			title: "Payment Status",
			key: "payment",
			render: (_, record) => (
				<Space direction="vertical" size={0}>
					<Space>
						<DollarOutlined />
						<Text strong>${record.totalAmount}</Text>
					</Space>
					<Space>
						<Badge status="success" text={`Paid: $${record.paidAmount}`} />
					</Space>
					{record.type === "service" && record.escrowAmount > 0 && (
						<Space>
							<Badge
								status="processing"
								text={`In Escrow: $${record.escrowAmount}`}
							/>
						</Space>
					)}
				</Space>
			),
		},
		{
			title: "Timeline",
			key: "timeline",
			render: (_, record) => (
				<Space direction="vertical" size={0}>
					<Text>{dayjs(record.orderDate).format("MMM D, YYYY")}</Text>
					{record.type === "product" ? (
						<Text type="secondary">
							Delivery: {dayjs(record.estimatedDelivery).format("MMM D, YYYY")}
						</Text>
					) : (
						<>
							<Text type="secondary">to</Text>
							<Text>
								{dayjs(record.estimatedEndDate).format("MMM D, YYYY")}
							</Text>
						</>
					)}
				</Space>
			),
		},
		{
			title: "",
			key: "actions",
			render: (_, record) => (
				<Button
					type="primary"
					icon={<EyeOutlined />}
					onClick={() => navigate(`/dashboard/business/orders/${record.id}`)}
				>
					View Details
				</Button>
			),
		},
	];

	return (
		<div className="p-6">
			{selectedBusiness ? (
				<>
					{renderBusinessHeader()}
					<Row gutter={[16, 16]}>
						<Col span={24}>
							<Space className="w-full justify-between">
								<Title level={2}>Business Orders</Title>
								<Space>
									<Select
										defaultValue="all"
										style={{ width: 120 }}
										options={[
											{ value: "all", label: "All Orders" },
											{ value: "product", label: "Products" },
											{ value: "service", label: "Services" },
											{ value: "processing", label: "Processing" },
											{ value: "completed", label: "Completed" },
										]}
									/>
									<DatePicker.RangePicker />
									<Input.Search
										placeholder="Search orders..."
										style={{ width: 250 }}
									/>
								</Space>
							</Space>
						</Col>

						<Col span={24}>
							<Row gutter={[16, 16]}>
								<Col span={6}>
									<Card>
										<Statistic
											title="Total Orders"
											value={orders.length}
											prefix={<ShoppingOutlined />}
										/>
									</Card>
								</Col>
								<Col span={6}>
									<Card>
										<Statistic
											title="Product Orders"
											value={orders.filter((o) => o.type === "product").length}
											prefix={<ShoppingOutlined />}
											valueStyle={{ color: "#1890ff" }}
										/>
									</Card>
								</Col>
								<Col span={6}>
									<Card>
										<Statistic
											title="Service Orders"
											value={orders.filter((o) => o.type === "service").length}
											prefix={<FileTextOutlined />}
											valueStyle={{ color: "#52c41a" }}
										/>
									</Card>
								</Col>
								<Col span={6}>
									<Card>
										<Statistic
											title="In Progress"
											value={
												orders.filter(
													(o) =>
														o.status === "processing" ||
														o.status === "in_progress"
												).length
											}
											prefix={<ClockCircleOutlined />}
											valueStyle={{ color: "#faad14" }}
										/>
									</Card>
								</Col>
							</Row>
						</Col>

						<Col span={24}>
							<Card>
								<Table
									columns={columns}
									dataSource={orders}
									loading={loading}
									rowKey="id"
									pagination={{
										total: orders.length,
										pageSize: 10,
										showTotal: (total) => `Total ${total} orders`,
										showQuickJumper: true,
										showSizeChanger: true,
									}}
								/>
							</Card>
						</Col>
					</Row>
				</>
			) : (
				<Empty
					className="py-20"
					description={
						<Space direction="vertical" align="center">
							<Text strong>No Business Selected</Text>
							<Button type="primary" href="/dashboard/businesses/create">
								<PlusOutlined /> Create Your First Business
							</Button>
						</Space>
					}
				/>
			)}
		</div>
	);
};

export default BusinessOrders;
