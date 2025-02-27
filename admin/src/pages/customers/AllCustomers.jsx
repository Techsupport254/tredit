import React, { useState } from "react";
import { Table, Input, Select, Button, Card, Tag, Avatar } from "antd";
import { FaSearch, FaFilter, FaUsers } from "react-icons/fa";

const { Option } = Select;

const AllCustomers = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("All");

	// Sample customer data
	const customers = [
		{
			key: "1",
			name: "Michael Scott",
			email: "michael@dundermifflin.com",
			status: "Active",
			joined: "2023-08-15",
			avatar: "https://randomuser.me/api/portraits/men/1.jpg",
		},
		{
			key: "2",
			name: "Pam Beesly",
			email: "pam@dundermifflin.com",
			status: "Inactive",
			joined: "2023-07-21",
			avatar: "https://randomuser.me/api/portraits/women/2.jpg",
		},
		{
			key: "3",
			name: "Jim Halpert",
			email: "jim@dundermifflin.com",
			status: "Active",
			joined: "2023-06-10",
			avatar: "https://randomuser.me/api/portraits/men/3.jpg",
		},
		{
			key: "4",
			name: "Dwight Schrute",
			email: "dwight@dundermifflin.com",
			status: "Suspended",
			joined: "2023-05-03",
			avatar: "https://randomuser.me/api/portraits/men/4.jpg",
		},
	];

	// Filtering customers based on status & search input
	const filteredCustomers = customers.filter(
		(customer) =>
			(filterStatus === "All" || customer.status === filterStatus) &&
			customer.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Table Columns
	const columns = [
		{
			title: "Customer",
			dataIndex: "name",
			key: "name",
			render: (text, record) => (
				<div className="flex items-center gap-3">
					<Avatar src={record.avatar} />
					<div>
						<p className="font-semibold">{text}</p>
						<p className="text-gray-500 text-sm">{record.email}</p>
					</div>
				</div>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status) => {
				let color =
					status === "Active"
						? "green"
						: status === "Inactive"
						? "gray"
						: "red";
				return <Tag color={color}>{status}</Tag>;
			},
		},
		{
			title: "Joined Date",
			dataIndex: "joined",
			key: "joined",
		},
	];

	return (
		<div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header Section */}
			<div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold flex items-center justify-center gap-2">
					<FaUsers className="text-yellow-300" /> All Customers
				</h2>
				<p className="text-gray-200 text-sm mt-2">
					View and manage all registered customers.
				</p>
			</div>

			{/* Search & Filter Section */}
			<Card className="mt-6 p-6 shadow-md rounded-lg">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Search */}
					<div className="flex items-center space-x-2 border rounded-md p-2 bg-gray-100">
						<FaSearch className="text-gray-400" />
						<Input
							placeholder="Search by name..."
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
							<Option value="Active">Active</Option>
							<Option value="Inactive">Inactive</Option>
							<Option value="Suspended">Suspended</Option>
						</Select>
					</div>

					{/* Reset Button */}
					<Button
						type="default"
						onClick={() => {
							setFilterStatus("All");
							setSearchTerm("");
						}}
						className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
					>
						Reset Filters
					</Button>
				</div>
			</Card>

			{/* Customers Table */}
			<Card className="mt-6 p-6 shadow-md rounded-lg">
				<Table
					columns={columns}
					dataSource={filteredCustomers}
					pagination={{ pageSize: 5 }}
					bordered
					className="overflow-x-auto"
				/>
			</Card>
		</div>
	);
};

export default AllCustomers;
