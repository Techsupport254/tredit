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
	FaPlus,
	FaFileAlt,
	FaDownload,
	FaTrophy,
	FaKey,
	FaHistory,
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
	Dropdown,
	Table,
	Timeline,
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
	UserAddOutlined,
	EllipsisOutlined,
	IdcardOutlined,
	TeamOutlined,
	SafetyCertificateOutlined,
	AccountBookOutlined,
	InboxOutlined,
	ShoppingCartOutlined,
	UserSwitchOutlined,
	DollarOutlined,
	GlobalOutlined,
	FundOutlined,
	CustomerServiceOutlined,
	UsergroupAddOutlined,
	EditOutlined,
	DeleteOutlined,
	KeyOutlined,
	AppstoreOutlined,
	BarChartOutlined,
	SettingOutlined,
	MailOutlined,
	PhoneOutlined,
	ClockCircleOutlined,
	UserOutlined,
	CheckCircleOutlined,
	CrownOutlined,
	TrophyOutlined,
	InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { BUSINESS_CONSTANTS } from "../../constants/businessConstants";
import axios from "axios";
import { TEAM_MEMBER_CONSTANTS } from "../../constants/businessConstants";

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
	const {
		fetchBusinessById,
		updateBusiness,
		deleteBusiness,
		connectYouTube,
		addTeamMember,
		removeTeamMember,
	} = useBusiness();
	const [business, setBusiness] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
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
	const [showEditDrawer, setShowEditDrawer] = useState(false);
	const [showAddLocationModal, setShowAddLocationModal] = useState(false);
	const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
	const [newMember, setNewMember] = useState({
		email: "",
		role: "staff",
		permissions: {},
	});
	const [errors, setErrors] = useState({});
	const [currentStep, setCurrentStep] = useState(0);
	const [isAddingMember, setIsAddingMember] = useState(false);

	const tableStyles = {
		".custom-table": {
			".ant-table": {
				borderRadius: "0 !important",
				overflow: "auto !important",
			},
			".ant-table-container": {
				borderRadius: "0 !important",
			},
			".ant-table-thead > tr > th": {
				background: "#f9fafb",
				color: "#374151",
				fontWeight: "600",
				fontSize: "0.875rem",
				padding: "12px 16px",
				borderBottom: "1px solid #e5e7eb",
				whiteSpace: "nowrap",
			},
			".ant-table-tbody > tr > td": {
				padding: "12px 16px",
				borderBottom: "1px solid #f3f4f6",
				fontSize: "0.875rem",
			},
			".ant-table-tbody > tr:hover > td": {
				background: "#f9fafb",
			},
			".ant-tag": {
				borderRadius: "6px",
				padding: "2px 8px",
				fontSize: "0.75rem",
				lineHeight: "1.5",
				display: "inline-flex",
				alignItems: "center",
				gap: "4px",
				whiteSpace: "nowrap",
			},
			"@media (max-width: 640px)": {
				".ant-table-thead > tr > th": {
					padding: "8px",
				},
				".ant-table-tbody > tr > td": {
					padding: "8px",
				},
			},
		},
	};

	useEffect(() => {
		// Add custom styles to head
		const styleElement = document.createElement("style");
		styleElement.textContent = Object.entries(tableStyles)
			.map(([selector, styles]) => {
				const cssRules = Object.entries(styles)
					.map(([key, value]) => {
						if (typeof value === "object") {
							const nestedRules = Object.entries(value)
								.map(([k, v]) => `${k}: ${v};`)
								.join("\n");
							return `${key} {\n${nestedRules}\n}`;
						}
						return `${key}: ${value};`;
					})
					.join("\n");
				return `${selector} {\n${cssRules}\n}`;
			})
			.join("\n\n");
		document.head.appendChild(styleElement);

		return () => {
			document.head.removeChild(styleElement);
		};
	}, []);

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
		setShowEditDrawer(true);
	};

	const handleCancel = () => {
		editForm.resetFields();
		setEditSection(null);
		setEditMode(false);
		setEditDrawerVisible(false);
		setShowEditDrawer(false);
		setAddMemberDrawerVisible(false);
		setInviteStep(0);
		addMemberForm.resetFields();
		setSelectedPermissions({});
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

	const validateForm = () => {
		const newErrors = {};
		if (!newMember.email) newErrors.email = "Email is required";
		if (!newMember.email.includes("@"))
			newErrors.email = "Please enter a valid email address";
		if (!newMember.role) newErrors.role = "Role is required";
		return newErrors;
	};

	const handleAddMember = async () => {
		try {
			const formErrors = validateForm();
			if (Object.keys(formErrors).length > 0) {
				setErrors(formErrors);
				return;
			}

			setIsAddingMember(true);
			setErrors({});

			const response = await addTeamMember(business.id, {
				email: newMember.email.trim().toLowerCase(),
				role: newMember.role,
			});

			if (response.success) {
				showSuccess(response.data.message || "Team member added successfully");
				setIsAddMemberOpen(false);
				setNewMember({
					email: "",
					role: "staff",
					permissions: {},
				});
				loadBusinessDetails(); // Refresh the team members list
			}
		} catch (error) {
			console.error("Error adding team member:", error);
			const errorMessage = error.response?.data?.message || error.message;

			// Handle specific error cases
			if (errorMessage.includes("No user found with email")) {
				setErrors({
					email:
						"This user hasn't registered yet. Please ask them to register first.",
				});
			} else if (errorMessage.includes("already a member")) {
				setErrors({
					email: "This user is already a member of this business.",
				});
			} else if (errorMessage.includes("previously removed")) {
				setErrors({
					email:
						"This user was previously removed. Please contact support to restore access.",
				});
			} else if (errorMessage.includes("Invalid role")) {
				setErrors({
					role: "Please select a valid role.",
				});
			} else if (errorMessage.includes("already has an owner")) {
				setErrors({
					role: "This business already has an owner. Please select a different role.",
				});
			} else {
				showError(errorMessage || "Failed to add team member");
			}
		} finally {
			setIsAddingMember(false);
		}
	};

	const handleRemoveMember = async (memberId) => {
		try {
			const member = business.teamMembers.find((m) => m.id === memberId);
			if (!member) return;

			const isOwner = member.role === "owner";
			if (isOwner) {
				showError("Cannot remove the business owner");
				return;
			}

			const confirmMessage = `Are you sure you want to remove ${
				member.user.name || member.user.email
			} from the team?`;
			if (!window.confirm(confirmMessage)) return;

			await removeTeamMember(business.id, memberId);
			showSuccess("Team member removed successfully");
			loadBusinessDetails(); // Refresh the team members list
		} catch (error) {
			console.error("Error removing team member:", error);
			const errorMessage = error.response?.data?.message || error.message;
			showError(errorMessage || "Failed to remove team member");
		}
	};

	const getRoleIcon = (role) => {
		switch (role) {
			case "owner":
				return <CrownOutlined className="text-yellow-500" />;
			case "admin":
				return <SafetyCertificateOutlined className="text-blue-500" />;
			case "manager":
				return <UserSwitchOutlined className="text-purple-500" />;
			case "accountant":
				return <AccountBookOutlined className="text-green-500" />;
			case "inventory_manager":
				return <InboxOutlined className="text-orange-500" />;
			case "sales_representative":
				return <ShoppingCartOutlined className="text-red-500" />;
			case "marketing_specialist":
				return <FundOutlined className="text-indigo-500" />;
			case "customer_service":
				return <CustomerServiceOutlined className="text-cyan-500" />;
			case "staff":
				return <UsergroupAddOutlined className="text-gray-500" />;
			default:
				return <UserOutlined className="text-gray-400" />;
		}
	};

	const getStatusBadge = (status = "pending", type = "status") => {
		const statusConfig = {
			status: {
				active: {
					color: "bg-green-100 text-green-700 border-green-300",
					icon: <FaCheckCircle className="text-green-500" />,
					text: "Active",
				},
				inactive: {
					color: "bg-gray-100 text-gray-600 border-gray-300",
					icon: <FaTimesCircle className="text-gray-500" />,
					text: "Inactive",
				},
				suspended: {
					color: "bg-red-100 text-red-700 border-red-300",
					icon: <FaTimesCircle className="text-red-500" />,
					text: "Suspended",
				},
				pending: {
					color: "bg-yellow-100 text-yellow-700 border-yellow-300",
					icon: <FaClock className="text-yellow-500" />,
					text: "Pending",
				},
			},
			verification: {
				verified: {
					color: "bg-green-100 text-green-700 border-green-300",
					icon: <FaCheckCircle className="text-green-500" />,
					text: "Verified",
				},
				unverified: {
					color: "bg-gray-100 text-gray-600 border-gray-300",
					icon: <FaTimesCircle className="text-gray-500" />,
					text: "Unverified",
				},
				rejected: {
					color: "bg-red-100 text-red-700 border-red-300",
					icon: <FaTimesCircle className="text-red-500" />,
					text: "Rejected",
				},
				pending: {
					color: "bg-yellow-100 text-yellow-700 border-yellow-300",
					icon: <FaClock className="text-yellow-500" />,
					text: "Pending",
				},
			},
		};

		const normalizedStatus = (status || "pending").toLowerCase();
		const config =
			statusConfig[type][normalizedStatus] || statusConfig[type].pending;

		return (
			<div
				className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color} shadow-sm transition-all duration-200 hover:shadow-md`}
			>
				{config.icon}
				<span className="capitalize font-medium text-sm">{config.text}</span>
			</div>
		);
	};

	const renderTeamMembers = () => {
		if (!business?.teamMembers?.length) {
			return renderEmptyList("No team members added yet");
		}

		return (
			<div className="bg-white rounded-lg overflow-hidden -mx-4 sm:mx-0">
				<Table
					dataSource={business.teamMembers}
					rowKey="id"
					pagination={false}
					className="custom-table"
					scroll={{ x: true }}
					columns={[
						{
							title: "Member",
							key: "member",
							fixed: "left",
							width: 250,
							render: (_, member) => (
								<div className="flex items-center space-x-3 py-2">
									<Avatar
										size={32}
										src={member.user?.profileImage}
										icon={!member.user?.profileImage && <UserOutlined />}
										className="bg-blue-100 flex-shrink-0"
									/>
									<div className="min-w-0">
										<div className="text-sm font-medium text-gray-900 truncate">
											{member.user?.name || "Unnamed User"}
										</div>
										<div className="text-xs text-gray-500 truncate">
											{member.user?.email}
										</div>
									</div>
								</div>
							),
						},
						{
							title: "Role",
							key: "role",
							width: 180,
							render: (_, member) => (
								<div className="flex items-center space-x-2">
									<Tag
										icon={getRoleIcon(member.role)}
										color={
											member.role === "owner"
												? "gold"
												: member.role === "admin"
												? "blue"
												: "default"
										}
									>
										{member.role.charAt(0).toUpperCase() + member.role.slice(1)}
									</Tag>
								</div>
							),
						},
						{
							title: "Status",
							key: "status",
							width: 120,
							render: (_, member) =>
								getStatusBadge(member.status || "pending", "status"),
						},
						{
							title: "Department",
							dataIndex: ["department"],
							key: "department",
							width: 150,
							render: (department) =>
								department ? (
									<Tag icon={<TeamOutlined />}>{department}</Tag>
								) : (
									<span className="text-gray-400">-</span>
								),
						},
						{
							title: "Position",
							dataIndex: ["position"],
							key: "position",
							width: 150,
							render: (position) =>
								position ? (
									<Tag icon={<IdcardOutlined />}>{position}</Tag>
								) : (
									<span className="text-gray-400">-</span>
								),
						},
						{
							title: "Permissions",
							key: "permissions",
							width: 150,
							render: (_, member) => {
								const activePermissions = Object.entries(
									member.permissions || {}
								)
									.filter(([, value]) => value === true)
									.map(([key]) => key);

								if (activePermissions.length === 0) {
									return <span className="text-gray-400">No permissions</span>;
								}

								return (
									<Tooltip
										title={
											<div className="max-w-xs">
												{activePermissions.map((perm) => (
													<div key={perm} className="text-xs py-0.5">
														• {perm.split("_").join(" ")}
													</div>
												))}
											</div>
										}
									>
										<div className="flex items-center space-x-1">
											<Tag className="cursor-help">
												{activePermissions.length} permission
												{activePermissions.length !== 1 ? "s" : ""}
											</Tag>
											<InfoCircleOutlined className="text-gray-400" />
										</div>
									</Tooltip>
								);
							},
						},
						{
							title: "",
							key: "actions",
							fixed: "right",
							width: 60,
							render: (_, member) => (
								<Dropdown
									menu={{
										items: [
											{
												key: "edit",
												label: "Edit Member",
												icon: <EditOutlined />,
												onClick: () => handleEditMember(member),
											},
											{
												key: "remove",
												label: "Remove Member",
												icon: <DeleteOutlined />,
												danger: true,
												disabled: member.role === "owner",
												onClick: () => handleRemoveMember(member.id),
											},
										],
									}}
									trigger={["click"]}
									placement="bottomRight"
								>
									<Button
										type="text"
										icon={<EllipsisOutlined />}
										className="hover:bg-gray-50"
									/>
								</Dropdown>
							),
						},
					]}
				/>
			</div>
		);
	};

	const handleEditSection = (section) => {
		setEditSection(section);

		// Convert time strings to dayjs objects for business hours
		const businessHoursWithDayjs = {};
		if (business.businessHours) {
			Object.entries(business.businessHours).forEach(([day, hours]) => {
				businessHoursWithDayjs[day] = {
					...hours,
					start: hours.start ? dayjs(hours.start, "HH:mm") : null,
					end: hours.end ? dayjs(hours.end, "HH:mm") : null,
				};
			});
		}

		editForm.setFieldsValue({
			...business,
			address: business.address || {},
			businessHours: businessHoursWithDayjs || {},
			serviceCategories:
				business.type === "service" ? business.serviceCategories : [],
			productCategories:
				business.type === "product" ? business.productCategories : [],
		});
		setEditDrawerVisible(true);
		setShowEditDrawer(true);
	};

	const handleEditSave = async () => {
		const hide = message.loading("Saving changes...", 0);
		try {
			const values = await editForm.validateFields();

			// Convert dayjs objects back to string format for API
			if (values.businessHours) {
				const businessHoursWithStrings = {};
				Object.entries(values.businessHours).forEach(([day, hours]) => {
					businessHoursWithStrings[day] = {
						...hours,
						start: hours.start ? hours.start.format("HH:mm") : null,
						end: hours.end ? hours.end.format("HH:mm") : null,
					};
				});
				values.businessHours = businessHoursWithStrings;
			}

			await updateBusiness(id, {
				...values,
				id: business.id,
			});
			hide();
			message.success("Changes saved successfully!");
			setEditDrawerVisible(false);
			setShowEditDrawer(false);
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

						{/* Tags Input */}
						<Form.Item
							name="tags"
							label="Business Tags"
							extra="Add tags to help customers find your business"
						>
							<Select
								mode="tags"
								placeholder="Add tags (press enter to add)"
								className="w-full"
								tokenSeparators={[","]}
								maxTagCount={10}
								maxTagTextLength={20}
								showSearch={true}
								filterOption={(input, option) =>
									option.children.toLowerCase().indexOf(input.toLowerCase()) >=
									0
								}
								options={BUSINESS_CONSTANTS.TAGS.map((tag) => ({
									label: tag,
									value: tag,
								}))}
								tagRender={({ label, closable, onClose }) => (
									<Tag
										closable={closable}
										onClose={(e) => {
											e.preventDefault();
											e.stopPropagation();
											onClose();
										}}
										className="px-2 py-0.5 m-1 bg-blue-50 text-blue-600 border-0 hover:bg-blue-100 transition-colors"
									>
										{label}
									</Tag>
								)}
							/>
						</Form.Item>
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
					{/* Operating Status Summary */}
					<div className="mb-6 bg-gray-50 rounded-xl p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-orange-500">
									<FaClock />
								</div>
								<div>
									<h4 className="font-medium text-gray-900">
										Operating Status
									</h4>
									<p className="text-sm text-gray-500">
										{
											Object.values(business.businessHours || {}).filter(
												(day) => day.closed
											).length
										}{" "}
										days closed per week
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 rounded-full">
									<FaCheckCircle className="text-green-500" />
									<span className="text-green-600 text-sm font-medium">
										{
											Object.values(business.businessHours || {}).filter(
												(day) => !day.closed
											).length
										}{" "}
										Days Open
									</span>
								</div>
								<div className="flex items-center gap-1 px-3 py-1.5 bg-red-50 rounded-full">
									<FaTimesCircle className="text-red-500" />
									<span className="text-red-600 text-sm font-medium">
										{
											Object.values(business.businessHours || {}).filter(
												(day) => day.closed
											).length
										}{" "}
										Days Closed
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Business Hours Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{DAYS_ORDER.map((day) => {
							const hours = business.businessHours?.[day] || {};
							const isClosed = hours.closed;

							return (
								<div
									key={day}
									className={`p-4 rounded-xl flex flex-col transition-all duration-300 ${
										isClosed
											? "bg-red-50 border border-red-100"
											: "bg-green-50 border border-green-100"
									}`}
								>
									<div className="flex items-center justify-between mb-2">
										<span
											className={`font-medium capitalize ${
												isClosed ? "text-red-700" : "text-green-700"
											}`}
										>
											{day}
										</span>
										{isClosed ? (
											<div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full">
												<FaTimesCircle className="text-red-500 text-sm" />
												<span className="text-red-600 text-xs font-medium">
													Closed
												</span>
											</div>
										) : (
											<div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
												<FaCheckCircle className="text-green-500 text-sm" />
												<span className="text-green-600 text-xs font-medium">
													Open
												</span>
											</div>
										)}
									</div>
									{!isClosed && (
										<div className="flex items-center gap-2 text-sm">
											<FaClock
												className={`${
													isClosed ? "text-red-400" : "text-green-400"
												}`}
											/>
											<span
												className={`${
													isClosed ? "text-red-600" : "text-green-600"
												}`}
											>
												{hours.start} - {hours.end}
											</span>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);

	const handleEditLocation = (location) => {
		// TODO: Implement location editing functionality
		console.log("Edit location:", location);
	};

	const handleDeleteLocation = async (locationId) => {
		try {
			// TODO: Implement location deletion functionality
			console.log("Delete location:", locationId);
			showSuccess("Location deleted successfully");
			loadBusinessDetails();
		} catch (error) {
			showError("Failed to delete location");
		}
	};

	const renderLocations = () => {
		// Create a locations array from the address object
		const locations = business.address
			? [
					{
						id: "main",
						name: "Main Location",
						type:
							business.operationMode === "digital"
								? "Digital Office"
								: "Physical Location",
						address: business.address,
						phone: business.phone,
						email: business.email,
						businessHours: business.businessHours,
						isPrimary: true,
					},
			  ]
			: [];

		return (
			<div className="space-y-6">
				{/* Header Section */}
				<div className="bg-white rounded-2xl shadow-sm p-6">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div>
							<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
								<FaMapMarkerAlt className="text-blue-500" />
								Business Locations
							</h3>
							<p className="text-sm text-gray-500 mt-1">
								Manage and organize your business locations
							</p>
						</div>
						<div className="flex items-center gap-3">
							<Button
								type="primary"
								icon={<FaPlus />}
								onClick={() => setShowAddLocationModal(true)}
								className="flex items-center gap-2"
							>
								Add New Location
							</Button>
						</div>
					</div>

					{/* Quick Stats */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
						<div className="bg-blue-50 rounded-xl p-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-lg bg-blue-500 bg-opacity-10 flex items-center justify-center">
									<FaBuilding className="text-blue-500" />
								</div>
								<div>
									<p className="text-sm text-blue-600 font-medium">
										Total Locations
									</p>
									<p className="text-2xl font-semibold text-blue-700">
										{locations.length}
									</p>
								</div>
							</div>
						</div>
						<div className="bg-green-50 rounded-xl p-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-lg bg-green-500 bg-opacity-10 flex items-center justify-center">
									<FaStore className="text-green-500" />
								</div>
								<div>
									<p className="text-sm text-green-600 font-medium">
										Physical Locations
									</p>
									<p className="text-2xl font-semibold text-green-700">
										{
											locations.filter(
												(loc) => loc.type === "Physical Location"
											).length
										}
									</p>
								</div>
							</div>
						</div>
						<div className="bg-purple-50 rounded-xl p-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-lg bg-purple-500 bg-opacity-10 flex items-center justify-center">
									<FaGlobe className="text-purple-500" />
								</div>
								<div>
									<p className="text-sm text-purple-600 font-medium">
										Digital Offices
									</p>
									<p className="text-2xl font-semibold text-purple-700">
										{
											locations.filter((loc) => loc.type === "Digital Office")
												.length
										}
									</p>
								</div>
							</div>
						</div>
						<div className="bg-orange-50 rounded-xl p-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-lg bg-orange-500 bg-opacity-10 flex items-center justify-center">
									<FaClock className="text-orange-500" />
								</div>
								<div>
									<p className="text-sm text-orange-600 font-medium">
										Operating Hours
									</p>
									<p className="text-2xl font-semibold text-orange-700">
										{
											Object.values(business.businessHours || {}).filter(
												(day) => !day.closed
											).length
										}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Locations List */}
				{locations.length === 0 ? (
					<div className="bg-white rounded-2xl shadow-sm p-8 text-center">
						<div className="max-w-sm mx-auto">
							<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<FaMapMarkerAlt className="text-blue-500 text-2xl" />
							</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								No Locations Added
							</h3>
							<p className="text-gray-500 mb-6">
								Start by adding your first business location. You can add
								multiple locations and manage them all from here.
							</p>
							<Button
								type="primary"
								icon={<FaPlus />}
								onClick={() => setShowAddLocationModal(true)}
								className="flex items-center gap-2 mx-auto"
							>
								Add Your First Location
							</Button>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{locations.map((location, index) => (
							<div
								key={index}
								className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
							>
								{/* Location Header */}
								<div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
									<div className="flex items-start justify-between">
										<div className="flex items-start gap-4">
											<div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-300">
												{location.type === "Digital Office" ? (
													<FaGlobe className="text-xl" />
												) : (
													<FaBuilding className="text-xl" />
												)}
											</div>
											<div>
												<div className="flex items-center gap-2">
													<h4 className="text-lg font-medium text-gray-900">
														{location.name}
													</h4>
													{location.isPrimary && (
														<Tag color="blue" className="rounded-full">
															Primary
														</Tag>
													)}
												</div>
												<p className="text-sm text-gray-500 mt-1">
													{location.type}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Tooltip title="Edit Location">
												<Button
													type="text"
													icon={<FaEdit />}
													onClick={() => handleEditLocation(location)}
													className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
												/>
											</Tooltip>
											<Popconfirm
												title="Delete Location"
												description="Are you sure you want to delete this location? This action cannot be undone."
												onConfirm={() => handleDeleteLocation(location.id)}
												okText="Delete"
												cancelText="Cancel"
												placement="left"
											>
												<Button
													type="text"
													icon={<FaTrash />}
													className="text-red-600 hover:text-red-700 hover:bg-red-50"
												/>
											</Popconfirm>
										</div>
									</div>
								</div>

								{/* Location Details */}
								<div className="p-6 space-y-4">
									{/* Address Section */}
									{location.address && (
										<div className="flex items-start gap-3">
											<div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
												<FaMapMarkerAlt />
											</div>
											<div className="flex-1">
												<p className="text-sm font-medium text-gray-900 mb-1">
													Address
												</p>
												<div className="text-gray-600 text-sm space-y-1">
													{location.address.street && (
														<p>{location.address.street}</p>
													)}
													<p>
														{[
															location.address.city,
															location.address.state,
															location.address.postalCode,
														]
															.filter(Boolean)
															.join(", ")}
													</p>
													{location.address.country && (
														<p>{location.address.country}</p>
													)}
												</div>
											</div>
										</div>
									)}

									{/* Contact Section */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										{location.phone && (
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
													<FaPhone />
												</div>
												<div>
													<p className="text-sm font-medium text-gray-900">
														Phone
													</p>
													<a
														href={`tel:${location.phone}`}
														className="text-sm text-green-600 hover:text-green-700"
													>
														{location.phone}
													</a>
												</div>
											</div>
										)}

										{location.email && (
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
													<FaEnvelope />
												</div>
												<div>
													<p className="text-sm font-medium text-gray-900">
														Email
													</p>
													<a
														href={`mailto:${location.email}`}
														className="text-sm text-purple-600 hover:text-purple-700"
													>
														{location.email}
													</a>
												</div>
											</div>
										)}
									</div>

									{/* Business Hours Section */}
									{location.businessHours && (
										<div className="pt-4 border-t">
											<div className="flex items-center gap-2 mb-3">
												<FaClock className="text-orange-500" />
												<h5 className="text-sm font-medium text-gray-900">
													Business Hours
												</h5>
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
												{Object.entries(location.businessHours)
													.filter(([_, hours]) => !hours.closed)
													.map(([day, hours]) => (
														<div
															key={day}
															className="flex items-center justify-between bg-gray-50 rounded-lg p-2"
														>
															<span className="text-sm font-medium text-gray-700 capitalize">
																{day}
															</span>
															<span className="text-sm text-gray-600">
																{hours.start} - {hours.end}
															</span>
														</div>
													))}
											</div>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		);
	};

	const renderFinancial = () => {
		return (
			<div className="space-y-6">
				{/* Financial Overview */}
				<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
					<div className="border-b border-gray-100">
						<div className="flex items-center justify-between p-6">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
									<FaWallet className="text-xl" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										Financial Overview
									</h3>
									<p className="text-sm text-gray-500">
										Business financial information
									</p>
								</div>
							</div>
							<Button
								onClick={() => handleEditSection(EDITABLE_SECTIONS.PAYMENT)}
								icon={<FaEdit />}
								className="flex items-center gap-2"
							>
								Edit Financial Info
							</Button>
						</div>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Revenue Card */}
							<div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-green-500">
										<FaDollarSign className="text-xl" />
									</div>
									<div>
										<h4 className="font-medium text-gray-900">Revenue</h4>
										<p className="text-sm text-gray-500">
											Total business revenue
										</p>
									</div>
								</div>
								<div className="text-2xl font-bold text-gray-900">
									{business.currency}{" "}
									{Number(business.revenue || 0).toLocaleString()}
								</div>
							</div>

							{/* Payment Methods Card */}
							<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-500">
										<FaCreditCard className="text-xl" />
									</div>
									<div>
										<h4 className="font-medium text-gray-900">
											Payment Methods
										</h4>
										<p className="text-sm text-gray-500">
											Accepted payment options
										</p>
									</div>
								</div>
								<div className="flex flex-wrap gap-2">
									{business.paymentMethods?.map((method, index) => (
										<Tag key={index} color="blue" className="capitalize">
											{method.replace(/_/g, " ")}
										</Tag>
									))}
								</div>
							</div>

							{/* Currency Card */}
							<div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-purple-500">
										<FaGlobe className="text-xl" />
									</div>
									<div>
										<h4 className="font-medium text-gray-900">Currency</h4>
										<p className="text-sm text-gray-500">Business currency</p>
									</div>
								</div>
								<div className="text-xl font-bold text-gray-900">
									{business.currency}
								</div>
							</div>

							{/* Blockchain Info Card */}
							<div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-orange-500">
										<FaLink className="text-xl" />
									</div>
									<div>
										<h4 className="font-medium text-gray-900">Blockchain</h4>
										<p className="text-sm text-gray-500">
											Last update:{" "}
											{new Date(
												business.lastBlockchainUpdate
											).toLocaleDateString()}
										</p>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<FaLink className="text-orange-400" />
										<a
											href={`https://amoy.polygonscan.com/tx/${business.metadata?.blockchainTxHash}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-orange-600 hover:text-orange-700 truncate"
										>
											{business.metadata?.blockchainTxHash}
										</a>
									</div>
									<div className="flex items-center gap-2">
										<FaGlobe className="text-orange-400" />
										<a
											href={business.ipfsUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-orange-600 hover:text-orange-700 truncate"
										>
											IPFS: {business.ipfsCid}
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Payment Methods Section */}
				<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
					<div className="border-b border-gray-100">
						<div className="flex items-center justify-between p-6">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
									<FaCreditCard className="text-xl" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										Payment Methods
									</h3>
									<p className="text-sm text-gray-500">
										Configure accepted payment options
									</p>
								</div>
							</div>
							<Button
								onClick={() => handleEditSection(EDITABLE_SECTIONS.PAYMENT)}
								icon={<FaEdit />}
								className="flex items-center gap-2"
							>
								Edit Payment Methods
							</Button>
						</div>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{business.paymentMethods?.map((method, index) => (
								<div
									key={index}
									className="bg-gray-50 p-4 rounded-xl flex items-center gap-3"
								>
									<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-500">
										{method === "crypto" ? (
											<FaWallet className="text-xl" />
										) : method === "bank_transfer" ? (
											<FaCreditCard className="text-xl" />
										) : (
											<FaDollarSign className="text-xl" />
										)}
									</div>
									<div>
										<div className="font-medium text-gray-900 capitalize">
											{method.replace(/_/g, " ")}
										</div>
										<div className="text-sm text-gray-500">
											{method === "crypto"
												? "Cryptocurrency payments"
												: method === "bank_transfer"
												? "Bank transfer payments"
												: "Other payment methods"}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderReviews = () => {
		return (
			<div className="space-y-6">
				{/* Reviews Overview */}
				<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
					<div className="border-b border-gray-100">
						<div className="flex items-center justify-between p-6">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-500">
									<FaStar className="text-xl" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										Reviews
									</h3>
									<p className="text-sm text-gray-500">
										Customer feedback and ratings
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="p-6">
						{business.reviewCount > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Overall Rating Card */}
								<div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6">
									<div className="flex items-center gap-3 mb-4">
										<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-yellow-500">
											<FaStar className="text-xl" />
										</div>
										<div>
											<h4 className="font-medium text-gray-900">
												Overall Rating
											</h4>
											<p className="text-sm text-gray-500">
												Average customer rating
											</p>
										</div>
									</div>
									<div className="flex items-baseline gap-2">
										<div className="text-3xl font-bold text-gray-900">
											{business.averageRating.toFixed(1)}
										</div>
										<div className="text-gray-500">/ 5.0</div>
									</div>
									<div className="flex items-center gap-1 mt-2">
										{[...Array(5)].map((_, index) => (
											<FaStar
												key={index}
												className={`${
													index < Math.round(business.averageRating)
														? "text-yellow-400"
														: "text-gray-300"
												}`}
											/>
										))}
									</div>
								</div>

								{/* Review Count Card */}
								<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
									<div className="flex items-center gap-3 mb-4">
										<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-500">
											<FaUsers className="text-xl" />
										</div>
										<div>
											<h4 className="font-medium text-gray-900">
												Total Reviews
											</h4>
											<p className="text-sm text-gray-500">
												Customer feedback received
											</p>
										</div>
									</div>
									<div className="text-3xl font-bold text-gray-900">
										{business.reviewCount}
									</div>
									<div className="text-sm text-gray-500 mt-1">
										Reviews from verified customers
									</div>
								</div>
							</div>
						) : (
							<div className="text-center py-12">
								<div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<FaStar className="text-yellow-500 text-2xl" />
								</div>
								<Text className="text-gray-500 block mb-4">
									No reviews yet. Be the first to review this business!
								</Text>
								<div className="flex items-center justify-center gap-2">
									<div className="flex items-center gap-1">
										{[...Array(5)].map((_, index) => (
											<FaStar key={index} className="text-gray-300" />
										))}
									</div>
									<span className="text-gray-400">0.0</span>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Review List Section */}
				<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
					<div className="border-b border-gray-100">
						<div className="flex items-center justify-between p-6">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
									<FaClipboard className="text-xl" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										Review List
									</h3>
									<p className="text-sm text-gray-500">
										Detailed customer feedback
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="p-6">
						{business.reviewCount > 0 ? (
							<div className="space-y-6">
								{/* Placeholder for actual reviews */}
								<div className="text-center py-8">
									<Text className="text-gray-500">
										Reviews will be displayed here when available
									</Text>
								</div>
							</div>
						) : (
							<div className="text-center py-12">
								<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<FaClipboard className="text-green-500 text-2xl" />
								</div>
								<Text className="text-gray-500 block">
									No reviews available yet. Reviews will appear here once
									customers start leaving feedback.
								</Text>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	};

	const renderCompliance = () => {
		return (
			<div className="space-y-6">
				{/* Compliance Overview */}
				<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
					<div className="border-b border-gray-100">
						<div className="flex items-center justify-between p-6">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
									<FaShieldAlt className="text-xl" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										Compliance Overview
									</h3>
									<p className="text-sm text-gray-500">
										Business compliance and regulatory information
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Verification Status */}
							<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-500">
										<FaCheckCircle className="text-xl" />
									</div>
									<div>
										<h4 className="font-medium text-gray-900">
											Verification Status
										</h4>
										<p className="text-sm text-gray-500">
											Business verification status
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									{business.verificationStatus === "verified" ? (
										<div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
											<FaCheckCircle className="text-green-500" />
											<span className="text-green-600 text-sm font-medium">
												Verified
											</span>
										</div>
									) : business.verificationStatus === "pending" ? (
										<div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-full">
											<FaClock className="text-yellow-500" />
											<span className="text-yellow-600 text-sm font-medium">
												Pending
											</span>
										</div>
									) : (
										<div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full">
											<FaTimesCircle className="text-red-500" />
											<span className="text-red-600 text-sm font-medium">
												Unverified
											</span>
										</div>
									)}
								</div>
							</div>

							{/* Compliance Status */}
							<div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-purple-500">
										<FaShieldAlt className="text-xl" />
									</div>
									<div>
										<h4 className="font-medium text-gray-900">
											Compliance Status
										</h4>
										<p className="text-sm text-gray-500">
											Regulatory compliance status
										</p>
									</div>
								</div>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">
											Terms of Service
										</span>
										<div className="flex items-center gap-2">
											<FaCheckCircle className="text-green-500" />
											<span className="text-sm text-gray-900">Accepted</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">
											Privacy Policy
										</span>
										<div className="flex items-center gap-2">
											<FaCheckCircle className="text-green-500" />
											<span className="text-sm text-gray-900">Accepted</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">
											Data Protection
										</span>
										<div className="flex items-center gap-2">
											<FaCheckCircle className="text-green-500" />
											<span className="text-sm text-gray-900">Compliant</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Compliance Documents */}
				<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
					<div className="border-b border-gray-100">
						<div className="flex items-center justify-between p-6">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
									<FaFileAlt className="text-xl" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										Compliance Documents
									</h3>
									<p className="text-sm text-gray-500">
										Important compliance-related documents
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="p-6">
						<div className="space-y-4">
							{/* Terms of Service */}
							<div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-500">
										<FaFileAlt className="text-xl" />
									</div>
									<div>
										<h4 className="font-medium text-gray-900">
											Terms of Service
										</h4>
										<p className="text-sm text-gray-500">
											Last updated: {new Date().toLocaleDateString()}
										</p>
									</div>
								</div>
								<Button type="link" icon={<FaDownload />}>
									Download
								</Button>
							</div>

							{/* Privacy Policy */}
							<div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-500">
										<FaFileAlt className="text-xl" />
									</div>
									<div>
										<h4 className="font-medium text-gray-900">
											Privacy Policy
										</h4>
										<p className="text-sm text-gray-500">
											Last updated: {new Date().toLocaleDateString()}
										</p>
									</div>
								</div>
								<Button type="link" icon={<FaDownload />}>
									Download
								</Button>
							</div>

							{/* Data Protection Policy */}
							<div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-500">
										<FaFileAlt className="text-xl" />
									</div>
									<div>
										<h4 className="font-medium text-gray-900">
											Data Protection Policy
										</h4>
										<p className="text-sm text-gray-500">
											Last updated: {new Date().toLocaleDateString()}
										</p>
									</div>
								</div>
								<Button type="link" icon={<FaDownload />}>
									Download
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderBlockchain = () => {
		return (
			<div className="space-y-6">
				{/* Blockchain Overview */}
				<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
					<div className="border-b border-gray-100">
						<div className="flex items-center justify-between p-6">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
									<FaLink className="text-xl" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										Blockchain Information
									</h3>
									<p className="text-sm text-gray-500">
										Business blockchain details and transactions
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Transaction Hash */}
							<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-500">
										<FaLink className="text-xl" />
									</div>
									<div>
										<h4 className="font-medium text-gray-900">
											Transaction Hash
										</h4>
										<p className="text-sm text-gray-500">
											Blockchain transaction identifier
										</p>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<FaLink className="text-blue-400" />
										<a
											href={`https://amoy.polygonscan.com/tx/${business.metadata?.blockchainTxHash}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-blue-600 hover:text-blue-700 truncate"
										>
											{business.metadata?.blockchainTxHash}
										</a>
									</div>
								</div>
							</div>

							{/* IPFS Information */}
							<div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-purple-500">
										<FaGlobe className="text-xl" />
									</div>
									<div>
										<h4 className="font-medium text-gray-900">IPFS Details</h4>
										<p className="text-sm text-gray-500">
											Decentralized storage information
										</p>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<FaGlobe className="text-purple-400" />
										<a
											href={business.ipfsUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-purple-600 hover:text-purple-700 truncate"
										>
											IPFS: {business.ipfsCid}
										</a>
									</div>
									<div className="text-sm text-gray-500">
										Last Update:{" "}
										{new Date(business.lastBlockchainUpdate).toLocaleString()}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
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
					{SOCIAL_ACCOUNTS.map((platform) => {
						const accountData = business.socialMedia?.[platform.key] || {};
						const isConnected = accountData.isConnected;

						return (
							<div
								key={platform.key}
								className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
							>
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-4">
										<div
											className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
											style={{
												color: platform.color,
												background: `${platform.color}10`,
											}}
										>
											{platform.icon}
										</div>
										<div>
											<h4 className="text-lg font-medium text-gray-900">
												{platform.name}
											</h4>
											<p className="text-sm text-gray-500">
												{isConnected ? "Connected" : "Not connected"}
											</p>
										</div>
									</div>
									<Button
										type={isConnected ? "default" : "primary"}
										icon={isConnected ? <FaSync /> : <FaPlus />}
										className="flex items-center gap-2"
										onClick={() => handleConnect(platform.name)}
									>
										{isConnected ? "Refresh" : "Connect"}
									</Button>
								</div>

								{isConnected && (
									<div className="mt-4 pt-4 border-t border-gray-200">
										<div className="flex items-center justify-between">
											<span className="text-sm text-gray-600">
												Last Updated
											</span>
											<span className="text-sm text-gray-900">
												{new Date(
													accountData.lastUpdate || Date.now()
												).toLocaleDateString(undefined, {
													year: "numeric",
													month: "long",
													day: "numeric",
													hour: "numeric",
													minute: "numeric",
												})}
											</span>
										</div>
									</div>
								)}
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
									{/* Last Synced */}
									<div className="mt-4">
										<p className="text-sm text-gray-500">
											Last Synced:{" "}
											{new Date(
												platformData.lastUpdate || Date.now()
											).toLocaleString()}
										</p>
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
						<div className="flex items-center justify-end gap-4 mt-6 py-4">
							<Button
								type="default"
								icon={<FaSync />}
								onClick={() => handleConnect("YouTube")}
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
						<FaGlobe />
						Connect Platforms
					</span>
				),
				children: renderConnectPlatforms(),
			},
			...SOCIAL_ACCOUNTS.map((platform) => {
				const accountData = business.socialMedia?.[platform.key] || {};
				const isConnected = accountData.isConnected;

				return {
					key: platform.key,
					label: (
						<span
							className="flex items-center gap-2"
							style={{ color: platform.color }}
						>
							{platform.icon}
							{platform.name}
						</span>
					),
					disabled: !isConnected,
					children: renderPlatformData(platform),
				};
			}),
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

	const renderContent = () => {
		switch (selectedMenu) {
			case "overview":
				return renderOverview();
			case "team":
				return renderTeamMembers();
			case "locations":
				return renderLocations();
			case "financial":
				return renderFinancial();
			case "social_media":
				return renderSocialMedia();
			case "reviews":
				return renderReviews();
			case "compliance":
				return renderCompliance();
			case "blockchain":
				return renderBlockchain();
			case "delete":
				return renderDeleteConfirmation();
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 p-4">
			{/* Mobile View */}
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
