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
	DatePicker,
	Tag,
} from "antd";
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const ServiceContracts = () => {
	const [contracts, setContracts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [editingId, setEditingId] = useState(null);

	const getStatusColor = (status) => {
		switch (status) {
			case "active":
				return "success";
			case "pending":
				return "processing";
			case "completed":
				return "default";
			case "cancelled":
				return "error";
			default:
				return "default";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "active":
				return <CheckCircleOutlined />;
			case "pending":
				return <ClockCircleOutlined />;
			default:
				return null;
		}
	};

	const columns = [
		{
			title: "Contract Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Client",
			dataIndex: "client",
			key: "client",
		},
		{
			title: "Service Type",
			dataIndex: "serviceType",
			key: "serviceType",
		},
		{
			title: "Duration",
			dataIndex: "duration",
			key: "duration",
			render: (_, record) => `${record.startDate} - ${record.endDate}`,
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
		form.setFieldsValue({
			...record,
			duration: [record.startDate, record.endDate],
		});
		setIsModalVisible(true);
	};

	const handleDelete = (id) => {
		Modal.confirm({
			title: "Are you sure you want to delete this contract?",
			content: "This action cannot be undone.",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk: async () => {
				try {
					// Add your delete API call here
					message.success("Contract deleted successfully");
					setContracts(contracts.filter((contract) => contract.id !== id));
				} catch (error) {
					message.error("Failed to delete contract");
				}
			},
		});
	};

	const handleModalOk = async () => {
		try {
			const values = await form.validateFields();
			const [startDate, endDate] = values.duration;
			const contractData = {
				...values,
				startDate: startDate.format("YYYY-MM-DD"),
				endDate: endDate.format("YYYY-MM-DD"),
			};
			delete contractData.duration;

			if (editingId) {
				// Add your update API call here
				message.success("Contract updated successfully");
				setContracts(
					contracts.map((contract) =>
						contract.id === editingId
							? { ...contract, ...contractData }
							: contract
					)
				);
			} else {
				// Add your create API call here
				message.success("Contract created successfully");
				setContracts([...contracts, { id: Date.now(), ...contractData }]);
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
				<h1 className="text-2xl font-semibold">Service Contracts</h1>
				<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
					Add Contract
				</Button>
			</div>

			<Table
				columns={columns}
				dataSource={contracts}
				loading={loading}
				rowKey="id"
			/>

			<Modal
				title={editingId ? "Edit Contract" : "Add New Contract"}
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
						label="Contract Name"
						rules={[{ required: true, message: "Please enter contract name" }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="client"
						label="Client"
						rules={[{ required: true, message: "Please enter client name" }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="serviceType"
						label="Service Type"
						rules={[{ required: true, message: "Please select service type" }]}
					>
						<Select>
							<Select.Option value="consulting">Consulting</Select.Option>
							<Select.Option value="development">Development</Select.Option>
							<Select.Option value="maintenance">Maintenance</Select.Option>
							<Select.Option value="training">Training</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item
						name="duration"
						label="Contract Duration"
						rules={[
							{ required: true, message: "Please select contract duration" },
						]}
					>
						<RangePicker style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item
						name="description"
						label="Description"
						rules={[
							{ required: true, message: "Please enter contract description" },
						]}
					>
						<TextArea rows={4} />
					</Form.Item>
					<Form.Item
						name="status"
						label="Status"
						rules={[
							{ required: true, message: "Please select contract status" },
						]}
					>
						<Select>
							<Select.Option value="pending">Pending</Select.Option>
							<Select.Option value="active">Active</Select.Option>
							<Select.Option value="completed">Completed</Select.Option>
							<Select.Option value="cancelled">Cancelled</Select.Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default ServiceContracts;
