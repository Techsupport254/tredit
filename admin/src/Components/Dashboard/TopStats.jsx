import React, { useMemo, useState, useEffect } from "react";
import {
	Card,
	Col,
	Row,
	Progress,
	Skeleton,
	Statistic,
	Badge,
	Tooltip,
} from "antd";
import {
	UserOutlined,
	ShoppingCartOutlined,
	DollarOutlined,
	ArrowUpOutlined,
	ArrowDownOutlined,
	InboxOutlined,
	RiseOutlined,
	UserAddOutlined,
} from "@ant-design/icons";

// Create a formatter for KES currency
const currencyFormatter = new Intl.NumberFormat("en-KE", {
	style: "currency",
	currency: "KES",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

// Updated stats data with improved styling information
const statsData = [
	{
		title: "Total Sales",
		value: 11250,
		formatter: (value) => currencyFormatter.format(value),
		icon: <DollarOutlined />,
		prefix: <DollarOutlined className="text-blue-500 mr-2" />,
		color: "blue",
		progress: 70,
		changeValue: 8.5,
		changeDirection: "up",
		statusMessage: "from last week",
		badgeStatus: "success",
		valueStyle: { color: "#3b82f6" },
		borderColor: "border-l-blue-500",
	},
	{
		title: "New Customers",
		value: 325,
		icon: <UserAddOutlined />,
		prefix: <UserAddOutlined className="text-green-500 mr-2" />,
		color: "green",
		progress: 50,
		changeValue: 12.3,
		changeDirection: "up",
		statusMessage: "from last month",
		badgeStatus: "success",
		valueStyle: { color: "#10b981" },
		borderColor: "border-l-green-500",
	},
	{
		title: "Pending Orders",
		value: 85,
		icon: <InboxOutlined />,
		prefix: <InboxOutlined className="text-amber-500 mr-2" />,
		color: "amber",
		progress: 30,
		changeValue: 5,
		changeDirection: "none",
		statusMessage: "orders require attention",
		badgeStatus: "warning",
		valueStyle: { color: "#f59e0b" },
		borderColor: "border-l-amber-500",
	},
	{
		title: "Revenue Growth",
		value: 18.7,
		suffix: "%",
		icon: <RiseOutlined />,
		prefix: <RiseOutlined className="text-indigo-500 mr-2" />,
		color: "indigo",
		progress: 18.7,
		changeValue: 4.3,
		changeDirection: "up",
		statusMessage: "this month",
		badgeStatus: "success",
		valueStyle: { color: "#6366f1" },
		borderColor: "border-l-indigo-500",
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
		() => (stat, index) => {
			// Get the appropriate change icon
			const getChangeIcon = () => {
				if (stat.changeDirection === "up") {
					return (
						<RiseOutlined
							className="text-green-500 mr-1"
							style={{ fontSize: "16px" }}
						/>
					);
				} else if (stat.changeDirection === "down") {
					return (
						<RiseOutlined
							className="text-red-500 mr-1"
							style={{ fontSize: "16px", transform: "rotate(180deg)" }}
						/>
					);
				}
				return null;
			};

			return (
				<Col key={index} xs={24} sm={12} lg={6}>
					<Card
						hoverable
						className={`h-full shadow-sm transition-all hover:shadow-md border-l-4 ${stat.borderColor}`}
					>
						<Statistic
							title={stat.title}
							value={stat.value}
							formatter={stat.formatter}
							prefix={stat.prefix}
							suffix={stat.suffix}
							valueStyle={stat.valueStyle}
						/>
						<div className="mt-2 text-xs text-gray-500">
							{stat.changeDirection !== "none" && (
								<Tooltip
									title={`${
										stat.changeDirection === "up" ? "Increased" : "Decreased"
									} by ${stat.changeValue}%`}
								>
									<span>
										{getChangeIcon()}
										<span
											className={
												stat.changeDirection === "up"
													? "text-green-500"
													: "text-red-500"
											}
										>
											{stat.changeValue}%
										</span>{" "}
										{stat.statusMessage}
									</span>
								</Tooltip>
							)}
							{stat.changeDirection === "none" && (
								<span>
									{stat.changeValue} {stat.statusMessage}
								</span>
							)}
						</div>
					</Card>
				</Col>
			);
		},
		[]
	);

	if (loading) {
		return (
			<Row gutter={[16, 16]}>
				{[1, 2, 3, 4].map((key) => (
					<Col key={key} xs={24} sm={12} lg={6}>
						<Card className="shadow-sm">
							<Skeleton active paragraph={{ rows: 1 }} />
						</Card>
					</Col>
				))}
			</Row>
		);
	}

	return <Row gutter={[16, 16]}>{statsData.map(renderStatCard)}</Row>;
};

export default React.memo(TopStats);
