import React, { useState } from "react";
import { Card, DatePicker, Select, Statistic } from "antd";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
} from "recharts";
import {
	FaChartLine,
	FaDollarSign,
	FaShoppingCart,
	FaUsers,
} from "react-icons/fa";

const { RangePicker } = DatePicker;
const { Option } = Select;

// Sample sales data
const salesData = [
	{ month: "Jan", revenue: 8000, sales: 300 },
	{ month: "Feb", revenue: 9500, sales: 400 },
	{ month: "Mar", revenue: 7200, sales: 280 },
	{ month: "Apr", revenue: 11000, sales: 450 },
	{ month: "May", revenue: 12500, sales: 500 },
	{ month: "Jun", revenue: 14000, sales: 550 },
];

const SalesAnalytics = () => {
	const [selectedRange, setSelectedRange] = useState(null);

	return (
		<div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header */}
			<div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold flex items-center justify-center gap-2">
					<FaChartLine /> Sales Analytics
				</h2>
				<p className="text-gray-200 text-sm mt-2">
					Track and analyze your sales performance.
				</p>
			</div>

			{/* Date Range Picker & Filter */}
			<Card className="mt-6 p-6 shadow-md rounded-lg">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Date Picker */}
					<div className="flex items-center space-x-2">
						<span className="font-semibold text-gray-600">
							Select Date Range:
						</span>
						<RangePicker
							onChange={(dates) => setSelectedRange(dates)}
							className="w-full"
						/>
					</div>

					{/* Filter */}
					<div className="flex items-center space-x-2">
						<span className="font-semibold text-gray-600">Filter by:</span>
						<Select defaultValue="Monthly" className="w-full">
							<Option value="Daily">Daily</Option>
							<Option value="Weekly">Weekly</Option>
							<Option value="Monthly">Monthly</Option>
						</Select>
					</div>
				</div>
			</Card>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
				<Card className="shadow-md rounded-lg">
					<Statistic
						title="Total Revenue"
						value={salesData.reduce((sum, item) => sum + item.revenue, 0)}
						prefix={<FaDollarSign />}
					/>
				</Card>
				<Card className="shadow-md rounded-lg">
					<Statistic
						title="Total Sales"
						value={salesData.reduce((sum, item) => sum + item.sales, 0)}
						prefix={<FaShoppingCart />}
					/>
				</Card>
				<Card className="shadow-md rounded-lg">
					<Statistic title="New Customers" value={245} prefix={<FaUsers />} />
				</Card>
			</div>

			{/* Sales Trends Chart */}
			<Card className="mt-6 shadow-md rounded-lg p-6">
				<h3 className="text-xl font-semibold mb-4">Sales & Revenue Trends</h3>
				<ResponsiveContainer width="100%" height={300}>
					<LineChart data={salesData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="month" />
						<YAxis />
						<Tooltip />
						<Line
							type="monotone"
							dataKey="revenue"
							stroke="#8884d8"
							strokeWidth={2}
						/>
						<Line
							type="monotone"
							dataKey="sales"
							stroke="#82ca9d"
							strokeWidth={2}
						/>
					</LineChart>
				</ResponsiveContainer>
			</Card>

			{/* Sales Breakdown Chart */}
			<Card className="mt-6 shadow-md rounded-lg p-6">
				<h3 className="text-xl font-semibold mb-4">Sales Breakdown</h3>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={salesData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="month" />
						<YAxis />
						<Tooltip />
						<Bar dataKey="sales" fill="#82ca9d" />
					</BarChart>
				</ResponsiveContainer>
			</Card>
		</div>
	);
};

export default SalesAnalytics;
