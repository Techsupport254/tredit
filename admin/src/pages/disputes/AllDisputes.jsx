import React, { useState } from "react";
import { Table, Tag, Select, Input, Button, Card } from "antd";
import { FaSearch, FaFilter, FaExclamationTriangle } from "react-icons/fa";

const { Option } = Select;

const AllDisputes = () => {
	const [filterStatus, setFilterStatus] = useState("All");
	const [searchTerm, setSearchTerm] = useState("");

	// Sample dispute data
	const disputes = [
		{
			key: "1",
			id: "#DPT001",
			user: "John Doe",
			reason: "Unauthorized Transaction",
			status: "Pending",
			date: "2025-02-20",
		},
		{
			key: "2",
			id: "#DPT002",
			user: "Jane Smith",
			reason: "Payment Not Received",
			status: "Resolved",
			date: "2025-02-18",
		},
		{
			key: "3",
			id: "#DPT003",
			user: "Alice Johnson",
			reason: "Fraudulent Activity",
			status: "In Progress",
			date: "2025-02-17",
		},
		{
			key: "4",
			id: "#DPT004",
			user: "Mark Wilson",
			reason: "Duplicate Charge",
			status: "Closed",
			date: "2025-02-16",
		},
	];

	// Filtered disputes based on status & search
	const filteredDisputes = disputes.filter(
		(dispute) =>
			(filterStatus === "All" || dispute.status === filterStatus) &&
			dispute.user.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Dispute table columns
	const columns = [
		{
			title: "Dispute ID",
			dataIndex: "id",
			key: "id",
			render: (text) => (
				<span className="font-semibold text-blue-600">{text}</span>
			),
		},
		{
			title: "User",
			dataIndex: "user",
			key: "user",
		},
		{
			title: "Reason",
			dataIndex: "reason",
			key: "reason",
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status) => {
				let color = "";
				switch (status) {
					case "Pending":
						color = "orange";
						break;
					case "Resolved":
						color = "green";
						break;
					case "In Progress":
						color = "blue";
						break;
					case "Closed":
						color = "gray";
						break;
					default:
						color = "default";
				}
				return <Tag color={color}>{status}</Tag>;
			},
		},
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
		},
	];

	return (
		<div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header Section */}
			<div className="bg-gradient-to-r from-red-500 to-orange-600 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold flex items-center justify-center gap-2">
					<FaExclamationTriangle className="text-yellow-300" /> All Disputes
				</h2>
				<p className="text-gray-200 text-sm mt-2">
					Manage and track all user disputes effectively.
				</p>
			</div>

			{/* Search & Filter Section */}
			<Card className="mt-6 p-6 shadow-md rounded-lg">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Search */}
					<div className="flex items-center space-x-2 border rounded-md p-2 bg-gray-100">
						<FaSearch className="text-gray-400" />
						<Input
							placeholder="Search by user..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full bg-transparent outline-none"
						/>
					</div>

					{/* Filter */}
					<div className="flex items-center space-x-2 border rounded-md p-2 bg-gray-100">
						<FaFilter className="text-gray-400" />
						<Select
							value={filterStatus}
							onChange={(value) => setFilterStatus(value)}
							className="w-full"
							size="large"
						>
							<Option value="All">All</Option>
							<Option value="Pending">Pending</Option>
							<Option value="In Progress">In Progress</Option>
							<Option value="Resolved">Resolved</Option>
							<Option value="Closed">Closed</Option>
						</Select>
					</div>

					{/* Reset Button */}
					<Button
						type="default"
						onClick={() => {
							setFilterStatus("All");
							setSearchTerm("");
						}}
						className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
					>
						Reset Filters
					</Button>
				</div>
			</Card>

			{/* Dispute Table */}
			<Card className="mt-6 p-6 shadow-md rounded-lg">
				<Table
					columns={columns}
					dataSource={filteredDisputes}
					pagination={{ pageSize: 5 }}
					bordered
					className="overflow-x-auto"
				/>
			</Card>
		</div>
	);
};

export default AllDisputes;
