import React, { useState } from "react";
import { Card, Select, Table, Tag, Button } from "antd";
import {
	FaClipboardList,
	FaCheckCircle,
	FaTimesCircle,
	FaClock,
} from "react-icons/fa";

const { Option } = Select;

// Sample Order Data
const ordersData = [
	{
		id: "ORD12345",
		customer: "John Doe",
		amount: 250,
		status: "Completed",
		date: "2025-02-20",
	},
	{
		id: "ORD12346",
		customer: "Jane Smith",
		amount: 180,
		status: "Pending",
		date: "2025-02-19",
	},
	{
		id: "ORD12347",
		customer: "Alex Johnson",
		amount: 400,
		status: "Shipped",
		date: "2025-02-18",
	},
	{
		id: "ORD12348",
		customer: "Emily Davis",
		amount: 120,
		status: "Cancelled",
		date: "2025-02-17",
	},
];

const AllOrders = () => {
	const [filter, setFilter] = useState("All");

	// Order Status Tag Colors
	const statusColors = {
		Completed: "green",
		Pending: "gold",
		Shipped: "blue",
		Cancelled: "red",
	};

	// Filter Orders
	const filteredOrders =
		filter === "All"
			? ordersData
			: ordersData.filter((order) => order.status === filter);

	return (
		<div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-600 to-purple-500 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold flex items-center justify-center gap-2">
					<FaClipboardList /> All Orders
				</h2>
				<p className="text-gray-200 text-sm mt-2">
					Manage and track all customer orders efficiently.
				</p>
			</div>

			{/* Filter Selection */}
			<Card className="mt-6 p-6 shadow-md rounded-lg">
				<div className="flex items-center space-x-2">
					<span className="font-semibold text-gray-600">Filter by Status:</span>
					<Select
						defaultValue="All"
						onChange={(value) => setFilter(value)}
						className="w-full"
					>
						<Option value="All">All Orders</Option>
						<Option value="Completed">Completed</Option>
						<Option value="Pending">Pending</Option>
						<Option value="Shipped">Shipped</Option>
						<Option value="Cancelled">Cancelled</Option>
					</Select>
				</div>
			</Card>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
				<Card className="shadow-md rounded-lg flex flex-col items-center p-4">
					<FaCheckCircle className="text-green-500 text-3xl" />
					<h3 className="text-lg font-semibold mt-2">Completed</h3>
					<p className="text-gray-600 text-sm">
						{ordersData.filter((o) => o.status === "Completed").length} Orders
					</p>
				</Card>
				<Card className="shadow-md rounded-lg flex flex-col items-center p-4">
					<FaClock className="text-gold-500 text-3xl" />
					<h3 className="text-lg font-semibold mt-2">Pending</h3>
					<p className="text-gray-600 text-sm">
						{ordersData.filter((o) => o.status === "Pending").length} Orders
					</p>
				</Card>
				<Card className="shadow-md rounded-lg flex flex-col items-center p-4">
					<FaClipboardList className="text-blue-500 text-3xl" />
					<h3 className="text-lg font-semibold mt-2">Shipped</h3>
					<p className="text-gray-600 text-sm">
						{ordersData.filter((o) => o.status === "Shipped").length} Orders
					</p>
				</Card>
				<Card className="shadow-md rounded-lg flex flex-col items-center p-4">
					<FaTimesCircle className="text-red-500 text-3xl" />
					<h3 className="text-lg font-semibold mt-2">Cancelled</h3>
					<p className="text-gray-600 text-sm">
						{ordersData.filter((o) => o.status === "Cancelled").length} Orders
					</p>
				</Card>
			</div>

			{/* Orders Table */}
			<Card className="mt-6 shadow-md rounded-lg p-6">
				<h3 className="text-xl font-semibold mb-4">Order List</h3>
				<Table
					dataSource={filteredOrders}
					columns={[
						{ title: "Order ID", dataIndex: "id", key: "id" },
						{ title: "Customer", dataIndex: "customer", key: "customer" },
						{ title: "Amount ($)", dataIndex: "amount", key: "amount" },
						{ title: "Date", dataIndex: "date", key: "date" },
						{
							title: "Status",
							dataIndex: "status",
							key: "status",
							render: (status) => (
								<Tag color={statusColors[status]}>{status}</Tag>
							),
						},
						{
							title: "Action",
							key: "action",
							render: (_, record) => (
								<Button
									type="primary"
									size="small"
									onClick={() => alert(`Viewing order: ${record.id}`)}
								>
									View
								</Button>
							),
						},
					]}
					pagination={false}
					rowKey="id"
				/>
			</Card>
		</div>
	);
};

export default AllOrders;
