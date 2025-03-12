import React, { useState } from "react";
import {
	Card,
	Button,
	Table,
	Space,
	message,
	notification,
	Modal,
	Form,
	Input,
	Tag,
	Tooltip,
} from "antd";
import {
	PlusOutlined,
	DeleteOutlined,
	CopyOutlined,
	KeyOutlined,
	EyeOutlined,
	EyeInvisibleOutlined,
} from "@ant-design/icons";

const ApiKeys = () => {
	const [apiKeys, setApiKeys] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [showSecret, setShowSecret] = useState(false);

	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Key",
			dataIndex: "key",
			key: "key",
			render: (key) => (
				<Space>
					<code className="bg-gray-100 px-2 py-1 rounded">{key}</code>
					<Button
						type="text"
						icon={<CopyOutlined />}
						onClick={() => handleCopy(key)}
					/>
				</Space>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status) => (
				<Tag color={status === "active" ? "success" : "error"}>
					{status.toUpperCase()}
				</Tag>
			),
		},
		{
			title: "Created",
			dataIndex: "created",
			key: "created",
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, record) => (
				<Space>
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

	const handleCopy = (text) => {
		navigator.clipboard.writeText(text);
		message.success("API key copied to clipboard");
	};

	const handleDelete = (id) => {
		Modal.confirm({
			title: "Delete API Key",
			content:
				"Are you sure you want to delete this API key? This action cannot be undone.",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk: async () => {
				try {
					// Add your delete API call here
					message.success("API key deleted successfully");
					setApiKeys(apiKeys.filter((key) => key.id !== id));
				} catch (error) {
					message.error("Failed to delete API key");
				}
			},
		});
	};

	const handleCreate = async () => {
		try {
			const values = await form.validateFields();
			// Add your create API call here
			message.success("API key created successfully");
			setIsModalVisible(false);
			form.resetFields();
			// Refresh API keys list
		} catch (error) {
			message.error("Please fill in all required fields");
		}
	};

	return (
		<div className="p-6">
			<div className="mb-6 flex justify-between items-center">
				<h1 className="text-2xl font-semibold">API Keys</h1>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => setIsModalVisible(true)}
				>
					Create API Key
				</Button>
			</div>

			<Card>
				<Table
					columns={columns}
					dataSource={apiKeys}
					loading={loading}
					rowKey="id"
				/>
			</Card>

			<Modal
				title="Create New API Key"
				open={isModalVisible}
				onOk={handleCreate}
				onCancel={() => {
					setIsModalVisible(false);
					form.resetFields();
				}}
			>
				<Form form={form} layout="vertical">
					<Form.Item
						name="name"
						label="Key Name"
						rules={[
							{
								required: true,
								message: "Please enter a name for the API key",
							},
						]}
					>
						<Input placeholder="e.g., Production API Key" />
					</Form.Item>
					<Form.Item
						name="description"
						label="Description"
						rules={[{ required: true, message: "Please enter a description" }]}
					>
						<Input.TextArea
							placeholder="Describe what this API key will be used for"
							rows={3}
						/>
					</Form.Item>
					<Form.Item
						name="permissions"
						label="Permissions"
						rules={[{ required: true, message: "Please select permissions" }]}
					>
						<Select mode="multiple" placeholder="Select permissions">
							<Select.Option value="read">Read</Select.Option>
							<Select.Option value="write">Write</Select.Option>
							<Select.Option value="admin">Admin</Select.Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default ApiKeys;
