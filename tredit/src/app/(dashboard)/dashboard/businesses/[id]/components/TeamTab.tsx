import { useState } from "react";
import {
	Table,
	Button,
	Space,
	Modal,
	Form,
	Input,
	Select,
	message,
	Tag,
	Avatar,
	Popconfirm,
	Tooltip,
} from "antd";
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	UserOutlined,
} from "@ant-design/icons";
import axios from "axios";

interface TeamMember {
	id: string;
	name: string;
	email: string;
	role: string;
	image?: string;
	status: string;
	responsibilities: string[];
	permissions: Record<string, boolean>;
}

interface TeamTabProps {
	members: TeamMember[];
	onAddMember: (member: TeamMember) => void;
	onRemoveMember: (memberId: string) => void;
	onUpdateMember: (memberId: string, data: Partial<TeamMember>) => void;
}

const TeamTab = ({
	members,
	onAddMember,
	onRemoveMember,
	onUpdateMember,
}: TeamTabProps) => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [isLoading, setIsLoading] = useState(false);
	const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

	const handleAddMember = async (values: any) => {
		try {
			setIsLoading(true);
			const response = await axios.post(
				`/api/business/${members[0]?.businessId}/team`,
				values
			);
			message.success("Team member added successfully");
			onAddMember(response.data);
			setIsModalVisible(false);
			form.resetFields();
		} catch (error: any) {
			message.error(error.response?.data?.error || "Failed to add team member");
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateMember = async (values: any) => {
		if (!editingMember) return;
		try {
			setIsLoading(true);
			const response = await axios.patch(
				`/api/business/${members[0]?.businessId}/team/${editingMember.id}`,
				values
			);
			message.success("Team member updated successfully");
			onUpdateMember(editingMember.id, response.data);
			setIsModalVisible(false);
			setEditingMember(null);
			form.resetFields();
		} catch (error: any) {
			message.error(
				error.response?.data?.error || "Failed to update team member"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteMember = async (memberId: string) => {
		try {
			setIsLoading(true);
			await axios.delete(
				`/api/business/${members[0]?.businessId}/team/${memberId}`
			);
			message.success("Team member removed successfully");
			onRemoveMember(memberId);
		} catch (error: any) {
			message.error(
				error.response?.data?.error || "Failed to remove team member"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const showModal = (member?: TeamMember) => {
		if (member) {
			setEditingMember(member);
			form.setFieldsValue({
				email: member.email,
				role: member.role,
				responsibilities: member.responsibilities,
				permissions: member.permissions,
			});
		} else {
			setEditingMember(null);
			form.resetFields();
		}
		setIsModalVisible(true);
	};

	const columns = [
		{
			title: "Member",
			key: "member",
			render: (_, record: TeamMember) => (
				<div className="flex items-center gap-3">
					<Avatar
						src={record.image}
						icon={<UserOutlined />}
						className="bg-blue-500"
					/>
					<div>
						<div className="font-medium">{record.name}</div>
						<div className="text-gray-500 text-sm">{record.email}</div>
					</div>
				</div>
			),
		},
		{
			title: "Role",
			dataIndex: "role",
			key: "role",
			render: (role: string) => (
				<Tag
					color={role === "OWNER" ? "gold" : role === "ADMIN" ? "red" : "blue"}
				>
					{role}
				</Tag>
			),
		},
		{
			title: "Responsibilities",
			key: "responsibilities",
			render: (_, record: TeamMember) => (
				<div className="flex flex-wrap gap-1">
					{record.responsibilities.map((resp, index) => (
						<Tag key={index} color="green">
							{resp}
						</Tag>
					))}
				</div>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: string) => (
				<Tag color={status === "active" ? "green" : "red"}>
					{status.toUpperCase()}
				</Tag>
			),
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, record: TeamMember) => (
				<Space>
					<Tooltip title="Edit">
						<Button
							type="text"
							icon={<EditOutlined />}
							onClick={() => showModal(record)}
							disabled={record.role === "OWNER"}
						/>
					</Tooltip>
					<Popconfirm
						title="Remove team member?"
						description="Are you sure you want to remove this team member?"
						onConfirm={() => handleDeleteMember(record.id)}
						okText="Yes"
						cancelText="No"
						disabled={record.role === "OWNER"}
					>
						<Tooltip title="Remove">
							<Button
								type="text"
								danger
								icon={<DeleteOutlined />}
								disabled={record.role === "OWNER"}
							/>
						</Tooltip>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-lg font-medium">Team Members</h2>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => showModal()}
					className="bg-blue-500"
				>
					Add Member
				</Button>
			</div>

			<Table
				columns={columns}
				dataSource={members}
				rowKey="id"
				pagination={false}
				loading={isLoading}
			/>

			<Modal
				title={editingMember ? "Edit Team Member" : "Add Team Member"}
				open={isModalVisible}
				onCancel={() => {
					setIsModalVisible(false);
					setEditingMember(null);
					form.resetFields();
				}}
				footer={null}
			>
				<Form
					form={form}
					layout="vertical"
					onFinish={editingMember ? handleUpdateMember : handleAddMember}
				>
					<Form.Item
						name="email"
						label="Email"
						rules={[
							{ required: true, message: "Please enter email" },
							{ type: "email", message: "Please enter a valid email" },
						]}
					>
						<Input placeholder="Enter member's email" />
					</Form.Item>

					<Form.Item
						name="role"
						label="Role"
						rules={[{ required: true, message: "Please select a role" }]}
					>
						<Select
							placeholder="Select role"
							options={[
								{ label: "Admin", value: "ADMIN" },
								{ label: "Manager", value: "MANAGER" },
								{ label: "Member", value: "MEMBER" },
							]}
						/>
					</Form.Item>

					<Form.Item
						name="responsibilities"
						label="Responsibilities"
						rules={[
							{ required: true, message: "Please select responsibilities" },
						]}
					>
						<Select
							mode="multiple"
							placeholder="Select responsibilities"
							options={[
								{ label: "Product Management", value: "Product Management" },
								{ label: "Order Management", value: "Order Management" },
								{ label: "Customer Service", value: "Customer Service" },
								{ label: "Content Management", value: "Content Management" },
								{ label: "Analytics", value: "Analytics" },
							]}
						/>
					</Form.Item>

					<Form.Item className="mb-0 text-right">
						<Space>
							<Button
								onClick={() => {
									setIsModalVisible(false);
									setEditingMember(null);
									form.resetFields();
								}}
							>
								Cancel
							</Button>
							<Button type="primary" htmlType="submit" loading={isLoading}>
								{editingMember ? "Update" : "Add"}
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default TeamTab;
