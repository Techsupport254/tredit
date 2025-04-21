import { useState, useEffect } from "react";
import {
	Card,
	Typography,
	Button,
	Statistic,
	Row,
	Col,
	List,
	Avatar,
	Spin,
	Alert,
} from "antd";
import {
	YoutubeOutlined,
	PlayCircleOutlined,
	EyeOutlined,
	LikeOutlined,
} from "@ant-design/icons";
import type { YouTubeChannelData } from "@/lib/youtube";

const { Title, Text } = Typography;

interface YouTubeVideo {
	id: string;
	title: string;
	description: string;
	thumbnails: {
		default: { url: string };
		medium: { url: string };
	};
	publishedAt: string;
}

interface YouTubeSectionProps {
	businessId: string;
	onConnect: () => void;
	isConnected: boolean;
}

export default function YouTubeSection({
	businessId,
	onConnect,
	isConnected,
}: YouTubeSectionProps) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [channelData, setChannelData] = useState<YouTubeChannelData | null>(
		null
	);
	const [recentVideos, setRecentVideos] = useState<YouTubeVideo[]>([]);

	useEffect(() => {
		if (isConnected) {
			fetchYouTubeData();
		} else {
			setLoading(false);
		}
	}, [isConnected, businessId]);

	const fetchYouTubeData = async () => {
		try {
			setLoading(true);
			setError(null);

			// Fetch channel data
			const channelResponse = await fetch(
				`/api/youtube?businessId=${businessId}&action=channel`
			);
			if (!channelResponse.ok) {
				throw new Error("Failed to fetch channel data");
			}
			const channelData = await channelResponse.json();
			setChannelData(channelData);

			// Fetch recent videos
			const videosResponse = await fetch(
				`/api/youtube?businessId=${businessId}&action=recent-videos&maxResults=5`
			);
			if (!videosResponse.ok) {
				throw new Error("Failed to fetch recent videos");
			}
			const videosData = await videosResponse.json();
			setRecentVideos(videosData);
		} catch (error: any) {
			console.error("Error fetching YouTube data:", error);
			setError(error.message || "Failed to fetch YouTube data");
		} finally {
			setLoading(false);
		}
	};

	if (!isConnected) {
		return (
			<Card title="YouTube Integration">
				<div className="text-center py-8">
					<YoutubeOutlined className="text-4xl text-red-600 mb-4" />
					<Title level={4}>Connect Your YouTube Channel</Title>
					<Text className="block mb-4">
						Link your YouTube channel to upload and manage videos directly from
						your business dashboard.
					</Text>
					<Button type="primary" onClick={onConnect} icon={<YoutubeOutlined />}>
						Connect YouTube Account
					</Button>
				</div>
			</Card>
		);
	}

	if (loading) {
		return (
			<Card title="YouTube Integration">
				<div className="flex justify-center items-center py-12">
					<Spin size="large" />
				</div>
			</Card>
		);
	}

	if (error) {
		return (
			<Card title="YouTube Integration">
				<Alert
					message="Error Loading YouTube Data"
					description={error}
					type="error"
					showIcon
				/>
			</Card>
		);
	}

	return (
		<Card title="YouTube Integration" className="mb-6">
			{channelData && (
				<>
					<div className="flex items-center mb-6">
						<Avatar
							size={64}
							src={channelData.thumbnails.default.url}
							icon={<YoutubeOutlined />}
						/>
						<div className="ml-4">
							<Title level={4} className="!mb-0">
								{channelData.title}
							</Title>
							<Text type="secondary">{channelData.customUrl}</Text>
						</div>
					</div>

					<Row gutter={16} className="mb-6">
						<Col span={8}>
							<Statistic
								title="Subscribers"
								value={Number(
									channelData.statistics.subscriberCount
								).toLocaleString()}
								prefix={<YoutubeOutlined />}
							/>
						</Col>
						<Col span={8}>
							<Statistic
								title="Total Views"
								value={Number(
									channelData.statistics.viewCount
								).toLocaleString()}
								prefix={<EyeOutlined />}
							/>
						</Col>
						<Col span={8}>
							<Statistic
								title="Videos"
								value={Number(
									channelData.statistics.videoCount
								).toLocaleString()}
								prefix={<PlayCircleOutlined />}
							/>
						</Col>
					</Row>

					<div>
						<Title level={5}>Recent Videos</Title>
						<List
							itemLayout="horizontal"
							dataSource={recentVideos}
							renderItem={(video) => (
								<List.Item>
									<List.Item.Meta
										avatar={
											<img
												src={video.thumbnails.default.url}
												alt={video.title}
												className="w-20 h-auto rounded"
											/>
										}
										title={
											<a
												href={`https://youtube.com/watch?v=${video.id}`}
												target="_blank"
												rel="noopener noreferrer"
											>
												{video.title}
											</a>
										}
										description={
											<div>
												<Text type="secondary">
													{new Date(video.publishedAt).toLocaleDateString()}
												</Text>
												<Text className="block" ellipsis={{ rows: 2 }}>
													{video.description}
												</Text>
											</div>
										}
									/>
								</List.Item>
							)}
						/>
					</div>
				</>
			)}
		</Card>
	);
}
