import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { formatDistanceToNow } from "date-fns";

interface MessageProps {
	message: {
		id: string;
		content: string;
		senderId: string;
		sender: {
			id: string;
			name: string;
			profileImage?: string | null;
		};
		createdAt: Date;
		metadata?: {
			isTeamMessage?: boolean;
			teamMemberId?: string;
			teamMemberRole?: string;
		};
	};
	currentUserId: string;
}

export function Message({ message, currentUserId }: MessageProps) {
	const isCurrentUser = message.senderId === currentUserId;
	const isTeamMember = message.metadata?.isTeamMessage;

	return (
		<div
			className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}
		>
			<div
				className={`max-w-[70%] rounded-lg p-3 ${
					isCurrentUser
						? "bg-blue-600 text-white"
						: "bg-white border border-gray-200"
				}`}
			>
				{isTeamMember && (
					<div className="text-xs text-gray-500 mb-1">
						{message.sender.name} • {message.metadata?.teamMemberRole}
					</div>
				)}
				<div className="text-sm">{message.content}</div>
				<div
					className={`text-xs mt-1 text-right ${
						isCurrentUser ? "text-blue-200" : "text-gray-400"
					}`}
				>
					{formatDistanceToNow(new Date(message.createdAt), {
						addSuffix: true,
					})}
				</div>
			</div>
		</div>
	);
}
