import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Card,
	Typography,
	Space,
	Image,
	Descriptions,
	Tag,
	Button,
	Divider,
	Row,
	Col,
	Carousel,
	Statistic,
	Table,
	Empty,
	Skeleton,
	message,
	Collapse,
	Badge,
	Tooltip,
} from "antd";
import {
	ShoppingOutlined,
	TagOutlined,
	CheckCircleOutlined,
	StopOutlined,
	ArrowLeftOutlined,
	DollarOutlined,
	EditOutlined,
	SettingOutlined,
	LinkOutlined,
	WarningOutlined,
	InfoCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useBusiness } from "../../Context/BusinessContext";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const ProductDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { selectedBusiness } = useBusiness();

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				setLoading(true);
				const response = await axios.get(`/products/${id}`);
				if (response.data?.success) {
					setProduct(response.data.data);
				} else {
					throw new Error(response.data?.message || "Failed to fetch product");
				}
			} catch (error) {
				setError(error.message);
				message.error(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchProduct();
	}, [id]);

	const handleGoBack = () => {
		navigate(-1);
	};

	const handleEdit = () => {
		navigate(`/products/${id}/edit`);
	};

	const formatCurrency = (amount, currency = "USD") => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency,
		}).format(amount);
	};

	if (loading) {
		return (
			<Card className="m-4">
				<Skeleton active avatar paragraph={{ rows: 4 }} />
			</Card>
		);
	}

	if (error || !product) {
		return (
			<Card className="m-4">
				<Empty
					description={
						<Text type="danger">Error loading product: {error}</Text>
					}
				>
					<Button type="primary" onClick={handleGoBack}>
						Go Back
					</Button>
				</Empty>
			</Card>
		);
	}

	const variantColumns = [
		{
			title: "SKU",
			dataIndex: "sku",
			key: "sku",
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			render: (price, record) => formatCurrency(price, record.currency),
		},
		{
			title: "Stock",
			dataIndex: "stockQuantity",
			key: "stockQuantity",
			render: (stock) => (
				<Tag color={stock > 0 ? "success" : "error"}>
					{stock > 0 ? `${stock} in stock` : "Out of stock"}
				</Tag>
			),
		},
		{
			title: "Status",
			key: "status",
			render: (_, record) => (
				<Space>
					{record.isActive ? (
						<Tag color="success">Active</Tag>
					) : (
						<Tag color="error">Inactive</Tag>
					)}
					{record.availability?.preOrder && (
						<Tag color="processing">Pre-order</Tag>
					)}
				</Space>
			),
		},
	];

	return (
		<div className="p-4">
			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				{/* Header */}
				<Space className="w-full justify-between">
					<Button icon={<ArrowLeftOutlined />} onClick={handleGoBack}>
						Back to Products
					</Button>
					<Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
						Edit Product
					</Button>
				</Space>

				<Row gutter={[24, 24]}>
					{/* Product Media */}
					<Col xs={24} lg={8}>
						<Space direction="vertical" size="large" style={{ width: "100%" }}>
							<Card title="Product Images">
								{product.media && product.media.length > 0 ? (
									<Carousel>
										{product.media.map((url, index) => (
											<div key={index}>
												<Image
													src={url}
													alt={`${product.name} - ${index + 1}`}
													style={{
														width: "100%",
														height: "300px",
														objectFit: "cover",
													}}
												/>
											</div>
										))}
									</Carousel>
								) : (
									<Empty description="No images available" />
								)}
							</Card>

							{product.videoReviewUrl && (
								<Card title="Video Review">
									<Button
										type="primary"
										icon={<LinkOutlined />}
										href={product.videoReviewUrl}
										target="_blank"
									>
										Watch Video Review
									</Button>
								</Card>
							)}
						</Space>
					</Col>

					{/* Product Details */}
					<Col xs={24} lg={16}>
						<Space direction="vertical" size="large" style={{ width: "100%" }}>
							<Card>
								<Space
									direction="vertical"
									size="large"
									style={{ width: "100%" }}
								>
									<div>
										<Space align="center">
											<Title level={2} style={{ margin: 0 }}>
												{product.name}
											</Title>
											<Space>
												{product.isInStock ? (
													<Tag color="success" icon={<CheckCircleOutlined />}>
														In Stock
													</Tag>
												) : (
													<Tag color="error" icon={<StopOutlined />}>
														Out of Stock
													</Tag>
												)}
											</Space>
										</Space>
										<Space wrap style={{ marginTop: 8 }}>
											<Tag color="blue" icon={<TagOutlined />}>
												{product.category}
											</Tag>
											<Tag color="purple" icon={<ShoppingOutlined />}>
												{product.brand}
											</Tag>
											{product.tags?.map((tag) => (
												<Tag key={tag}>{tag}</Tag>
											))}
										</Space>
									</div>

									<Divider />

									<Collapse defaultActiveKey={["1"]} expandIconPosition="end">
										<Panel header="Description" key="1">
											<Paragraph>{product.description}</Paragraph>
											<Paragraph type="secondary">
												{product.shortDescription}
											</Paragraph>
										</Panel>

										<Panel header="Variants" key="2">
											<Table
												dataSource={product.variants}
												columns={variantColumns}
												pagination={false}
												rowKey="id"
											/>
										</Panel>

										<Panel header="Variant Details" key="3">
											{product.variants.map((variant) => (
												<Card
													key={variant.id}
													title={`${variant.name} (${variant.sku})`}
													style={{ marginBottom: 16 }}
													extra={
														<Space>
															{variant.isActive ? (
																<Tag color="success">Active</Tag>
															) : (
																<Tag color="error">Inactive</Tag>
															)}
														</Space>
													}
												>
													<Descriptions column={2}>
														<Descriptions.Item label="Color">
															{variant.color || "-"}
														</Descriptions.Item>
														<Descriptions.Item label="Size">
															{variant.size || "-"}
														</Descriptions.Item>
														<Descriptions.Item label="Weight">
															{variant.weight ? `${variant.weight} kg` : "-"}
														</Descriptions.Item>
														<Descriptions.Item label="Dimensions">
															{variant.dimensions || "-"}
														</Descriptions.Item>
														<Descriptions.Item label="Material">
															{variant.material || "-"}
														</Descriptions.Item>
													</Descriptions>

													<Divider />

													<Row gutter={[16, 16]}>
														<Col span={8}>
															<Card size="small">
																<Statistic
																	title="Price"
																	value={variant.price}
																	prefix={<DollarOutlined />}
																	formatter={(value) =>
																		formatCurrency(value, variant.currency)
																	}
																/>
															</Card>
														</Col>
														<Col span={8}>
															<Card size="small">
																<Statistic
																	title="Stock"
																	value={variant.stockQuantity}
																	prefix={<ShoppingOutlined />}
																/>
															</Card>
														</Col>
														<Col span={8}>
															<Card size="small">
																<Statistic
																	title="Tax Rate"
																	value={variant.tax.rate}
																	suffix="%"
																/>
															</Card>
														</Col>
													</Row>

													{variant.discount.amount > 0 && (
														<>
															<Divider />
															<Title level={5}>Discount</Title>
															<Descriptions column={2}>
																<Descriptions.Item label="Type">
																	{variant.discount.type}
																</Descriptions.Item>
																<Descriptions.Item label="Amount">
																	{variant.discount.type === "fixed"
																		? formatCurrency(
																				variant.discount.amount,
																				variant.currency
																		  )
																		: `${variant.discount.amount}%`}
																</Descriptions.Item>
																{variant.discount.startDate && (
																	<Descriptions.Item label="Start Date">
																		{new Date(
																			variant.discount.startDate
																		).toLocaleDateString()}
																	</Descriptions.Item>
																)}
																{variant.discount.endDate && (
																	<Descriptions.Item label="End Date">
																		{new Date(
																			variant.discount.endDate
																		).toLocaleDateString()}
																	</Descriptions.Item>
																)}
															</Descriptions>
														</>
													)}

													{variant.warranty && variant.warranty.period > 0 && (
														<>
															<Divider />
															<Title level={5}>Warranty</Title>
															<Descriptions column={1}>
																<Descriptions.Item label="Period">
																	{variant.warranty.period} months
																</Descriptions.Item>
																<Descriptions.Item label="Terms">
																	{variant.warranty.terms || "-"}
																</Descriptions.Item>
																{variant.warranty.registrationRequired && (
																	<Descriptions.Item label="Registration">
																		<Tag color="warning">
																			Registration Required
																		</Tag>
																	</Descriptions.Item>
																)}
															</Descriptions>
														</>
													)}
												</Card>
											))}
										</Panel>
									</Collapse>
								</Space>
							</Card>
						</Space>
					</Col>
				</Row>
			</Space>
		</div>
	);
};

export default ProductDetails;
