import React, { useState, useEffect, useCallback } from "react";
import {
	Button,
	Typography,
	Space,
	Select,
	Skeleton,
	Card,
	Tabs,
	Table,
	Tag,
	Badge,
	Avatar,
	Tooltip,
	Empty,
	Statistic,
	Row,
	Col,
	Divider,
	Dropdown,
	Menu,
	message,
	Rate,
	Input,
} from "antd";
import {
	PlusOutlined,
	ShopOutlined,
	DownOutlined,
	AppstoreOutlined,
	UnorderedListOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	StopOutlined,
	StarOutlined,
	StarFilled,
	DollarOutlined,
	TagOutlined,
	ShoppingOutlined,
	CustomerServiceOutlined,
	SettingOutlined,
	EditOutlined,
	DeleteOutlined,
	EyeOutlined,
	ShareAltOutlined,
	MoreOutlined,
	SearchOutlined,
	FilterOutlined,
} from "@ant-design/icons";
import { useBusiness } from "../../Context/BusinessContext";
import storage from "../../utils/storage";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BUSINESS_CONSTANTS } from "../../constants/businessConstants";

const { Title, Text } = Typography;
const { Option } = Select;

const ListingsManager = () => {
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
	const [activeTab, setActiveTab] = useState("all");
	const [viewMode, setViewMode] = useState("table");
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategories, setSelectedCategories] = useState([]);

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

	const getStatusTag = (status) => {
		switch (status?.toLowerCase()) {
			case BUSINESS_CONSTANTS.STATUS.ACTIVE.toLowerCase():
				return (
					<Tag icon={<CheckCircleOutlined />} color="success">
						Active
					</Tag>
				);
			case "draft":
				return (
					<Tag icon={<ClockCircleOutlined />} color="default">
						Draft
					</Tag>
				);
			case "archived":
				return (
					<Tag icon={<StopOutlined />} color="error">
						Archived
					</Tag>
				);
			default:
				return <Tag color="default">{status}</Tag>;
		}
	};

	const getTypeTag = (type) => {
		switch (type?.toLowerCase()) {
			case BUSINESS_CONSTANTS.TYPES.PRODUCT.toLowerCase():
				return (
					<Tag icon={<ShoppingOutlined />} color="blue">
						Product
					</Tag>
				);
			case BUSINESS_CONSTANTS.TYPES.SERVICE.toLowerCase():
				return (
					<Tag icon={<CustomerServiceOutlined />} color="green">
						Service
					</Tag>
				);
			default:
				return <Tag color="default">{type}</Tag>;
		}
	};

	const formatCurrency = (amount) => {
		if (!amount || isNaN(amount)) return "-";

		// Always use the selected business's currency
		const businessCurrency = selectedBusiness?.currency;
		if (!businessCurrency) return `${amount}`;

		try {
			// Create locale string based on currency
			let locale = "en-US"; // default
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
			// Fallback formatting
			return `${businessCurrency} ${amount.toFixed(2)}`;
		}
	};

	const columns = [
		{
			title: "Listing",
			dataIndex: "name",
			key: "name",
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
							icon={getDefaultIcon()}
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
						<Space wrap>
							<Tag
								color="blue"
								icon={getDefaultIcon()}
								style={{ padding: "4px 8px", borderRadius: "6px" }}
							>
								{record.category}
							</Tag>
							{record.serviceType && (
								<Tag
									color="cyan"
									icon={<ClockCircleOutlined />}
									style={{ padding: "4px 8px", borderRadius: "6px" }}
								>
									{record.serviceType}
								</Tag>
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
							{record.shortDescription || record.description}
						</Text>
					</div>
				</Space>
			),
		},
		{
			title: "Price",
			key: "price",
			render: (_, record) => {
				const isService =
					selectedBusiness?.type === BUSINESS_CONSTANTS.TYPES.SERVICE;

				if (isService) {
					return (
						<Space direction="vertical" size="small">
							<Text strong style={{ fontSize: "16px" }}>
								{formatCurrency(record.basePrice)}
								{record.maxPrice !== record.basePrice &&
									` - ${formatCurrency(record.maxPrice)}`}
							</Text>
							{record.estimatedCompletionTime && (
								<Text type="secondary" style={{ fontSize: "14px" }}>
									Est. {record.estimatedCompletionTime}
								</Text>
							)}
						</Space>
					);
				}

				const lowestPrice =
					record.variants?.reduce(
						(min, variant) => Math.min(min, variant.price || 0),
						Infinity
					) || 0;

				const highestPrice =
					record.variants?.reduce(
						(max, variant) => Math.max(max, variant.price || 0),
						0
					) || 0;

				const formattedLowPrice = formatCurrency(lowestPrice);
				const formattedHighPrice = formatCurrency(highestPrice);

				return (
					<Text strong style={{ fontSize: "16px" }}>
						{lowestPrice === highestPrice
							? formattedLowPrice
							: `${formattedLowPrice} - ${formattedHighPrice}`}
					</Text>
				);
			},
		},
		{
			title: "Status",
			key: "status",
			render: (_, record) => {
				const isService =
					selectedBusiness?.type === BUSINESS_CONSTANTS.TYPES.SERVICE;

				if (isService) {
					return record.isAvailable ? (
						<Tag
							icon={<CheckCircleOutlined />}
							color="success"
							style={{
								padding: "4px 12px",
								borderRadius: "6px",
								fontSize: "14px",
							}}
						>
							Available
						</Tag>
					) : (
						<Tag
							icon={<StopOutlined />}
							color="error"
							style={{
								padding: "4px 12px",
								borderRadius: "6px",
								fontSize: "14px",
							}}
						>
							Unavailable
						</Tag>
					);
				}

				const totalStock = record.variants?.reduce(
					(sum, variant) => sum + (variant.stockQuantity || 0),
					0
				);

				return totalStock > 0 ? (
					<Tag
						icon={<CheckCircleOutlined />}
						color="success"
						style={{
							padding: "4px 12px",
							borderRadius: "6px",
							fontSize: "14px",
						}}
					>
						In Stock ({totalStock})
					</Tag>
				) : (
					<Tag
						icon={<StopOutlined />}
						color="error"
						style={{
							padding: "4px 12px",
							borderRadius: "6px",
							fontSize: "14px",
						}}
					>
						Out of Stock
					</Tag>
				);
			},
		},
		{
			title: "Performance",
			key: "performance",
			render: (_, record) => {
				const isService =
					selectedBusiness?.type === BUSINESS_CONSTANTS.TYPES.SERVICE;

				if (isService) {
					return (
						<Space direction="vertical" size="small">
							<Space>
								<StarFilled style={{ color: "#faad14" }} />
								<Text strong>{record.rating?.toFixed(1)}</Text>
								<Text type="secondary">({record.reviewsCount} reviews)</Text>
							</Space>
							<Text type="secondary" style={{ fontSize: "14px" }}>
								{record.completedServices} services completed
							</Text>
						</Space>
					);
				}

				return (
					<Space direction="vertical" size="small">
						{record.variants?.map((variant, index) => (
							<div
								key={index}
								style={{ display: "flex", alignItems: "center", gap: "8px" }}
							>
								<Badge
									status={variant.stockQuantity > 0 ? "success" : "error"}
									text={
										<Text type="secondary" style={{ fontSize: "14px" }}>
											{variant.name} - {variant.stockQuantity} in stock
										</Text>
									}
								/>
							</div>
						))}
					</Space>
				);
			},
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, record) => (
				<Space size="middle">
					<Dropdown
						menu={{
							items: [
								{
									key: "view",
									icon: <EyeOutlined />,
									label: "View Details",
									onClick: () => handleViewProduct(record.id),
								},
								{
									key: "edit",
									icon: <EditOutlined />,
									label: "Edit",
								},
								{
									key: "share",
									icon: <ShareAltOutlined />,
									label: "Share",
								},
								{
									type: "divider",
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
						<Button
							type="text"
							icon={<MoreOutlined />}
							style={{
								borderRadius: "6px",
								width: "32px",
								height: "32px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						/>
					</Dropdown>
				</Space>
			),
		},
	];

	const renderBusinessSelector = () => {
		if (loadingBusinesses) {
			return <Skeleton.Button active style={{ width: 200 }} />;
		}

		if (!businesses || businesses.length === 0) {
			return (
				<Button type="primary" href="/dashboard/businesses/create">
					<PlusOutlined /> Create Your First Business
				</Button>
			);
		}

		return (
			<Select
				value={selectedBusinessId}
				onChange={handleBusinessChange}
				style={{ width: isMobile ? "100%" : 250 }}
				placeholder="Select a business"
				suffixIcon={<DownOutlined />}
			>
				{businesses.map((business) => (
					<Option key={business.id} value={business.id}>
						<Space>
							{business.type === BUSINESS_CONSTANTS.TYPES.SERVICE ? (
								<CustomerServiceOutlined />
							) : (
								<ShoppingOutlined />
							)}
							<span>{business.name}</span>
						</Space>
					</Option>
				))}
			</Select>
		);
	};

	const renderBusinessHeader = () => {
		if (!selectedBusiness) return null;

		return (
			<Card className="mb-4">
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
					<Space size="middle" className="w-full md:w-auto">
						<Avatar
							size={48}
							src={selectedBusiness.logo}
							icon={getDefaultIcon()}
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
										items: [
											...businesses.map((business) => ({
												key: business.id,
												icon:
													business.type === BUSINESS_CONSTANTS.TYPES.SERVICE ? (
														<CustomerServiceOutlined style={{ fontSize: 16 }} />
													) : (
														<ShoppingOutlined style={{ fontSize: 16 }} />
													),
												label:
													business.id === selectedBusinessId ? (
														<Text strong>{business.name}</Text>
													) : (
														business.name
													),
												onClick: () => handleBusinessChange(business.id),
											})),
											{ type: "divider" },
											{
												key: "add",
												icon: <PlusOutlined style={{ fontSize: 16 }} />,
												label: "Add New Business",
											},
										],
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
							<Text type="secondary" className="block mb-2">
								{selectedBusiness.description}
							</Text>
							<Space wrap size="small">
								<Tag color="blue" icon={getDefaultIcon()}>
									{selectedBusiness.type}
								</Tag>
								<Tag color="cyan">{selectedBusiness.category}</Tag>
								<Tag color="purple">{selectedBusiness.operationMode}</Tag>
							</Space>
						</div>
					</Space>
					<Space className="w-full md:w-auto justify-end">
						<Button type="primary" icon={<PlusOutlined />} block={isMobile}>
							Add{" "}
							{selectedBusiness.type === BUSINESS_CONSTANTS.TYPES.SERVICE
								? "Service"
								: "Product"}
						</Button>
					</Space>
				</div>
			</Card>
		);
	};

	const renderStatistics = () => {
		if (!selectedBusiness) return null;

		const isService =
			selectedBusiness.type === BUSINESS_CONSTANTS.TYPES.SERVICE;
		const totalItems = listings.length;

		let stats;
		if (isService) {
			const availableServices = listings.filter(
				(service) => service.isAvailable
			).length;
			const totalCompletedServices = listings.reduce(
				(sum, service) => sum + (service.completedServices || 0),
				0
			);
			const averageRating =
				listings.reduce((sum, service) => sum + (service.rating || 0), 0) /
					totalItems || 0;

			stats = [
				{
					title: "Total Services",
					value: totalItems,
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
					value: totalCompletedServices,
					prefix: (
						<TagOutlined style={{ fontSize: "24px", color: "#722ed1" }} />
					),
				},
				{
					title: "Average Rating",
					value: averageRating.toFixed(1),
					prefix: <StarFilled style={{ fontSize: "24px", color: "#faad14" }} />,
					suffix: "/ 5.0",
				},
			];
		} else {
			const inStockProducts = listings.filter((product) =>
				product.variants?.some((variant) => variant.stockQuantity > 0)
			).length;
			const totalValue = listings.reduce(
				(sum, product) =>
					sum +
					(product.variants?.reduce(
						(variantSum, variant) =>
							variantSum + (variant.price || 0) * (variant.stockQuantity || 0),
						0
					) || 0),
				0
			);

			stats = [
				{
					title: "Total Products",
					value: totalItems,
					prefix: (
						<TagOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
					),
				},
				{
					title: "In Stock Products",
					value: inStockProducts,
					prefix: (
						<CheckCircleOutlined
							style={{ fontSize: "24px", color: "#52c41a" }}
						/>
					),
				},
				{
					title: "Out of Stock",
					value: totalItems - inStockProducts,
					prefix: (
						<StopOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />
					),
				},
				{
					title: "Total Inventory Value",
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
						<Card
							hoverable
							style={{
								borderRadius: "12px",
								height: "100%",
							}}
						>
							<Statistic
								title={
									<Text strong style={{ fontSize: "16px", color: "#8c8c8c" }}>
										{stat.title}
									</Text>
								}
								value={stat.value}
								prefix={stat.prefix}
								suffix={stat.suffix}
								valueStyle={{
									fontSize: "24px",
									color: "#262626",
								}}
							/>
						</Card>
					</Col>
				))}
			</Row>
		);
	};

	const getFilteredListings = useCallback(() => {
		if (!listings) return [];
		const isService =
			selectedBusiness?.type === BUSINESS_CONSTANTS.TYPES.SERVICE;

		let filtered = listings;

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(item) =>
					item.name.toLowerCase().includes(query) ||
					item.description?.toLowerCase().includes(query) ||
					item.category?.toLowerCase().includes(query) ||
					(isService && item.serviceType?.toLowerCase().includes(query))
			);
		}

		// Apply category filter
		if (selectedCategories.length > 0) {
			filtered = filtered.filter((item) =>
				selectedCategories.includes(item.category)
			);
		}

		// Apply tab filter
		switch (activeTab) {
			case "in_stock":
				return isService
					? filtered.filter((item) => item.isAvailable)
					: filtered.filter((item) =>
							item.variants?.some((variant) => variant.stockQuantity > 0)
					  );
			case "out_of_stock":
				return isService
					? filtered.filter((item) => !item.isAvailable)
					: filtered.filter((item) =>
							item.variants?.every((variant) => variant.stockQuantity <= 0)
					  );
			case "featured":
				return filtered.filter((item) => item.metadata?.featured);
			default:
				return filtered;
		}
	}, [
		listings,
		activeTab,
		selectedBusiness?.type,
		searchQuery,
		selectedCategories,
	]);

	const handleViewProduct = (productId) => {
		const isService =
			selectedBusiness?.type === BUSINESS_CONSTANTS.TYPES.SERVICE;
		navigate(isService ? `/services/${productId}` : `/products/${productId}`);
	};

	const getTabItems = () => {
		const isService =
			selectedBusiness?.type === BUSINESS_CONSTANTS.TYPES.SERVICE;
		return [
			{
				key: "all",
				label: `All ${isService ? "Services" : "Products"}`,
				icon: isService ? <CustomerServiceOutlined /> : <ShoppingOutlined />,
			},
			{
				key: "in_stock",
				label: isService ? "Available" : "In Stock",
				icon: <CheckCircleOutlined />,
			},
			{
				key: "out_of_stock",
				label: isService ? "Unavailable" : "Out of Stock",
				icon: <StopOutlined />,
			},
			{
				key: "featured",
				label: "Featured",
				icon: <StarOutlined />,
			},
		];
	};

	const getEmptyStateMessage = () => {
		const isService =
			selectedBusiness?.type === BUSINESS_CONSTANTS.TYPES.SERVICE;

		switch (activeTab) {
			case "in_stock":
				return {
					message: isService ? "No available services" : "No products in stock",
					buttonText: `Add New ${isService ? "Service" : "Product"}`,
					description: isService
						? "Add services to your catalog to start offering them"
						: "Add products to your inventory to start selling",
				};
			case "out_of_stock":
				return {
					message: isService
						? "No unavailable services"
						: "No out of stock products",
					buttonText: `View All ${isService ? "Services" : "Products"}`,
					description: isService
						? "All your services are currently available"
						: "All your products are currently in stock",
				};
			case "featured":
				return {
					message: isService ? "No featured services" : "No featured products",
					buttonText: isService ? "Feature a Service" : "Feature a Product",
					description: `Feature your best ${
						isService ? "services" : "products"
					} to highlight them to customers`,
				};
			default:
				return {
					message: isService ? "No services found" : "No products found",
					buttonText: isService ? "Add Service" : "Add Product",
					description: `Start by adding your first ${
						isService ? "service" : "product"
					}`,
				};
		}
	};

	const getDefaultIcon = () => {
		const isService =
			selectedBusiness?.type === BUSINESS_CONSTANTS.TYPES.SERVICE;
		return isService ? (
			<CustomerServiceOutlined style={{ fontSize: 10, color: "#1890ff" }} />
		) : (
			<ShoppingOutlined style={{ fontSize: 14, color: "#1890ff" }} />
		);
	};

	const renderGridView = () => {
		const filteredListings = getFilteredListings();
		const isService =
			selectedBusiness?.type === BUSINESS_CONSTANTS.TYPES.SERVICE;

		return (
			<Row gutter={[16, 16]} className="mt-4">
				{filteredListings.map((item) => (
					<Col xs={24} sm={12} md={8} lg={6} key={item.id}>
						<Card
							hoverable
							style={{
								borderRadius: "12px",
								overflow: "hidden",
								height: "100%",
								display: "flex",
								flexDirection: "column",
							}}
							cover={
								<div
									style={{
										height: 200,
										background: "#f5f5f5",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										overflow: "hidden",
										position: "relative",
									}}
								>
									{item.media?.[0] ? (
										<>
											<img
												alt={item.name}
												src={item.media[0].url}
												style={{
													width: "100%",
													height: "100%",
													objectFit: "cover",
												}}
											/>
											{isService && (
												<div
													style={{
														position: "absolute",
														bottom: 0,
														left: 0,
														right: 0,
														background:
															"linear-gradient(transparent, rgba(0,0,0,0.7))",
														padding: "16px",
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
													}}
												>
													<Text
														strong
														style={{ color: "white", fontSize: "16px" }}
													>
														{formatCurrency(item.basePrice)}
														{item.maxPrice !== item.basePrice &&
															` - ${formatCurrency(item.maxPrice)}`}
													</Text>
													{item.estimatedCompletionTime && (
														<Tag color="blue" icon={<ClockCircleOutlined />}>
															{item.estimatedCompletionTime}
														</Tag>
													)}
												</div>
											)}
										</>
									) : (
										<div
											style={{
												background: "#f0f5ff",
												width: "100%",
												height: "100%",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											{getDefaultIcon()}
										</div>
									)}
									{item.metadata?.featured && (
										<Tag
											color="gold"
											style={{
												position: "absolute",
												top: 8,
												right: 8,
												borderRadius: "6px",
												padding: "4px 8px",
											}}
										>
											<StarFilled /> Featured
										</Tag>
									)}
									{isService && (
										<Tag
											color={item.isAvailable ? "success" : "error"}
											style={{
												position: "absolute",
												top: 8,
												left: 8,
												borderRadius: "6px",
												padding: "4px 8px",
											}}
										>
											{item.isAvailable ? (
												<>
													<CheckCircleOutlined /> Available
												</>
											) : (
												<>
													<StopOutlined /> Unavailable
												</>
											)}
										</Tag>
									)}
								</div>
							}
							bodyStyle={{
								padding: "16px",
								flex: 1,
								display: "flex",
								flexDirection: "column",
							}}
						>
							<div style={{ flex: 1 }}>
								<Space direction="vertical" size={2} style={{ width: "100%" }}>
									<Text strong style={{ fontSize: "16px", display: "block" }}>
										{item.name}
									</Text>
									<Space wrap size={4}>
										<Tag
											color="blue"
											icon={getDefaultIcon()}
											style={{
												borderRadius: "6px",
												padding: "4px 8px",
											}}
										>
											{item.category}
										</Tag>
										{isService && item.serviceType && (
											<Tag
												color="cyan"
												icon={<CustomerServiceOutlined />}
												style={{
													borderRadius: "6px",
													padding: "4px 8px",
												}}
											>
												{item.serviceType}
											</Tag>
										)}
									</Space>
									<Text
										type="secondary"
										style={{
											fontSize: "14px",
											display: "-webkit-box",
											WebkitLineClamp: 2,
											WebkitBoxOrient: "vertical",
											overflow: "hidden",
											margin: "8px 0",
											flex: 1,
										}}
									>
										{item.shortDescription || item.description}
									</Text>
								</Space>
							</div>

							{isService ? (
								<div
									className="mt-3 pt-3"
									style={{ borderTop: "1px solid #f0f0f0" }}
								>
									<Space
										direction="vertical"
										style={{ width: "100%" }}
										size={1}
									>
										<Space align="center">
											<Rate
												disabled
												value={item.rating}
												style={{ fontSize: "14px" }}
											/>
											<Text type="secondary">({item.reviewsCount})</Text>
										</Space>
										<Text type="secondary" style={{ fontSize: "13px" }}>
											{item.completedServices} services completed
										</Text>
									</Space>
								</div>
							) : (
								<div
									className="mt-3 pt-3"
									style={{ borderTop: "1px solid #f0f0f0" }}
								>
									<Space direction="vertical" style={{ width: "100%" }}>
										<Text strong style={{ fontSize: "16px" }}>
											{formatCurrency(
												item.variants?.reduce(
													(min, variant) => Math.min(min, variant.price || 0),
													Infinity
												) || 0
											)}
											{item.variants?.length > 1 && " - "}
											{item.variants?.length > 1 &&
												formatCurrency(
													item.variants?.reduce(
														(max, variant) => Math.max(max, variant.price || 0),
														0
													) || 0
												)}
										</Text>
										<Text type="secondary" style={{ fontSize: "13px" }}>
											{item.variants?.reduce(
												(sum, variant) => sum + (variant.stockQuantity || 0),
												0
											)}{" "}
											in stock
										</Text>
									</Space>
								</div>
							)}

							<div
								className="mt-3 pt-3"
								style={{ borderTop: "1px solid #f0f0f0" }}
							>
								<Space split={<Divider type="vertical" />}>
									<Tooltip title="View Details">
										<Button
											type="link"
											icon={<EyeOutlined />}
											onClick={() => handleViewProduct(item.id)}
										>
											View
										</Button>
									</Tooltip>
									<Tooltip title="Edit">
										<Button type="link" icon={<EditOutlined />}>
											Edit
										</Button>
									</Tooltip>
									<Dropdown
										menu={{
											items: [
												{
													key: "share",
													icon: <ShareAltOutlined />,
													label: "Share",
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
										<Button type="link" icon={<MoreOutlined />} />
									</Dropdown>
								</Space>
							</div>
						</Card>
					</Col>
				))}
			</Row>
		);
	};

	const renderSearchAndViewMode = () => (
		<div className="flex flex-col md:flex-row gap-4 mb-4">
			<div className="flex-1">
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex-1">
						<Input.Search
							placeholder={`Search ${
								selectedBusiness?.type === BUSINESS_CONSTANTS.TYPES.SERVICE
									? "services"
									: "products"
							}...`}
							allowClear
							onChange={(e) => setSearchQuery(e.target.value)}
							style={{ width: "100%" }}
							prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
						/>
					</div>
					<Select
						mode="multiple"
						allowClear
						style={{ minWidth: 200, maxWidth: "100%" }}
						placeholder="Filter by categories"
						value={selectedCategories}
						onChange={setSelectedCategories}
						options={(selectedBusiness?.type ===
						BUSINESS_CONSTANTS.TYPES.SERVICE
							? BUSINESS_CONSTANTS.SERVICE_CATEGORIES
							: BUSINESS_CONSTANTS.PRODUCT_CATEGORIES
						).map((category) => ({
							label: category,
							value: category,
						}))}
						maxTagCount="responsive"
						suffixIcon={<FilterOutlined />}
					/>
				</div>
				{selectedCategories.length > 0 && (
					<div className="mt-2">
						<Text type="secondary" className="mr-2">
							{selectedCategories.length}{" "}
							{selectedCategories.length === 1 ? "filter" : "filters"} applied
						</Text>
						<Button
							type="link"
							size="small"
							onClick={() => setSelectedCategories([])}
						>
							Clear all
						</Button>
					</div>
				)}
			</div>
			<Space className="md:ml-4">
				<Tooltip title="Grid View">
					<Button
						icon={<AppstoreOutlined />}
						type={viewMode === "grid" ? "primary" : "default"}
						onClick={() => setViewMode("grid")}
					/>
				</Tooltip>
				<Tooltip title="Table View">
					<Button
						icon={<UnorderedListOutlined />}
						type={viewMode === "table" ? "primary" : "default"}
						onClick={() => setViewMode("table")}
					/>
				</Tooltip>
			</Space>
		</div>
	);

	return (
		<div className="p-4 md:p-6">
			{selectedBusiness && (
				<>
					{renderBusinessHeader()}
					{renderStatistics()}

					<Card>
						{renderSearchAndViewMode()}

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
						) : getFilteredListings().length === 0 ? (
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
										<Button
											type="primary"
											icon={
												selectedBusiness?.type ===
												BUSINESS_CONSTANTS.TYPES.SERVICE ? (
													<CustomerServiceOutlined />
												) : (
													<PlusOutlined />
												)
											}
										>
											{getEmptyStateMessage().buttonText}
										</Button>
									</Space>
								}
							/>
						) : viewMode === "table" ? (
							<div className="overflow-x-auto">
								<Table
									columns={columns}
									dataSource={getFilteredListings()}
									rowKey="id"
									pagination={{ pageSize: 10 }}
									scroll={{ x: true }}
								/>
							</div>
						) : (
							renderGridView()
						)}
					</Card>
				</>
			)}
			{!selectedBusiness && !loadingBusinesses && (
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

export default ListingsManager;
