import React, { useState } from "react";
import { Card, Table, Tag, Input, Button } from "antd";
import { FaBox, FaSearch, FaPlus } from "react-icons/fa";

// Sample Product Data
const productData = [
	{
		id: "P1001",
		name: "Wireless Headphones",
		price: 99,
		category: "Electronics",
		stock: 15,
		status: "Active",
	},
	{
		id: "P1002",
		name: "Smart Watch",
		price: 149,
		category: "Wearable",
		stock: 8,
		status: "Active",
	},
	{
		id: "P1003",
		name: "Gaming Mouse",
		price: 45,
		category: "Accessories",
		stock: 25,
		status: "Active",
	},
	{
		id: "P1004",
		name: "Bluetooth Speaker",
		price: 65,
		category: "Electronics",
		stock: 0,
		status: "Out of Stock",
	},
];

const AllProducts = () => {
	const [search, setSearch] = useState("");

	// Filter Products Based on Search
	const filteredProducts = productData.filter((product) =>
		product.name.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6 overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold flex items-center justify-center gap-2">
					<FaBox /> All Products
				</h2>
				<p className="text-gray-200 text-sm mt-2">
					Manage and track all available products.
				</p>
			</div>

			{/* Product Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
				<Card className="shadow-md rounded-lg flex flex-col items-center p-4">
					<FaBox className="text-green-500 text-3xl" />
					<h3 className="text-lg font-semibold mt-2">Total Products</h3>
					<p className="text-gray-600 text-sm">{productData.length} Items</p>
				</Card>

				<Card className="shadow-md rounded-lg flex flex-col items-center p-4">
					<FaBox className="text-red-500 text-3xl" />
					<h3 className="text-lg font-semibold mt-2">Out of Stock</h3>
					<p className="text-gray-600 text-sm">
						{productData.filter((p) => p.stock === 0).length} Items
					</p>
				</Card>

				<Card className="shadow-md rounded-lg flex flex-col items-center p-4">
					<FaBox className="text-blue-500 text-3xl" />
					<h3 className="text-lg font-semibold mt-2">Active Products</h3>
					<p className="text-gray-600 text-sm">
						{productData.filter((p) => p.status === "Active").length} Items
					</p>
				</Card>
			</div>

			{/* Search Bar & Add Button */}
			<div className="flex justify-between items-center mt-6">
				<Input
					placeholder="Search Products..."
					prefix={<FaSearch />}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-2/3 p-2 border rounded-md"
				/>
				<Button type="primary" icon={<FaPlus />} className="ml-4">
					Add Product
				</Button>
			</div>

			{/* Product Table */}
			<Card className="mt-6 shadow-md rounded-lg p-6 overflow-x-auto">
				<h3 className="text-xl font-semibold mb-4">Product List</h3>
				<Table
					dataSource={filteredProducts}
					columns={[
						{ title: "Product ID", dataIndex: "id", key: "id" },
						{ title: "Name", dataIndex: "name", key: "name" },
						{ title: "Category", dataIndex: "category", key: "category" },
						{ title: "Price ($)", dataIndex: "price", key: "price" },
						{ title: "Stock", dataIndex: "stock", key: "stock" },
						{
							title: "Status",
							dataIndex: "status",
							key: "status",
							render: (status) => {
								let color = status === "Active" ? "green" : "red";
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
									onClick={() => alert(`Editing product: ${record.id}`)}
								>
									Edit
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

export default AllProducts;
