import React from "react";
import { Card, List, Button, Typography, Avatar, message } from "antd";
import {
	CheckCircleFilled,
	DownOutlined,
	LinkOutlined,
} from "@ant-design/icons";
import { FaTiktok, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";

const SocialMedia = ({}) => {
	const { user, fetchYouTubeData, youtube } = useAuth();
	const { Text } = Typography;
	const [expandedSocial, setExpandedSocial] = React.useState(null);
	console.log(youtube);

	const socialAccounts = [
		{
			name: "TikTok",
			icon: <FaTiktok className="text-2xl" />,
			color: "#000",
			connected: false,
			details: null,
		},
		{
			name: "Facebook",
			icon: <FaFacebook className="text-2xl" />,
			color: "#1877F2",
			connected: false,
			details: null,
		},
		{
			name: "Instagram",
			icon: <FaInstagram className="text-2xl" />,
			color: "#E1306C",
			connected: false,
			details: null,
		},
		{
			name: "YouTube",
			icon: <FaYoutube className="text-2xl" />,
			color: "#FF0000",
			connected: youtube ? true : false,
			details: {
				username: youtube?.snippet?.title,
				Description: youtube?.snippet?.description,
				subscribers: youtube?.statistics?.subscriberCount,
				views: youtube?.statistics?.viewCount,
				videos: youtube?.statistics?.videoCount,
				profileImage: youtube?.snippet?.thumbnails?.default?.url,
				joined: youtube?.snippet?.publishedAt,
			},
		},
	];

	const formatValue = (value) => {
		if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
		if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
		return value;
	};

	// // add commas to numbers
	// const formatValue = (value) => {
	// 	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	// };
	console.log("ProfileSetup -> user", user);

	return (
		<Card
			title={<span className="text-xl font-semibold">Social Connections</span>}
			bordered={false}
			className="shadow-lg rounded-xl mt-4"
		>
			<List
				dataSource={socialAccounts}
				renderItem={(item) => (
					<div className="mb-2">
						<List.Item
							className="hover:bg-gray-50 rounded-lg p-4"
							extra={
								item.connected ? (
									<div
										className="flex items-center gap-1"
										style={{
											color: item.color,
											borderColor: item.color,
										}}
									>
										<CheckCircleFilled className="text-green-500 text-xl" />
										Linked
										<Button
											type="text"
											icon={<DownOutlined />}
											onClick={() =>
												setExpandedSocial(
													expandedSocial === item.name ? null : item.name
												)
											}
										/>
									</div>
								) : (
									<Button
										type="primary"
										ghost
										shape="round"
										className="flex items-center gap-2"
										style={{
											color: item.color,
											borderColor: item.color,
										}}
										onClick={() =>
											item.name === "YouTube"
												? fetchYouTubeData()
												: message.info(`${item.name} connection coming soon!`)
										}
									>
										<LinkOutlined /> Connect
									</Button>
								)
							}
						>
							<div className="flex items-center gap-4">
								<span style={{ color: item.color }}>{item.icon}</span>
								<Text className="font-medium text-lg">{item.name}</Text>
							</div>
						</List.Item>

						{expandedSocial === item.name && item.details && (
							<div className="p-5 bg-white rounded-xl shadow-lg mt-4 border border-gray-200">
								{/* ✅ Profile Section */}
								<div className="flex items-center gap-4">
									<Avatar
										size={72}
										src={
											item.details.profileImage ||
											"https://via.placeholder.com/72"
										}
										alt={item.details.username || "No Image"}
										className="border border-gray-300 shadow-sm"
									/>

									<div className="flex flex-col">
										<span className="text-xl font-semibold text-gray-800">
											{item.details.username || "No Name"}
										</span>
										<span className="text-sm text-gray-500">
											{item.details.Description || "No Description Available"}
										</span>
										<small
											className="text-xs text-gray-400"
											title="Joined Date"
										>
											Joined:{" "}
											{new Date(item.details.joined).toLocaleDateString(
												"en-US",
												{
													year: "numeric",
													month: "short",
													day: "numeric",
												}
											) || "N/A"}
										</small>
									</div>
								</div>

								{/* ✅ YouTube Stats Section */}
								<div className="mt-4 grid grid-cols-3 gap-4">
									{/* Subscribers */}
									<div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg shadow-sm">
										<span className="text-2xl font-bold text-blue-600">
											{formatValue(item.details.subscribers) || "0"}
										</span>
										<span className="text-sm text-blue-700">Subscribers</span>
									</div>

									{/* Views */}
									<div className="flex flex-col items-center p-4 bg-green-50 rounded-lg shadow-sm">
										<span className="text-2xl font-bold text-green-600">
											{formatValue(item.details.views) || "0"}
										</span>
										<span className="text-sm text-green-700">Total Views</span>
									</div>

									{/* Videos */}
									<div className="flex flex-col items-center p-4 bg-red-50 rounded-lg shadow-sm">
										<span className="text-2xl font-bold text-red-600">
											{formatValue(item.details.videos) || "0"}
										</span>
										<span className="text-sm text-red-700">Videos</span>
									</div>
								</div>
							</div>
						)}
					</div>
				)}
			/>
		</Card>
	);
};

export default SocialMedia;
