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
	Timeline,
	Empty,
	Skeleton,
	message,
	Table,
	List,
	Collapse,
	Badge,
	Tooltip,
} from "antd";
import {
	CustomerServiceOutlined,
	TagOutlined,
	CheckCircleOutlined,
	StopOutlined,
	ArrowLeftOutlined,
	ClockCircleOutlined,
	CalendarOutlined,
	EditOutlined,
	StarFilled,
	FileTextOutlined,
	LinkOutlined,
	FieldTimeOutlined,
	DollarOutlined,
	TeamOutlined,
	SettingOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useBusiness } from "../../Context/BusinessContext";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const ServiceDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [service, setService] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { selectedBusiness } = useBusiness();

	useEffect(() => {
		const fetchService = async () => {
			try {
				setLoading(true);
				const response = await axios.get(`/services/${id}`);
				if (response.data?.success) {
					setService(response.data.data);
				} else {
					throw new Error(response.data?.message || "Failed to fetch service");
				}
			} catch (error) {
				setError(error.message);
				message.error(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchService();
	}, [id]);

	const handleGoBack = () => {
		navigate(-1);
	};

	const handleEdit = () => {
		navigate(`/services/${id}/edit`);
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

	if (error || !service) {
		return (
			<Card className="m-4">
				<Empty
					description={
						<Text type="danger">Error loading service: {error}</Text>
					}
				>
					<Button type="primary" onClick={handleGoBack}>
						Go Back
					</Button>
				</Empty>
			</Card>
		);
	}

	const renderAvailabilitySchedule = () => {
		const days = [
			"monday",
			"tuesday",
			"wednesday",
			"thursday",
			"friday",
			"saturday",
			"sunday",
		];
		return (
			<List
				size="small"
				dataSource={days}
				renderItem={(day) => {
					const schedule = service.availability[day];
					return (
						<List.Item>
							<Text style={{ textTransform: "capitalize", width: 100 }}>
								{day}:
							</Text>
							{schedule ? (
								<Text>
									{schedule.start} - {schedule.end}
								</Text>
							) : (
								<Text type="secondary">Closed</Text>
							)}
						</List.Item>
					);
				}}
			/>
		);
	};

	return (
		<div className="p-4">
			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				{/* Header */}
				<Space className="w-full justify-between">
					<Button icon={<ArrowLeftOutlined />} onClick={handleGoBack}>
						Back to Services
					</Button>
					<Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
						Edit Service
					</Button>
				</Space>

				<Row gutter={[24, 24]}>
					{/* Service Media */}
					<Col xs={24} lg={8}>
						<Space direction="vertical" size="large" style={{ width: "100%" }}>
							<Card title="Media Gallery">
								{service.media && service.media.length > 0 ? (
									<Carousel>
										{service.media.map((item, index) => (
											<div key={index}>
												{item.type === "image" ? (
													<Image
														src={item.url}
														alt={item.alt || `${service.name} - ${index + 1}`}
														style={{
															width: "100%",
															height: "300px",
															objectFit: "cover",
														}}
													/>
												) : (
													<div style={{ position: "relative" }}>
														<Image
															src={item.thumbnail}
															alt="Video thumbnail"
															style={{
																width: "100%",
																height: "300px",
																objectFit: "cover",
															}}
														/>
														<div
															style={{
																position: "absolute",
																top: "50%",
																left: "50%",
																transform: "translate(-50%, -50%)",
															}}
														>
															<Button
																type="primary"
																icon={<LinkOutlined />}
																href={item.url}
																target="_blank"
															>
																Watch Video
															</Button>
														</div>
													</div>
												)}
											</div>
										))}
									</Carousel>
								) : (
									<Empty description="No media available" />
								)}
							</Card>

							<Card title="Documents">
								<List
									dataSource={service.documents}
									renderItem={(doc) => (
										<List.Item>
											<Button
												type="link"
												icon={<FileTextOutlined />}
												href={doc.url}
												target="_blank"
											>
												{doc.name}
											</Button>
										</List.Item>
									)}
								/>
							</Card>

							<Card title="Availability Schedule">
								{renderAvailabilitySchedule()}
							</Card>
						</Space>
					</Col>

					{/* Service Details */}
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
												{service.name}
											</Title>
											{service.metadata?.featured && (
												<Badge.Ribbon text="Featured" color="gold" />
											)}
										</Space>
										<Space wrap style={{ marginTop: 8 }}>
											<Tag color="blue" icon={<TagOutlined />}>
												{service.category}
											</Tag>
											<Tag color="cyan" icon={<CustomerServiceOutlined />}>
												{service.serviceType}
											</Tag>
											{service.tags?.map((tag) => (
												<Tag key={tag}>{tag}</Tag>
											))}
										</Space>
									</div>

									<Descriptions column={2}>
										<Descriptions.Item label="Status">
											{service.isAvailable ? (
												<Tag color="success" icon={<CheckCircleOutlined />}>
													Available
												</Tag>
											) : (
												<Tag color="error" icon={<StopOutlined />}>
													Unavailable
												</Tag>
											)}
										</Descriptions.Item>
										<Descriptions.Item label="Service Type">
											<Tag icon={<SettingOutlined />}>
												{service.serviceType}{" "}
												{service.recurringInterval &&
													`(${service.recurringInterval})`}
											</Tag>
										</Descriptions.Item>
										<Descriptions.Item label="Duration">
											<Tag icon={<FieldTimeOutlined />}>
												{service.duration} days
											</Tag>
										</Descriptions.Item>
										<Descriptions.Item label="Max Clients">
											<Tag icon={<TeamOutlined />}>
												{service.maxClientsPerSlot} per slot
											</Tag>
										</Descriptions.Item>
									</Descriptions>

									<Divider />

									<Row gutter={[16, 16]}>
										<Col span={8}>
											<Statistic
												title="Base Price"
												value={service.basePrice}
												prefix={<DollarOutlined />}
												formatter={(value) =>
													formatCurrency(value, service.currency)
												}
											/>
										</Col>
										<Col span={8}>
											<Statistic
												title="Max Price"
												value={service.maxPrice}
												prefix={<DollarOutlined />}
												formatter={(value) =>
													formatCurrency(value, service.currency)
												}
											/>
										</Col>
										<Col span={8}>
											<Statistic
												title="Rating"
												value={service.rating}
												prefix={<StarFilled style={{ color: "#faad14" }} />}
												suffix={`(${service.reviewsCount} reviews)`}
											/>
										</Col>
									</Row>

									<Divider />

									<Collapse defaultActiveKey={["1"]} expandIconPosition="end">
										<Panel header="Description" key="1">
											<Paragraph>{service.description}</Paragraph>
											<Paragraph type="secondary">
												{service.shortDescription}
											</Paragraph>
										</Panel>

										<Panel header="Deliverables" key="2">
											<List
												dataSource={service.deliverables}
												renderItem={(item) => (
													<List.Item>
														<Text>{item}</Text>
													</List.Item>
												)}
											/>
										</Panel>

										<Panel header="Requirements" key="3">
											<List
												dataSource={service.requirements}
												renderItem={(item) => (
													<List.Item>
														<Text>{item}</Text>
													</List.Item>
												)}
											/>
										</Panel>

										<Panel header="Service Packages" key="4">
											{service.packages.map((pkg, index) => (
												<Card
													key={index}
													title={pkg.name}
													style={{ marginBottom: 16 }}
												>
													<Descriptions column={1}>
														<Descriptions.Item label="Price">
															{formatCurrency(pkg.price, service.currency)}
														</Descriptions.Item>
														<Descriptions.Item label="Description">
															{pkg.items[0].description}
														</Descriptions.Item>
													</Descriptions>
													<Divider />
													<Title level={5}>Features</Title>
													<List
														dataSource={pkg.features}
														renderItem={(feature) => (
															<List.Item>
																<Text>{feature}</Text>
															</List.Item>
														)}
													/>
												</Card>
											))}
										</Panel>

										<Panel header="Customization Options" key="5">
											<List
												dataSource={service.customizationOptions}
												renderItem={(option) => (
													<List.Item>
														<List.Item.Meta
															title={option.name}
															description={option.description}
														/>
														<Text strong>
															{formatCurrency(option.price, service.currency)}
														</Text>
													</List.Item>
												)}
											/>
										</Panel>

										<Panel header="Milestones" key="6">
											<Timeline mode="left">
												{service.milestones.map((milestone, index) => (
													<Timeline.Item
														key={index}
														label={`${milestone.timeline.duration} ${milestone.timeline.unit}`}
													>
														<Card size="small" title={milestone.name}>
															<Text>{milestone.description}</Text>
															<Divider />
															<Text strong>Deliverables:</Text>
															<List
																size="small"
																dataSource={milestone.deliverables}
																renderItem={(item) => (
																	<List.Item>{item}</List.Item>
																)}
															/>
															<Divider />
															<Tag color="blue">
																Payment: {milestone.percentagePayment}%
															</Tag>
														</Card>
													</Timeline.Item>
												))}
											</Timeline>
										</Panel>

										<Panel header="SEO Metadata" key="7">
											<Descriptions column={1}>
												<Descriptions.Item label="Title">
													{service.seoMetadata.title}
												</Descriptions.Item>
												<Descriptions.Item label="Description">
													{service.seoMetadata.description}
												</Descriptions.Item>
												<Descriptions.Item label="Keywords">
													{service.seoMetadata.keywords.map((keyword) => (
														<Tag key={keyword}>{keyword}</Tag>
													))}
												</Descriptions.Item>
											</Descriptions>
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

export default ServiceDetails;
