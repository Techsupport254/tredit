import React, { useState, useEffect } from "react";
import {
	Card,
	Row,
	Col,
	Statistic,
	Table,
	message,
	notification,
	DatePicker,
	Select,
	Button,
} from "antd";
import { Line, Bar, Pie } from "@ant-design/charts";
import {
	ArrowUpOutlined,
	ArrowDownOutlined,
	DollarOutlined,
	ShoppingOutlined,
	UserOutlined,
	ShoppingCartOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;

const Analytics = () => {
	const [loading, setLoading] = useState(false);
	const [dateRange, setDateRange] = useState(null);
	const [timeframe, setTimeframe] = useState("week");
	const [salesData, setSalesData] = useState([]);
	const [ordersData, setOrdersData] = useState([]);
	const [customerData, setCustomerData] = useState([]);

	// Sample data - replace with actual API calls
	const sampleSalesData = [
		{ date: "2024-01", value: 3500 },
		{ date: "2024-02", value: 4200 },
		{ date: "2024-03", value: 3800 },
		{ date: "2024-04", value: 4500 },
		{ date: "2024-05", value: 5000 },
		{ date: "2024-06", value: 4800 },
	];

	const sampleOrdersData = [
		{ category: "Electronics", value: 35 },
		{ category: "Clothing", value: 25 },
		{ category: "Books", value: 20 },
		{ category: "Home", value: 15 },
		{ category: "Other", value: 5 },
	];

	const sampleCustomerData = [
		{ date: "2024-01", value: 150 },
		{ date: "2024-02", value: 180 },
		{ date: "2024-03", value: 220 },
		{ date: "2024-04", value: 250 },
		{ date: "2024-05", value: 280 },
		{ date: "2024-06", value: 300 },
	];

	useEffect(() => {
		fetchAnalyticsData();
	}, [dateRange, timeframe]);

	const fetchAnalyticsData = async () => {
		try {
			setLoading(true);
			// Add your API calls here
			// For now, using sample data
			setSalesData(sampleSalesData);
			setOrdersData(sampleOrdersData);
			setCustomerData(sampleCustomerData);
		} catch (error) {
			message.error("Failed to fetch analytics data");
			notification.error({
				message: "Error",
				description:
					"There was an error loading the analytics data. Please try again.",
				placement: "topRight",
			});
		} finally {
			setLoading(false);
		}
	};

	const salesConfig = {
		data: salesData,
		xField: "date",
		yField: "value",
		point: {
			size: 5,
			shape: "diamond",
		},
		label: {
			style: {
				fill: "#aaa",
			},
		},
	};

	const ordersConfig = {
		data: ordersData,
		angleField: "value",
		colorField: "category",
		radius: 0.8,
		label: {
			type: "outer",
			content: "{name} {percentage}%",
		},
	};

	const customerConfig = {
		data: customerData,
		xField: "date",
		yField: "value",
		barSize: 20,
		label: {
			position: "middle",
			style: {
				fill: "#FFFFFF",
			},
		},
	};

	const handleDateRangeChange = (dates) => {
		setDateRange(dates);
	};

	const handleTimeframeChange = (value) => {
		setTimeframe(value);
	};

	const handleRefresh = () => {
		fetchAnalyticsData();
	};

	return (
		<div className="p-6">
			<div className="mb-6 flex justify-between items-center">
				<h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
				<div className="flex space-x-4">
					<RangePicker onChange={handleDateRangeChange} />
					<Select
						defaultValue="week"
						style={{ width: 120 }}
						onChange={handleTimeframeChange}
						options={[
							{ value: "day", label: "Daily" },
							{ value: "week", label: "Weekly" },
							{ value: "month", label: "Monthly" },
						]}
					/>
					<Button onClick={handleRefresh}>Refresh</Button>
				</div>
			</div>

			<Row gutter={[16, 16]} className="mb-6">
				<Col span={6}>
					<Card>
						<Statistic
							title="Total Sales"
							value={25000}
							precision={2}
							prefix={<DollarOutlined />}
							suffix={
								<span className="text-green-500">
									<ArrowUpOutlined /> 12%
								</span>
							}
						/>
					</Card>
				</Col>
				<Col span={6}>
					<Card>
						<Statistic
							title="Total Orders"
							value={150}
							prefix={<ShoppingOutlined />}
							suffix={
								<span className="text-green-500">
									<ArrowUpOutlined /> 8%
								</span>
							}
						/>
					</Card>
				</Col>
				<Col span={6}>
					<Card>
						<Statistic
							title="New Customers"
							value={45}
							prefix={<UserOutlined />}
							suffix={
								<span className="text-red-500">
									<ArrowDownOutlined /> 3%
								</span>
							}
						/>
					</Card>
				</Col>
				<Col span={6}>
					<Card>
						<Statistic
							title="Average Order Value"
							value={166.67}
							precision={2}
							prefix={<ShoppingCartOutlined />}
							suffix={
								<span className="text-green-500">
									<ArrowUpOutlined /> 5%
								</span>
							}
						/>
					</Card>
				</Col>
			</Row>

			<Row gutter={[16, 16]}>
				<Col span={16}>
					<Card title="Sales Trend">
						<Line {...salesConfig} />
					</Card>
				</Col>
				<Col span={8}>
					<Card title="Orders by Category">
						<Pie {...ordersConfig} />
					</Card>
				</Col>
				<Col span={24}>
					<Card title="Customer Growth">
						<Bar {...customerConfig} />
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default Analytics;
