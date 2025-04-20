import { Avatar, Button, List, Tag, Typography } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface TeamMember {
	id: string;
	name: string;
	role: "OWNER" | "ADMIN" | "MANAGER" | "MEMBER";
	email: string;
	image?: string;
	status: "active" | "inactive";
}

interface TeamTabProps {
	members: TeamMember[];
	onAddMember?: () => void;
	onEditMember?: (member: TeamMember) => void;
	onRemoveMember?: (memberId: string) => void;
}

export default function TeamTab({
	members,
	onAddMember,
	onEditMember,
	onRemoveMember,
}: TeamTabProps) {
	return (
		<div className="pb-6">
			<div className="flex justify-between items-center mb-6">
				<Title level={5} className="!mt-4 !mb-0">
					Team Members
				</Title>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={onAddMember}
					className="bg-blue-500 h-11"
				>
					Add Member
				</Button>
			</div>

			<List
				dataSource={members}
				renderItem={(member) => (
					<List.Item
						key={member.id}
						className="bg-white rounded-lg shadow-sm mb-4 p-4"
						actions={[
							<Button
								key="edit"
								icon={<EditOutlined />}
								onClick={() => onEditMember?.(member)}
								className="mr-2"
							>
								Edit
							</Button>,
							<Button
								key="delete"
								danger
								icon={<DeleteOutlined />}
								onClick={() => onRemoveMember?.(member.id)}
							>
								Remove
							</Button>,
						]}
					>
						<List.Item.Meta
							avatar={
								<Avatar size={40} className="bg-blue-500">
									{member.name.charAt(0).toUpperCase()}
								</Avatar>
							}
							title={
								<div className="flex items-center gap-2">
									<span className="font-medium">{member.name}</span>
									<Tag color={member.status === "active" ? "green" : "red"}>
										{member.status}
									</Tag>
								</div>
							}
							description={
								<div>
									<div className="text-gray-500">{member.role}</div>
									<div className="text-gray-400">{member.email}</div>
								</div>
							}
						/>
					</List.Item>
				)}
			/>
		</div>
	);
}
