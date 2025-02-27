import React, { useState } from "react";
import { Card, Input, Select, Button, List, Tag, Avatar } from "antd";
import {
	FaSearch,
	FaFilter,
	FaUserCircle,
	FaEnvelopeOpenText,
} from "react-icons/fa";

const { Option } = Select;

const CustomerQueries = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("All");

	const queries = [
		{
			id: 1,
			name: "John Doe",
			avatar: "https://randomuser.me/api/portraits/men/4.jpg",
			email: "john.doe@email.com",
			query: "How can I reset my password?",
			date: "2024-02-21",
			status: "Pending",
		},
		{
			id: 2,
			name: "Sarah Adams",
			avatar: "https://randomuser.me/api/portraits/women/5.jpg",
			email: "sarah.adams@email.com",
			query: "I was charged incorrectly for my subscription.",
			date: "2024-02-20",
			status: "Resolved",
		},
		{
			id: 3,
			name: "Michael Smith",
			avatar: "https://randomuser.me/api/portraits/men/6.jpg",
			email: "michael.smith@email.com",
			query: "How do I delete my account permanently?",
			date: "2024-02-19",
			status: "In Progress",
		},
	];

	// Filtering function
	const filteredQueries = queries.filter(
		(q) =>
			(statusFilter === "All" || q.status === statusFilter) &&
			q.query.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header Section */}
			<div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold flex items-center justify-center gap-2">
					<FaEnvelopeOpenText /> Customer Queries
				</h2>
				<p className="text-gray-200 text-sm mt-2">
					Manage and respond to customer inquiries.
				</p>
			</div>

			{/* Search & Filter Section */}
			<Card className="mt-6 p-6 shadow-md rounded-lg">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Search */}
					<div className="flex items-center space-x-2 border rounded-md p-2 bg-gray-100">
						<FaSearch className="text-gray-400" />
						<Input
							placeholder="Search queries..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full bg-transparent outline-none"
						/>
					</div>

					{/* Filter */}
					<div className="flex items-center space-x-2 border rounded-md p-2 bg-gray-100">
						<FaFilter className="text-gray-400" />
						<Select
							value={statusFilter}
							onChange={(value) => setStatusFilter(value)}
							className="w-full"
							size="large"
						>
							<Option value="All">All Status</Option>
							<Option value="Pending">Pending</Option>
							<Option value="In Progress">In Progress</Option>
							<Option value="Resolved">Resolved</Option>
						</Select>
					</div>
				</div>
			</Card>

			{/* Queries List */}
			<Card className="mt-6 p-6 shadow-md rounded-lg">
				<List
					itemLayout="horizontal"
					dataSource={filteredQueries}
					renderItem={(query) => (
						<List.Item className="border-b pb-4 mb-4">
							<List.Item.Meta
								avatar={
									<Avatar
										src={
											query.avatar || (
												<FaUserCircle className="text-gray-400 w-10 h-10" />
											)
										}
									/>
								}
								title={
									<div className="flex justify-between items-center">
										<div>
											<span className="font-semibold">{query.name}</span>{" "}
											<span className="text-gray-500 text-sm">
												({query.email})
											</span>
										</div>
										<Tag
											color={
												query.status === "Pending"
													? "red"
													: query.status === "Resolved"
													? "green"
													: "blue"
											}
										>
											{query.status}
										</Tag>
									</div>
								}
								description={
									<div className="mt-2">
										<p>{query.query}</p>
										<p className="text-gray-500 text-sm mt-1">
											Received on {query.date}
										</p>
									</div>
								}
							/>
						</List.Item>
					)}
				/>
			</Card>
		</div>
	);
};

export default CustomerQueries;
