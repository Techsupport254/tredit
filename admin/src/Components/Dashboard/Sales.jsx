import React, { useMemo, useState, useEffect } from "react";
import { Card, Col, Row, Skeleton } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import { Line, Pie } from "@ant-design/plots";

// Move data outside component to prevent recreation
const salesData = [
	{ month: "Jan", value: 300 },
	{ month: "Feb", value: 450 },
	{ month: "Mar", value: 600 },
	{ month: "Apr", value: 800 },
	{ month: "May", value: 750 },
	{ month: "Jun", value: 900 },
];

const pieData = [
	{ type: "Online", value: 60 },
	{ type: "In-Store", value: 40 },
];

const Sales = () => {
	const [loading, setLoading] = useState(true);

	// Simulate data loading
	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	// Memoize chart configurations
	const lineConfig = useMemo(
		() => ({
			data: salesData,
			xField: "month",
			yField: "value",
			smooth: true,
			tooltip: { showMarkers: false },
			areaStyle: { fill: "#e6f7ff" },
			color: "#1890ff",
			responsive: true,
			autoFit: true,
			animation: false, // Disable animation to prevent flickering
			point: {
				shape: "circle",
				size: 4,
				style: { fill: "#1890ff", stroke: "#fff", lineWidth: 2 },
			},
		}),
		[]
	);

	const pieConfig = useMemo(
		() => ({
			data: pieData,
			angleField: "value",
			colorField: "type",
			animation: false, // Disable animation to prevent flickering
			label: {
				type: "inner",
				offset: "-30%",
				content: ({ value }) => `${value}%`,
				style: { fontSize: 14, fontWeight: "bold" },
			},
			legend: {
				position: "bottom",
				itemWidth: 100,
			},
			color: ["#5B8FF9", "#61DDAA"],
			responsive: true,
			autoFit: true,
		}),
		[]
	);

	if (loading) {
		return (
			<div className="w-full px-2 sm:px-4 lg:px-8 xl:px-12 py-2 sm:py-4 lg:py-6">
				<Row gutter={[16, 16]} justify="center">
					<Col xs={24} sm={24} md={24} lg={16} className="flex">
						<Card className="rounded-xl shadow-lg w-full">
							<Skeleton active />
						</Card>
					</Col>
					<Col xs={24} sm={24} md={24} lg={8} className="flex">
						<Card className="rounded-xl shadow-lg w-full">
							<Skeleton active />
						</Card>
					</Col>
				</Row>
			</div>
		);
	}

	return (
		<div className="w-full px-2 sm:px-4 lg:px-8 xl:px-12 py-2 sm:py-4 lg:py-6">
			<Row gutter={[16, 16]} justify="center">
				<Col xs={24} sm={24} md={24} lg={16} className="flex">
					<Card
						title="Sales Overview"
						extra={<BarChartOutlined className="text-xl" />}
						className="rounded-xl shadow-lg w-full"
					>
						<div className="w-full" style={{ height: "320px" }}>
							<Line {...lineConfig} />
						</div>
					</Card>
				</Col>

				<Col xs={24} sm={24} md={24} lg={8} className="flex">
					<Card
						title="Sales by Channel"
						className="rounded-xl shadow-lg flex flex-col justify-center items-center w-full"
					>
						<div
							className="w-full flex justify-center"
							style={{ height: "150px" }}
						>
							<Pie {...pieConfig} />
						</div>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default React.memo(Sales);
