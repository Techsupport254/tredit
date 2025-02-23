import React, { useEffect } from "react";
import { Card, Col, Row, Skeleton } from "antd";
import { Column } from "@ant-design/plots";
import { WorldMap } from "react-svg-worldmap";

// ✅ Dummy Product Views Data for TikTok, Facebook, Instagram
const productViewsData = [
	{ day: "Sun", platform: "TikTok", views: 8000 },
	{ day: "Sun", platform: "Facebook", views: 10000 },
	{ day: "Sun", platform: "Instagram", views: 9500 },
	{ day: "Mon", platform: "TikTok", views: 7000 },
	{ day: "Mon", platform: "Facebook", views: 9000 },
	{ day: "Mon", platform: "Instagram", views: 8500 },
	{ day: "Tue", platform: "TikTok", views: 6000 },
	{ day: "Tue", platform: "Facebook", views: 11000 },
	{ day: "Tue", platform: "Instagram", views: 9000 },
	{ day: "Wed", platform: "TikTok", views: 8500 },
	{ day: "Wed", platform: "Facebook", views: 9500 },
	{ day: "Wed", platform: "Instagram", views: 9700 },
	{ day: "Thu", platform: "TikTok", views: 9500 },
	{ day: "Thu", platform: "Facebook", views: 14000 },
	{ day: "Thu", platform: "Instagram", views: 12000 },
	{ day: "Fri", platform: "TikTok", views: 9000 },
	{ day: "Fri", platform: "Facebook", views: 13000 },
	{ day: "Fri", platform: "Instagram", views: 11500 },
	{ day: "Sat", platform: "TikTok", views: 9500 },
	{ day: "Sat", platform: "Facebook", views: 14000 },
	{ day: "Sat", platform: "Instagram", views: 12500 },
];

// ✅ Dummy Active Users Data
const userData = [
	{ country: "us", value: 5000 },
	{ country: "gb", value: 1200 },
	{ country: "de", value: 900 },
	{ country: "fr", value: 800 },
	{ country: "in", value: 2200 },
	{ country: "cn", value: 3200 },
];

const ProductViews = () => {
	// Debugging: Ensure data is correctly formatted
	useEffect(() => {
		console.log("Product Views Data:", productViewsData);
	}, []);

	// Column Chart Config
	const columnConfig = {
		data: productViewsData,
		xField: "day",
		yField: "views",
		seriesField: "platform",
		isGroup: true,
		legend: { position: "top-right" },
		color: ["#FF0050", "#1877F2", "#C13584"], // TikTok, Facebook, Instagram colors
		responsive: true,
		yAxis: {
			label: {
				formatter: (val) => `${val / 1000}K`, // Converts values to "K" format
			},
		},
		xAxis: {
			label: {
				autoHide: false,
				autoRotate: true,
			},
		},
		tooltip: {
			shared: true,
			showMarkers: false,
			customContent: (title, data) => `
				<div style="padding:10px;">
					<strong>${title}</strong>
					${data
						.map(
							(d) =>
								`<div style="color:${d.color}">
									${d.name}: ${d.value !== null ? d.value : "0"}
								</div>`
						)
						.join("")}
				</div>
			`,
		},
	};

	return (
		<div className="w-full px-2 sm:px-4 lg:px-8 xl:px-12 py-2 sm:py-4 lg:py-6">
			<Row gutter={[16, 16]} justify="center">
				{/* Product Views Bar Chart - Stacks Below on Mobile */}
				<Col xs={24} sm={24} md={12} lg={10}>
					<Card
						title="Product Views (TikTok, Facebook, Instagram)"
						className="rounded-xl shadow-lg"
						bodyStyle={{ padding: "16px" }}
					>
						<div className="w-full">
							<Column
								{...columnConfig}
								style={{ height: "300px", width: "100%" }}
							/>
						</div>
					</Card>
				</Col>

				{/* Active Users Map - Stacks Below on Mobile */}
				<Col xs={24} sm={24} md={12} lg={14}>
					<Card
						title="User Activity by Country"
						className="rounded-xl shadow-lg flex flex-col justify-center items-center w-full"
					>
						<div className="w-full flex justify-center overflow-hidden">
							<WorldMap
								color="blue"
								valueSuffix=" users"
								size="responsive"
								data={userData}
								style={{
									width: "100%",
									maxWidth: "600px",
									height: "auto",
									overflow: "hidden",
								}}
							/>
						</div>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default ProductViews;
