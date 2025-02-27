import React, { useState } from "react";
import { Table, Tag, Select, Input, Button, Card } from "antd";
import { FaSearch, FaFilter, FaCheckCircle } from "react-icons/fa";

const { Option } = Select;

const ResolvedDisputes = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState("All");

	// Sample dispute data
	const disputes = [
		{
			key: "1",
			id: "#RD001",
			user: "Michael Scott",
			reason: "Refund Issued",
			resolution: "Resolved",
			date: "2025-02-15",
		},
		{
			key: "2",
			id: "#RD002",
			user: "Pam Beesly",
			reason: "Payment Cleared",
			resolution: "Closed",
			date: "2025-02-14",
		},
		{
			key: "3",
			id: "#RD003",
			user: "Jim Halpert",
			reason: "Fraudulent Claim",
			resolution: "Resolved",
			date: "2025-02-13",
		},
		{
			key: "4",
			id: "#RD004",
			user: "Dwight Schrute",
			reason: "Duplicate Charge Reversed",
			resolution: "Closed",
			date: "2025-02-12",
		},
	];

	// Filtering disputes based on type & search input
	const filteredDisputes = disputes.filter(
		(dispute) =>
			(filterType === "All" || dispute.resolution === filterType) &&
			dispute.user.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Table Columns
	const columns = [
		{
			title: "Dispute ID",
			dataIndex: "id",
			key: "id",
			render: (text) => (
				<span className="font-semibold text-green-600">{text}</span>
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
			title: "Resolution",
			dataIndex: "resolution",
			key: "resolution",
			render: (resolution) => {
				let color = resolution === "Resolved" ? "green" : "gray";
				return <Tag color={color}>{resolution}</Tag>;
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
			<div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold flex items-center justify-center gap-2">
					<FaCheckCircle className="text-yellow-300" /> Resolved Disputes
				</h2>
				<p className="text-gray-200 text-sm mt-2">
					View and manage all successfully resolved disputes.
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
							value={filterType}
							onChange={(value) => setFilterType(value)}
							className="w-full"
							size="large"
						>
							<Option value="All">All</Option>
							<Option value="Resolved">Resolved</Option>
							<Option value="Closed">Closed</Option>
						</Select>
					</div>

					{/* Reset Button */}
					<Button
						type="default"
						onClick={() => {
							setFilterType("All");
							setSearchTerm("");
						}}
						className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
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

export default ResolvedDisputes;
