import React, { useState } from "react";
import { Table, Input, Button, Tag, Card } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const Inventory = () => {
	const [search, setSearch] = useState("");

	// Sample Inventory Data
	const inventoryData = [
		{
			key: "1",
			name: "Wireless Headphones",
			category: "Electronics",
			stock: 50,
			status: "In Stock",
		},
		{
			key: "2",
			name: "Running Shoes",
			category: "Fashion",
			stock: 0,
			status: "Out of Stock",
		},
		{
			key: "3",
			name: "Gaming Mouse",
			category: "Electronics",
			stock: 20,
			status: "In Stock",
		},
		{
			key: "4",
			name: "Office Chair",
			category: "Furniture",
			stock: 5,
			status: "Low Stock",
		},
		{
			key: "5",
			name: "Smart Watch",
			category: "Accessories",
			stock: 2,
			status: "Low Stock",
		},
	];

	// Table Columns
	const columns = [
		{ title: "Product Name", dataIndex: "name", key: "name" },
		{ title: "Category", dataIndex: "category", key: "category" },
		{ title: "Stock", dataIndex: "stock", key: "stock" },
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status) => {
				let color =
					status === "In Stock"
						? "green"
						: status === "Low Stock"
						? "orange"
						: "red";
				return <Tag color={color}>{status}</Tag>;
			},
		},
	];

	// Filtered Data
	const filteredData = inventoryData.filter((item) =>
		item.name.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-500 to-teal-600 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold">Inventory Management</h2>
				<p className="text-gray-200 text-sm mt-1">
					Monitor and manage your stock efficiently.
				</p>
			</div>

			{/* Search Input */}
			<Card className="mt-6 shadow-md rounded-lg p-6">
				<div className="flex justify-between items-center mb-4">
					<Input
						placeholder="Search by product name..."
						prefix={<SearchOutlined />}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-1/3"
					/>
					<Button type="primary">Add New Product</Button>
				</div>

				{/* Inventory Table */}
				<Table
					dataSource={filteredData}
					columns={columns}
					pagination={{ pageSize: 5 }}
				/>
			</Card>
		</div>
	);
};

export default Inventory;
