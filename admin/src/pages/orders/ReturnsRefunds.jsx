import React from "react";
import { Card, Table, Tag, Button } from "antd";
import { FaUndo, FaEye, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// Sample Returns & Refunds Data
const returnsRefundsData = [
	{
		id: "RR1001",
		customer: "John Doe",
		amount: 120,
		status: "Approved",
		date: "2025-02-12",
	},
	{
		id: "RR1002",
		customer: "Jane Smith",
		amount: 85,
		status: "Pending",
		date: "2025-02-10",
	},
	{
		id: "RR1003",
		customer: "Alice Brown",
		amount: 215,
		status: "Rejected",
		date: "2025-02-08",
	},
	{
		id: "RR1004",
		customer: "Bob Johnson",
		amount: 50,
		status: "Approved",
		date: "2025-02-06",
	},
];

const ReturnsRefunds = () => {
	return (
		<div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6 overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold flex items-center justify-center gap-2">
					<FaUndo /> Returns & Refunds
				</h2>
				<p className="text-gray-200 text-sm mt-2">
					Manage all customer return & refund requests.
				</p>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
				<Card className="shadow-md rounded-lg flex flex-col items-center p-4">
					<FaCheckCircle className="text-green-500 text-3xl" />
					<h3 className="text-lg font-semibold mt-2">Approved Refunds</h3>
					<p className="text-gray-600 text-sm">
						{
							returnsRefundsData.filter((item) => item.status === "Approved")
								.length
						}{" "}
						Requests
					</p>
				</Card>

				<Card className="shadow-md rounded-lg flex flex-col items-center p-4">
					<FaTimesCircle className="text-red-500 text-3xl" />
					<h3 className="text-lg font-semibold mt-2">Rejected Refunds</h3>
					<p className="text-gray-600 text-sm">
						{
							returnsRefundsData.filter((item) => item.status === "Rejected")
								.length
						}{" "}
						Requests
					</p>
				</Card>

				<Card className="shadow-md rounded-lg flex flex-col items-center p-4">
					<FaUndo className="text-yellow-500 text-3xl" />
					<h3 className="text-lg font-semibold mt-2">Pending Requests</h3>
					<p className="text-gray-600 text-sm">
						{
							returnsRefundsData.filter((item) => item.status === "Pending")
								.length
						}{" "}
						Requests
					</p>
				</Card>
			</div>

			{/* Returns & Refunds Table */}
			<Card className="mt-6 shadow-md rounded-lg p-6 overflow-x-auto">
				<h3 className="text-xl font-semibold mb-4">Return & Refund Requests</h3>
				<Table
					dataSource={returnsRefundsData}
					columns={[
						{ title: "Request ID", dataIndex: "id", key: "id" },
						{ title: "Customer", dataIndex: "customer", key: "customer" },
						{ title: "Amount ($)", dataIndex: "amount", key: "amount" },
						{ title: "Date", dataIndex: "date", key: "date" },
						{
							title: "Status",
							dataIndex: "status",
							key: "status",
							render: (status) => {
								let color =
									status === "Approved"
										? "green"
										: status === "Rejected"
										? "red"
										: "orange";
								return <Tag color={color}>{status}</Tag>;
							},
						},
						{
							title: "Action",
							key: "action",
							render: (_, record) => (
								<Button
									type="primary"
									size="small"
									icon={<FaEye />}
									onClick={() => alert(`Viewing refund request: ${record.id}`)}
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

export default ReturnsRefunds;
