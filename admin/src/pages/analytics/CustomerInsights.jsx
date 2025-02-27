import React, { useState } from "react";
import { Card, Select, Statistic, Table } from "antd";
import {
	PieChart,
	Pie,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
} from "recharts";
import { FaUsers, FaClock, FaStar, FaShoppingCart } from "react-icons/fa";

const { Option } = Select;

// Sample customer data
const customerData = [
	{
		name: "John Doe",
		purchases: 15,
		avgSpending: 320,
		loyalty: "Gold",
		rating: 4.7,
	},
	{
		name: "Jane Smith",
		purchases: 10,
		avgSpending: 250,
		loyalty: "Silver",
		rating: 4.3,
	},
	{
		name: "Alex Johnson",
		purchases: 20,
		avgSpending: 500,
		loyalty: "Platinum",
		rating: 4.9,
	},
	{
		name: "Emily Davis",
		purchases: 8,
		avgSpending: 180,
		loyalty: "Bronze",
		rating: 4.1,
	},
];

const customerLoyaltyData = [
	{ category: "Platinum", value: 10 },
	{ category: "Gold", value: 25 },
	{ category: "Silver", value: 35 },
	{ category: "Bronze", value: 30 },
];

const purchaseBehaviorData = [
	{ month: "Jan", purchases: 120 },
	{ month: "Feb", purchases: 180 },
	{ month: "Mar", purchases: 240 },
	{ month: "Apr", purchases: 300 },
	{ month: "May", purchases: 350 },
];

const CustomerInsights = () => {
	const [selectedFilter, setSelectedFilter] = useState("Monthly");

	return (
		<div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-600 to-purple-500 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold flex items-center justify-center gap-2">
					<FaUsers /> Customer Insights
				</h2>
				<p className="text-gray-200 text-sm mt-2">
					Analyze customer behavior, spending habits, and loyalty trends.
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
						title="Total Customers"
						value={customerData.length * 50}
						prefix={<FaUsers />}
					/>
				</Card>
				<Card className="shadow-md rounded-lg">
					<Statistic
						title="Avg Purchases"
						value={
							customerData.reduce((sum, item) => sum + item.purchases, 0) /
							customerData.length
						}
						prefix={<FaShoppingCart />}
					/>
				</Card>
				<Card className="shadow-md rounded-lg">
					<Statistic
						title="Avg Customer Rating"
						value={
							customerData.reduce((sum, item) => sum + item.rating, 0) /
							customerData.length
						}
						precision={1}
						prefix={<FaStar />}
					/>
				</Card>
			</div>

			{/* Customer Loyalty Distribution */}
			<Card className="mt-6 shadow-md rounded-lg p-6">
				<h3 className="text-xl font-semibold mb-4">
					Customer Loyalty Distribution
				</h3>
				<ResponsiveContainer width="100%" height={300}>
					<PieChart>
						<Pie
							data={customerLoyaltyData}
							dataKey="value"
							nameKey="category"
							cx="50%"
							cy="50%"
							outerRadius={100}
							fill="#8884d8"
							label
						/>
						<Tooltip />
					</PieChart>
				</ResponsiveContainer>
			</Card>

			{/* Purchase Behavior Trends */}
			<Card className="mt-6 shadow-md rounded-lg p-6">
				<h3 className="text-xl font-semibold mb-4">
					Purchase Behavior Over Time
				</h3>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={purchaseBehaviorData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="month" />
						<YAxis />
						<Tooltip />
						<Bar dataKey="purchases" fill="#8884d8" />
					</BarChart>
				</ResponsiveContainer>
			</Card>

			{/* Customer Table */}
			<Card className="mt-6 shadow-md rounded-lg p-6">
				<h3 className="text-xl font-semibold mb-4">
					Customer Purchase & Loyalty
				</h3>
				<Table
					dataSource={customerData}
					columns={[
						{ title: "Customer", dataIndex: "name", key: "name" },
						{ title: "Purchases", dataIndex: "purchases", key: "purchases" },
						{
							title: "Avg Spending ($)",
							dataIndex: "avgSpending",
							key: "avgSpending",
						},
						{ title: "Loyalty Tier", dataIndex: "loyalty", key: "loyalty" },
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

export default CustomerInsights;
