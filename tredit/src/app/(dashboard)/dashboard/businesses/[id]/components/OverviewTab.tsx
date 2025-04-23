import {
	Card,
	Col,
	Descriptions,
	Empty,
	List,
	Row,
	Statistic,
	Typography,
	Divider,
	Space,
	Tag,
	Button,
	Input,
	message,
	Tooltip,
} from "antd";
import {
	FileTextOutlined,
	StarOutlined,
	ShopOutlined,
	TeamOutlined,
	GlobalOutlined,
	PhoneOutlined,
	MailOutlined,
	EnvironmentOutlined,
	BankOutlined,
	CopyOutlined,
	ShareAltOutlined,
	FacebookOutlined,
	TwitterOutlined,
	LinkedinOutlined,
	WhatsAppOutlined,
	LinkOutlined,
} from "@ant-design/icons";
import { Business, Product, Service, Order } from "../page";
import { generateShareableLink } from "@/lib/utils/url";
import { useState, useEffect } from "react";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface OverviewTabProps {
	business: Business;
	products: Product[];
	services: Service[];
	orders: Order[];
}

export default function OverviewTab({
	business,
	products,
	services,
	orders,
}: OverviewTabProps) {
	const [shareableLink, setShareableLink] = useState<string>("");

	useEffect(() => {
		setShareableLink(
			generateShareableLink(business.id, business.name, business.type)
		);
	}, [business.id, business.name, business.type]);

	const handleCopyLink = () => {
		if (shareableLink) {
			navigator.clipboard.writeText(shareableLink);
			message.success("Link copied to clipboard!");
		}
	};

	const handleShare = async () => {
		if (!shareableLink) return;

		if (navigator.share) {
			try {
				await navigator.share({
					title: business.name,
					text: `Check out ${business.name} on our platform!`,
					url: shareableLink,
				});
			} catch (error) {
				console.error("Error sharing:", error);
			}
		}
	};

	const socialShareLinks = {
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
			shareableLink
		)}`,
		twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
			shareableLink
		)}&text=${encodeURIComponent(
			`Check out ${business.name} on our platform!`
		)}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
			shareableLink
		)}`,
		whatsapp: `https://wa.me/?text=${encodeURIComponent(
			`Check out ${business.name} on our platform! ${shareableLink}`
		)}`,
	};

	return (
		<div className="space-y-6">
			{/* Shareable Profile */}
			<Card className="overflow-hidden">
				<div className="relative">
					{/* Header with gradient background */}
					<div className="h-40 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center">
						<div className="text-center text-white">
							<Title level={3} className="!text-white !mb-2">
								Share Your Business
							</Title>
							<Text className="text-white/80">
								Share your business profile with customers and partners
							</Text>
						</div>
					</div>

					{/* Content */}
					<div className="p-6">
						{/* Link Section */}
						<div className="bg-gray-50 rounded-lg p-4 mb-6">
							<div className="flex items-center gap-2 mb-2">
								<LinkOutlined className="text-blue-500" />
								<Text strong>Your Business Link</Text>
							</div>
							<div className="flex gap-2">
								<Input
									value={shareableLink}
									readOnly
									className="flex-1"
									suffix={
										<Tooltip title="Copy link">
											<Button
												type="text"
												icon={<CopyOutlined />}
												onClick={handleCopyLink}
												className="hover:text-blue-500"
											/>
										</Tooltip>
									}
								/>
							</div>
							<Text type="secondary" className="text-sm mt-2 block">
								This link will take visitors directly to your store page
							</Text>
						</div>

						{/* Share Buttons */}
						<div className="space-y-4">
							<div className="text-center">
								<Button
									type="primary"
									icon={<ShareAltOutlined />}
									onClick={handleShare}
									className="bg-blue-500 hover:bg-blue-600 h-11 px-8 text-base shadow-lg hover:shadow-xl transition-all duration-200"
									size="large"
								>
									Share Profile
								</Button>
							</div>

							<Divider>
								<Text type="secondary" className="text-sm">
									Or share on social media
								</Text>
							</Divider>

							<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
								<Tooltip title="Share on Facebook">
									<Button
										type="primary"
										icon={<FacebookOutlined />}
										onClick={() =>
											window.open(socialShareLinks.facebook, "_blank")
										}
										className="bg-blue-600 hover:bg-blue-700 h-11 shadow-md hover:shadow-lg transition-all duration-200"
										block
									>
										Facebook
									</Button>
								</Tooltip>
								<Tooltip title="Share on Twitter">
									<Button
										type="primary"
										icon={<TwitterOutlined />}
										onClick={() =>
											window.open(socialShareLinks.twitter, "_blank")
										}
										className="bg-sky-500 hover:bg-sky-600 h-11 shadow-md hover:shadow-lg transition-all duration-200"
										block
									>
										Twitter
									</Button>
								</Tooltip>
								<Tooltip title="Share on LinkedIn">
									<Button
										type="primary"
										icon={<LinkedinOutlined />}
										onClick={() =>
											window.open(socialShareLinks.linkedin, "_blank")
										}
										className="bg-blue-700 hover:bg-blue-800 h-11 shadow-md hover:shadow-lg transition-all duration-200"
										block
									>
										LinkedIn
									</Button>
								</Tooltip>
								<Tooltip title="Share on WhatsApp">
									<Button
										type="primary"
										icon={<WhatsAppOutlined />}
										onClick={() =>
											window.open(socialShareLinks.whatsapp, "_blank")
										}
										className="bg-green-500 hover:bg-green-600 h-11 shadow-md hover:shadow-lg transition-all duration-200"
										block
									>
										WhatsApp
									</Button>
								</Tooltip>
							</div>
						</div>
					</div>
				</div>
			</Card>

			{/* Basic Information */}
			<Card>
				<Title level={4} className="!mb-6">
					Basic Information
				</Title>
				<Row gutter={[24, 24]}>
					<Col xs={24} md={12}>
						<Descriptions column={1}>
							<Descriptions.Item
								label={
									<Space>
										<ShopOutlined />
										<Text>Business Type</Text>
									</Space>
								}
							>
								<Tag color="blue" className="uppercase">
									{business.type}
								</Tag>
							</Descriptions.Item>
							<Descriptions.Item
								label={
									<Space>
										<BankOutlined />
										<Text>Category</Text>
									</Space>
								}
							>
								{business.category}
							</Descriptions.Item>
							<Descriptions.Item
								label={
									<Space>
										<TeamOutlined />
										<Text>Employees</Text>
									</Space>
								}
							>
								{business.employeeCount}
							</Descriptions.Item>
						</Descriptions>
					</Col>
					<Col xs={24} md={12}>
						<Descriptions column={1}>
							<Descriptions.Item
								label={
									<Space>
										<StarOutlined />
										<Text>Rating</Text>
									</Space>
								}
							>
								{business.averageRating.toFixed(1)} ({business.reviewCount}{" "}
								reviews)
							</Descriptions.Item>
							<Descriptions.Item
								label={
									<Space>
										<ShopOutlined />
										<Text>Products/Services</Text>
									</Space>
								}
							>
								{business.type === "PRODUCT"
									? products.length
									: services.length}{" "}
								items
							</Descriptions.Item>
							<Descriptions.Item
								label={
									<Space>
										<ShopOutlined />
										<Text>Orders</Text>
									</Space>
								}
							>
								{orders.length} orders
							</Descriptions.Item>
						</Descriptions>
					</Col>
				</Row>
			</Card>

			{/* Contact Information */}
			<Card>
				<Title level={4} className="!mb-6">
					Contact Information
				</Title>
				<Row gutter={[24, 24]}>
					<Col xs={24} md={12}>
						<Descriptions column={1}>
							<Descriptions.Item
								label={
									<Space>
										<MailOutlined />
										<Text>Email</Text>
									</Space>
								}
							>
								{business.email}
							</Descriptions.Item>
							<Descriptions.Item
								label={
									<Space>
										<PhoneOutlined />
										<Text>Phone</Text>
									</Space>
								}
							>
								{business.phone}
							</Descriptions.Item>
						</Descriptions>
					</Col>
					<Col xs={24} md={12}>
						<Descriptions column={1}>
							<Descriptions.Item
								label={
									<Space>
										<EnvironmentOutlined />
										<Text>Location</Text>
									</Space>
								}
							>
								{business.city}, {business.country}
							</Descriptions.Item>
							<Descriptions.Item
								label={
									<Space>
										<GlobalOutlined />
										<Text>Website</Text>
									</Space>
								}
							>
								<a href="#" className="text-blue-500 hover:text-blue-600">
									Visit Website
								</a>
							</Descriptions.Item>
						</Descriptions>
					</Col>
				</Row>
			</Card>

			{/* Description */}
			<Card>
				<Title level={4} className="!mb-6">
					About
				</Title>
				<Text className="text-gray-600">{business.description}</Text>
			</Card>
		</div>
	);
}
