import React, { useState } from "react";
import {
	Table,
	Button,
	Space,
	message,
	notification,
	Modal,
	Form,
	Input,
	InputNumber,
	Tag,
} from "antd";
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	WarningOutlined,
} from "@ant-design/icons";

const StockControl = () => {
	const [inventory, setInventory] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [editingId, setEditingId] = useState(null);

	const columns = [
		{
			title: "Product Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "SKU",
			dataIndex: "sku",
			key: "sku",
		},
		{
			title: "Quantity",
			dataIndex: "quantity",
			key: "quantity",
			render: (quantity, record) => (
				<Space>
					<span>{quantity}</span>
					{quantity <= record.lowStockThreshold && (
						<Tag color="red" icon={<WarningOutlined />}>
							Low Stock
						</Tag>
					)}
				</Space>
			),
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			render: (price) => `$${price.toFixed(2)}`,
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, record) => (
				<Space>
					<Button
						type="primary"
						icon={<EditOutlined />}
						onClick={() => handleEdit(record)}
					>
						Edit
					</Button>
					<Button
						danger
						icon={<DeleteOutlined />}
						onClick={() => handleDelete(record.id)}
					>
						Delete
					</Button>
				</Space>
			),
		},
	];

	const handleAdd = () => {
		setEditingId(null);
		form.resetFields();
		setIsModalVisible(true);
	};

	const handleEdit = (record) => {
		setEditingId(record.id);
		form.setFieldsValue(record);
		setIsModalVisible(true);
	};

	const handleDelete = (id) => {
		Modal.confirm({
			title: "Are you sure you want to delete this product?",
			content: "This action cannot be undone.",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk: async () => {
				try {
					// Add your delete API call here
					message.success("Product deleted successfully");
					setInventory(inventory.filter((item) => item.id !== id));
				} catch (error) {
					message.error("Failed to delete product");
				}
			},
		});
	};

	const handleModalOk = async () => {
		try {
			const values = await form.validateFields();
			if (editingId) {
				// Add your update API call here
				message.success("Product updated successfully");
				setInventory(
					inventory.map((item) =>
						item.id === editingId ? { ...item, ...values } : item
					)
				);
			} else {
				// Add your create API call here
				message.success("Product added successfully");
				setInventory([...inventory, { id: Date.now(), ...values }]);
			}
			setIsModalVisible(false);
			form.resetFields();
		} catch (error) {
			message.error("Please fill in all required fields");
		}
	};

	return (
		<div className="p-6">
			<div className="mb-4 flex justify-between items-center">
				<h1 className="text-2xl font-semibold">Stock Control</h1>
				<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
					Add Product
				</Button>
			</div>

			<Table
				columns={columns}
				dataSource={inventory}
				loading={loading}
				rowKey="id"
			/>

			<Modal
				title={editingId ? "Edit Product" : "Add New Product"}
				open={isModalVisible}
				onOk={handleModalOk}
				onCancel={() => {
					setIsModalVisible(false);
					form.resetFields();
				}}
			>
				<Form form={form} layout="vertical">
					<Form.Item
						name="name"
						label="Product Name"
						rules={[{ required: true, message: "Please enter product name" }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="sku"
						label="SKU"
						rules={[{ required: true, message: "Please enter SKU" }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="quantity"
						label="Quantity"
						rules={[{ required: true, message: "Please enter quantity" }]}
					>
						<InputNumber min={0} style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item
						name="price"
						label="Price"
						rules={[{ required: true, message: "Please enter price" }]}
					>
						<InputNumber
							min={0}
							step={0.01}
							prefix="$"
							style={{ width: "100%" }}
						/>
					</Form.Item>
					<Form.Item
						name="lowStockThreshold"
						label="Low Stock Threshold"
						rules={[
							{ required: true, message: "Please enter low stock threshold" },
						]}
					>
						<InputNumber min={0} style={{ width: "100%" }} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default StockControl;
