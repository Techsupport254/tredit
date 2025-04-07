import React, { useState, useEffect, useCallback } from "react";
import {
	Table,
	Button,
	Space,
	message,
	notification,
	Modal,
	Form,
	Input,
	InputNumber,
	Tag,
	Select,
	Tooltip,
	Typography,
	Card,
	Row,
	Col,
	Statistic,
	Avatar,
	Empty,
	Dropdown,
	Menu,
	Collapse,
	Badge,
	Descriptions,
	Divider,
	Tabs,
	Skeleton,
} from "antd";
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	WarningOutlined,
	ReloadOutlined,
	HistoryOutlined,
	ImportOutlined,
	ExportOutlined,
	ShoppingOutlined,
	CustomerServiceOutlined,
	DownOutlined,
	DollarOutlined,
	CheckCircleOutlined,
	StopOutlined,
	TagOutlined,
	CaretDownOutlined,
	SearchOutlined,
	FilterOutlined,
	EyeOutlined,
	StarOutlined,
	TrophyOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useBusiness } from "../../Context/BusinessContext";
import storage from "../../utils/storage";
import { BUSINESS_CONSTANTS } from "../../constants/businessConstants";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const StockControl = () => {
	const navigate = useNavigate();
	const {
		businesses,
		isLoading: loadingBusinesses,
		fetchAllBusinesses,
		fetchBusinessListings,
		listings,
		listingsLoading,
		listingsError,
	} = useBusiness();
	const [selectedBusinessId, setSelectedBusinessId] = useState(
		storage.getItem("selectedBusinessId") || null
	);
	const [selectedBusiness, setSelectedBusiness] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [stockHistory, setStockHistory] = useState([]);
	const [form] = Form.useForm();
	const [editingId, setEditingId] = useState(null);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [activeTab, setActiveTab] = useState("all");

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

			// Only set first business if no stored business ID exists
			if (!storedBusinessId) {
				const firstBusiness = businesses[0];
				setSelectedBusinessId(firstBusiness.id);
				setSelectedBusiness(firstBusiness);
				storage.setItem("selectedBusinessId", firstBusiness.id);
				storage.setItem("selectedBusiness", JSON.stringify(firstBusiness));
			} else {
				// Find the stored business in the current businesses array
				const storedBusiness = businesses.find(
					(b) => b.id === storedBusinessId
				);
				if (storedBusiness) {
					setSelectedBusinessId(storedBusinessId);
					setSelectedBusiness(storedBusiness);
					// Update storage with fresh data
					storage.setItem("selectedBusiness", JSON.stringify(storedBusiness));
				} else {
					// If stored business no longer exists, fall back to first business
					const firstBusiness = businesses[0];
					setSelectedBusinessId(firstBusiness.id);
					setSelectedBusiness(firstBusiness);
					storage.setItem("selectedBusinessId", firstBusiness.id);
					storage.setItem("selectedBusiness", JSON.stringify(firstBusiness));
				}
			}
		}
	}, [businesses]);

	// Fetch listings when selected business changes
	useEffect(() => {
		if (selectedBusinessId) {
			fetchBusinessListings(selectedBusinessId);
		}
	}, [selectedBusinessId, fetchBusinessListings]);

	const handleBusinessChange = (businessId) => {
		const newSelectedBusiness = businesses.find((b) => b.id === businessId);
		if (newSelectedBusiness) {
			setSelectedBusinessId(businessId);
			setSelectedBusiness(newSelectedBusiness);
			storage.setItem("selectedBusinessId", businessId);
			storage.setItem("selectedBusiness", JSON.stringify(newSelectedBusiness));
		}
	};

	const getTabItems = () => {
		if (selectedBusiness?.type === BUSINESS_CONSTANTS.TYPES.SERVICE) {
			return [
				{
					key: "all",
					label: "All Services",
					icon: <CustomerServiceOutlined />,
				},
				{
					key: "available",
					label: "Available",
					icon: <CheckCircleOutlined />,
				},
				{
					key: "unavailable",
					label: "Unavailable",
					icon: <StopOutlined />,
				},
				{
					key: "popular",
					label: "Popular",
					icon: <TagOutlined />,
				},
			];
		}

		return [
			{
				key: "all",
				label: "All Products",
				icon: <ShoppingOutlined />,
			},
			{
				key: "in_stock",
				label: "In Stock",
				icon: <CheckCircleOutlined />,
			},
			{
				key: "out_of_stock",
				label: "Out of Stock",
				icon: <StopOutlined />,
			},
			{
				key: "low_stock",
				label: "Low Stock",
				icon: <WarningOutlined />,
			},
		];
	};

	const getFilteredInventory = useCallback(() => {
		if (!listings) return [];

		let filtered = listings;

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((item) => {
				if (selectedBusiness?.type === BUSINESS_CONSTANTS.TYPES.SERVICE) {
					return (
						item.name.toLowerCase().includes(query) ||
						item.description?.toLowerCase().includes(query) ||
						item.category?.toLowerCase().includes(query) ||
						item.packages?.some(
							(pkg) =>
								pkg.name.toLowerCase().includes(query) ||
								pkg.items?.some((i) => i.name.toLowerCase().includes(query))
						) ||
						item.tags?.some((tag) => tag.toLowerCase().includes(query))
					);
				}
				return (
					item.name.toLowerCase().includes(query) ||
					item.description?.toLowerCase().includes(query) ||
					item.category?.toLowerCase().includes(query) ||
					item.sku?.toLowerCase().includes(query) ||
					item.variants?.some(
						(variant) =>
							variant.name.toLowerCase().includes(query) ||
							variant.sku?.toLowerCase().includes(query)
					)
				);
			});
		}

		// Apply category filter
		if (selectedCategories.length > 0) {
			filtered = filtered.filter((item) =>
				selectedCategories.includes(item.category)
			);
		}

		// Apply tab filter
		if (selectedBusiness?.type === BUSINESS_CONSTANTS.TYPES.SERVICE) {
			switch (activeTab) {
				case "available":
					return filtered.filter((item) => item.isAvailable);
				case "unavailable":
					return filtered.filter((item) => !item.isAvailable);
				case "popular":
					return filtered.filter((item) => item.metadata?.popular);
				default:
					return filtered;
			}
		} else {
			switch (activeTab) {
				case "in_stock":
					return filtered.filter((item) =>
						item.variants?.some((variant) => variant.stockQuantity > 0)
					);
				case "out_of_stock":
					return filtered.filter((item) =>
						item.variants?.every((variant) => variant.stockQuantity <= 0)
					);
				case "low_stock":
					return filtered.filter((item) =>
						item.variants?.some(
							(variant) =>
								variant.stockQuantity <= (variant.lowStockThreshold || 0)
						)
					);
				default:
					return filtered;
			}
		}
	}, [
		listings,
		activeTab,
		searchQuery,
		selectedCategories,
		selectedBusiness?.type,
	]);

	const formatCurrency = (amount) => {
		if (!amount || isNaN(amount)) return "-";

		const businessCurrency = selectedBusiness?.currency;
		if (!businessCurrency) return `${amount}`;

		try {
			let locale = "en-US";
			if (businessCurrency === "KES") locale = "en-KE";

			return new Intl.NumberFormat(locale, {
				style: "currency",
				currency: businessCurrency,
				currencyDisplay: "narrowSymbol",
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}).format(amount);
		} catch (error) {
			console.error("Currency formatting error:", error);
			return `${businessCurrency} ${amount.toFixed(2)}`;
		}
	};

	const getServiceColumns = () => [
		{
			title: "Service",
			dataIndex: "name",
			key: "name",
			sorter: (a, b) => a.name.localeCompare(b.name),
			render: (text, record) => (
				<Space size="middle" align="start">
					{record.media?.[0] ? (
						<Avatar
							src={record.media[0].url}
							size={64}
							shape="square"
							style={{
								borderRadius: "8px",
								boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
							}}
						/>
					) : (
						<Avatar
							size={64}
							icon={<CustomerServiceOutlined />}
							shape="square"
							style={{
								borderRadius: "8px",
								background: "#f0f5ff",
								color: "#1890ff",
							}}
						/>
					)}
					<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
						<Text strong style={{ fontSize: "16px" }}>
							{text}
						</Text>
						<Space>
							<Tag color="blue">{record.serviceType}</Tag>
							<Tag color="cyan">{record.category}</Tag>
						</Space>
						<Text
							type="secondary"
							style={{
								fontSize: "14px",
								maxWidth: "400px",
								display: "-webkit-box",
								WebkitLineClamp: 2,
								WebkitBoxOrient: "vertical",
								overflow: "hidden",
							}}
						>
							{record.shortDescription}
						</Text>
					</div>
				</Space>
			),
		},
		{
			title: "Pricing",
			key: "pricing",
			render: (_, record) => (
				<Space direction="vertical" size="small">
					<Text strong>
						{formatCurrency(record.basePrice)} -{" "}
						{formatCurrency(record.maxPrice)}
					</Text>
					<Dropdown
						menu={{
							items: record.packages?.map((pkg, index) => ({
								key: index,
								label: (
									<div style={{ padding: "8px", minWidth: "300px" }}>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginBottom: "8px",
												borderBottom: "1px solid #f0f0f0",
												paddingBottom: "8px",
											}}
										>
											<Text strong>{pkg.name}</Text>
											<Text>{formatCurrency(pkg.price)}</Text>
										</div>
										<div style={{ fontSize: "14px" }}>
											{pkg.features?.map((feature, i) => (
												<div key={i}>
													<CheckCircleOutlined
														style={{ color: "#52c41a", marginRight: "8px" }}
													/>
													{feature}
												</div>
											))}
										</div>
									</div>
								),
							})),
						}}
						trigger={["click"]}
						placement="bottomLeft"
					>
						<Button type="link">
							<Space>
								<Badge count={record.packages?.length || 0} />
								<Text>Packages</Text>
								<CaretDownOutlined />
							</Space>
						</Button>
					</Dropdown>
				</Space>
			),
		},
		{
			title: "Duration",
			key: "duration",
			render: (_, record) => (
				<Space direction="vertical" size="small">
					<Text>{record.estimatedCompletionTime}</Text>
					<Tag color="purple">{record.duration} days</Tag>
				</Space>
			),
		},
		{
			title: "Availability",
			key: "availability",
			render: (_, record) => (
				<Space direction="vertical" size="small">
					<Tag color={record.isAvailable ? "success" : "error"}>
						{record.isAvailable ? "Available" : "Unavailable"}
					</Tag>
					<Text type="secondary">Max Clients: {record.maxClientsPerSlot}</Text>
				</Space>
			),
		},
		{
			title: "Stats",
			key: "stats",
			render: (_, record) => (
				<Space direction="vertical" size="small">
					<Space>
						<StarOutlined style={{ color: "#faad14" }} />
						<Text>{record.rating}</Text>
						<Text type="secondary">({record.reviewsCount} reviews)</Text>
					</Space>
					<Text>{record.completedServices} completed</Text>
				</Space>
			),
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, record) => (
				<Space>
					<Button
						type="primary"
						icon={<EditOutlined />}
						onClick={() => handleEdit(record)}
					>
						Edit
					</Button>
					<Dropdown
						menu={{
							items: [
								{
									key: "view",
									icon: <EyeOutlined />,
									label: "View Details",
								},
								{
									key: "toggle",
									icon: record.isAvailable ? (
										<StopOutlined />
									) : (
										<CheckCircleOutlined />
									),
									label: record.isAvailable
										? "Mark Unavailable"
										: "Mark Available",
								},
								{
									key: "delete",
									icon: <DeleteOutlined />,
									label: "Delete",
									danger: true,
								},
							],
						}}
					>
						<Button icon={<DownOutlined />} />
					</Dropdown>
				</Space>
			),
		},
	];

	const columns =
		selectedBusiness?.type === BUSINESS_CONSTANTS.TYPES.SERVICE
			? getServiceColumns()
			: [
					{
						title: "Product",
						dataIndex: "name",
						key: "name",
						sorter: (a, b) => a.name.localeCompare(b.name),
						render: (text, record) => (
							<Space size="middle" align="start">
								{record.media?.[0] ? (
									<Avatar
										src={record.media[0].url}
										size={64}
										shape="square"
										style={{
											borderRadius: "8px",
											boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
										}}
									/>
								) : (
									<Avatar
										size={64}
										icon={<ShoppingOutlined />}
										shape="square"
										style={{
											borderRadius: "8px",
											background: "#f0f5ff",
											color: "#1890ff",
										}}
									/>
								)}
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "4px",
									}}
								>
									<Text strong style={{ fontSize: "16px" }}>
										{text}
									</Text>
									<Space>
										<Tag color="blue">SKU: {record.sku}</Tag>
										{record.category && (
											<Tag color="cyan">{record.category}</Tag>
										)}
									</Space>
									<Text
										type="secondary"
										style={{
											fontSize: "14px",
											maxWidth: "400px",
											display: "-webkit-box",
											WebkitLineClamp: 2,
											WebkitBoxOrient: "vertical",
											overflow: "hidden",
										}}
									>
										{record.description}
									</Text>
								</div>
							</Space>
						),
					},
					{
						title: "Stock",
						key: "stock",
						render: (_, record) => {
							const variants = record.variants || [];
							const totalStock = variants.reduce(
								(sum, variant) => sum + (variant.stockQuantity || 0),
								0
							);
							const hasLowStock = variants.some(
								(variant) =>
									variant.stockQuantity <= (variant.lowStockThreshold || 0)
							);

							return (
								<Space direction="vertical" size="small">
									<Text strong>{totalStock} units</Text>
									{hasLowStock && (
										<Tooltip title="Some variants are below threshold">
											<Tag color="red" icon={<WarningOutlined />}>
												Low Stock
											</Tag>
										</Tooltip>
									)}
								</Space>
							);
						},
						sorter: (a, b) => {
							const getTotal = (record) =>
								(record.variants || []).reduce(
									(sum, variant) => sum + (variant.stockQuantity || 0),
									0
								);
							return getTotal(a) - getTotal(b);
						},
					},
					{
						title: "Variants",
						key: "variants",
						render: (_, record) => {
							const variants = record.variants || [];
							const menuItems = variants.map((variant, index) => ({
								key: index,
								label: (
									<div style={{ padding: "8px", minWidth: "300px" }}>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginBottom: "8px",
												borderBottom: "1px solid #f0f0f0",
												paddingBottom: "8px",
											}}
										>
											<Space>
												<Text strong>{variant.name}</Text>
												<Tag color={variant.isActive ? "success" : "error"}>
													{variant.isActive ? "Active" : "Inactive"}
												</Tag>
											</Space>
											<Text type="secondary">SKU: {variant.sku}</Text>
										</div>

										<div
											style={{
												display: "grid",
												gridTemplateColumns: "1fr 1fr",
												gap: "8px",
												fontSize: "14px",
											}}
										>
											<div>
												<Text type="secondary">Price: </Text>
												<Text strong>{formatCurrency(variant.price)}</Text>
											</div>
											<div>
												<Text type="secondary">Stock: </Text>
												<Space>
													<Text>{variant.stockQuantity}</Text>
													{variant.stockQuantity <=
														(variant.lowStockThreshold || 0) && (
														<Tag
															color="red"
															style={{ marginLeft: 0, padding: "0 4px" }}
														>
															Low
														</Tag>
													)}
												</Space>
											</div>
											<div>
												<Text type="secondary">Threshold: </Text>
												<Text>{variant.lowStockThreshold}</Text>
											</div>
											{variant.color && (
												<div>
													<Text type="secondary">Color: </Text>
													<Text>{variant.color}</Text>
												</div>
											)}
											{variant.size && (
												<div>
													<Text type="secondary">Size: </Text>
													<Text>{variant.size}</Text>
												</div>
											)}
											{variant.weight && (
												<div>
													<Text type="secondary">Weight: </Text>
													<Text>{variant.weight} kg</Text>
												</div>
											)}
											{variant.dimensions && (
												<div>
													<Text type="secondary">Dimensions: </Text>
													<Text>{variant.dimensions}</Text>
												</div>
											)}
										</div>

										{variant.discount && variant.discount.amount > 0 && (
											<div
												style={{
													marginTop: "8px",
													paddingTop: "8px",
													borderTop: "1px solid #f0f0f0",
												}}
											>
												<Space>
													<Text type="secondary">Discount:</Text>
													<Tag color="green">
														{variant.discount.type === "percentage"
															? `${variant.discount.amount}% off`
															: `${formatCurrency(
																	variant.discount.amount
															  )} off`}
													</Tag>
												</Space>
											</div>
										)}
									</div>
								),
							}));

							return (
								<Dropdown
									menu={{ items: menuItems }}
									trigger={["click"]}
									placement="bottomLeft"
								>
									<Button type="link">
										<Space>
											<Badge count={variants.length} />
											<Text>Variant{variants.length !== 1 ? "s" : ""}</Text>
											<CaretDownOutlined />
										</Space>
									</Button>
								</Dropdown>
							);
						},
					},
					{
						title: "Value",
						key: "value",
						render: (_, record) => {
							const totalValue = (record.variants || []).reduce(
								(sum, variant) =>
									sum + (variant.price || 0) * (variant.stockQuantity || 0),
								0
							);
							return <Text strong>{formatCurrency(totalValue)}</Text>;
						},
						sorter: (a, b) => {
							const getValue = (record) =>
								(record.variants || []).reduce(
									(sum, variant) =>
										sum + (variant.price || 0) * (variant.stockQuantity || 0),
									0
								);
							return getValue(a) - getValue(b);
						},
					},
					{
						title: "Status",
						key: "status",
						render: (_, record) => {
							const totalStock = (record.variants || []).reduce(
								(sum, variant) => sum + (variant.stockQuantity || 0),
								0
							);
							return totalStock > 0 ? (
								<Tag icon={<CheckCircleOutlined />} color="success">
									In Stock
								</Tag>
							) : (
								<Tag icon={<StopOutlined />} color="error">
									Out of Stock
								</Tag>
							);
						},
					},
					{
						title: "Actions",
						key: "actions",
						render: (_, record) => (
							<Space>
								<Button
									type="primary"
									icon={<EditOutlined />}
									onClick={() => handleEdit(record)}
								>
									Edit
								</Button>
								<Button
									icon={<HistoryOutlined />}
									onClick={() => handleViewHistory(record)}
								>
									History
								</Button>
								<Dropdown
									menu={{
										items: [
											{
												key: "adjust",
												icon: <TagOutlined />,
												label: "Adjust Stock",
												onClick: () => handleStockAdjustment(record),
											},
											{
												key: "delete",
												icon: <DeleteOutlined />,
												label: "Delete",
												danger: true,
												onClick: () => handleDelete(record.id),
											},
										],
									}}
								>
									<Button icon={<DownOutlined />} />
								</Dropdown>
							</Space>
						),
					},
			  ];

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

	const renderStatistics = () => {
		if (!selectedBusiness || !listings.length) return null;

		let stats;
		if (selectedBusiness.type === BUSINESS_CONSTANTS.TYPES.SERVICE) {
			const totalServices = listings.length;
			const availableServices = listings.filter(
				(service) => service.isAvailable
			).length;
			const totalCompleted = listings.reduce(
				(sum, service) => sum + (service.completedServices || 0),
				0
			);
			const averageRating =
				listings.reduce((sum, service) => sum + (service.rating || 0), 0) /
				listings.length;

			stats = [
				{
					title: "Total Services",
					value: totalServices,
					prefix: (
						<CustomerServiceOutlined
							style={{ fontSize: "24px", color: "#1890ff" }}
						/>
					),
				},
				{
					title: "Available Services",
					value: availableServices,
					prefix: (
						<CheckCircleOutlined
							style={{ fontSize: "24px", color: "#52c41a" }}
						/>
					),
				},
				{
					title: "Completed Services",
					value: totalCompleted,
					prefix: (
						<TrophyOutlined style={{ fontSize: "24px", color: "#faad14" }} />
					),
				},
				{
					title: "Average Rating",
					value: averageRating.toFixed(1),
					suffix: "/5",
					prefix: (
						<StarOutlined style={{ fontSize: "24px", color: "#13c2c2" }} />
					),
				},
			];
		} else {
			const totalProducts = listings.length;
			const totalVariants = listings.reduce(
				(sum, product) => sum + (product.variants?.length || 0),
				0
			);
			const totalValue = listings.reduce(
				(sum, product) =>
					sum +
					(product.variants || []).reduce(
						(varSum, variant) =>
							varSum + (variant.price || 0) * (variant.stockQuantity || 0),
						0
					),
				0
			);
			const lowStockItems = listings.filter((product) =>
				(product.variants || []).some(
					(variant) => variant.stockQuantity <= (variant.lowStockThreshold || 0)
				)
			).length;

			stats = [
				{
					title: "Total Products",
					value: totalProducts,
					prefix: (
						<ShoppingOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
					),
				},
				{
					title: "Total Variants",
					value: totalVariants,
					prefix: (
						<TagOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
					),
				},
				{
					title: "Low Stock Items",
					value: lowStockItems,
					prefix: (
						<WarningOutlined style={{ fontSize: "24px", color: "#faad14" }} />
					),
				},
				{
					title: "Total Value",
					value: formatCurrency(totalValue),
					prefix: (
						<DollarOutlined style={{ fontSize: "24px", color: "#13c2c2" }} />
					),
				},
			];
		}

		return (
			<Row gutter={[16, 16]} className="mb-6">
				{stats.map((stat, index) => (
					<Col xs={24} sm={12} md={6} key={index}>
						<Card hoverable style={{ borderRadius: "12px", height: "100%" }}>
							<Statistic
								title={
									<Text strong style={{ fontSize: "16px", color: "#8c8c8c" }}>
										{stat.title}
									</Text>
								}
								value={stat.value}
								prefix={stat.prefix}
								suffix={stat.suffix}
								valueStyle={{ fontSize: "24px", color: "#262626" }}
							/>
						</Card>
					</Col>
				))}
			</Row>
		);
	};

	const handleAdd = () => {
		setEditingId(null);
		setSelectedProduct(null);
		form.resetFields();
		setIsModalVisible(true);
	};

	const handleEdit = (record) => {
		setEditingId(record.id);
		setSelectedProduct(record);
		form.setFieldsValue({
			...record,
			status: record.isActive ? "active" : "inactive",
		});
		setIsModalVisible(true);
	};

	const handleViewHistory = async (record) => {
		setSelectedProduct(record);
		setStockHistory(record.stockHistory || []);
		setIsHistoryModalVisible(true);
	};

	const handleDelete = (id) => {
		Modal.confirm({
			title: "Are you sure you want to delete this product?",
			content: "This action cannot be undone.",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk: async () => {
				try {
					const response = await axios.delete(`/products/${id}`);
					if (response.data?.success) {
						message.success("Product deleted successfully");
						fetchBusinessListings(selectedBusinessId);
					} else {
						throw new Error(
							response.data?.message || "Failed to delete product"
						);
					}
				} catch (error) {
					message.error("Failed to delete product");
				}
			},
		});
	};

	const handleModalOk = async () => {
		try {
			const values = await form.validateFields();
			const payload = {
				...values,
				isActive: values.status === "active",
				businessId: selectedBusinessId,
			};

			if (editingId) {
				const response = await axios.put(`/products/${editingId}`, payload);
				if (response.data?.success) {
					message.success("Product updated successfully");
					fetchBusinessListings(selectedBusinessId);
				} else {
					throw new Error(response.data?.message || "Failed to update product");
				}
			} else {
				const response = await axios.post("/products", payload);
				if (response.data?.success) {
					message.success("Product added successfully");
					fetchBusinessListings(selectedBusinessId);
				} else {
					throw new Error(response.data?.message || "Failed to add product");
				}
			}

			setIsModalVisible(false);
			form.resetFields();
		} catch (error) {
			if (error.errorFields) {
				message.error("Please fill in all required fields correctly");
			} else {
				message.error(error.message || "Operation failed");
			}
		}
	};

	const handleStockAdjustment = async (values) => {
		try {
			const response = await axios.post(
				`/products/${selectedProduct.id}/adjust-stock`,
				{
					...values,
					businessId: selectedBusinessId,
				}
			);

			if (response.data?.success) {
				message.success("Stock adjusted successfully");
				fetchBusinessListings(selectedBusinessId);
			} else {
				throw new Error(response.data?.message || "Failed to adjust stock");
			}
		} catch (error) {
			message.error(error.message || "Failed to adjust stock");
		}
	};

	const historyColumns = [
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
			render: (date) => new Date(date).toLocaleString(),
		},
		{
			title: "Type",
			dataIndex: "type",
			key: "type",
			render: (type) => (
				<Tag color={type === "increase" ? "success" : "error"}>
					{type.charAt(0).toUpperCase() + type.slice(1)}
				</Tag>
			),
		},
		{
			title: "Quantity",
			dataIndex: "quantity",
			key: "quantity",
			render: (quantity, record) => (
				<Text type={record.type === "increase" ? "success" : "danger"}>
					{record.type === "increase" ? "+" : "-"}
					{quantity}
				</Text>
			),
		},
		{
			title: "Reason",
			dataIndex: "reason",
			key: "reason",
		},
		{
			title: "Updated By",
			dataIndex: "updatedBy",
			key: "updatedBy",
		},
	];

	const getEmptyStateMessage = () => {
		switch (activeTab) {
			case "in_stock":
				return {
					message: "No products in stock",
					buttonText: "Add New Product",
					description: "Add products to your inventory to start selling",
				};
			case "out_of_stock":
				return {
					message: "No out of stock products",
					buttonText: "View All Products",
					description: "All your products are currently in stock",
				};
			case "low_stock":
				return {
					message: "No low stock products",
					buttonText: "View All Products",
					description: "All your products are above their threshold levels",
				};
			default:
				return {
					message: "No products found",
					buttonText: "Add Product",
					description: "Start by adding your first product",
				};
		}
	};

	return (
		<div className="p-6">
			{selectedBusiness ? (
				<>
					{renderBusinessHeader()}
					{renderStatistics()}

					<Card>
						<div className="mb-4 flex justify-between items-center flex-wrap gap-4">
							<Space wrap>
								<Input.Search
									placeholder="Search products..."
									allowClear
									style={{ width: 250 }}
									prefix={<SearchOutlined />}
									onChange={(e) => setSearchQuery(e.target.value)}
									value={searchQuery}
								/>
								<Select
									mode="multiple"
									allowClear
									style={{ minWidth: 200 }}
									placeholder="Filter by categories"
									value={selectedCategories}
									onChange={setSelectedCategories}
									options={BUSINESS_CONSTANTS.PRODUCT_CATEGORIES.map(
										(category) => ({
											label: category,
											value: category,
										})
									)}
									maxTagCount="responsive"
									suffixIcon={<FilterOutlined />}
								/>
							</Space>
							<Space wrap>
								<Button
									icon={<ReloadOutlined />}
									onClick={() => fetchBusinessListings(selectedBusinessId)}
								>
									Refresh
								</Button>
								<Button icon={<ImportOutlined />}>Import</Button>
								<Button icon={<ExportOutlined />}>Export</Button>
								<Button
									type="primary"
									icon={<PlusOutlined />}
									onClick={handleAdd}
								>
									Add Product
								</Button>
							</Space>
						</div>

						<Tabs
							activeKey={activeTab}
							onChange={setActiveTab}
							items={getTabItems()}
							className="mb-4"
						/>

						{listingsLoading ? (
							<div className="py-20">
								<Skeleton active />
							</div>
						) : getFilteredInventory().length === 0 ? (
							<Empty
								className="py-20"
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={
									<Space direction="vertical" align="center" size="large">
										<div className="text-center">
											<Text strong className="text-lg block">
												{getEmptyStateMessage().message}
											</Text>
											<Text type="secondary">
												{getEmptyStateMessage().description}
											</Text>
										</div>
										<Button type="primary" icon={<PlusOutlined />}>
											{getEmptyStateMessage().buttonText}
										</Button>
									</Space>
								}
							/>
						) : (
							<Table
								columns={columns}
								dataSource={getFilteredInventory()}
								loading={listingsLoading}
								rowKey="id"
								pagination={{
									showSizeChanger: true,
									showTotal: (total) => `Total ${total} items`,
								}}
							/>
						)}
					</Card>
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

			{/* Add/Edit Product Modal */}
			<Modal
				title={editingId ? "Edit Product" : "Add New Product"}
				open={isModalVisible}
				onOk={handleModalOk}
				onCancel={() => {
					setIsModalVisible(false);
					form.resetFields();
				}}
				width={600}
			>
				<Form form={form} layout="vertical">
					<Form.Item
						name="name"
						label="Product Name"
						rules={[{ required: true, message: "Please enter product name" }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="sku"
						label="SKU"
						rules={[{ required: true, message: "Please enter SKU" }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="quantity"
						label="Quantity"
						rules={[{ required: true, message: "Please enter quantity" }]}
					>
						<InputNumber min={0} style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item
						name="price"
						label="Price"
						rules={[{ required: true, message: "Please enter price" }]}
					>
						<InputNumber
							min={0}
							step={0.01}
							prefix="$"
							style={{ width: "100%" }}
						/>
					</Form.Item>
					<Form.Item
						name="lowStockThreshold"
						label="Low Stock Threshold"
						rules={[
							{ required: true, message: "Please enter low stock threshold" },
						]}
					>
						<InputNumber min={0} style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item
						name="status"
						label="Status"
						rules={[{ required: true, message: "Please select status" }]}
					>
						<Select>
							<Option value="active">Active</Option>
							<Option value="inactive">Inactive</Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>

			{/* Stock History Modal */}
			<Modal
				title={`Stock History - ${selectedProduct?.name}`}
				open={isHistoryModalVisible}
				onCancel={() => setIsHistoryModalVisible(false)}
				footer={[
					<Button key="close" onClick={() => setIsHistoryModalVisible(false)}>
						Close
					</Button>,
					<Button
						key="adjust"
						type="primary"
						onClick={() => {
							Modal.confirm({
								title: "Adjust Stock",
								content: (
									<Form
										onFinish={handleStockAdjustment}
										layout="vertical"
										initialValues={{ type: "increase" }}
									>
										<Form.Item
											name="type"
											label="Adjustment Type"
											rules={[{ required: true }]}
										>
											<Select>
												<Option value="increase">Increase</Option>
												<Option value="decrease">Decrease</Option>
											</Select>
										</Form.Item>
										<Form.Item
											name="quantity"
											label="Quantity"
											rules={[{ required: true }]}
										>
											<InputNumber min={1} style={{ width: "100%" }} />
										</Form.Item>
										<Form.Item
											name="reason"
											label="Reason"
											rules={[{ required: true }]}
										>
											<Input.TextArea />
										</Form.Item>
									</Form>
								),
								okText: "Adjust",
								onOk: (close) => {
									const form = document.querySelector("form");
									const formData = new FormData(form);
									const values = Object.fromEntries(formData.entries());
									handleStockAdjustment(values);
									close();
								},
							});
						}}
					>
						Adjust Stock
					</Button>,
				]}
				width={800}
			>
				<Table
					columns={historyColumns}
					dataSource={stockHistory}
					loading={listingsLoading}
					rowKey="id"
					pagination={{ pageSize: 5 }}
				/>
			</Modal>
		</div>
	);
};

export default StockControl;
