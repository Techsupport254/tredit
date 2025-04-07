import React from "react";
import {
	Card,
	Row,
	Col,
	Typography,
	Space,
	Tag,
	Descriptions,
	Steps,
	Button,
	Divider,
	Badge,
	Alert,
	Timeline,
	Avatar,
} from "antd";
import {
	UserOutlined,
	PhoneOutlined,
	MailOutlined,
	DollarOutlined,
	LockOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ServiceOrderDetails = () => {
	const { orderId } = useParams();

	// Mock data - In real app, fetch based on orderId
	const orderDetails = {
		id: "1",
		serviceId: "ab83d18c-4be1-4b2c-848b-0009d5dc16a4",
		serviceName: "Web Development Service",
		category: "Web Development",
		status: "in_progress",
		description: "Professional web development services for businesses",
		clientName: "James Wilson",
		clientEmail: "james.w@email.com",
		clientPhone: "+1 (555) 123-4567",
		selectedPackage: {
			name: "Professional",
			price: 799.99,
			features: [
				"10 pages",
				"Advanced SEO",
				"Custom animations",
				"E-commerce integration",
				"Analytics setup",
			],
		},
		customizationOptions: [
			{
				name: "E-commerce Integration",
				price: 199.99,
			},
			{
				name: "Custom Features",
				price: 299.99,
			},
		],
		totalPrice: 1299.97,
		paidAmount: 649.99,
		escrowAmount: 649.99,
		milestones: [
			{
				name: "Planning",
				status: "completed",
				price: 259.99,
				released: true,
				completionDate: "2024-03-25",
				description: "Initial consultation and project planning",
				deliverables: ["Project scope document", "Wireframes", "Timeline"],
			},
			{
				name: "Design",
				status: "in_progress",
				price: 389.99,
				released: false,
				startDate: "2024-03-26",
				description: "Website design and mockup creation",
				deliverables: ["Design mockups", "Style guide", "Component library"],
			},
			{
				name: "Development",
				status: "pending",
				price: 389.99,
				released: false,
				description: "Website development and implementation",
				deliverables: [
					"Functional website",
					"Mobile responsiveness",
					"Basic SEO",
				],
			},
			{
				name: "Testing",
				status: "pending",
				price: 259.99,
				released: false,
				description: "Quality assurance and testing",
				deliverables: ["Test reports", "Performance metrics", "Security audit"],
			},
		],
		startDate: "2024-03-25",
		estimatedEndDate: "2024-04-08",
	};

	const getStatusColor = (status) => {
		switch (status.toLowerCase()) {
			case "completed":
				return "success";
			case "in_progress":
				return "processing";
			case "pending":
				return "default";
			default:
				return "default";
		}
	};

	return (
		<div className="p-6">
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Space className="w-full justify-between">
						<Space direction="vertical" size={0}>
							<Title level={2}>{orderDetails.serviceName}</Title>
							<Space>
								<Tag color="blue">{orderDetails.category}</Tag>
								<Tag color="orange">
									{orderDetails.status.replace("_", " ").toUpperCase()}
								</Tag>
							</Space>
						</Space>
					</Space>
				</Col>

				{/* Client Information */}
				<Col span={8}>
					<Card title="Client Information">
						<Space direction="vertical" className="w-full">
							<Space>
								<Avatar size="large" icon={<UserOutlined />} />
								<Space direction="vertical" size={0}>
									<Text strong>{orderDetails.clientName}</Text>
									<Space>
										<MailOutlined />
										<Text>{orderDetails.clientEmail}</Text>
									</Space>
									<Space>
										<PhoneOutlined />
										<Text>{orderDetails.clientPhone}</Text>
									</Space>
								</Space>
							</Space>
						</Space>
					</Card>
				</Col>

				{/* Payment Summary */}
				<Col span={8}>
					<Card title="Payment Summary">
						<Space direction="vertical" className="w-full">
							<Descriptions column={1}>
								<Descriptions.Item label="Total Price">
									<Text strong>${orderDetails.totalPrice}</Text>
								</Descriptions.Item>
								<Descriptions.Item label="Paid Amount">
									<Badge
										status="success"
										text={`$${orderDetails.paidAmount}`}
									/>
								</Descriptions.Item>
								<Descriptions.Item label="In Escrow">
									<Badge
										status="processing"
										text={`$${orderDetails.escrowAmount}`}
									/>
								</Descriptions.Item>
							</Descriptions>
						</Space>
					</Card>
				</Col>

				{/* Timeline */}
				<Col span={8}>
					<Card title="Timeline">
						<Space direction="vertical" className="w-full">
							<Descriptions column={1}>
								<Descriptions.Item label="Start Date">
									{dayjs(orderDetails.startDate).format("MMM D, YYYY")}
								</Descriptions.Item>
								<Descriptions.Item label="Estimated Completion">
									{dayjs(orderDetails.estimatedEndDate).format("MMM D, YYYY")}
								</Descriptions.Item>
								<Descriptions.Item label="Duration">
									{dayjs(orderDetails.estimatedEndDate).diff(
										orderDetails.startDate,
										"day"
									)}{" "}
									days
								</Descriptions.Item>
							</Descriptions>
						</Space>
					</Card>
				</Col>

				{/* Milestones */}
				<Col span={24}>
					<Card title="Milestones & Payments">
						<Timeline mode="left">
							{orderDetails.milestones.map((milestone, index) => (
								<Timeline.Item
									key={index}
									color={getStatusColor(milestone.status)}
									label={
										<Space direction="vertical" size={0}>
											<Text strong>${milestone.price}</Text>
											{milestone.completionDate && (
												<Text type="secondary">
													Completed:{" "}
													{dayjs(milestone.completionDate).format(
														"MMM D, YYYY"
													)}
												</Text>
											)}
										</Space>
									}
								>
									<Card size="small" className="mb-4">
										<Space direction="vertical" className="w-full">
											<Space className="w-full justify-between">
												<Text strong>{milestone.name}</Text>
												<Space>
													<Tag color={getStatusColor(milestone.status)}>
														{milestone.status.toUpperCase()}
													</Tag>
													{milestone.released ? (
														<Tag icon={<CheckCircleOutlined />} color="success">
															Payment Released
														</Tag>
													) : (
														<Tag icon={<LockOutlined />} color="processing">
															In Escrow
														</Tag>
													)}
												</Space>
											</Space>
											<Text type="secondary">{milestone.description}</Text>
											<Divider orientation="left" plain>
												Deliverables
											</Divider>
											<Space wrap>
												{milestone.deliverables.map((deliverable, idx) => (
													<Tag key={idx}>{deliverable}</Tag>
												))}
											</Space>
											{milestone.status === "completed" &&
												!milestone.released && (
													<Button type="primary" icon={<DollarOutlined />}>
														Release Payment
													</Button>
												)}
										</Space>
									</Card>
								</Timeline.Item>
							))}
						</Timeline>
					</Card>
				</Col>

				{/* Package Details */}
				<Col span={12}>
					<Card title="Selected Package">
						<Space direction="vertical" className="w-full">
							<Space className="w-full justify-between">
								<Text strong>{orderDetails.selectedPackage.name}</Text>
								<Text>${orderDetails.selectedPackage.price}</Text>
							</Space>
							<Divider />
							<Space wrap>
								{orderDetails.selectedPackage.features.map((feature, index) => (
									<Tag key={index} color="blue">
										{feature}
									</Tag>
								))}
							</Space>
						</Space>
					</Card>
				</Col>

				{/* Customizations */}
				<Col span={12}>
					<Card title="Customization Options">
						<Space direction="vertical" className="w-full">
							{orderDetails.customizationOptions.map((option, index) => (
								<Space key={index} className="w-full justify-between">
									<Text>{option.name}</Text>
									<Text>${option.price}</Text>
								</Space>
							))}
						</Space>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default ServiceOrderDetails;
