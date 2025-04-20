"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	Button,
	Empty,
	Row,
	Col,
	Typography,
	Rate,
	Tag,
	Spin,
	message,
	theme,
} from "antd";
import {
	PlusOutlined,
	ShopOutlined,
	GlobalOutlined,
	PhoneOutlined,
	MailOutlined,
	TeamOutlined,
	AppstoreOutlined,
	TagOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

interface Business {
	id: string;
	name: string;
	description: string | null;
	type: "PRODUCT" | "SERVICE";
	category: string;
	email: string;
	phone: string;
	city: string;
	country: string;
	employeeCount: number;
	averageRating: number;
	reviewCount: number;
}

export default function BusinessesPage() {
	const router = useRouter();
	const [businesses, setBusinesses] = useState<Business[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { token } = theme.useToken();

	useEffect(() => {
		fetchBusinesses();
	}, []);

	const fetchBusinesses = async () => {
		try {
			const response = await axios.get("/api/business");
			if (response.data) {
				setBusinesses(response.data);
			}
		} catch (error: any) {
			message.error(
				error.response?.data?.error || "Failed to fetch businesses"
			);
			console.error("Error fetching businesses:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-8">
				<div>
					<Title level={2} className="!mb-1">
						Businesses
					</Title>
					<Text type="secondary">
						Manage your business profiles and settings
					</Text>
				</div>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					size="large"
					onClick={() => router.push("/dashboard/businesses/setup")}
					style={{ backgroundColor: token.colorPrimary }}
				>
					Add Business
				</Button>
			</div>

			{businesses.length === 0 ? (
				<Card className="text-center">
					<Empty
						image={
							<ShopOutlined
								style={{ fontSize: 64, color: token.colorPrimary }}
							/>
						}
						description={
							<div>
								<Title level={4}>No businesses yet</Title>
								<Text type="secondary">
									Get started by creating a new business
								</Text>
								<div className="mt-4">
									<Button
										type="primary"
										onClick={() => router.push("/dashboard/businesses/setup")}
										style={{ backgroundColor: token.colorPrimary }}
									>
										Add your first business
									</Button>
								</div>
							</div>
						}
					/>
				</Card>
			) : (
				<Row gutter={[24, 24]}>
					{businesses.map((business) => (
						<Col xs={24} md={12} key={business.id}>
							<Card
								hoverable
								className="overflow-hidden shadow-sm hover:shadow-md transition-all"
								onClick={() =>
									router.push(`/dashboard/businesses/${business.id}` as any)
								}
							>
								<div className="flex items-start gap-6">
									<div
										className="flex-shrink-0 w-20 h-20 bg-blue-50 rounded-lg flex items-center justify-center"
										style={{ backgroundColor: token.colorBgLayout }}
									>
										<ShopOutlined
											style={{ fontSize: 32, color: token.colorPrimary }}
										/>
									</div>

									<div className="flex-grow min-w-0">
										<Title level={4} className="!mb-1 !mt-0">
											{business.name}
										</Title>
										<Text type="secondary" className="block mb-4">
											{business.description || business.name}
										</Text>

										<div className="flex flex-wrap gap-2 mb-4">
											<Tag
												icon={<AppstoreOutlined />}
												color="blue"
												className="flex items-center"
											>
												{business.type}
											</Tag>
											<Tag
												icon={<TagOutlined />}
												color="purple"
												className="flex items-center"
											>
												{business.category}
											</Tag>
										</div>

										<div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
											{business.email && (
												<div className="flex items-center gap-2">
													<MailOutlined className="text-gray-400" />
													<Text className="truncate">{business.email}</Text>
												</div>
											)}
											{business.phone && (
												<div className="flex items-center gap-2">
													<PhoneOutlined className="text-gray-400" />
													<Text>{business.phone}</Text>
												</div>
											)}
											{(business.city || business.country) && (
												<div className="flex items-center gap-2">
													<GlobalOutlined className="text-gray-400" />
													<Text>
														{[business.city, business.country]
															.filter(Boolean)
															.join(", ")}
													</Text>
												</div>
											)}
											{business.employeeCount > 0 && (
												<div className="flex items-center gap-2">
													<TeamOutlined className="text-gray-400" />
													<Text>{business.employeeCount} employees</Text>
												</div>
											)}
										</div>

										<div className="flex items-center justify-between pt-3 border-t border-gray-100">
											<Rate
												disabled
												defaultValue={business.averageRating}
												className="text-sm !text-blue-500"
											/>
											<Text type="secondary" className="text-sm">
												({business.reviewCount} reviews)
											</Text>
										</div>
									</div>
								</div>
							</Card>
						</Col>
					))}
				</Row>
			)}
		</div>
	);
}
