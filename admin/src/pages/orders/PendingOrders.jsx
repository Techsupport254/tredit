import React, { useState } from "react";
import { Card, Table, Tag, Button, Select } from "antd";
import { FaClock, FaEye } from "react-icons/fa";

const { Option } = Select;

// Sample Pending Orders Data
const pendingOrdersData = [
	{
		id: "ORD56789",
		customer: "Michael Scott",
		amount: 320,
		status: "Pending",
		date: "2025-02-21",
	},
	{
		id: "ORD56790",
		customer: "Dwight Schrute",
		amount: 450,
		status: "Pending",
		date: "2025-02-20",
	},
	{
		id: "ORD56791",
		customer: "Pam Beesly",
		amount: 210,
		status: "Pending",
		date: "2025-02-19",
	},
	{
		id: "ORD56792",
		customer: "Jim Halpert",
		amount: 150,
		status: "Pending",
		date: "2025-02-18",
	},
];

const PendingOrders = () => {
	const [filter, setFilter] = useState("All");

	// Filter orders (future feature, if needed)
	const filteredOrders =
		filter === "All"
			? pendingOrdersData
			: pendingOrdersData.filter((order) => order.status === filter);

	return (
		<div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6 overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold flex items-center justify-center gap-2">
					<FaClock /> Pending Orders
				</h2>
				<p className="text-gray-200 text-sm mt-2">
					Review and manage all pending customer orders.
				</p>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
				<Card className="shadow-md rounded-lg flex flex-col items-center p-4">
					<FaClock className="text-yellow-500 text-3xl" />
					<h3 className="text-lg font-semibold mt-2">Total Pending</h3>
					<p className="text-gray-600 text-sm">
						{pendingOrdersData.length} Orders
					</p>
				</Card>
			</div>

			{/* Orders Table */}
			<Card className="mt-6 shadow-md rounded-lg p-6 overflow-x-auto">
				<h3 className="text-xl font-semibold mb-4">Pending Orders List</h3>
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
							render: (status) => <Tag color="gold">{status}</Tag>,
						},
						{
							title: "Action",
							key: "action",
							render: (_, record) => (
								<Button
									type="primary"
									size="small"
									icon={<FaEye />}
									onClick={() => alert(`Viewing order: ${record.id}`)}
								>
									View
								</Button>
							),
						},
					]}
					pagination={{ pageSize: 5 }}
					rowKey="id"
					scroll={{ x: "max-content" }}
				/>
			</Card>
		</div>
	);
};

export default PendingOrders;
