import {
	Card,
	Col,
	Descriptions,
	Empty,
	List,
	Row,
	Statistic,
	Typography,
} from "antd";
import {
	FileTextOutlined,
	StarOutlined,
	ShopOutlined,
	TeamOutlined,
} from "@ant-design/icons";
import { Business, Product, Service, Order } from "../page";

const { Title, Text, Paragraph } = Typography;

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
	return (
		<div className="pb-6">
			<Title level={5} className="!mt-4 !mb-6">
				Business Information
			</Title>
			<Descriptions column={{ xs: 1, sm: 2 }} bordered>
				<Descriptions.Item label="Business Type">
					{business.type}
				</Descriptions.Item>
				<Descriptions.Item label="Category">
					{business.category}
				</Descriptions.Item>
				<Descriptions.Item label="Email">{business.email}</Descriptions.Item>
				<Descriptions.Item label="Phone">{business.phone}</Descriptions.Item>
				<Descriptions.Item label="City">{business.city}</Descriptions.Item>
				<Descriptions.Item label="Country">
					{business.country}
				</Descriptions.Item>
			</Descriptions>

			<Title level={5} className="!mt-8 !mb-6">
				Performance Metrics
			</Title>
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={8}>
					<Card>
						<Statistic
							title="Total Orders"
							value={orders.length}
							prefix={<ShopOutlined />}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={8}>
					<Card>
						<Statistic
							title="Average Rating"
							value={business.averageRating}
							precision={1}
							prefix={<StarOutlined />}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={8}>
					<Card>
						<Statistic
							title="Total Reviews"
							value={business.reviewCount}
							prefix={<FileTextOutlined />}
						/>
					</Card>
				</Col>
			</Row>
		</div>
	);
}
