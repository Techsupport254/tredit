import { List, Button, Typography, Avatar, message, Collapse } from "antd";
import {
	CheckCircleFilled,
	CaretRightOutlined,
	LinkOutlined,
} from "@ant-design/icons";
import { FaTiktok, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";
import PropTypes from "prop-types";
import styled from "styled-components";
import { motion } from "framer-motion";

const { Text } = Typography;
const { Panel } = Collapse;

// Styled Components
const StyledCollapse = styled(Collapse)`
	background: white;
	border-radius: 16px !important;
	overflow: hidden;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

	.ant-collapse-header {
		padding: 20px !important;
		background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
		border-bottom: 1px solid #f0f0f0;
	}

	.ant-collapse-content-box {
		padding: 16px !important;
	}
`;

const StyledInnerCollapse = styled(Collapse)`
	background: transparent !important;
	border: none !important;

	.ant-collapse-header {
		padding: 12px 16px !important;
		background: white !important;
		border-radius: 12px !important;
		transition: all 0.3s ease;

		&:hover {
			background: #f8f9fa !important;
		}
	}

	.ant-collapse-content {
		background: transparent !important;
	}

	.ant-collapse-content-box {
		padding: 16px 16px 8px !important;
	}
`;

const SocialAccountItem = styled(List.Item)`
	padding: 16px !important;
	border-radius: 12px !important;
	margin-bottom: 8px !important;
	background: white;
	transition: all 0.3s ease;
	border: 1px solid #f0f0f0 !important;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}
`;

const ConnectButton = styled(Button)`
	&.ant-btn {
		height: 36px;
		padding: 0 20px;
		font-weight: 500;
		transition: all 0.3s ease;

		&:hover {
			transform: translateY(-1px);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		}
	}
`;

const StatCardWrapper = styled.div`
	background: ${(props) => props.bgColor};
	border-radius: 12px;
	padding: 16px;
	text-align: center;
	transition: all 0.3s ease;
	border: 1px solid rgba(0, 0, 0, 0.05);

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.stat-value {
		font-size: 24px;
		font-weight: 600;
		color: ${(props) => props.textColor};
		margin-bottom: 4px;
	}

	.stat-label {
		font-size: 13px;
		color: ${(props) => props.textColor};
		opacity: 0.9;
	}
`;

// Add new styled components for the connected accounts display
const ConnectedAccountsDisplay = styled.div`
	display: flex;
	align-items: center;
	margin-left: auto;
	gap: -8px;
`;

const AccountIcon = styled(motion.div)`
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: white;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	border: 2px solid white;
	margin-left: -8px;
	position: relative;
	z-index: ${(props) => props.$zIndex};

	&:hover {
		transform: translateY(-2px);
	}

	.icon {
		font-size: 16px;
		color: ${(props) => props.$color};
	}
`;

const CompletionStatus = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
	margin-left: 12px;
	padding: 4px 12px;
	border-radius: 20px;
	background: ${(props) =>
		props.$isComplete ? "rgba(16, 185, 129, 0.1)" : "transparent"};
	color: ${(props) => (props.$isComplete ? "#10b981" : "#94a3b8")};
	font-size: 14px;
	font-weight: 500;
`;

// Constants
const SOCIAL_ACCOUNTS = [
	{
		name: "TikTok",
		icon: <FaTiktok className="text-2xl" />,
		color: "#000",
	},
	{
		name: "Facebook",
		icon: <FaFacebook className="text-2xl" />,
		color: "#1877F2",
	},
	{
		name: "Instagram",
		icon: <FaInstagram className="text-2xl" />,
		color: "#E1306C",
	},
	{
		name: "YouTube",
		icon: <FaYoutube className="text-2xl" />,
		color: "#FF0000",
	},
];

const formatValue = (value) => {
	if (!value) return "0";
	if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
	if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
	return value;
};

const StatCard = ({ value, label, bgColor, textColor }) => (
	<StatCardWrapper bgColor={bgColor} textColor={textColor}>
		<div className="stat-value">{formatValue(value)}</div>
		<div className="stat-label">{label}</div>
	</StatCardWrapper>
);

StatCard.propTypes = {
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	label: PropTypes.string.isRequired,
	bgColor: PropTypes.string.isRequired,
	textColor: PropTypes.string.isRequired,
};

const SocialMedia = () => {
	const auth = useAuth();
	const youtube = auth?.youtube;

	const getSocialAccountDetails = (platform) => {
		if (platform === "YouTube" && youtube) {
			return {
				username: youtube?.snippet?.title,
				description: youtube?.snippet?.description,
				subscribers: youtube?.statistics?.subscriberCount,
				views: youtube?.statistics?.viewCount,
				videos: youtube?.statistics?.videoCount,
				profileImage: youtube?.snippet?.thumbnails?.default?.url,
				joined: youtube?.snippet?.publishedAt,
			};
		}
		return null;
	};

	const handleConnect = async (platform) => {
		if (platform === "YouTube") {
			try {
				await auth.fetchYouTubeData();
				message.success("YouTube account connected successfully!");
			} catch (error) {
				message.error("Failed to connect YouTube account");
			}
		} else {
			message.info(`${platform} connection coming soon!`);
		}
	};

	const renderAccountStats = (details) => (
		<div className="grid grid-cols-3 gap-4 mt-4">
			<StatCard
				value={details.subscribers}
				label="Subscribers"
				bgColor="rgba(59, 130, 246, 0.1)"
				textColor="#3b82f6"
			/>
			<StatCard
				value={details.views}
				label="Total Views"
				bgColor="rgba(16, 185, 129, 0.1)"
				textColor="#10b981"
			/>
			<StatCard
				value={details.videos}
				label="Videos"
				bgColor="rgba(239, 68, 68, 0.1)"
				textColor="#ef4444"
			/>
		</div>
	);

	const getConnectedAccounts = () => {
		return SOCIAL_ACCOUNTS.map((account) => ({
			...account,
			isConnected: account.name === "YouTube" ? !!youtube : false,
		}));
	};

	const connectedAccounts = getConnectedAccounts();
	const totalConnected = connectedAccounts.filter(
		(acc) => acc.isConnected
	).length;
	const isAllConnected = totalConnected === SOCIAL_ACCOUNTS.length;

	const renderConnectedAccounts = () => {
		const connected = connectedAccounts.filter((acc) => acc.isConnected);

		return (
			<div className="flex items-center">
				<ConnectedAccountsDisplay>
					{connected.map((account, index) => (
						<AccountIcon
							key={account.name}
							$zIndex={connected.length - index}
							$color={account.color}
							initial={{ scale: 0, x: -20 }}
							animate={{ scale: 1, x: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<span className="icon">{account.icon}</span>
						</AccountIcon>
					))}
				</ConnectedAccountsDisplay>
				<CompletionStatus $isComplete={isAllConnected}>
					{isAllConnected ? (
						<>
							<CheckCircleFilled />
							<span>All Connected</span>
						</>
					) : (
						<>
							<span>
								{totalConnected}/{SOCIAL_ACCOUNTS.length}
							</span>
						</>
					)}
				</CompletionStatus>
			</div>
		);
	};

	const renderSocialAccountContent = (account) => {
		const details = getSocialAccountDetails(account.name);
		const isConnected = account.name === "YouTube" ? !!youtube : false;

		return (
			<SocialAccountItem>
				<div className="w-full">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<span className="text-2xl" style={{ color: account.color }}>
								{account.icon}
							</span>
							<Text className="font-medium text-lg">{account.name}</Text>
						</div>
						{isConnected ? (
							<div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
								<CheckCircleFilled className="text-green-500" />
								<span className="text-green-600 font-medium">Connected</span>
							</div>
						) : (
							<ConnectButton
								type="primary"
								ghost
								shape="round"
								className="flex items-center gap-2"
								style={{ color: account.color, borderColor: account.color }}
								onClick={() => handleConnect(account.name)}
							>
								<LinkOutlined /> Connect
							</ConnectButton>
						)}
					</div>

					{isConnected && details && (
						<StyledInnerCollapse
							className="mt-4"
							expandIcon={({ isActive }) => (
								<CaretRightOutlined
									rotate={isActive ? 90 : 0}
									className="text-blue-600"
								/>
							)}
						>
							<Panel
								header={
									<div className="flex items-center gap-4">
										<Avatar
											size={48}
											src={details.profileImage}
											alt={details.username}
											className="border-2 border-white shadow-sm"
										/>
										<div>
											<div className="font-semibold text-gray-800">
												{details.username}
											</div>
											<div className="text-xs text-gray-500">
												Expand to view channel details
											</div>
										</div>
									</div>
								}
								key="1"
							>
								<div className="space-y-4">
									<div className="bg-gray-50 rounded-lg p-4">
										<Text className="text-sm text-gray-600 block leading-relaxed">
											{details.description || "No description available"}
										</Text>
										<Text className="text-xs text-gray-400 mt-2 block">
											Joined:{" "}
											{new Date(details.joined).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</Text>
									</div>
									{renderAccountStats(details)}
								</div>
							</Panel>
						</StyledInnerCollapse>
					)}
				</div>
			</SocialAccountItem>
		);
	};

	return (
		<StyledCollapse
			className="bg-white rounded-2xl overflow-hidden"
			expandIcon={({ isActive }) => (
				<CaretRightOutlined
					rotate={isActive ? 90 : 0}
					className="text-blue-600"
				/>
			)}
			defaultActiveKey={["1"]}
		>
			<Panel
				header={
					<div className="flex items-center justify-between w-full">
						<div className="flex items-center gap-3">
							<LinkOutlined className="text-blue-600" />
							<span className="font-semibold text-gray-800">
								Social Connections
							</span>
						</div>
						{renderConnectedAccounts()}
					</div>
				}
				key="1"
			>
				<List
					dataSource={SOCIAL_ACCOUNTS}
					renderItem={renderSocialAccountContent}
					className="space-y-3"
				/>
			</Panel>
		</StyledCollapse>
	);
};

export default SocialMedia;
