import { Button, List, Typography, Spin, Avatar } from "antd";
import {
	FacebookOutlined,
	InstagramOutlined,
	TikTokOutlined,
	YoutubeOutlined,
} from "@ant-design/icons";
import { useState } from "react";

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

const platformConfig = {
	YOUTUBE: {
		icon: <YoutubeOutlined />,
		color: "#FF0000",
		name: "YouTube",
	},
	FACEBOOK: {
		icon: <FacebookOutlined />,
		color: "#1877F2",
		name: "Facebook",
	},
	INSTAGRAM: {
		icon: <InstagramOutlined />,
		color: "#E4405F",
		name: "Instagram",
	},
	TIKTOK: {
		icon: <TikTokOutlined />,
		color: "#000000",
		name: "TikTok",
	},
};

export default function SocialMediaTab({
	connections,
	channelData,
	onConnect,
	onDisconnect,
}: SocialMediaTabProps) {
	const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);

	const handleAction = async (platform: string, isConnected: boolean) => {
		setLoadingPlatform(platform);
		try {
			if (isConnected) {
				await onDisconnect?.(platform);
			} else {
				await onConnect?.(platform);
			}
		} finally {
			setLoadingPlatform(null);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Title level={5} className="!mt-4 !mb-6">
					Connected Accounts
				</Title>
				<Typography.Text type="secondary">
					Connect your social media accounts to manage them in one place
				</Typography.Text>
			</div>

			<List
				dataSource={Object.entries(platformConfig).map(
					([platform, config]) => ({
						platform,
						...config,
					})
				)}
				renderItem={(item) => {
					const connection = connections.find(
						(c) => c.platform === item.platform
					);
					const channelInfo = channelData[item.platform];
					const isLoading = loadingPlatform === item.platform;

					return (
						<List.Item
							className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-4"
							style={{
								borderLeft: `4px solid ${
									connection?.connected ? item.color : "#e5e7eb"
								}`,
							}}
						>
							<div className="flex items-center space-x-4">
								{connection?.connected && channelInfo ? (
									<div className="relative">
										<Avatar
											size={48}
											src={channelInfo.accountImage}
											alt={channelInfo.channelName}
										/>
										<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
									</div>
								) : (
									<div
										className="text-2xl flex items-center justify-center w-12 h-12 rounded-full"
										style={{
											color: "#6B7280",
											backgroundColor: "#F3F4F6",
										}}
									>
										{item.icon}
									</div>
								)}
								<div>
									<Typography.Text strong className="block text-lg">
										{item.name}
									</Typography.Text>
									{connection?.connected && channelInfo && (
										<div className="text-sm text-gray-500">
											{channelInfo.channelName}
										</div>
									)}
								</div>
							</div>
							<Button
								type={connection?.connected ? "default" : "primary"}
								size="large"
								className={`h-11 min-w-[120px] ${
									connection?.connected
										? "hover:bg-gray-100 text-gray-700 border border-gray-200"
										: "hover:opacity-90 border-0 text-white"
								}`}
								style={{
									backgroundColor: connection?.connected
										? undefined
										: item.color,
								}}
								onClick={() =>
									handleAction(item.platform, !!connection?.connected)
								}
								disabled={isLoading}
							>
								{isLoading ? (
									<Spin size="small" />
								) : connection?.connected ? (
									"Disconnect"
								) : (
									"Connect"
								)}
							</Button>
						</List.Item>
					);
				}}
			/>
		</div>
	);
}
