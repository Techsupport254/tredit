import React from "react";
import { Table, Tag, Card } from "antd";
import {
	FaMoneyBillWave,
	FaCheckCircle,
	FaTimesCircle,
	FaClock,
} from "react-icons/fa";

const transactions = [
	{
		id: 1,
		amount: "$150.00",
		date: "Feb 22, 2025",
		method: "Credit Card",
		status: "Completed",
	},
	{
		id: 2,
		amount: "$80.00",
		date: "Feb 21, 2025",
		method: "PayPal",
		status: "Pending",
	},
	{
		id: 3,
		amount: "$250.00",
		date: "Feb 19, 2025",
		method: "Bank Transfer",
		status: "Failed",
	},
	{
		id: 4,
		amount: "$500.00",
		date: "Feb 18, 2025",
		method: "Crypto",
		status: "Completed",
	},
];

const statusColors = {
	Completed: "green",
	Pending: "orange",
	Failed: "red",
};

const TransactionHistory = () => {
	return (
		<div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header */}
			<div className="flex items-center justify-between bg-gradient-to-r from-green-500 to-blue-600 p-6 rounded-lg text-white">
				<div className="flex items-center gap-4">
					<FaMoneyBillWave className="text-4xl" />
					<div>
						<h2 className="text-xl font-semibold">Transaction History</h2>
						<p className="text-gray-200 text-sm">
							Track your past transactions
						</p>
					</div>
				</div>
			</div>

			{/* Transactions Table */}
			<Card className="mt-6">
				<Table
					dataSource={transactions}
					pagination={{ pageSize: 5 }}
					columns={[
						{
							title: "Date",
							dataIndex: "date",
							key: "date",
						},
						{
							title: "Amount",
							dataIndex: "amount",
							key: "amount",
						},
						{
							title: "Payment Method",
							dataIndex: "method",
							key: "method",
						},
						{
							title: "Status",
							dataIndex: "status",
							key: "status",
							render: (status) => (
								<Tag color={statusColors[status]}>
									{status === "Pending" && <FaClock className="mr-1" />}
									{status === "Completed" && <FaCheckCircle className="mr-1" />}
									{status === "Failed" && <FaTimesCircle className="mr-1" />}
									{status}
								</Tag>
							),
						},
					]}
				/>
			</Card>
		</div>
	);
};

export default TransactionHistory;
