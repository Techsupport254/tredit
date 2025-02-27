import React from "react";
import { Card, Table, Tag, Button } from "antd";
import { FaCheckCircle, FaEye } from "react-icons/fa";

// Sample Completed Orders Data
const completedOrdersData = [
	{
		id: "ORD1001",
		customer: "John Doe",
		amount: 120,
		status: "Completed",
		date: "2025-02-10",
	},
	{
		id: "ORD1002",
		customer: "Jane Smith",
		amount: 340,
		status: "Completed",
		date: "2025-02-08",
	},
	{
		id: "ORD1003",
		customer: "Alice Brown",
		amount: 215,
		status: "Completed",
		date: "2025-02-06",
	},
	{
		id: "ORD1004",
		customer: "Bob Johnson",
		amount: 499,
		status: "Completed",
		date: "2025-02-05",
	},
];

const CompletedOrders = () => {
	return (
		<div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6 overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold flex items-center justify-center gap-2">
					<FaCheckCircle /> Completed Orders
				</h2>
				<p className="text-gray-200 text-sm mt-2">
					List of all successfully completed orders.
				</p>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
				<Card className="shadow-md rounded-lg flex flex-col items-center p-4">
					<FaCheckCircle className="text-green-500 text-3xl" />
					<h3 className="text-lg font-semibold mt-2">Total Completed</h3>
					<p className="text-gray-600 text-sm">
						{completedOrdersData.length} Orders
					</p>
				</Card>
			</div>

			{/* Orders Table */}
			<Card className="mt-6 shadow-md rounded-lg p-6 overflow-x-auto">
				<h3 className="text-xl font-semibold mb-4">Completed Orders List</h3>
				<Table
					dataSource={completedOrdersData}
					columns={[
						{ title: "Order ID", dataIndex: "id", key: "id" },
						{ title: "Customer", dataIndex: "customer", key: "customer" },
						{ title: "Amount ($)", dataIndex: "amount", key: "amount" },
						{ title: "Date", dataIndex: "date", key: "date" },
						{
							title: "Status",
							dataIndex: "status",
							key: "status",
							render: (status) => <Tag color="green">{status}</Tag>,
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

export default CompletedOrders;
