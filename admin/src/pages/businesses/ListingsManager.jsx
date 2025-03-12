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
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const ListingsManager = () => {
	const [listings, setListings] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [editingId, setEditingId] = useState(null);

	const columns = [
		{
			title: "Title",
			dataIndex: "title",
			key: "title",
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			render: (price) => `$${price.toFixed(2)}`,
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
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
			title: "Are you sure you want to delete this listing?",
			content: "This action cannot be undone.",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk: async () => {
				try {
					// Add your delete API call here
					message.success("Listing deleted successfully");
					setListings(listings.filter((listing) => listing.id !== id));
				} catch (error) {
					message.error("Failed to delete listing");
				}
			},
		});
	};

	const handleModalOk = async () => {
		try {
			const values = await form.validateFields();
			if (editingId) {
				// Add your update API call here
				message.success("Listing updated successfully");
				setListings(
					listings.map((listing) =>
						listing.id === editingId ? { ...listing, ...values } : listing
					)
				);
			} else {
				// Add your create API call here
				message.success("Listing created successfully");
				setListings([...listings, { id: Date.now(), ...values }]);
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
				<h1 className="text-2xl font-semibold">Listings Manager</h1>
				<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
					Add Listing
				</Button>
			</div>

			<Table
				columns={columns}
				dataSource={listings}
				loading={loading}
				rowKey="id"
			/>

			<Modal
				title={editingId ? "Edit Listing" : "Add New Listing"}
				open={isModalVisible}
				onOk={handleModalOk}
				onCancel={() => {
					setIsModalVisible(false);
					form.resetFields();
				}}
			>
				<Form form={form} layout="vertical">
					<Form.Item
						name="title"
						label="Title"
						rules={[{ required: true, message: "Please enter listing title" }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="price"
						label="Price"
						rules={[{ required: true, message: "Please enter listing price" }]}
					>
						<Input type="number" prefix="$" />
					</Form.Item>
					<Form.Item
						name="status"
						label="Status"
						rules={[
							{ required: true, message: "Please select listing status" },
						]}
					>
						<Select>
							<Select.Option value="active">Active</Select.Option>
							<Select.Option value="draft">Draft</Select.Option>
							<Select.Option value="archived">Archived</Select.Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default ListingsManager;
