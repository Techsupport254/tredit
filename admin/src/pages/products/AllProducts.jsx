import { Table, Button, Select, Dropdown, Tag } from "antd";
import {
	ExportOutlined,
	MoreOutlined,
	DeleteOutlined,
	EditOutlined,
} from "@ant-design/icons";
import { useState } from "react";

// Sample Product Data
const productData = [
	{
		id: "#KP267400",
		name: "Cherry Delight",
		price: 90.5,
		type: "Dessert",
		stock: "350 pcs",
		status: "Pending",
		image: "🍒",
	},
	{
		id: "#TL651535",
		name: "Kiwi",
		price: 12.0,
		type: "Fruits",
		stock: "650 kg",
		status: "Active",
		image: "🥝",
	},
	{
		id: "#GB651535",
		name: "Mango Magic",
		price: 100.5,
		type: "Ice Cream",
		stock: "1200 pcs",
		status: "Inactive",
		image: "🥭",
	},
	{
		id: "#ER651535",
		name: "Joy Care",
		price: 59.99,
		type: "Care",
		stock: "700 pcs",
		status: "On Sale",
		image: "🏥",
	},
	{
		id: "#SD487441",
		name: "Blueberry Bliss",
		price: 150.9,
		type: "Dessert",
		stock: "100 lt",
		status: "Bouncing",
		image: "🫐",
	},
];

const AllProducts = () => {
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [filters, setFilters] = useState({
		status: undefined,
		type: undefined,
	});

	const getStatusColor = (status) => {
		const colors = {
			Active: "bg-emerald-50 text-emerald-600",
			Inactive: "bg-red-50 text-red-600",
			Pending: "bg-orange-50 text-orange-600",
			"On Sale": "bg-blue-50 text-blue-600",
			Bouncing: "bg-purple-50 text-purple-600",
		};
		return colors[status] || "bg-gray-50 text-gray-600";
	};

	// Get unique types and statuses for filters
	const uniqueTypes = [...new Set(productData.map((item) => item.type))];
	const uniqueStatuses = [...new Set(productData.map((item) => item.status))];

	// Filter products based on selected filters
	const filteredProducts = productData.filter((product) => {
		if (filters.status && product.status !== filters.status) return false;
		if (filters.type && product.type !== filters.type) return false;
		return true;
	});

	const handleBulkAction = (action) => {
		switch (action) {
			case "delete":
				console.log("Delete selected items:", selectedRowKeys);
				break;
			case "edit":
				console.log("Edit selected items:", selectedRowKeys);
				break;
			case "export":
				console.log("Export selected items:", selectedRowKeys);
				break;
		}
	};

	const bulkActionItems = [
		{
			key: "delete",
			label: "Delete Selected",
			icon: <DeleteOutlined />,
			danger: true,
		},
		{
			key: "edit",
			label: "Edit Selected",
			icon: <EditOutlined />,
		},
		{
			key: "export",
			label: "Export Selected",
			icon: <ExportOutlined />,
		},
	];

	const handleExport = () => {
		// Prepare data for export
		const exportData = filteredProducts.map((product) => ({
			ID: product.id,
			Name: product.name,
			Price: product.price,
			Type: product.type,
			Stock: product.stock,
			Status: product.status,
		}));

		// Convert to CSV
		const headers = Object.keys(exportData[0]);
		const csvContent = [
			headers.join(","),
			...exportData.map((row) =>
				headers
					.map((header) => {
						const value = row[header];
						// Handle values that might contain commas
						return typeof value === "string" && value.includes(",")
							? `"${value}"`
							: value;
					})
					.join(",")
			),
		].join("\n");

		// Create and trigger download
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`products_${new Date().toISOString().split("T")[0]}.csv`
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<div className="p-0 bg-gray-50 w-full min-h-screen">
			<div className="max-w-[1200px] mx-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						{selectedRowKeys.length > 0 && (
							<div className="flex items-center gap-2">
								<Tag color="blue">{selectedRowKeys.length} items selected</Tag>
								<Dropdown
									menu={{
										items: bulkActionItems,
										onClick: ({ key }) => handleBulkAction(key),
									}}
									trigger={["click"]}
								>
									<Button type="primary" className="bg-blue-500">
										Bulk Actions
									</Button>
								</Dropdown>
							</div>
						)}
						<div className="flex items-center gap-2">
							<span className="text-gray-600">Showing</span>
							<Select
								defaultValue="10"
								className="w-[70px] bg-blue-50"
								options={[
									{ value: "10", label: "10" },
									{ value: "20", label: "20" },
									{ value: "30", label: "30" },
								]}
								suffixIcon={<span className="text-black">▼</span>}
							/>
						</div>
						<Select
							placeholder="Filter by Status"
							className="w-[150px]"
							allowClear
							onChange={(value) =>
								setFilters((prev) => ({ ...prev, status: value }))
							}
							options={uniqueStatuses.map((status) => ({
								value: status,
								label: status,
							}))}
						/>
						<Select
							placeholder="Filter by Type"
							className="w-[150px]"
							allowClear
							onChange={(value) =>
								setFilters((prev) => ({ ...prev, type: value }))
							}
							options={uniqueTypes.map((type) => ({
								value: type,
								label: type,
							}))}
						/>
					</div>
					<div className="flex items-center gap-3">
						<Button
							className="flex items-center gap-2 border rounded-lg h-10 px-4 hover:bg-gray-50"
							onClick={handleExport}
						>
							<ExportOutlined />
							Export
						</Button>
						<Button
							type="primary"
							className="flex items-center gap-2 bg-blue-500 h-10 px-4 rounded-lg hover:bg-blue-600"
						>
							<svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
								<path
									d="M12 7L12 17"
									stroke="white"
									strokeWidth="1.5"
									strokeLinecap="round"
								/>
								<path
									d="M7 12L17 12"
									stroke="white"
									strokeWidth="1.5"
									strokeLinecap="round"
								/>
							</svg>
							Add New Product
						</Button>
					</div>
				</div>

				{/* Products Table */}
				<div className="bg-white rounded-lg overflow-hidden">
					<Table
						dataSource={filteredProducts}
						rowSelection={{
							selectedRowKeys,
							onChange: (newSelectedRowKeys) => {
								setSelectedRowKeys(newSelectedRowKeys);
							},
						}}
						columns={[
							{
								title: "Product Name",
								key: "name",
								render: (record) => (
									<div className="flex items-center gap-3">
										<span className="text-2xl">{record.image}</span>
										<div>
											<div className="font-medium">{record.name}</div>
											<div className="text-gray-500 text-sm">{record.id}</div>
										</div>
									</div>
								),
							},
							{
								title: "Price",
								dataIndex: "price",
								key: "price",
								render: (price) => (
									<span className="font-medium">${price.toFixed(2)}</span>
								),
							},
							{
								title: "Stock",
								dataIndex: "stock",
								key: "stock",
								render: (stock) => (
									<span className="text-gray-600">{stock}</span>
								),
							},
							{
								title: "Type",
								dataIndex: "type",
								key: "type",
								render: (type) => <span className="text-gray-600">{type}</span>,
							},
							{
								title: "Status",
								dataIndex: "status",
								key: "status",
								render: (status) => (
									<span
										className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
											status
										)}`}
									>
										{status}
									</span>
								),
							},
							{
								title: "Action",
								key: "action",
								render: () => (
									<Button
										type="text"
										icon={<MoreOutlined />}
										className="text-gray-500 hover:text-gray-700"
									/>
								),
							},
						]}
						pagination={{
							total: filteredProducts.length,
							pageSize: 10,
							showSizeChanger: false,
							showTotal: false,
							size: "small",
							className: "px-6",
						}}
						rowKey="id"
					/>
				</div>
			</div>
		</div>
	);
};

export default AllProducts;
