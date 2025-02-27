import React, { useState } from "react";
import { Card, Select, Statistic, Table } from "antd";
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
	FaChartBar,
	FaShoppingBag,
	FaDollarSign,
	FaStar,
} from "react-icons/fa";

const { Option } = Select;

// Sample product performance data
const productData = [
	{ name: "Product A", sales: 120, revenue: 2400, rating: 4.5 },
	{ name: "Product B", sales: 98, revenue: 1900, rating: 4.2 },
	{ name: "Product C", sales: 80, revenue: 1600, rating: 4.0 },
	{ name: "Product D", sales: 150, revenue: 3000, rating: 4.8 },
	{ name: "Product E", sales: 130, revenue: 2600, rating: 4.6 },
];

const salesTrendData = [
	{
		month: "Jan",
		ProductA: 30,
		ProductB: 20,
		ProductC: 25,
		ProductD: 50,
		ProductE: 40,
	},
	{
		month: "Feb",
		ProductA: 40,
		ProductB: 30,
		ProductC: 35,
		ProductD: 60,
		ProductE: 50,
	},
	{
		month: "Mar",
		ProductA: 50,
		ProductB: 40,
		ProductC: 45,
		ProductD: 80,
		ProductE: 70,
	},
];

const ProductPerformance = () => {
	const [selectedFilter, setSelectedFilter] = useState("Monthly");

	return (
		<div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-600 to-purple-500 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold flex items-center justify-center gap-2">
					<FaChartBar /> Product Performance
				</h2>
				<p className="text-gray-200 text-sm mt-2">
					Analyze sales trends, revenue, and customer ratings.
				</p>
			</div>

			{/* Filter Selection */}
			<Card className="mt-6 p-6 shadow-md rounded-lg">
				<div className="flex items-center space-x-2">
					<span className="font-semibold text-gray-600">Filter by:</span>
					<Select
						defaultValue="Monthly"
						onChange={(value) => setSelectedFilter(value)}
						className="w-full"
					>
						<Option value="Daily">Daily</Option>
						<Option value="Weekly">Weekly</Option>
						<Option value="Monthly">Monthly</Option>
					</Select>
				</div>
			</Card>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
				<Card className="shadow-md rounded-lg">
					<Statistic
						title="Total Sales"
						value={productData.reduce((sum, item) => sum + item.sales, 0)}
						prefix={<FaShoppingBag />}
					/>
				</Card>
				<Card className="shadow-md rounded-lg">
					<Statistic
						title="Total Revenue"
						value={`$${productData.reduce(
							(sum, item) => sum + item.revenue,
							0
						)}`}
						prefix={<FaDollarSign />}
					/>
				</Card>
				<Card className="shadow-md rounded-lg">
					<Statistic
						title="Average Rating"
						value={
							productData.reduce((sum, item) => sum + item.rating, 0) /
							productData.length
						}
						precision={1}
						prefix={<FaStar />}
					/>
				</Card>
			</div>

			{/* Sales Trend Chart */}
			<Card className="mt-6 shadow-md rounded-lg p-6">
				<h3 className="text-xl font-semibold mb-4">Sales Trends</h3>
				<ResponsiveContainer width="100%" height={300}>
					<LineChart data={salesTrendData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="month" />
						<YAxis />
						<Tooltip />
						<Line
							type="monotone"
							dataKey="ProductA"
							stroke="#8884d8"
							strokeWidth={2}
						/>
						<Line
							type="monotone"
							dataKey="ProductB"
							stroke="#82ca9d"
							strokeWidth={2}
						/>
						<Line
							type="monotone"
							dataKey="ProductC"
							stroke="#ff7300"
							strokeWidth={2}
						/>
					</LineChart>
				</ResponsiveContainer>
			</Card>

			{/* Product Performance Table */}
			<Card className="mt-6 shadow-md rounded-lg p-6">
				<h3 className="text-xl font-semibold mb-4">Product Sales & Revenue</h3>
				<Table
					dataSource={productData}
					columns={[
						{ title: "Product", dataIndex: "name", key: "name" },
						{ title: "Sales", dataIndex: "sales", key: "sales" },
						{ title: "Revenue ($)", dataIndex: "revenue", key: "revenue" },
						{
							title: "Rating",
							dataIndex: "rating",
							key: "rating",
							render: (rating) => `${rating} ⭐`,
						},
					]}
					pagination={false}
					rowKey="name"
				/>
			</Card>
		</div>
	);
};

export default ProductPerformance;
