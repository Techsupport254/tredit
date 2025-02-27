import React from "react";
import { Table, Tag, Button, Card } from "antd";
import {
	FaMoneyCheckAlt,
	FaClock,
	FaCheckCircle,
	FaTimesCircle,
} from "react-icons/fa";

const payoutRequests = [
	{ id: 1, amount: "$500.00", date: "Feb 22, 2025", status: "Pending" },
	{ id: 2, amount: "$1,200.00", date: "Feb 20, 2025", status: "Approved" },
	{ id: 3, amount: "$350.00", date: "Feb 18, 2025", status: "Rejected" },
];

const statusColors = {
	Pending: "orange",
	Approved: "green",
	Rejected: "red",
};

const PayoutRequests = () => {
	return (
		<div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header */}
			<div className="flex items-center justify-between bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-lg text-white">
				<div className="flex items-center gap-4">
					<FaMoneyCheckAlt className="text-4xl" />
					<div>
						<h2 className="text-xl font-semibold">Payout Requests</h2>
						<p className="text-gray-200 text-sm">
							Manage your withdrawal requests
						</p>
					</div>
				</div>
			</div>

			{/* Payout Requests Table */}
			<Card className="mt-6">
				<Table
					dataSource={payoutRequests}
					pagination={false}
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
							title: "Status",
							dataIndex: "status",
							key: "status",
							render: (status) => (
								<Tag color={statusColors[status]}>
									{status === "Pending" && <FaClock className="mr-1" />}
									{status === "Approved" && <FaCheckCircle className="mr-1" />}
									{status === "Rejected" && <FaTimesCircle className="mr-1" />}
									{status}
								</Tag>
							),
						},
					]}
				/>
			</Card>

			{/* Request Payout Button */}
			<Button
				type="primary"
				className="w-full mt-4 bg-blue-600 border-blue-600"
			>
				Request Payout
			</Button>
		</div>
	);
};

export default PayoutRequests;
