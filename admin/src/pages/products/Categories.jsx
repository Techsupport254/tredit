import React, { useState } from "react";
import { Table, Input, Button, Tag, Card } from "antd";
import {
	SearchOutlined,
	PlusOutlined,
	DeleteOutlined,
} from "@ant-design/icons";

const Categories = () => {
	const [search, setSearch] = useState("");
	const [categories, setCategories] = useState([
		{ key: "1", name: "Electronics", status: "Active" },
		{ key: "2", name: "Fashion", status: "Active" },
		{ key: "3", name: "Home & Kitchen", status: "Active" },
		{ key: "4", name: "Sports", status: "Inactive" },
		{ key: "5", name: "Accessories", status: "Active" },
	]);

	// Table Columns
	const columns = [
		{ title: "Category Name", dataIndex: "name", key: "name" },
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status) => (
				<Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
			),
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, record) => (
				<Button
					type="link"
					icon={<DeleteOutlined />}
					danger
					onClick={() => handleDelete(record.key)}
				>
					Delete
				</Button>
			),
		},
	];

	// Filtered Data
	const filteredData = categories.filter((category) =>
		category.name.toLowerCase().includes(search.toLowerCase())
	);

	// Handle Delete
	const handleDelete = (key) => {
		setCategories(categories.filter((category) => category.key !== key));
	};

	return (
		<div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header */}
			<div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold">Manage Categories</h2>
				<p className="text-gray-200 text-sm mt-1">
					Organize your products into categories.
				</p>
			</div>

			{/* Search & Add Category */}
			<Card className="mt-6 shadow-md rounded-lg p-6">
				<div className="flex justify-between items-center mb-4">
					<Input
						placeholder="Search categories..."
						prefix={<SearchOutlined />}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-1/3"
					/>
					<Button type="primary" icon={<PlusOutlined />}>
						Add New Category
					</Button>
				</div>

				{/* Categories Table */}
				<Table
					dataSource={filteredData}
					columns={columns}
					pagination={{ pageSize: 5 }}
				/>
			</Card>
		</div>
	);
};

export default Categories;
