import React, { useMemo, useState, useEffect } from "react";
import { Card, Col, Row, Progress, Skeleton } from "antd";
import {
	UserOutlined,
	ShoppingCartOutlined,
	DollarOutlined,
	ArrowUpOutlined,
} from "@ant-design/icons";

// Move data outside component
const statsData = [
	{
		title: "Total Sales",
		value: "11,250",
		icon: <DollarOutlined />,
		color: "bg-blue-100 text-blue-700",
		progress: 70,
	},
	{
		title: "New Customers",
		value: "325",
		icon: <UserOutlined />,
		color: "bg-green-100 text-green-700",
		progress: 50,
	},
	{
		title: "Pending Orders",
		value: "85",
		icon: <ShoppingCartOutlined />,
		color: "bg-red-100 text-red-700",
		progress: 30,
	},
	{
		title: "Revenue Growth",
		value: "18.7%",
		icon: <ArrowUpOutlined />,
		color: "bg-orange-100 text-orange-700",
		progress: 18.7,
	},
];

const TopStats = () => {
	const [loading, setLoading] = useState(true);

	// Simulate data loading
	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	const renderStatCard = useMemo(
		() => (stat, index) =>
			(
				<Col key={index} xs={12} sm={12} md={6} lg={6} className="flex p-0">
					<Card
						className="rounded-xl shadow-lg flex flex-col justify-between w-full bg-white 
				px-0 py-3 sm:px-3 sm:py-4 md:px-4 md:py-0 lg:px-5 lg:py-8"
					>
						<div className="flex flex-col items-center text-center w-full">
							<div
								className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full ${stat.color}`}
								style={{ fontSize: "1.5rem", minWidth: "50px" }}
							>
								{stat.icon}
							</div>

							<p className="text-gray-500 text-xs sm:text-sm md:text-base mt-2 font-medium">
								{stat.title}
							</p>

							<p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-1">
								{stat.value}
							</p>

							<div className="w-full mt-3">
								<Progress
									percent={stat.progress}
									status="active"
									showInfo={false}
									strokeColor="#1890ff"
									strokeWidth={4}
									className="w-full"
								/>
							</div>
						</div>
					</Card>
				</Col>
			),
		[]
	);

	if (loading) {
		return (
			<div className="w-full px-0 sm:px-4 lg:px-8 xl:px-12 py-0 sm:py-4 lg:py-6">
				<Row gutter={[12, 12]} justify="center">
					{[1, 2, 3, 4].map((key) => (
						<Col key={key} xs={12} sm={12} md={6} lg={6} className="flex p-0">
							<Card className="rounded-xl shadow-lg w-full">
								<Skeleton active paragraph={{ rows: 2 }} />
							</Card>
						</Col>
					))}
				</Row>
			</div>
		);
	}

	return (
		<div className="w-full px-0 sm:px-4 lg:px-8 xl:px-12 py-0 sm:py-4 lg:py-6">
			<Row gutter={[12, 12]} justify="center">
				{statsData.map(renderStatCard)}
			</Row>
		</div>
	);
};

export default React.memo(TopStats);
