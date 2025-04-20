import { Button, List, Typography, Avatar } from "antd";
import {
	FacebookOutlined,
	InstagramOutlined,
	TikTokOutlined,
	YoutubeOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

interface ChannelData {
	channelName: string;
	channelId: string;
	accountImage: string;
}

interface SocialMediaConnection {
	id: string;
	platform: string;
	connected: boolean;
	channelId?: string;
}

interface SocialMediaTabProps {
	connections: SocialMediaConnection[];
	channelData: Record<string, ChannelData | null>;
	onConnect?: (platform: string) => void;
	onDisconnect?: (platform: string) => void;
}

const platformIcons = {
	YOUTUBE: <YoutubeOutlined />,
	FACEBOOK: <FacebookOutlined />,
	INSTAGRAM: <InstagramOutlined />,
	TIKTOK: <TikTokOutlined />,
};

export default function SocialMediaTab({
	connections,
	channelData,
	onConnect,
	onDisconnect,
}: SocialMediaTabProps) {
	console.log("SocialMediaTab rendered with:", {
		connections,
		channelData,
	});

	return (
		<div className="space-y-6">
			<Title level={5} className="!mt-4 !mb-6">
				Connected Accounts
			</Title>

			<List
				dataSource={[
					{ platform: "YOUTUBE", icon: platformIcons.YOUTUBE },
					{ platform: "FACEBOOK", icon: platformIcons.FACEBOOK },
					{ platform: "INSTAGRAM", icon: platformIcons.INSTAGRAM },
					{ platform: "TIKTOK", icon: platformIcons.TIKTOK },
				]}
				renderItem={(item) => {
					const connection = connections.find(
						(c) => c.platform === item.platform
					);
					const channelInfo = channelData[item.platform];

					console.log(`Rendering ${item.platform}:`, {
						connection,
						channelInfo,
					});

					return (
						<List.Item className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-4">
							<div className="flex items-center space-x-4">
								{channelInfo?.accountImage ? (
									<Avatar src={channelInfo.accountImage} size={40} />
								) : (
									<div className="text-2xl">{item.icon}</div>
								)}
								<div>
									<Typography.Text strong className="block">
										{item.platform}
									</Typography.Text>
									{connection?.connected && (
										<div className="text-sm text-gray-500">
											{channelInfo?.channelName || connection.channelId}
										</div>
									)}
								</div>
							</div>
							<Button
								type={connection?.connected ? "default" : "primary"}
								size="large"
								className={`h-11 ${
									connection?.connected
										? "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
										: "bg-blue-500 hover:bg-blue-600 border-0 text-white"
								}`}
								onClick={() =>
									connection?.connected
										? onDisconnect?.(item.platform)
										: onConnect?.(item.platform)
								}
							>
								{connection?.connected ? "Disconnect" : "Connect"}
							</Button>
						</List.Item>
					);
				}}
			/>
		</div>
	);
}
