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
	FaStar,
	FaCrown,
	FaUserShield,
	FaUserTie,
	FaUser,
	FaEye,
	FaInfoCircle,
	FaBox,
	FaShoppingCart,
	FaUserFriends,
	FaUserPlus,
	FaSync,
	FaExternalLinkAlt,
	FaVideo,
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
	Form,
	TimePicker,
	Checkbox,
	Radio,
	Space,
	Drawer,
	Steps,
	Popconfirm,
	Segmented,
	InputNumber,
	Empty,
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
import dayjs from "dayjs";
import { BUSINESS_CONSTANTS } from "../../constants/businessConstants";
import axios from "axios";

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
			viewCount: "Total Views",
			thumbnailUrl: "Thumbnail URL",
			description: "Description",
		},
	},
];

const BUSINESS_TYPES = Object.values(BUSINESS_CONSTANTS.TYPES);
const BUSINESS_MODELS = Object.values(BUSINESS_CONSTANTS.MODELS);
const OPERATION_MODES = Object.values(BUSINESS_CONSTANTS.OPERATION_MODES);
const CATEGORIES = BUSINESS_CONSTANTS.CATEGORIES;

const DAYS_ORDER = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
];

const EDITABLE_SECTIONS = {
	BASIC: "basic",
	CONTACT: "contact",
	OPERATIONS: "operations",
	HOURS: "hours",
	SOCIAL: "social",
	PAYMENT: "payment",
	CATEGORIES: "categories",
};

// Add this after the EDITABLE_SECTIONS constant
const TEAM_MEMBER_ROLES = [
	{
		value: "owner",
		label: "Owner",
		description: "Full access to all features and settings",
		icon: <FaCrown className="text-yellow-500" />,
	},
	{
		value: "admin",
		label: "Administrator",
		description: "Can manage most features except critical settings",
		icon: <FaUserShield className="text-blue-500" />,
	},
	{
		value: "manager",
		label: "Manager",
		description: "Can manage day-to-day operations",
		icon: <FaUserTie className="text-purple-500" />,
	},
	{
		value: "staff",
		label: "Staff",
		description: "Basic access to daily tasks",
		icon: <FaUser className="text-green-500" />,
	},
	{
		value: "viewer",
		label: "Viewer",
		description: "Can only view information",
		icon: <FaEye className="text-gray-500" />,
	},
];

const BusinessDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { fetchBusinessById, updateBusiness, deleteBusiness, connectYouTube } =
		useBusiness();
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
	const [editSection, setEditSection] = useState(null);
	const [editForm] = Form.useForm();
	const [editDrawerVisible, setEditDrawerVisible] = useState(false);
	const [editingHours, setEditingHours] = useState(false);
	const [addMemberDrawerVisible, setAddMemberDrawerVisible] = useState(false);
	const [addMemberForm] = Form.useForm();
	const [selectedPermissions, setSelectedPermissions] = useState({});
	const [inviteStep, setInviteStep] = useState(0);

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
			} else {
				showError("Business not found");
				navigate("/businesses");
			}
		} catch (error) {
			console.error("Error loading business details:", error);
			showError("Failed to load business details");
			navigate("/businesses");
		} finally {
			setLoading(false);
		}
	};

	// Return loading state
	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 p-4">
				<LoadingSpinner message="Loading business details..." />
			</div>
		);
	}

	// Return error state if no business found
	if (!business) {
		return (
			<div className="min-h-screen bg-gray-50 p-4">
				<ErrorMessage message="Business not found" />
			</div>
		);
	}

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

	const handleConnect = async (platform) => {
		if (platform === "YouTube") {
			try {
				await connectYouTube(business.id);
			} catch (error) {
				showError("Failed to connect YouTube account");
			}
		} else {
			showInfo(`${platform} connection coming soon!`);
		}
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

		const renderAddMemberDrawer = () => (
			<Drawer
				title="Add Team Member"
				placement="right"
				width={720}
				onClose={() => {
					setAddMemberDrawerVisible(false);
					setInviteStep(0);
					addMemberForm.resetFields();
					setSelectedPermissions({});
				}}
				open={addMemberDrawerVisible}
				extra={
					<Space>
						<Button onClick={() => setAddMemberDrawerVisible(false)}>
							Cancel
						</Button>
						{inviteStep === 1 ? (
							<Button type="primary" onClick={handleAddTeamMember}>
								Send Invitation
							</Button>
						) : (
							<Button type="primary" onClick={() => setInviteStep(1)}>
								Next
							</Button>
						)}
					</Space>
				}
			>
				<Steps
					current={inviteStep}
					items={[
						{
							title: "Basic Info",
							description: "Member details",
						},
						{
							title: "Permissions",
							description: "Access control",
						},
					]}
					className="mb-8"
				/>

				<Form form={addMemberForm} layout="vertical">
					{inviteStep === 0 ? (
						<>
							<Form.Item
								name="email"
								label="Email Address"
								rules={[
									{ required: true, message: "Please enter email address" },
									{ type: "email", message: "Please enter a valid email" },
								]}
							>
								<Input placeholder="Enter team member's email" />
							</Form.Item>

							<Form.Item
								name="role"
								label="Role"
								rules={[{ required: true, message: "Please select a role" }]}
							>
								<Radio.Group className="space-y-4 w-full">
									{TEAM_MEMBER_ROLES.map((role) => (
										<Radio
											key={role.value}
											value={role.value}
											className="w-full"
										>
											<div className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
												<div className="flex-shrink-0 mt-1">{role.icon}</div>
												<div className="ml-4">
													<div className="font-medium text-gray-900">
														{role.label}
													</div>
													<div className="text-sm text-gray-500">
														{role.description}
													</div>
												</div>
											</div>
										</Radio>
									))}
								</Radio.Group>
							</Form.Item>

							<Form.Item name="position" label="Position">
								<Input placeholder="e.g. Senior Developer" />
							</Form.Item>

							<Form.Item name="department" label="Department">
								<Input placeholder="e.g. Engineering" />
							</Form.Item>
						</>
					) : (
						<div className="space-y-6">
							<div className="bg-blue-50 rounded-lg p-4 mb-6">
								<div className="flex items-center gap-3">
									<FaInfoCircle className="text-blue-500" />
									<div>
										<h4 className="font-medium text-blue-900">Permissions</h4>
										<p className="text-sm text-blue-700">
											Select the permissions for this team member. These can be
											modified later.
										</p>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{[
									{
										key: "manage_team",
										label: "Manage Team",
										description: "Add, remove, and manage team members",
										icon: <FaUsers className="text-purple-500" />,
									},
									{
										key: "manage_products",
										label: "Manage Products",
										description: "Create and manage products",
										icon: <FaBox className="text-orange-500" />,
									},
									{
										key: "manage_orders",
										label: "Manage Orders",
										description: "Process and manage orders",
										icon: <FaShoppingCart className="text-green-500" />,
									},
									{
										key: "manage_customers",
										label: "Manage Customers",
										description: "Access customer information",
										icon: <FaUserFriends className="text-blue-500" />,
									},
									{
										key: "view_analytics",
										label: "View Analytics",
										description: "Access business analytics",
										icon: <FaChartBar className="text-indigo-500" />,
									},
									{
										key: "manage_settings",
										label: "Manage Settings",
										description: "Change business settings",
										icon: <FaCog className="text-gray-500" />,
									},
								].map((permission) => (
									<div
										key={permission.key}
										className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
											selectedPermissions[permission.key]
												? "border-blue-500 bg-blue-50"
												: "border-gray-200 hover:border-blue-200"
										}`}
										onClick={() =>
											setSelectedPermissions((prev) => ({
												...prev,
												[permission.key]: !prev[permission.key],
											}))
										}
									>
										<div className="flex items-start gap-3">
											<div className="flex-shrink-0 mt-1">
												{permission.icon}
											</div>
											<div>
												<div className="font-medium text-gray-900">
													{permission.label}
												</div>
												<div className="text-sm text-gray-500">
													{permission.description}
												</div>
											</div>
											<Checkbox
												checked={selectedPermissions[permission.key]}
												className="ml-auto mt-1"
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</Form>
			</Drawer>
		);

		return (
			<div className="space-y-6">
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
						icon={<FaUserPlus />}
						onClick={() => setAddMemberDrawerVisible(true)}
						className="flex items-center gap-2"
					>
						Add Team Member
					</Button>
				</div>

				{teamMembers.length === 0 ? (
					<div className="text-center py-12 bg-white rounded-2xl">
						<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<FaUsers className="text-blue-500 text-2xl" />
						</div>
						<Text className="text-gray-500 block mb-4">
							Build your team by adding members
						</Text>
						<Button
							type="primary"
							icon={<FaUserPlus />}
							onClick={() => setAddMemberDrawerVisible(true)}
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
														src={member.user?.profileImage}
														icon={<FaUserCircle />}
														className="bg-blue-100"
														style={{ marginLeft: "16px" }}
													/>
													<div className="ml-4">
														<div className="text-sm font-medium text-gray-900">
															{member.user?.name}
														</div>
														<div className="text-sm text-gray-500">
															<a
																href={`mailto:${member.user?.email}`}
																className="hover:text-blue-600"
															>
																{member.user?.email}
															</a>
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center gap-2">
													{
														TEAM_MEMBER_ROLES.find(
															(role) => role.value === member.role
														)?.icon
													}
													<div>
														<div className="text-sm text-gray-900 capitalize">
															{member.role}
														</div>
														{member.position && (
															<div className="text-xs text-gray-500">
																{member.position}
															</div>
														)}
													</div>
												</div>
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
													{Object.entries(member.permissions || {})
														.filter(([_, value]) => value)
														.slice(0, 3)
														.map(([key]) => (
															<Tag key={key} className="capitalize text-xs">
																{key.replace(/_/g, " ")}
															</Tag>
														))}
													{Object.entries(member.permissions || {}).filter(
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
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center gap-2">
													<Tooltip title="Edit Member">
														<Button
															type="text"
															icon={<FaEdit />}
															className="text-blue-600 hover:text-blue-700"
															onClick={() => handleEditMember(member)}
														/>
													</Tooltip>
													<Tooltip title="Remove Member">
														<Popconfirm
															title="Remove Team Member"
															description="Are you sure you want to remove this team member?"
															onConfirm={() => handleRemoveMember(member.id)}
															okText="Yes"
															cancelText="No"
														>
															<Button
																type="text"
																icon={<FaTrash />}
																className="text-red-600 hover:text-red-700"
															/>
														</Popconfirm>
													</Tooltip>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{renderAddMemberDrawer()}
			</div>
		);
	};

	// Add these functions to handle team member actions
	const handleEditMember = (member) => {
		// Implement edit functionality
		console.log("Edit member:", member);
	};

	const handleRemoveMember = async (memberId) => {
		try {
			// Implement remove functionality
			console.log("Remove member:", memberId);
			showSuccess("Team member removed successfully");
			loadBusinessDetails();
		} catch (error) {
			showError("Failed to remove team member");
		}
	};

	const handleRefreshChannelData = async (businessId) => {
		try {
			message.loading({
				content: "Refreshing channel data...",
				key: "refresh",
			});
			await axios.post(`/youtube/${businessId}/refresh`);
			await loadBusinessDetails();
			message.success({
				content: "Channel data refreshed successfully",
				key: "refresh",
			});
		} catch (error) {
			console.error("Error refreshing channel data:", error);
			message.error({
				content:
					error.response?.data?.message || "Failed to refresh channel data",
				key: "refresh",
			});
		}
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

			// Enhanced YouTube data display
			if (account.key === "youtube") {
				return (
					<div className="space-y-6">
						{/* Channel Banner */}
						{metadata.bannerImageUrl && (
							<div className="w-full h-32 md:h-48 rounded-xl overflow-hidden">
								<img
									src={metadata.bannerImageUrl}
									alt="Channel Banner"
									className="w-full h-full object-cover"
								/>
							</div>
						)}

						{/* Channel Header */}
						<div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6">
							<div className="flex items-start gap-6">
								{/* Channel Thumbnail */}
								{metadata.thumbnails && (
									<div className="flex-shrink-0">
										<img
											src={
												metadata.thumbnails.default?.url ||
												metadata.thumbnails.medium?.url
											}
											alt={metadata.channelName}
											className="w-24 h-24 rounded-xl object-cover"
										/>
									</div>
								)}

								{/* Channel Info */}
								<div className="flex-grow">
									<h3 className="text-xl font-bold text-gray-900 mb-2">
										{metadata.channelName}
									</h3>
									<div className="flex items-center gap-2 mb-2">
										{metadata.customUrl && (
											<a
												href={`https://youtube.com/${metadata.customUrl}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-red-600 hover:text-red-700 flex items-center gap-1"
											>
												<FaYoutube />
												{metadata.customUrl}
											</a>
										)}
									</div>
									{metadata.description && (
										<p className="text-gray-600 text-sm line-clamp-2 mb-3">
											{metadata.description}
										</p>
									)}
									<div className="flex flex-wrap items-center gap-4">
										<div className="flex items-center gap-1 text-gray-600">
											<FaUsers className="text-gray-400" />
											<span>
												{Number(metadata.subscriberCount).toLocaleString()}{" "}
												subscribers
											</span>
										</div>
										<div className="flex items-center gap-1 text-gray-600">
											<FaVideo className="text-gray-400" />
											<span>
												{Number(metadata.videoCount).toLocaleString()} videos
											</span>
										</div>
										<div className="flex items-center gap-1 text-gray-600">
											<FaEye className="text-gray-400" />
											<span>
												{Number(metadata.viewCount).toLocaleString()} views
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Channel Statistics */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
								<div className="flex items-center gap-3 mb-2">
									<div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
										<FaUsers className="text-xl" />
									</div>
									<div>
										<p className="text-sm text-gray-500">Subscribers</p>
										<p className="text-xl font-bold text-gray-900">
											{Number(metadata.subscriberCount).toLocaleString()}
										</p>
									</div>
								</div>
							</div>
							<div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
								<div className="flex items-center gap-3 mb-2">
									<div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
										<FaVideo className="text-xl" />
									</div>
									<div>
										<p className="text-sm text-gray-500">Videos</p>
										<p className="text-xl font-bold text-gray-900">
											{Number(metadata.videoCount).toLocaleString()}
										</p>
									</div>
								</div>
							</div>
							<div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
								<div className="flex items-center gap-3 mb-2">
									<div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
										<FaEye className="text-xl" />
									</div>
									<div>
										<p className="text-sm text-gray-500">Total Views</p>
										<p className="text-xl font-bold text-gray-900">
											{Number(metadata.viewCount).toLocaleString()}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Additional Channel Info */}
						<div className="bg-white rounded-xl p-6 border border-gray-100">
							<h4 className="font-medium text-gray-900 mb-4">
								Channel Details
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{metadata.publishedAt && (
									<div className="flex items-center gap-2">
										<FaCalendar className="text-gray-400" />
										<div>
											<p className="text-sm text-gray-500">Created On</p>
											<p className="text-gray-900">
												{new Date(metadata.publishedAt).toLocaleDateString()}
											</p>
										</div>
									</div>
								)}
								{metadata.country && (
									<div className="flex items-center gap-2">
										<FaGlobe className="text-gray-400" />
										<div>
											<p className="text-sm text-gray-500">Country</p>
											<p className="text-gray-900">{metadata.country}</p>
										</div>
									</div>
								)}
							</div>
							{metadata.keywords && (
								<div className="mt-4">
									<p className="text-sm text-gray-500 mb-2">Keywords</p>
									<div className="flex flex-wrap gap-2">
										{metadata.keywords.split(",").map((keyword, index) => (
											<Tag key={index} className="rounded-full">
												{keyword.trim()}
											</Tag>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Channel Actions */}
						<div className="flex items-center justify-end gap-4 mt-6">
							<Button
								type="default"
								icon={<FaSync />}
								onClick={() => handleRefreshChannelData(business.id)}
							>
								Refresh Data
							</Button>
							{metadata.channelUrl && (
								<Button
									type="primary"
									icon={<FaExternalLinkAlt />}
									href={metadata.channelUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									View Channel
								</Button>
							)}
						</div>
					</div>
				);
			}

			// Default display for other platforms
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

	const handleEditSection = (section) => {
		setEditSection(section);
		editForm.setFieldsValue({
			...business,
			address: business.address || {},
			businessHours: business.businessHours || {},
			serviceCategories:
				business.type === "service" ? business.serviceCategories : [],
			productCategories:
				business.type === "product" ? business.productCategories : [],
		});
		setEditDrawerVisible(true);
	};

	const handleEditSave = async () => {
		const hide = message.loading("Saving changes...", 0);
		try {
			const values = await editForm.validateFields();

			// Convert dayjs objects back to string format for API
			if (values.businessHours) {
				Object.entries(values.businessHours).forEach(([day, hours]) => {
					if (hours.start) {
						values.businessHours[day].start = hours.start.format("HH:mm");
					}
					if (hours.end) {
						values.businessHours[day].end = hours.end.format("HH:mm");
					}
				});
			}

			await updateBusiness(id, {
				...values,
				id: business.id,
			});
			hide();
			message.success("Changes saved successfully!");
			setEditDrawerVisible(false);
			setEditSection(null);
			loadBusinessDetails();
		} catch (error) {
			hide();
			if (error.message) {
				try {
					const validationErrors = JSON.parse(error.message);
					Object.entries(validationErrors).forEach(([field, message]) => {
						editForm.setFields([
							{
								name: field,
								errors: [message],
							},
						]);
					});
					message.error("Please check the form for errors");
				} catch {
					message.error(error.message || "Failed to update business");
				}
			} else {
				message.error("Failed to update business");
			}
		}
	};

	const renderEditDrawer = () => (
		<Drawer
			title="Edit Business Information"
			placement="right"
			width={720}
			onClose={handleCancel}
			open={editDrawerVisible}
			extra={
				<Space>
					<Button onClick={handleCancel}>Cancel</Button>
					<Button type="primary" onClick={handleEditSave} loading={loading}>
						Save Changes
					</Button>
				</Space>
			}
		>
			<Form
				form={editForm}
				layout="vertical"
				className="px-4"
				initialValues={{
					...business,
					address: business.address || {},
					businessHours: business.businessHours || {},
					serviceCategories:
						business.type === "service" ? business.serviceCategories : [],
					productCategories:
						business.type === "product" ? business.productCategories : [],
				}}
			>
				{editSection === EDITABLE_SECTIONS.CATEGORIES && (
					<>
						{business.type === "service" && (
							<Form.Item
								name="serviceCategories"
								label="Service Categories"
								rules={[
									{
										required: true,
										message: "Please select at least one service category",
									},
								]}
							>
								<Select
									mode="multiple"
									placeholder="Select service categories"
									className="w-full"
								>
									{BUSINESS_CONSTANTS.SERVICE_CATEGORIES.map((category) => (
										<Option key={category} value={category}>
											{category}
										</Option>
									))}
								</Select>
							</Form.Item>
						)}
						{business.type === "product" && (
							<Form.Item
								name="productCategories"
								label="Product Categories"
								rules={[
									{
										required: true,
										message: "Please select at least one product category",
									},
								]}
							>
								<Select
									mode="multiple"
									placeholder="Select product categories"
									className="w-full"
								>
									{BUSINESS_CONSTANTS.PRODUCT_CATEGORIES.map((category) => (
										<Option key={category} value={category}>
											{category}
										</Option>
									))}
								</Select>
							</Form.Item>
						)}
					</>
				)}
				{editSection === EDITABLE_SECTIONS.BASIC && (
					<>
						<Form.Item
							name="name"
							label="Business Name"
							rules={[
								{ required: true, message: "Please enter business name" },
								{
									min: BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MIN,
									max: BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MAX,
									message: `Name must be between ${BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MIN}-${BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MAX} characters`,
								},
							]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							name="description"
							label="Description"
							rules={[
								{ required: true, message: "Please enter description" },
								{
									min: BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MIN,
									max: BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MAX,
									message: `Description must be between ${BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MIN}-${BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MAX} characters`,
								},
							]}
						>
							<Input.TextArea rows={4} />
						</Form.Item>
						<Form.Item
							name="type"
							label="Business Type"
							rules={[
								{ required: true, message: "Please select business type" },
							]}
						>
							<Select>
								{Object.entries(BUSINESS_CONSTANTS.TYPES).map(
									([key, value]) => (
										<Option key={value} value={value}>
											{key.charAt(0) + key.slice(1).toLowerCase()}
										</Option>
									)
								)}
							</Select>
						</Form.Item>
						<Form.Item
							name="category"
							label="Category"
							rules={[{ required: true, message: "Please select category" }]}
						>
							<Select>
								{BUSINESS_CONSTANTS.CATEGORIES.map((category) => (
									<Option key={category} value={category}>
										{category}
									</Option>
								))}
							</Select>
						</Form.Item>
					</>
				)}

				{editSection === EDITABLE_SECTIONS.CONTACT && (
					<>
						<Form.Item
							name="email"
							label="Email"
							rules={[
								{ type: "email", message: "Please enter valid email" },
								{
									pattern: BUSINESS_CONSTANTS.VALIDATION.EMAIL_REGEX,
									message: "Invalid email format",
								},
							]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							name="phone"
							label="Phone"
							rules={[
								{
									pattern: BUSINESS_CONSTANTS.VALIDATION.PHONE_REGEX,
									message: "Invalid phone number format",
								},
							]}
						>
							<Input />
						</Form.Item>
						<Form.Item name={["address", "street"]} label="Street Address">
							<Input />
						</Form.Item>
						<Form.Item name={["address", "city"]} label="City">
							<Input />
						</Form.Item>
						<Form.Item name={["address", "state"]} label="State">
							<Input />
						</Form.Item>
						<Form.Item name={["address", "country"]} label="Country">
							<Input />
						</Form.Item>
						<Form.Item name={["address", "postalCode"]} label="Postal Code">
							<Input />
						</Form.Item>
					</>
				)}

				{editSection === EDITABLE_SECTIONS.OPERATIONS && (
					<>
						<Form.Item
							name="businessModel"
							label="Business Model"
							rules={[
								{ required: true, message: "Please select business model" },
							]}
						>
							<Radio.Group buttonStyle="solid">
								{Object.values(BUSINESS_CONSTANTS.MODELS).map((model) => (
									<Radio.Button key={model} value={model}>
										{model}
									</Radio.Button>
								))}
							</Radio.Group>
						</Form.Item>
						<Form.Item
							name="operationMode"
							label="Operation Mode"
							rules={[
								{ required: true, message: "Please select operation mode" },
							]}
						>
							<Segmented
								options={Object.values(BUSINESS_CONSTANTS.OPERATION_MODES).map(
									(mode) => ({
										label: mode.charAt(0).toUpperCase() + mode.slice(1),
										value: mode,
										icon:
											mode === "digital" ? (
												<FaGlobe />
											) : mode === "physical" ? (
												<FaStore />
											) : (
												<FaBuilding />
											),
									})
								)}
							/>
						</Form.Item>
					</>
				)}

				{editSection === EDITABLE_SECTIONS.PAYMENT && (
					<>
						<Form.Item
							name="paymentMethods"
							label="Payment Methods"
							rules={[
								{
									required: true,
									message: "Please select at least one payment method",
								},
							]}
						>
							<Select mode="multiple" placeholder="Select payment methods">
								{BUSINESS_CONSTANTS.PAYMENT_METHODS.map((method) => (
									<Option key={method} value={method}>
										{method
											.replace(/_/g, " ")
											.split(" ")
											.map(
												(word) => word.charAt(0).toUpperCase() + word.slice(1)
											)
											.join(" ")}
									</Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item
							name="currency"
							label="Currency"
							rules={[{ required: true, message: "Please select currency" }]}
						>
							<Select>
								{BUSINESS_CONSTANTS.CURRENCIES.map((currency) => (
									<Option key={currency} value={currency}>
										{currency}
									</Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item name="revenue" label="Revenue">
							<InputNumber
								className="w-full"
								formatter={(value) =>
									`${business.currency} ${value}`.replace(
										/\B(?=(\d{3})+(?!\d))/g,
										","
									)
								}
								parser={(value) => value.replace(/[^\d.]/g, "")}
							/>
						</Form.Item>
					</>
				)}

				{editSection === EDITABLE_SECTIONS.HOURS && (
					<div className="space-y-6">
						{BUSINESS_CONSTANTS.BUSINESS_DAYS.map((day) => (
							<div key={day} className="border-b pb-4">
								<div className="flex items-center justify-between mb-4">
									<Text strong className="capitalize">
										{day}
									</Text>
									<Form.Item
										name={["businessHours", day, "closed"]}
										valuePropName="checked"
										className="mb-0"
									>
										<Checkbox>Closed</Checkbox>
									</Form.Item>
								</div>
								<Form.Item
									shouldUpdate={(prevValues, currentValues) => {
										return (
											prevValues?.businessHours?.[day]?.closed !==
											currentValues?.businessHours?.[day]?.closed
										);
									}}
									noStyle
								>
									{({ getFieldValue }) => {
										const isClosed = getFieldValue([
											"businessHours",
											day,
											"closed",
										]);
										if (isClosed) return null;
										return (
											<div className="flex gap-4">
												<Form.Item
													name={["businessHours", day, "start"]}
													label="Open"
													className="mb-0 flex-1"
													rules={[
														{
															required: !isClosed,
															message: "Please select opening time",
														},
													]}
												>
													<TimePicker format="HH:mm" className="w-full" />
												</Form.Item>
												<Form.Item
													name={["businessHours", day, "end"]}
													label="Close"
													className="mb-0 flex-1"
													rules={[
														{
															required: !isClosed,
															message: "Please select closing time",
														},
													]}
												>
													<TimePicker format="HH:mm" className="w-full" />
												</Form.Item>
											</div>
										);
									}}
								</Form.Item>
							</div>
						))}
					</div>
				)}
			</Form>
		</Drawer>
	);

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
										{business.name || "Unnamed Business"}
									</Title>
									{business.status === "active" && (
										<div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
											<span className="text-green-600 text-sm font-medium">
												Active
											</span>
										</div>
									)}
								</div>
								<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
									{business.address &&
										(business.address.city || business.address.country) && (
											<div className="flex items-center gap-2 text-gray-600">
												<FaMapMarkerAlt className="text-gray-400" />
												<span className="text-sm">
													{[business.address.city, business.address.country]
														.filter(Boolean)
														.join(", ")}
												</span>
											</div>
										)}
									{business.operationMode && (
										<div className="flex items-center gap-2 text-gray-600">
											<FaGlobe className="text-gray-400" />
											<span className="text-sm capitalize">
												{business.operationMode} Business
											</span>
										</div>
									)}
									{business.category && (
										<div className="flex items-center gap-2 text-gray-600">
											<FaTag className="text-gray-400" />
											<span className="text-sm">{business.category}</span>
										</div>
									)}
								</div>
							</div>
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
					<div className="flex items-center justify-between p-6">
						<div className="flex items-center gap-4">
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
						<Button
							onClick={() => handleEditSection(EDITABLE_SECTIONS.BASIC)}
							icon={<FaEdit />}
							className="flex items-center gap-2"
						>
							Edit Basic Info
						</Button>
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

			{/* Service Categories */}
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				<div className="border-b border-gray-100">
					<div className="flex items-center justify-between p-6">
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
								<FaTag className="text-xl" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									Service Categories
								</h3>
								<p className="text-sm text-gray-500">
									Available services and categories
								</p>
							</div>
						</div>
						<Button
							onClick={() => handleEditSection(EDITABLE_SECTIONS.CATEGORIES)}
							icon={<FaEdit />}
							className="flex items-center gap-2"
						>
							Edit Categories
						</Button>
					</div>
				</div>
				<div className="p-6">
					{business.serviceCategories &&
					business.serviceCategories.length > 0 ? (
						<div className="flex flex-wrap gap-2">
							{business.serviceCategories.map((category, index) => (
								<Tag
									key={index}
									color="blue"
									className="rounded-full px-4 py-1.5 text-sm font-medium mb-2"
								>
									{category}
								</Tag>
							))}
						</div>
					) : (
						<Empty description="No service categories added" className="my-4" />
					)}
				</div>
			</div>

			{/* Tags */}
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				<div className="border-b border-gray-100">
					<div className="flex items-center gap-4 p-6">
						<div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
							<FaTag className="text-xl" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900">Tags</h3>
							<p className="text-sm text-gray-500">
								Business tags and keywords
							</p>
						</div>
					</div>
				</div>
				<div className="p-6">
					<div className="flex flex-wrap gap-2">
						{business.tags?.map((tag, index) => (
							<Tag
								key={index}
								color="purple"
								className="rounded-full px-4 py-1"
							>
								{tag}
							</Tag>
						))}
					</div>
				</div>
			</div>

			{/* Business Hours */}
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				<div className="border-b border-gray-100">
					<div className="flex items-center justify-between p-6">
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
								<FaClock className="text-xl" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									Business Hours
								</h3>
								<p className="text-sm text-gray-500">Operating hours</p>
							</div>
						</div>
						<Button
							onClick={() => handleEditSection(EDITABLE_SECTIONS.HOURS)}
							icon={<FaEdit />}
							className="flex items-center gap-2"
						>
							Edit Hours
						</Button>
					</div>
				</div>
				<div className="p-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{DAYS_ORDER.map((day) => {
							const hours = business.businessHours?.[day] || {
								start: "N/A",
								end: "N/A",
							};
							return (
								<div
									key={day}
									className="bg-gray-50 p-4 rounded-xl flex flex-col"
								>
									<span className="text-gray-900 font-medium capitalize mb-2">
										{day}
									</span>
									<div className="flex items-center gap-2 text-gray-600">
										<FaClock className="text-gray-400 text-sm" />
										<span>
											{hours.start} - {hours.end}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Contact Information */}
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				<div className="border-b border-gray-100">
					<div className="flex items-center justify-between p-6">
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
								<FaEnvelope className="text-xl" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									Contact Information
								</h3>
								<p className="text-sm text-gray-500">
									Business contact details
								</p>
							</div>
						</div>
						<Button
							onClick={() => handleEditSection(EDITABLE_SECTIONS.CONTACT)}
							icon={<FaEdit />}
							className="flex items-center gap-2"
						>
							Edit Contact
						</Button>
					</div>
				</div>
				<div className="p-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
								<div className="text-gray-900 font-semibold pl-11 break-all">
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
							<p className="text-gray-600 font-medium pl-11 break-words">
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
					<div className="flex items-center justify-between p-6">
						<div className="flex items-center gap-4">
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
						<Button
							onClick={() => handleEditSection(EDITABLE_SECTIONS.PAYMENT)}
							icon={<FaEdit />}
							className="flex items-center gap-2"
						>
							Edit Payment Info
						</Button>
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

			{/* Add edit buttons to each section */}
			<div className="flex justify-end gap-4">
				<Button
					onClick={() => handleEditSection(EDITABLE_SECTIONS.HOURS)}
					icon={<FaClock />}
					className="flex items-center gap-2"
				>
					Edit Hours
				</Button>
				<Button
					onClick={() => handleEditSection(EDITABLE_SECTIONS.PAYMENT)}
					icon={<FaWallet />}
					className="flex items-center gap-2"
				>
					Edit Payment Info
				</Button>
			</div>
		</div>
	);

	const renderLocation = () => {
		// Early return if business or address is not available
		if (!business?.address) {
			return (
				<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
					<div className="p-6 text-center">
						<Empty description="No location information available" />
					</div>
				</div>
			);
		}

		return (
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				<div className="border-b border-gray-100">
					<div className="flex items-center gap-4 p-6">
						<div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
							<FaMapMarkerAlt className="text-xl" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900">Location</h3>
							<p className="text-sm text-gray-500">
								Business address and location details
							</p>
						</div>
					</div>
				</div>
				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-gray-50 p-6 rounded-xl">
							<h4 className="font-medium text-gray-900 mb-4">
								Address Details
							</h4>
							<div className="space-y-3">
								{business.address.street && (
									<div className="flex items-center gap-2">
										<FaMapMarkerAlt className="text-gray-400" />
										<span className="text-gray-600">
											{business.address.street}
										</span>
									</div>
								)}
								{(business.address.city || business.address.state) && (
									<div className="flex items-center gap-2">
										<FaBuilding className="text-gray-400" />
										<span className="text-gray-600">
											{[business.address.city, business.address.state]
												.filter(Boolean)
												.join(", ")}
										</span>
									</div>
								)}
								{business.address.country && (
									<div className="flex items-center gap-2">
										<FaGlobe className="text-gray-400" />
										<span className="text-gray-600">
											{business.address.country}
										</span>
									</div>
								)}
								{business.address.postalCode && (
									<div className="flex items-center gap-2">
										<FaEnvelope className="text-gray-400" />
										<span className="text-gray-600">
											{business.address.postalCode}
										</span>
									</div>
								)}
							</div>
						</div>
						<div className="bg-gray-50 p-6 rounded-xl">
							<h4 className="font-medium text-gray-900 mb-4">
								Contact Information
							</h4>
							<div className="space-y-3">
								{business.email && (
									<div className="flex items-center gap-2">
										<FaEnvelope className="text-gray-400" />
										<span className="text-gray-600">{business.email}</span>
									</div>
								)}
								{business.phone && (
									<div className="flex items-center gap-2">
										<FaPhone className="text-gray-400" />
										<span className="text-gray-600">{business.phone}</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderFinancials = () => {
		return (
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				<div className="border-b border-gray-100">
					<div className="flex items-center gap-4 p-6">
						<div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
							<FaWallet className="text-xl" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900">
								Financial Information
							</h3>
							<p className="text-sm text-gray-500">
								Business financial details and transactions
							</p>
						</div>
					</div>
				</div>
				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-gray-50 p-6 rounded-xl">
							<h4 className="font-medium text-gray-900 mb-4">
								Revenue & Currency
							</h4>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Revenue</span>
									<span className="text-lg font-semibold text-gray-900">
										{business.currency} {business.revenue}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Currency</span>
									<span className="text-lg font-semibold text-gray-900">
										{business.currency}
									</span>
								</div>
							</div>
						</div>
						<div className="bg-gray-50 p-6 rounded-xl">
							<h4 className="font-medium text-gray-900 mb-4">
								Payment Methods
							</h4>
							<div className="flex flex-wrap gap-2">
								{business.paymentMethods?.map((method, index) => (
									<Tag
										key={index}
										color="blue"
										className="rounded-full px-4 py-1"
									>
										{method.replace(/_/g, " ")}
									</Tag>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderReviews = () => {
		return (
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				<div className="border-b border-gray-100">
					<div className="flex items-center gap-4 p-6">
						<div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-500">
							<FaUsers className="text-xl" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900">
								Reviews & Ratings
							</h3>
							<p className="text-sm text-gray-500">
								Customer reviews and ratings
							</p>
						</div>
					</div>
				</div>
				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-gray-50 p-6 rounded-xl">
							<h4 className="font-medium text-gray-900 mb-4">Overall Rating</h4>
							<div className="flex items-center gap-4">
								<div className="text-4xl font-bold text-gray-900">
									{business.averageRating.toFixed(1)}
								</div>
								<div className="flex-1">
									<div className="flex items-center gap-1">
										{[1, 2, 3, 4, 5].map((star) => (
											<FaStar
												key={star}
												className={`${
													star <= business.averageRating
														? "text-yellow-400"
														: "text-gray-300"
												}`}
											/>
										))}
									</div>
									<div className="text-sm text-gray-600 mt-1">
										{business.reviewCount} reviews
									</div>
								</div>
							</div>
						</div>
						<div className="bg-gray-50 p-6 rounded-xl">
							<h4 className="font-medium text-gray-900 mb-4">
								Review Statistics
							</h4>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Total Reviews</span>
									<span className="font-semibold text-gray-900">
										{business.reviewCount}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Average Rating</span>
									<span className="font-semibold text-gray-900">
										{business.averageRating.toFixed(1)} / 5.0
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderCompliance = () => {
		return (
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				<div className="border-b border-gray-100">
					<div className="flex items-center gap-4 p-6">
						<div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
							<FaShieldAlt className="text-xl" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900">
								Compliance
							</h3>
							<p className="text-sm text-gray-500">
								Business compliance and verification status
							</p>
						</div>
					</div>
				</div>
				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-gray-50 p-6 rounded-xl">
							<h4 className="font-medium text-gray-900 mb-4">
								Verification Status
							</h4>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Status</span>
									<Tag
										color={
											business.verificationStatus === "verified"
												? "success"
												: business.verificationStatus === "rejected"
												? "error"
												: "warning"
										}
									>
										{business.verificationStatus}
									</Tag>
								</div>
								{business.verificationNote && (
									<div className="mt-4">
										<span className="text-gray-600">Note:</span>
										<p className="text-gray-600 mt-1">
											{business.verificationNote}
										</p>
									</div>
								)}
							</div>
						</div>
						<div className="bg-gray-50 p-6 rounded-xl">
							<h4 className="font-medium text-gray-900 mb-4">
								Business Status
							</h4>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Status</span>
									<Tag
										color={
											business.status === "active"
												? "success"
												: business.status === "inactive"
												? "error"
												: "warning"
										}
									>
										{business.status}
									</Tag>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Operation Mode</span>
									<span className="font-semibold text-gray-900 capitalize">
										{business.operationMode}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderBlockchain = () => {
		return (
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				<div className="border-b border-gray-100">
					<div className="flex items-center gap-4 p-6">
						<div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
							<FaWallet className="text-xl" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900">
								Blockchain Information
							</h3>
							<p className="text-sm text-gray-500">
								Blockchain and IPFS details
							</p>
						</div>
					</div>
				</div>
				<div className="p-6">
					<div className="space-y-3">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
							<span className="text-gray-600">IPFS CID</span>
							<span className="font-mono text-sm text-gray-900 break-all">
								{business.ipfsCid}
							</span>
						</div>
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
							<span className="text-gray-600">IPFS URL</span>
							<a
								href={business.ipfsUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-indigo-600 hover:text-indigo-800 break-all"
							>
								{business.ipfsUrl}
							</a>
						</div>
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
							<span className="text-gray-600">Transaction Hash</span>
							<span className="font-mono text-sm text-gray-900 break-all">
								{business.metadata?.blockchainTxHash}
							</span>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderContent = () => {
		switch (selectedMenu) {
			case "overview":
				return renderOverview();
			case "team":
				return renderTeamMembers();
			case "locations":
				return renderLocation();
			case "financial":
				return renderFinancials();
			case "social_media":
				return renderSocialMedia();
			case "reviews":
				return renderReviews();
			case "compliance":
				return renderCompliance();
			case "blockchain":
				return renderBlockchain();
			default:
				return renderOverview();
		}
	};

	// Add this function to handle team member addition
	const handleAddTeamMember = async () => {
		try {
			const values = await addMemberForm.validateFields();
			// Add the selected permissions to the form values
			values.permissions = selectedPermissions;

			// Here you would typically make an API call to add the team member
			// For now, we'll just show a success message
			showSuccess("Team member invited successfully");
			setAddMemberDrawerVisible(false);
			setInviteStep(0);
			addMemberForm.resetFields();
			setSelectedPermissions({});
			loadBusinessDetails();
		} catch (error) {
			showError("Failed to add team member");
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

			{renderEditDrawer()}
		</div>
	);
};

export default BusinessDetails;
