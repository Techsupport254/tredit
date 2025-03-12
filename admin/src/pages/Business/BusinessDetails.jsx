import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	FaEdit,
	FaTrash,
	FaEnvelope,
	FaPhone,
	FaGlobe,
	FaBuilding,
	FaWallet,
	FaMapMarkerAlt,
	FaImage,
	FaUsers,
	FaUserCircle,
	FaShieldAlt,
	FaStore,
	FaTiktok,
	FaFacebook,
	FaInstagram,
	FaYoutube,
	FaSave,
	FaTimes,
	FaCopy,
	FaCheckCircle,
	FaClock,
	FaTimesCircle,
	FaCalendar,
	FaCreditCard,
	FaLink,
	FaTag,
	FaUpload,
	FaDollarSign,
	FaBriefcase,
	FaCog,
	FaAlignLeft,
	FaClipboard,
	FaChartBar,
} from "react-icons/fa";
import {
	Typography,
	Button,
	Card,
	Menu,
	Avatar,
	Tag,
	Tabs,
	Modal,
	Input,
	Select,
	Switch,
	Upload,
	Tooltip,
	message,
	Divider,
	List,
	Collapse,
	Layout,
	theme,
	Grid,
} from "antd";
import LoadingSpinner from "../../Components/Common/LoadingSpinner";
import ErrorMessage from "../../Components/Common/ErrorMessage";
import ConfirmationModal from "../../Components/Common/ConfirmationModal";
import { showSuccess, showError, showInfo } from "../../utils/notifications";
import { useBusiness } from "../../Context/BusinessContext";
import { motion } from "framer-motion";
import styled from "styled-components";
import {
	CaretRightOutlined,
	LinkOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;
const { Header, Content, Sider } = Layout;
const { useBreakpoint } = Grid;

const SOCIAL_ACCOUNTS = [
	{
		name: "TikTok",
		icon: <FaTiktok />,
		color: "#000000",
		key: "tiktok",
		metadataLabels: {
			displayName: "Display Name",
			profileUrl: "Profile URL",
			followerCount: "Followers",
			videoCount: "Videos",
			bio: "Bio",
		},
	},
	{
		name: "Facebook",
		icon: <FaFacebook />,
		color: "#1877F2",
		key: "facebook",
		metadataLabels: {
			pageName: "Page Name",
			pageUrl: "Page URL",
			pageCategory: "Category",
			followerCount: "Followers",
			pageVerified: "Verified",
		},
	},
	{
		name: "Instagram",
		icon: <FaInstagram />,
		color: "#E1306C",
		key: "instagram",
		metadataLabels: {
			accountType: "Account Type",
			accountUrl: "Profile URL",
			followerCount: "Followers",
			mediaCount: "Posts",
			isBusinessAccount: "Business Account",
			isPrivate: "Private Account",
		},
	},
	{
		name: "YouTube",
		icon: <FaYoutube />,
		color: "#FF0000",
		key: "youtube",
		metadataLabels: {
			channelName: "Channel Name",
			channelUrl: "Channel URL",
			subscriberCount: "Subscribers",
			videoCount: "Videos",
			customUrl: "Custom URL",
		},
	},
];

const BUSINESS_TYPES = ["service", "product", "hybrid"];
const BUSINESS_MODELS = ["B2B", "B2C", "B2B2C", "C2C"];
const OPERATION_MODES = ["online", "offline", "hybrid"];
const CATEGORIES = [
	"Development",
	"Design",
	"Marketing",
	"Electronics",
	"Fashion",
	"Food",
	"Health",
	"Education",
	"Other",
];

const BusinessDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { fetchBusinessById, updateBusiness, deleteBusiness } = useBusiness();
	const [business, setBusiness] = useState(null);
	const [loading, setLoading] = useState(true);
	const [selectedMenu, setSelectedMenu] = useState("overview");
	const [showVerifyModal, setShowVerifyModal] = useState(false);
	const [verificationNote, setVerificationNote] = useState("");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [editedBusiness, setEditedBusiness] = useState(null);
	const [imageUrl, setImageUrl] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	const screens = useBreakpoint();
	const {
		token: { colorBgContainer, borderRadiusLG },
	} = theme.useToken();

	useEffect(() => {
		loadBusinessDetails();
	}, [id]);

	const loadBusinessDetails = async () => {
		try {
			setLoading(true);
			const data = await fetchBusinessById(id);
			if (data) {
				setBusiness(data);
				setEditedBusiness(data);
			}
		} catch (error) {
			showError("Failed to load business details");
		} finally {
			setLoading(false);
		}
	};

	const handleVerification = async (status) => {
		try {
			const response = await fetch(
				`http://localhost:8000/api/businesses/${id}/verify`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						verificationStatus: status,
						verificationNote,
					}),
				}
			);

			if (response.ok) {
				const data = await response.json();
				setBusiness(data.data);
				setShowVerifyModal(false);
				setVerificationNote("");
				showSuccess(
					`Business ${
						status === "verified" ? "verified" : "rejected"
					} successfully`
				);
			} else {
				showError("Failed to update verification status");
			}
		} catch (error) {
			console.error("Error updating verification status:", error);
			showError("An error occurred while updating verification status");
		}
	};

	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to delete this business?")) {
			try {
				await deleteBusiness(id);
				showSuccess("Business deleted successfully");
				navigate("/businesses");
			} catch (error) {
				showError("Failed to delete business");
			}
		}
	};

	const handleConnect = (platform) => {
		showInfo(`${platform} connection coming soon!`);
	};

	const handleEdit = () => {
		setEditMode(true);
		setEditedBusiness({ ...business });
	};

	const handleCancel = () => {
		setEditMode(false);
		setEditedBusiness(business);
	};

	const handleSave = async () => {
		try {
			await updateBusiness(id, editedBusiness);
			setEditMode(false);
			loadBusinessDetails();
			showSuccess("Business updated successfully");
		} catch (error) {
			showError("Failed to update business");
		}
	};

	const handleInputChange = (field, value) => {
		setEditedBusiness((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const uploadButton = (
		<div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
			{uploading ? (
				<LoadingSpinner size={20} />
			) : (
				<FaImage className="text-2xl mb-2" />
			)}
			<div className="mt-2">Upload Logo</div>
		</div>
	);

	const menuItems = [
		{
			key: "overview",
			label: "Overview",
			icon: <FaStore />,
		},
		{
			key: "team",
			label: "Team Members",
			icon: <FaUsers />,
		},
		{
			key: "locations",
			label: "Locations",
			icon: <FaMapMarkerAlt />,
		},
		{
			key: "financial",
			label: "Financial",
			icon: <FaWallet />,
		},
		{
			key: "social_media",
			label: "Social Media",
			icon: <FaGlobe />,
		},
		{
			key: "reviews",
			label: "Reviews",
			icon: <FaUsers />,
		},
		{
			key: "compliance",
			label: "Compliance",
			icon: <FaShieldAlt />,
		},
		{
			key: "blockchain",
			label: "Blockchain",
			icon: <FaWallet />,
		},
		{
			type: "divider",
		},
		{
			key: "delete",
			label: "Delete Business",
			icon: <FaTrash />,
			danger: true,
		},
	];

	const renderEmptyList = (message) => (
		<div className="text-center py-8">
			<Text className="text-sm text-gray-500 italic">{message}</Text>
		</div>
	);

	const renderList = (items, emptyMessage) => {
		if (!items || items.length === 0) {
			return renderEmptyList(emptyMessage);
		}
		return (
			<ul className="list-disc list-inside space-y-1">
				{items.map((item, index) => (
					<li key={index} className="text-sm text-gray-900">
						{item}
					</li>
				))}
			</ul>
		);
	};

	const renderTeamMembers = () => {
		const teamMembers = business.teamMembers || [];

		return (
			<div className="space-y-6">
				{/* Header with Add Button */}
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-semibold text-gray-900">
							Team Members
						</h3>
						<p className="text-sm text-gray-500">
							Manage your business team members and their permissions
						</p>
					</div>
					<Button
						type="primary"
						icon={<FaUsers className="mr-2" />}
						className="flex items-center"
						onClick={() => console.log("Add team member")}
					>
						Add Team Member
					</Button>
				</div>

				{/* Team Members List */}
				{teamMembers.length === 0 ? (
					<div className="text-center py-12 bg-white rounded-2xl">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<FaUsers className="text-gray-400 text-2xl" />
						</div>
						<Text className="text-gray-500 block mb-4">
							No team members added yet
						</Text>
						<Button
							type="primary"
							icon={<FaUsers className="mr-2" />}
							onClick={() => console.log("Add team member")}
						>
							Add Your First Team Member
						</Button>
					</div>
				) : (
					<div className="bg-white rounded-2xl overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Member
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Role
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Permissions
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{teamMembers.map((member) => (
										<tr
											key={member.id}
											className="hover:bg-gray-50 transition-colors duration-200"
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<Avatar
														size={40}
														src={member.user.profileImage}
														icon={<FaUserCircle />}
														className="bg-blue-100"
													/>
													<div className="ml-4">
														<div className="text-sm font-medium text-gray-900">
															{member.user.name}
														</div>
														<div className="text-sm text-gray-500">
															<a
																href={`mailto:${member.user.email}`}
																className="hover:text-blue-600"
															>
																{member.user.email}
															</a>
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-900 capitalize">
													{member.role}
												</div>
												{member.department && (
													<div className="text-sm text-gray-500">
														{member.department}
													</div>
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<Tag
													color={
														member.status === "active" ? "success" : "default"
													}
													className="uppercase text-xs"
												>
													{member.status}
												</Tag>
											</td>
											<td className="px-6 py-4">
												<div className="flex flex-wrap gap-1">
													{Object.entries(member.permissions)
														.filter(([_, value]) => value)
														.slice(0, 3)
														.map(([key]) => (
															<Tag key={key} className="capitalize text-xs">
																{key.replace(/_/g, " ")}
															</Tag>
														))}
													{Object.entries(member.permissions).filter(
														([_, value]) => value
													).length > 3 && (
														<Tooltip
															title={Object.entries(member.permissions)
																.filter(([_, value]) => value)
																.slice(3)
																.map(([key]) => key.replace(/_/g, " "))
																.join(", ")}
														>
															<Tag className="cursor-help">
																+
																{Object.entries(member.permissions).filter(
																	([_, value]) => value
																).length - 3}
															</Tag>
														</Tooltip>
													)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm">
												<div className="flex items-center gap-2">
													<Button
														type="text"
														icon={<FaEdit />}
														className="text-blue-600 hover:text-blue-700"
														onClick={() =>
															console.log("Edit member", member.id)
														}
													/>
													<Button
														type="text"
														icon={<FaTrash />}
														className="text-red-600 hover:text-red-700"
														onClick={() =>
															console.log("Delete member", member.id)
														}
													/>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		);
	};

	const renderSocialMedia = () => {
		const defaultSocialMedia = {
			tiktok: { isConnected: false, permissions: [], metadata: {} },
			facebook: { isConnected: false, permissions: [], metadata: {} },
			instagram: { isConnected: false, permissions: [], metadata: {} },
			youtube: { isConnected: false, permissions: [], metadata: {} },
		};

		const socialMedia = business?.socialMedia || defaultSocialMedia;

		const connectedAccounts = SOCIAL_ACCOUNTS.map((account) => ({
			...account,
			isConnected: socialMedia[account.key]?.isConnected || false,
			data: socialMedia[account.key] || { metadata: {} },
		}));

		const totalConnected = connectedAccounts.filter(
			(acc) => acc.isConnected
		).length;

		const renderConnectPlatforms = () => (
			<div className="space-y-6">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h3 className="text-lg font-semibold text-gray-900">
							Connect Platforms
						</h3>
						<p className="text-sm text-gray-500">
							Connect your social media accounts
						</p>
					</div>
					<div className="flex items-center gap-2">
						<div className="text-sm text-gray-600">
							{totalConnected}/{SOCIAL_ACCOUNTS.length} Connected
						</div>
						{totalConnected === SOCIAL_ACCOUNTS.length && (
							<div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
								<FaCheckCircle className="text-sm" />
								<span className="text-sm font-medium">All Connected</span>
							</div>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{SOCIAL_ACCOUNTS.map((account) => {
						const isConnected = socialMedia[account.key]?.isConnected || false;
						return (
							<div
								key={account.key}
								className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
							>
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-4">
										<div
											className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
											style={{
												color: account.color,
												background: `${account.color}10`,
											}}
										>
											{account.icon}
										</div>
										<div>
											<h4 className="text-lg font-medium text-gray-900">
												{account.name}
											</h4>
											<p className="text-sm text-gray-500">
												{isConnected ? "Connected" : "Not connected"}
											</p>
										</div>
									</div>
									{isConnected ? (
										<div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
											<FaCheckCircle className="text-green-500" />
											<span className="text-green-600 text-sm font-medium">
												Connected
											</span>
										</div>
									) : (
										<Button
											type="primary"
											ghost
											icon={<LinkOutlined />}
											className="flex items-center gap-2"
											style={{
												color: account.color,
												borderColor: account.color,
											}}
											onClick={() => handleConnect(account.name)}
										>
											Connect
										</Button>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);

		const renderPlatformData = (account) => {
			const platformData = socialMedia[account.key];
			const metadata = platformData?.metadata || {};
			const hasMetadata = Object.keys(metadata).length > 0;

			if (!platformData?.isConnected) {
				return (
					<div className="text-center py-12">
						<div
							className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
							style={{ background: `${account.color}10`, color: account.color }}
						>
							{account.icon}
						</div>
						<Text className="text-gray-500 block">
							Connect your {account.name} account to see analytics
						</Text>
						<Button
							type="primary"
							ghost
							icon={<LinkOutlined />}
							className="mt-4"
							style={{ color: account.color, borderColor: account.color }}
							onClick={() => handleConnect(account.name)}
						>
							Connect {account.name}
						</Button>
					</div>
				);
			}

			if (!hasMetadata) {
				return (
					<div className="text-center py-12">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<FaChartBar className="text-gray-400 text-2xl" />
						</div>
						<Text className="text-gray-500 block">No data available yet</Text>
					</div>
				);
			}

			return (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Object.entries(account.metadataLabels).map(([key, label]) => {
						const value = metadata[key];
						if (value === undefined || value === null) return null;

						return (
							<div
								key={key}
								className="bg-white rounded-xl p-6 border border-gray-100"
							>
								<Text className="text-sm text-gray-500 block mb-1">
									{label}
								</Text>
								<Text strong className="text-lg">
									{typeof value === "boolean"
										? value
											? "Yes"
											: "No"
										: typeof value === "number"
										? value.toLocaleString()
										: value || "Not available"}
								</Text>
							</div>
						);
					})}
				</div>
			);
		};

		const items = [
			{
				key: "connect",
				label: (
					<span className="flex items-center gap-2">
						<LinkOutlined />
						Connect Platforms
					</span>
				),
				children: renderConnectPlatforms(),
			},
			...SOCIAL_ACCOUNTS.map((account) => ({
				key: account.key,
				label: (
					<span className="flex items-center gap-2">
						{account.icon}
						{account.name}
					</span>
				),
				children: renderPlatformData(account),
			})),
		];

		return (
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				<Tabs
					defaultActiveKey="connect"
					items={items}
					className="px-6 pt-6"
					onChange={(key) => console.log(key)}
				/>
			</div>
		);
	};

	const getStatusBadge = (status, type) => {
		const statusConfig = {
			status: {
				active: {
					color: "bg-green-100 text-green-700 border-green-300",
					icon: <FaCheckCircle className="text-green-500" />,
				},
				inactive: {
					color: "bg-gray-100 text-gray-600 border-gray-300",
					icon: <FaTimesCircle className="text-gray-500" />,
				},
				suspended: {
					color: "bg-red-100 text-red-700 border-red-300",
					icon: <FaTimesCircle className="text-red-500" />,
				},
				pending: {
					color: "bg-yellow-100 text-yellow-700 border-yellow-300",
					icon: <FaClock className="text-yellow-500" />,
				},
			},
			verification: {
				verified: {
					color: "bg-green-100 text-green-700 border-green-300",
					icon: <FaCheckCircle className="text-green-500" />,
				},
				unverified: {
					color: "bg-gray-100 text-gray-600 border-gray-300",
					icon: <FaTimesCircle className="text-gray-500" />,
				},
				rejected: {
					color: "bg-red-100 text-red-700 border-red-300",
					icon: <FaTimesCircle className="text-red-500" />,
				},
				pending: {
					color: "bg-yellow-100 text-yellow-700 border-yellow-300",
					icon: <FaClock className="text-yellow-500" />,
				},
			},
		};

		const config =
			statusConfig[type][status?.toLowerCase()] || statusConfig[type].pending;

		return (
			<div
				className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color} shadow-sm transition-all duration-200 hover:shadow-md`}
			>
				{config.icon}
				<span className="capitalize font-medium text-sm">
					{status || "Pending"}
				</span>
			</div>
		);
	};

	const renderBusinessHeader = () => {
		if (!business) return null;

		return (
			<div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
				<div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 sm:p-8">
					<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
							<div className="relative">
								<Avatar
									size={64}
									src={business.logo}
									icon={<FaStore className="text-xl" />}
									className="bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-white shadow-lg"
								/>
								{business.verificationStatus === "verified" && (
									<div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full">
										<FaCheckCircle className="text-sm" />
									</div>
								)}
							</div>
							<div className="flex-1">
								<div className="flex flex-wrap items-center gap-2 mb-2">
									<Title level={4} className="!mb-0 !text-xl sm:!text-2xl">
										{business.name}
									</Title>
									{business.status === "active" && (
										<Tag
											color="success"
											className="uppercase text-xs font-semibold"
										>
											Active
										</Tag>
									)}
								</div>
								<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
									<div className="flex items-center gap-2 text-gray-600">
										<FaMapMarkerAlt className="text-gray-400" />
										<span className="text-sm">
											{business.address?.city}, {business.address?.country}
										</span>
									</div>
									<div className="flex items-center gap-2 text-gray-600">
										<FaGlobe className="text-gray-400" />
										<span className="text-sm capitalize">
											{business.operationMode} Business
										</span>
									</div>
									<div className="flex items-center gap-2 text-gray-600">
										<FaTag className="text-gray-400" />
										<span className="text-sm">{business.category}</span>
									</div>
								</div>
							</div>
						</div>

						<div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-0">
							{editMode ? (
								<>
									<Button
										onClick={handleCancel}
										icon={<FaTimes />}
										className="flex items-center gap-2 hover:bg-gray-50 border border-gray-200"
									>
										Cancel
									</Button>
									<Button
										type="primary"
										onClick={handleSave}
										icon={<FaSave />}
										className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 border-blue-500"
									>
										Save Changes
									</Button>
								</>
							) : (
								<>
									<Button
										onClick={handleEdit}
										icon={<FaEdit />}
										className="flex items-center gap-2 hover:bg-gray-50 border border-gray-200"
									>
										Edit
									</Button>
									{business.verificationStatus === "pending" && (
										<Button
											type="primary"
											onClick={() => setShowVerifyModal(true)}
											icon={<FaShieldAlt />}
											className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 border-blue-500"
										>
											Verify Business
										</Button>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderOverview = () => (
		<div className="space-y-6">
			{/* Quick Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
				{[
					{
						label: "Team Members",
						value: business.teamMembers?.length || 0,
						icon: <FaUsers />,
						gradient: "from-blue-600 via-blue-500 to-indigo-500",
						iconBg: "bg-blue-500",
					},
					{
						label: "Revenue",
						value: `${business.currency} ${business.revenue || "0.00"}`,
						icon: <FaDollarSign />,
						gradient: "from-emerald-600 via-emerald-500 to-teal-500",
						iconBg: "bg-emerald-500",
					},
					{
						label: "Social Connections",
						value: `${
							Object.values(business.socialMedia || {}).filter(
								(p) => p.isConnected
							).length
						}/4`,
						icon: <FaGlobe />,
						gradient: "from-purple-600 via-purple-500 to-pink-500",
						iconBg: "bg-purple-500",
					},
				].map((stat, index) => (
					<div
						key={index}
						className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-2xl p-4 sm:p-6 text-white transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
					>
						<div className="relative z-10 flex items-start gap-3 sm:gap-4">
							<div
								className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.iconBg} bg-opacity-20 backdrop-blur-xl flex items-center justify-center text-xl sm:text-2xl text-white`}
							>
								{stat.icon}
							</div>
							<div>
								<div className="text-white/80 text-xs sm:text-sm font-medium mb-1">
									{stat.label}
								</div>
								<div className="text-2xl sm:text-3xl font-bold tracking-tight">
									{stat.value}
								</div>
							</div>
						</div>
						<div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
							<div className="text-[80px] sm:text-[120px]">{stat.icon}</div>
						</div>
					</div>
				))}
			</div>

			{/* Business Information */}
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				<div className="border-b border-gray-100">
					<div className="flex items-center gap-4 p-6">
						<div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
							<FaBriefcase className="text-xl" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900">
								Business Information
							</h3>
							<p className="text-sm text-gray-500">
								Overview of your business details
							</p>
						</div>
					</div>
				</div>
				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{[
							{ label: "Type", value: business.type, icon: <FaStore /> },
							{ label: "Category", value: business.category, icon: <FaTag /> },
							{
								label: "Business Model",
								value: business.businessModel,
								icon: <FaCog />,
							},
							{
								label: "Operation Mode",
								value: business.operationMode,
								icon: <FaBuilding />,
							},
						].map((item, index) => (
							<div
								key={index}
								className="group bg-gray-50 p-4 rounded-xl transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50"
							>
								<div className="flex items-center gap-3 mb-2">
									<div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-500 group-hover:text-blue-600 transition-colors duration-300">
										{item.icon}
									</div>
									<div className="text-gray-600 text-sm font-medium">
										{item.label}
									</div>
								</div>
								<div className="text-gray-900 font-semibold capitalize pl-11">
									{item.value}
								</div>
							</div>
						))}
					</div>
					{business.description && (
						<div className="mt-6 bg-gray-50 rounded-xl p-6">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-500">
									<FaAlignLeft />
								</div>
								<h4 className="font-medium text-gray-900">Description</h4>
							</div>
							<p className="text-gray-600 leading-relaxed pl-11">
								{business.description}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Contact Information */}
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				<div className="border-b border-gray-100">
					<div className="flex items-center gap-4 p-6">
						<div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
							<FaEnvelope className="text-xl" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900">
								Contact Information
							</h3>
							<p className="text-sm text-gray-500">Business contact details</p>
						</div>
					</div>
				</div>
				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{[
							{
								label: "Email",
								value: business.email || "Not provided",
								icon: <FaEnvelope />,
								link: business.email ? `mailto:${business.email}` : null,
								color: "text-blue-500",
								bg: "bg-blue-50",
							},
							{
								label: "Phone",
								value: business.phone || "Not provided",
								icon: <FaPhone />,
								link: business.phone ? `tel:${business.phone}` : null,
								color: "text-green-500",
								bg: "bg-green-50",
							},
						].map((contact, index) => (
							<div
								key={index}
								className={`group bg-gray-50 p-4 rounded-xl transition-all duration-300 hover:bg-gradient-to-br hover:from-${
									contact.bg.split("-")[1]
								}-50 hover:to-${contact.bg.split("-")[1]}-100/50`}
							>
								<div className="flex items-center gap-3 mb-2">
									<div
										className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center ${contact.color}`}
									>
										{contact.icon}
									</div>
									<div className="text-gray-600 text-sm font-medium">
										{contact.label}
									</div>
								</div>
								<div className="text-gray-900 font-semibold pl-11">
									{contact.link ? (
										<a
											href={contact.link}
											className={`${contact.color} hover:underline`}
										>
											{contact.value}
										</a>
									) : (
										contact.value
									)}
								</div>
							</div>
						))}
					</div>
					{business.address && (
						<div className="mt-6 bg-gray-50 rounded-xl p-6">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-purple-500">
									<FaMapMarkerAlt />
								</div>
								<h4 className="font-medium text-gray-900">Address</h4>
							</div>
							<p className="text-gray-600 font-medium pl-11">
								{[
									business.address.street,
									business.address.city,
									business.address.state,
									business.address.country,
									business.address.postalCode,
								]
									.filter(Boolean)
									.join(", ")}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Payment Information */}
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				<div className="border-b border-gray-100">
					<div className="flex items-center gap-4 p-6">
						<div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
							<FaWallet className="text-xl" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900">
								Payment Information
							</h3>
							<p className="text-sm text-gray-500">
								Payment methods and currency
							</p>
						</div>
					</div>
				</div>
				<div className="p-6 space-y-8">
					<div>
						<div className="flex items-center gap-3 mb-4">
							<div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
								<FaCreditCard />
							</div>
							<h4 className="font-medium text-gray-900">
								Accepted Payment Methods
							</h4>
						</div>
						<div className="flex flex-wrap gap-3 pl-11">
							{business.paymentMethods?.length > 0 ? (
								business.paymentMethods.map((method, index) => (
									<div
										key={index}
										className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-100 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
									>
										<FaCreditCard className="text-blue-500 group-hover:scale-110 transition-transform duration-300" />
										<span className="text-blue-700 font-medium capitalize">
											{method.replace(/_/g, " ")}
										</span>
									</div>
								))
							) : (
								<div className="text-gray-500 italic">
									No payment methods specified
								</div>
							)}
						</div>
					</div>
					<div>
						<div className="flex items-center gap-3 mb-4">
							<div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
								<FaDollarSign />
							</div>
							<h4 className="font-medium text-gray-900">Currency</h4>
						</div>
						<div className="pl-11">
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-100 transition-all duration-300 hover:shadow-md">
								<FaDollarSign className="text-emerald-500" />
								<span className="text-emerald-700 font-medium">
									{business.currency}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Status Information */}
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				<div className="border-b border-gray-100">
					<div className="flex items-center gap-4 p-6">
						<div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
							<FaShieldAlt className="text-xl" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900">
								Status Information
							</h3>
							<p className="text-sm text-gray-500">
								Business and verification status
							</p>
						</div>
					</div>
				</div>
				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{[
							{
								label: "Business Status",
								value: business.status,
								type: "status",
								icon: <FaStore />,
								bg: "bg-blue-50",
								color: "text-blue-500",
							},
							{
								label: "Verification Status",
								value: business.verificationStatus,
								type: "verification",
								icon: <FaShieldAlt />,
								bg: "bg-purple-50",
								color: "text-purple-500",
							},
						].map((status, index) => (
							<div
								key={index}
								className="group bg-gray-50 p-6 rounded-xl transition-all duration-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100/50"
							>
								<div className="flex items-center gap-3 mb-3">
									<div
										className={`w-8 h-8 rounded-lg ${status.bg} flex items-center justify-center ${status.color}`}
									>
										{status.icon}
									</div>
									<h4 className="font-medium text-gray-900">{status.label}</h4>
								</div>
								<div className="pl-11">
									{getStatusBadge(status.value, status.type)}
								</div>
							</div>
						))}
					</div>
					{business.verificationNote && (
						<div className="mt-6 bg-gray-50 rounded-xl p-6">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-500">
									<FaClipboard />
								</div>
								<h4 className="font-medium text-gray-900">Verification Note</h4>
							</div>
							<p className="text-gray-600 leading-relaxed pl-11">
								{business.verificationNote}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);

	const renderContent = () => {
		if (loading) {
			return <LoadingSpinner />;
		}

		if (!business) {
			return <ErrorMessage message="Business not found" />;
		}

		switch (selectedMenu) {
			case "overview":
				return renderOverview();
			case "team":
				return renderTeamMembers();
			case "social_media":
				return renderSocialMedia();
			case "locations":
				return (
					<div className="text-center py-12">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<FaMapMarkerAlt className="text-gray-400 text-2xl" />
						</div>
						<Text className="text-gray-500 block">No locations added yet</Text>
						<Button type="primary" className="mt-4">
							Add Location
						</Button>
					</div>
				);
			case "financial":
				return (
					<div className="text-center py-12">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<FaWallet className="text-gray-400 text-2xl" />
						</div>
						<Text className="text-gray-500 block">
							No financial data available
						</Text>
						<Button type="primary" className="mt-4">
							Add Financial Data
						</Button>
					</div>
				);
			case "reviews":
				return (
					<div className="text-center py-12">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<FaUsers className="text-gray-400 text-2xl" />
						</div>
						<Text className="text-gray-500 block">No reviews yet</Text>
						<Button type="primary" className="mt-4">
							Add Review
						</Button>
					</div>
				);
			case "compliance":
				return (
					<div className="text-center py-12">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<FaShieldAlt className="text-gray-400 text-2xl" />
						</div>
						<Text className="text-gray-500 block">
							No compliance data available
						</Text>
						<Button type="primary" className="mt-4">
							Add Compliance Data
						</Button>
					</div>
				);
			case "blockchain":
				return (
					<div className="text-center py-12">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<FaWallet className="text-gray-400 text-2xl" />
						</div>
						<Text className="text-gray-500 block">
							No blockchain data available
						</Text>
						<Button type="primary" className="mt-4">
							Connect Blockchain
						</Button>
					</div>
				);
			default:
				return renderOverview();
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{screens.md ? (
				<div className="flex">
					{/* Sticky Sidebar */}
					<div className="sticky top-0 h-screen flex-shrink-0">
						<div className="w-64 h-full bg-white shadow-sm overflow-y-auto">
							<div className="p-4 border-b border-gray-100">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
										<FaStore />
									</div>
									<h2 className="text-lg font-semibold text-gray-900">
										Business Menu
									</h2>
								</div>
							</div>
							<Menu
								mode="inline"
								selectedKeys={[selectedMenu]}
								items={menuItems}
								onClick={({ key }) => {
									if (key === "delete") {
										setShowDeleteModal(true);
									} else {
										setSelectedMenu(key);
									}
								}}
								className="border-r-0"
							/>
						</div>
					</div>

					{/* Main Content Area with Independent Scroll */}
					<div className="flex-1 min-h-screen">
						<div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
							{renderBusinessHeader()}
							<div className="overflow-x-auto">{renderContent()}</div>
						</div>
					</div>
				</div>
			) : (
				// Mobile View
				<div className="flex flex-col min-h-screen">
					{/* Mobile Header */}
					<div className="bg-white shadow-sm sticky top-0 z-20">
						<div className="p-2 sm:p-4">
							<Tabs
								activeKey={selectedMenu}
								onChange={(key) => {
									if (key === "delete") {
										setShowDeleteModal(true);
									} else {
										setSelectedMenu(key);
									}
								}}
								items={menuItems
									.filter((item) => item.type !== "divider")
									.map((item) => ({
										key: item.key,
										label: (
											<span className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
												{item.icon}
												<span className="hidden sm:inline">{item.label}</span>
											</span>
										),
									}))}
								className="business-tabs"
							/>
						</div>
					</div>

					{/* Mobile Content */}
					<div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-x-hidden">
						{renderBusinessHeader()}
						{renderContent()}
					</div>
				</div>
			)}

			{/* Modals */}
			<ConfirmationModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleDelete}
				title="Delete Business"
				message="Are you sure you want to delete this business? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				type="danger"
			/>

			<Modal
				title="Verification Note"
				open={showVerifyModal}
				onCancel={() => setShowVerifyModal(false)}
				footer={[
					<Button key="cancel" onClick={() => setShowVerifyModal(false)}>
						Cancel
					</Button>,
					<Button
						key="verify"
						type="primary"
						onClick={() => handleVerification("verified")}
					>
						Verify
					</Button>,
					<Button
						key="reject"
						danger
						onClick={() => handleVerification("rejected")}
					>
						Reject
					</Button>,
				]}
			>
				<Input.TextArea
					rows={4}
					value={verificationNote}
					onChange={(e) => setVerificationNote(e.target.value)}
					placeholder="Add a note about the verification decision..."
				/>
			</Modal>

			{/* Add custom styles for better mobile tabs */}
			<style jsx global>{`
				.business-tabs .ant-tabs-nav {
					margin-bottom: 0;
				}
				.business-tabs .ant-tabs-nav-list {
					width: 100%;
					justify-content: space-between;
				}
				.business-tabs .ant-tabs-tab {
					margin: 0;
					padding: 8px 12px;
				}
				@media (max-width: 640px) {
					.business-tabs .ant-tabs-tab {
						padding: 8px;
					}
				}
			`}</style>
		</div>
	);
};

export default BusinessDetails;
