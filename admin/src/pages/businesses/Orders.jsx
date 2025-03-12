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
	Select,
	Tag,
	Badge,
} from "antd";
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	ShoppingCartOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	CloseCircleOutlined,
} from "@ant-design/icons";

const Orders = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [editingId, setEditingId] = useState(null);

	const getStatusColor = (status) => {
		switch (status) {
			case "pending":
				return "warning";
			case "processing":
				return "processing";
			case "shipped":
				return "processing";
			case "delivered":
				return "success";
			case "cancelled":
				return "error";
			default:
				return "default";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "pending":
				return <ClockCircleOutlined />;
			case "processing":
			case "shipped":
				return <ShoppingCartOutlined />;
			case "delivered":
				return <CheckCircleOutlined />;
			case "cancelled":
				return <CloseCircleOutlined />;
			default:
				return null;
		}
	};

	const columns = [
		{
			title: "Order ID",
			dataIndex: "id",
			key: "id",
			render: (id) => `#${id}`,
		},
		{
			title: "Customer",
			dataIndex: "customer",
			key: "customer",
		},
		{
			title: "Items",
			dataIndex: "items",
			key: "items",
			render: (items) => (
				<Badge count={items.length} showZero>
					<ShoppingCartOutlined style={{ fontSize: "20px" }} />
				</Badge>
			),
		},
		{
			title: "Total",
			dataIndex: "total",
			key: "total",
			render: (total) => `$${total.toFixed(2)}`,
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status) => (
				<Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
					{status.charAt(0).toUpperCase() + status.slice(1)}
				</Tag>
			),
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
			title: "Are you sure you want to delete this order?",
			content: "This action cannot be undone.",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk: async () => {
				try {
					// Add your delete API call here
					message.success("Order deleted successfully");
					setOrders(orders.filter((order) => order.id !== id));
				} catch (error) {
					message.error("Failed to delete order");
				}
			},
		});
	};

	const handleModalOk = async () => {
		try {
			const values = await form.validateFields();
			if (editingId) {
				// Add your update API call here
				message.success("Order updated successfully");
				setOrders(
					orders.map((order) =>
						order.id === editingId ? { ...order, ...values } : order
					)
				);
			} else {
				// Add your create API call here
				message.success("Order created successfully");
				setOrders([...orders, { id: Date.now(), ...values }]);
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
				<h1 className="text-2xl font-semibold">Orders</h1>
				<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
					Add Order
				</Button>
			</div>

			<Table
				columns={columns}
				dataSource={orders}
				loading={loading}
				rowKey="id"
			/>

			<Modal
				title={editingId ? "Edit Order" : "Add New Order"}
				open={isModalVisible}
				onOk={handleModalOk}
				onCancel={() => {
					setIsModalVisible(false);
					form.resetFields();
				}}
			>
				<Form form={form} layout="vertical">
					<Form.Item
						name="customer"
						label="Customer Name"
						rules={[{ required: true, message: "Please enter customer name" }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="items"
						label="Items"
						rules={[{ required: true, message: "Please enter items" }]}
					>
						<Input.TextArea rows={4} placeholder="Enter items (one per line)" />
					</Form.Item>
					<Form.Item
						name="total"
						label="Total Amount"
						rules={[{ required: true, message: "Please enter total amount" }]}
					>
						<Input type="number" prefix="$" />
					</Form.Item>
					<Form.Item
						name="status"
						label="Status"
						rules={[{ required: true, message: "Please select order status" }]}
					>
						<Select>
							<Select.Option value="pending">Pending</Select.Option>
							<Select.Option value="processing">Processing</Select.Option>
							<Select.Option value="shipped">Shipped</Select.Option>
							<Select.Option value="delivered">Delivered</Select.Option>
							<Select.Option value="cancelled">Cancelled</Select.Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default Orders;
