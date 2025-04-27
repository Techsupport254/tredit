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
	currentUserRole?: string;
	businessId: string;
}

const TeamTab = ({
	members,
	onAddMember,
	onRemoveMember,
	onUpdateMember,
	currentUserRole,
	businessId,
}: TeamTabProps) => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [isLoading, setIsLoading] = useState(false);
	const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

	const handleAddMember = async (values: any) => {
		try {
			setIsLoading(true);
			const response = await axios.post(
				`/api/business/${businessId}/team`,
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
				`/api/business/${businessId}/team/${editingMember.id}`,
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
			await axios.delete(`/api/business/${businessId}/team/${memberId}`);
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
				<div className="flex flex-col gap-2 items-start">
					{record.responsibilities?.map((resp, index) => (
						<Tag
							key={index}
							color="green"
							className="!mb-0 !px-3 !py-1 text-sm font-normal"
						>
							{resp}
						</Tag>
					)) || (
						<span className="text-gray-400">No responsibilities assigned</span>
					)}
				</div>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: string) => (
				<Tag color={status === "active" ? "green" : "red"}>
					{status?.toUpperCase() || "INACTIVE"}
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
				{(currentUserRole === "OWNER" || currentUserRole === "ADMIN") && (
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={() => showModal()}
						className="bg-blue-500"
					>
						Add Member
					</Button>
				)}
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
								{ label: "Owner", value: "OWNER" },
								{ label: "Admin", value: "ADMIN" },
								{ label: "Store Manager", value: "STORE_MANAGER" },
								{ label: "Finance Manager", value: "FINANCE_MANAGER" },
								{
									label: "Customer Service Lead",
									value: "CUSTOMER_SERVICE_LEAD",
								},
								{ label: "Marketing Manager", value: "MARKETING_MANAGER" },
								{
									label: "Logistics Coordinator",
									value: "LOGISTICS_COORDINATOR",
								},
								{ label: "Inventory Manager", value: "INVENTORY_MANAGER" },
								{ label: "Content Creator", value: "CONTENT_CREATOR" },
								{
									label: "Social Media Manager",
									value: "SOCIAL_MEDIA_MANAGER",
								},
								{ label: "Quality Assurance", value: "QUALITY_ASSURANCE" },
								{ label: "Technical Support", value: "TECHNICAL_SUPPORT" },
								{
									label: "Sales Representative",
									value: "SALES_REPRESENTATIVE",
								},
								{ label: "Procurement Officer", value: "PROCUREMENT_OFFICER" },
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
