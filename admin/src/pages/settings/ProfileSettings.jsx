import React from "react";
import { useAccount } from "../../Context/AccountContext";
import { useAuth } from "../../Context/AuthContext";
import {
	UserOutlined,
	EditOutlined,
	EnvironmentOutlined,
	ShopOutlined,
	SecurityScanOutlined,
	CreditCardOutlined,
	DeleteOutlined,
	CheckCircleFilled,
	LinkOutlined,
	ShoppingOutlined,
	StarOutlined,
	HistoryOutlined,
	BellOutlined,
	SafetyCertificateOutlined,
	WalletOutlined,
	CreditCardFilled,
	ExclamationCircleOutlined,
} from "@ant-design/icons";
import { FaTiktok, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import {
	Avatar,
	Typography,
	Button,
	Card,
	Menu,
	Switch,
	message,
	Tabs,
	Input,
	Form,
	Select,
	Tag,
	Modal,
	Alert,
} from "antd";
import { useState } from "react";

const { Title, Text } = Typography;

// Constants for social accounts
const SOCIAL_ACCOUNTS = [
	{
		name: "TikTok",
		icon: <FaTiktok className="text-2xl" />,
		color: "#000",
		features: [
			{
				title: "Trending Content",
				description: "Leverage viral trends and hashtags",
			},
			{
				title: "Shopping Features",
				description: "Enable direct product purchases",
			},
			{
				title: "Analytics Dashboard",
				description: "Track engagement and growth",
			},
			{
				title: "Automated Posting",
				description: "Schedule and publish content",
			},
		],
	},
	{
		name: "Facebook",
		icon: <FaFacebook className="text-2xl" />,
		color: "#1877F2",
		features: [
			{
				title: "Shop Integration",
				description: "Sell directly on Facebook Marketplace",
			},
			{
				title: "Customer Messaging",
				description: "Manage customer inquiries",
			},
			{
				title: "Ad Campaigns",
				description: "Create and manage advertisements",
			},
			{
				title: "Page Insights",
				description: "Track page performance",
			},
		],
	},
	{
		name: "Instagram",
		icon: <FaInstagram className="text-2xl" />,
		color: "#E1306C",
		features: [
			{
				title: "Shopping Tags",
				description: "Tag products in posts and stories",
			},
			{
				title: "Story Highlights",
				description: "Showcase products in stories",
			},
			{
				title: "Business Tools",
				description: "Access professional features",
			},
			{
				title: "Insights",
				description: "Track post performance",
			},
		],
	},
	{
		name: "YouTube",
		icon: <FaYoutube className="text-2xl" />,
		color: "#FF0000",
		features: [
			{
				title: "Video Integration",
				description: "Embed product videos",
			},
			{
				title: "Channel Branding",
				description: "Customize channel appearance",
			},
			{
				title: "Community Posts",
				description: "Engage with subscribers",
			},
			{
				title: "Analytics",
				description: "Track video performance",
			},
		],
	},
];

// Add store categories
const STORE_CATEGORIES = [
	"Fashion & Apparel",
	"Electronics",
	"Home & Garden",
	"Beauty & Personal Care",
	"Sports & Outdoors",
	"Books & Media",
	"Food & Beverages",
	"Health & Wellness",
	"Art & Collectibles",
	"Other",
];

const formatValue = (value) => {
	if (!value) return "0";
	if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
	if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
	return value;
};

const ProfileSettings = () => {
	const { profile, updateStoreSettings, loginHistory } = useAccount();
	const auth = useAuth();
	const youtube = auth?.youtube;
	const [selectedMenu, setSelectedMenu] = useState("profile");
	const [editingSection, setEditingSection] = useState(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteText, setDeleteText] = useState("");

	const [form] = Form.useForm();

	// Menu items for the sidebar
	const menuItems = [
		{
			key: "profile",
			label: "Personal Info",
			icon: <UserOutlined />,
		},
		{
			key: "store",
			label: "Store Settings",
			icon: <ShopOutlined />,
		},
		{
			key: "social",
			label: "Social Media",
			icon: <LinkOutlined />,
		},
		{
			key: "security",
			label: "Security",
			icon: <SecurityScanOutlined />,
		},
		{
			key: "billing",
			label: "Billing",
			icon: <CreditCardOutlined />,
		},
		{
			type: "divider",
		},
		{
			key: "delete",
			label: "Delete Account",
			icon: <DeleteOutlined />,
			danger: true,
		},
	];

	const personalInfo = {
		firstName: profile?.name?.split(" ")[0] || "",
		lastName: profile?.name?.split(" ")[1] || "",
		email: profile?.email || "",
		phone: profile?.phoneNumber || "Not set",
		bio: profile?.bio || "Not set",
		role: profile?.role || "Vendor",
	};

	const addressInfo = {
		country: "United Kingdom",
		cityState: profile?.location || "Not set",
		postalCode: profile?.postalCode || "Not set",
		taxId: profile?.taxId || "Not set",
	};

	const storeInfo = {
		name: profile?.store?.name || "Not set",
		description: profile?.store?.description || "Not set",
		category: profile?.store?.category || "Not set",
		logo: profile?.store?.logo || profile?.profileImage,
		settings: profile?.store?.settings || {
			allowComments: true,
			enableSocialSharing: true,
			enableYouTubeIntegration: false,
		},
	};

	const handleSettingToggle = async (key, checked) => {
		const newSettings = {
			...storeInfo.settings,
			[key]: checked,
		};
		const success = await updateStoreSettings(newSettings);
		if (success) {
			storeInfo.settings[key] = checked;
		}
	};

	const handleSocialConnect = async (platform) => {
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

	const toggleEditMode = (section) => {
		if (!editingSection) {
			// When entering edit mode, set form values for the specific section
			if (section === "profile") {
				form.setFieldsValue({
					...personalInfo,
					...addressInfo,
				});
			} else if (section === "store") {
				form.setFieldsValue({
					name: storeInfo.name,
					category: storeInfo.category,
					description: storeInfo.description,
				});
			}
			setEditingSection(section);
		} else {
			setEditingSection(null);
		}
	};

	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			// Update based on which section is being edited
			if (editingSection === "profile") {
				Object.assign(personalInfo, {
					firstName: values.firstName,
					lastName: values.lastName,
					email: values.email,
					phone: values.phone,
					bio: values.bio,
				});
				Object.assign(addressInfo, {
					country: values.country,
					cityState: values.cityState,
					postalCode: values.postalCode,
					taxId: values.taxId,
				});
			} else if (editingSection === "store") {
				Object.assign(storeInfo, {
					name: values.name,
					category: values.category,
					description: values.description,
				});
			}
			message.success("Changes saved successfully!");
			setEditingSection(null);
		} catch (error) {
			message.error("Please check your input and try again");
		}
	};

	const renderEditableField = (label, value, fieldName) => {
		return (
			<div>
				<Text className="text-gray-500 block mb-1">{label}</Text>
				<Form.Item name={fieldName} className="!mb-0">
					<Input defaultValue={value} className="!bg-gray-50" />
				</Form.Item>
			</div>
		);
	};

	const renderReadOnlyField = (label, value) => {
		return (
			<div>
				<Text className="text-gray-500 block mb-1">{label}</Text>
				<Text strong>{value}</Text>
			</div>
		);
	};

	const renderEditButtons = (section) => {
		const isCurrentSectionEditing = editingSection === section;
		return isCurrentSectionEditing ? (
			<div className="space-x-2">
				<Button onClick={() => toggleEditMode(section)}>Cancel</Button>
				<Button type="primary" onClick={handleSave}>
					Save Changes
				</Button>
			</div>
		) : (
			<Button
				type="primary"
				ghost
				icon={<EditOutlined />}
				onClick={() => toggleEditMode(section)}
				className="border-blue-500 text-blue-500 hover:bg-blue-50"
			>
				Edit {section === "profile" ? "Profile" : "Store"}
			</Button>
		);
	};

	const handleDeleteAccount = async () => {
		try {
			setDeleteLoading(true);
			await updateStoreSettings({
				deleted: true,
			});
			message.success("Account deleted successfully!");
			// Redirect to login page or home page
		} catch (error) {
			message.error("Failed to delete account");
		} finally {
			setDeleteLoading(false);
			setShowDeleteConfirm(false);
		}
	};

	const renderContent = () => {
		switch (selectedMenu) {
			case "profile":
				return (
					<div className="space-y-4">
						{/* Profile Header */}
						<div className="bg-white rounded-lg p-4 flex items-start justify-between">
							<div className="flex items-center gap-3">
								<Avatar
									size={64}
									src={profile?.profileImage}
									icon={<UserOutlined />}
									className="bg-blue-100"
								/>
								<div>
									<Title level={4} className="!mb-0">
										{profile?.name}
									</Title>
									<Text className="text-gray-500">{personalInfo.role}</Text>
									<div className="flex items-center gap-1 mt-1">
										<EnvironmentOutlined className="text-gray-400" />
										<Text className="text-gray-500">
											{addressInfo.cityState}
										</Text>
									</div>
								</div>
							</div>
							<div className="hidden md:block">
								{renderEditButtons("profile")}
							</div>
						</div>

						{/* Personal Information */}
						<Card className="!p-4">
							<Form form={form} layout="vertical">
								<div className="flex items-center justify-between mb-3">
									<Title level={5} className="!mb-0">
										Personal Information
									</Title>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{editingSection === "profile" ? (
										<>
											{renderEditableField(
												"First Name",
												personalInfo.firstName,
												"firstName"
											)}
											{renderEditableField(
												"Last Name",
												personalInfo.lastName,
												"lastName"
											)}
											{renderEditableField(
												"Email address",
												personalInfo.email,
												"email"
											)}
											{renderEditableField(
												"Phone",
												personalInfo.phone,
												"phone"
											)}
											<div className="col-span-2">
												{renderEditableField("Bio", personalInfo.bio, "bio")}
											</div>
										</>
									) : (
										<>
											{renderReadOnlyField(
												"First Name",
												personalInfo.firstName
											)}
											{renderReadOnlyField("Last Name", personalInfo.lastName)}
											{renderReadOnlyField("Email address", personalInfo.email)}
											{renderReadOnlyField("Phone", personalInfo.phone)}
											<div className="col-span-2">
												{renderReadOnlyField("Bio", personalInfo.bio)}
											</div>
										</>
									)}
								</div>
							</Form>
						</Card>

						{/* Address Information */}
						<Card className="!p-4">
							<Form form={form} layout="vertical">
								<div className="flex items-center justify-between mb-3">
									<Title level={5} className="!mb-0">
										Address
									</Title>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{editingSection === "profile" ? (
										<>
											{renderEditableField(
												"Country",
												addressInfo.country,
												"country"
											)}
											{renderEditableField(
												"City/State",
												addressInfo.cityState,
												"cityState"
											)}
											{renderEditableField(
												"Postal Code",
												addressInfo.postalCode,
												"postalCode"
											)}
											{renderEditableField(
												"TAX ID",
												addressInfo.taxId,
												"taxId"
											)}
										</>
									) : (
										<>
											{renderReadOnlyField("Country", addressInfo.country)}
											{renderReadOnlyField("City/State", addressInfo.cityState)}
											{renderReadOnlyField(
												"Postal Code",
												addressInfo.postalCode
											)}
											{renderReadOnlyField("TAX ID", addressInfo.taxId)}
										</>
									)}
								</div>
							</Form>
						</Card>
					</div>
				);

			case "store":
				return (
					<div className="space-y-4">
						{/* Store Information */}
						<Card className="overflow-hidden !p-4">
							<Form form={form} layout="vertical">
								<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
											<ShopOutlined className="text-blue-500 text-lg" />
										</div>
										<Title level={5} className="!mb-0">
											Store Details
										</Title>
									</div>
									{renderEditButtons("store")}
								</div>
								<div className="space-y-10">
									{/* Basic Store Info */}
									<div>
										<Text className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-6 block">
											Basic Information
										</Text>
										<div className="bg-gray-50 rounded-xl p-6">
											<div className="flex items-start gap-6">
												<Avatar
													size={80}
													src={storeInfo.logo}
													icon={<ShopOutlined />}
													className="bg-white border-2 border-gray-100 flex-shrink-0"
												/>
												<div className="flex-grow space-y-6">
													{editingSection === "store" ? (
														<>
															<Form.Item name="name" className="!mb-4">
																<Input
																	placeholder="Store Name"
																	className="!text-xl"
																	defaultValue={storeInfo.name}
																/>
															</Form.Item>
															<div className="grid grid-cols-2 gap-6">
																<Form.Item name="category" className="!mb-0">
																	<Select
																		placeholder="Select Category"
																		defaultValue={storeInfo.category}
																		className="w-full"
																	>
																		{STORE_CATEGORIES.map((category) => (
																			<Select.Option
																				key={category}
																				value={category}
																			>
																				{category}
																			</Select.Option>
																		))}
																	</Select>
																</Form.Item>
																<div>
																	<Text className="text-gray-500 text-sm block mb-1">
																		Status
																	</Text>
																	<div className="flex items-center gap-1">
																		<div className="w-2 h-2 rounded-full bg-green-500"></div>
																		<Text strong className="text-gray-800">
																			Active
																		</Text>
																	</div>
																</div>
															</div>
														</>
													) : (
														<>
															<div>
																<Text className="text-gray-500 text-sm block mb-1">
																	Store Name
																</Text>
																<Text strong className="text-xl block">
																	{storeInfo.name}
																</Text>
															</div>
															<div className="grid grid-cols-2 gap-6">
																<div>
																	<Text className="text-gray-500 text-sm block mb-1">
																		Category
																	</Text>
																	<Text
																		strong
																		className="capitalize text-gray-800"
																	>
																		{storeInfo.category}
																	</Text>
																</div>
																<div>
																	<Text className="text-gray-500 text-sm block mb-1">
																		Status
																	</Text>
																	<div className="flex items-center gap-1">
																		<div className="w-2 h-2 rounded-full bg-green-500"></div>
																		<Text strong className="text-gray-800">
																			Active
																		</Text>
																	</div>
																</div>
															</div>
														</>
													)}
												</div>
											</div>
											<div className="mt-6 pt-6 border-t border-gray-200">
												<Text className="text-gray-500 text-sm block mb-2">
													Description
												</Text>
												{editingSection === "store" ? (
													<Form.Item name="description" className="!mb-0">
														<Input.TextArea
															rows={4}
															defaultValue={storeInfo.description}
															className="!bg-gray-50"
														/>
													</Form.Item>
												) : (
													<Text className="text-gray-800">
														{storeInfo.description}
													</Text>
												)}
											</div>
										</div>
									</div>

									{/* Store Settings */}
									<div>
										<Text className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-6 block">
											Store Settings
										</Text>
										<div className="space-y-3">
											{Object.entries(storeInfo.settings).map(
												([key, value]) => (
													<div
														key={key}
														className="bg-gray-50 rounded-xl p-5 flex items-center justify-between hover:bg-gray-100 transition-colors duration-200"
													>
														<div className="max-w-[80%]">
															<Text strong className="text-gray-800 block mb-1">
																{key.replace(/([A-Z])/g, " $1").trim()}
															</Text>
															<Text className="text-gray-500 text-sm">
																{key === "allowComments" &&
																	"Allow customers to leave comments on your products"}
																{key === "enableSocialSharing" &&
																	"Enable social media sharing for your products"}
																{key === "enableYouTubeIntegration" &&
																	"Connect and showcase your YouTube content"}
															</Text>
														</div>
														<Switch
															checked={value}
															onChange={(checked) =>
																handleSettingToggle(key, checked)
															}
															className={`${
																value ? "!bg-blue-500" : ""
															} min-w-[44px] h-6`}
														/>
													</div>
												)
											)}
										</div>
									</div>

									{/* Store Stats */}
									<div>
										<Text className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-6 block">
											Store Statistics
										</Text>
										<div className="grid grid-cols-3 gap-4">
											<div className="bg-blue-50 rounded-xl p-4">
												<div className="flex items-center justify-center mb-2">
													<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
														<ShopOutlined className="text-blue-500" />
													</div>
												</div>
												<div className="text-center">
													<Text className="text-2xl font-semibold text-blue-600 block">
														0
													</Text>
													<Text className="text-sm text-blue-600">
														Products
													</Text>
												</div>
											</div>
											<div className="bg-green-50 rounded-xl p-4">
												<div className="flex items-center justify-center mb-2">
													<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
														<ShoppingOutlined className="text-green-500" />
													</div>
												</div>
												<div className="text-center">
													<Text className="text-2xl font-semibold text-green-600 block">
														0
													</Text>
													<Text className="text-sm text-green-600">Orders</Text>
												</div>
											</div>
											<div className="bg-purple-50 rounded-xl p-4">
												<div className="flex items-center justify-center mb-2">
													<div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
														<StarOutlined className="text-purple-500" />
													</div>
												</div>
												<div className="text-center">
													<Text className="text-2xl font-semibold text-purple-600 block">
														0
													</Text>
													<Text className="text-sm text-purple-600">
														Reviews
													</Text>
												</div>
											</div>
										</div>
									</div>
								</div>
							</Form>
						</Card>
					</div>
				);

			case "social":
				return (
					<div className="space-y-4">
						<Card className="overflow-hidden !p-4">
							<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 flex items-center justify-center">
										<LinkOutlined className="text-blue-500 text-lg" />
									</div>
									<Title level={5} className="!mb-0">
										Social Connections
									</Title>
								</div>
							</div>
							<Tabs
								defaultActiveKey="connect"
								className="!mt-0"
								items={[
									{
										key: "connect",
										label: (
											<span className="flex items-center gap-2">
												<LinkOutlined />
												Connect Platforms
											</span>
										),
										children: (
											<div className="space-y-4">
												{SOCIAL_ACCOUNTS.map((account) => (
													<div
														key={account.name}
														className="bg-gray-50 hover:bg-gray-100 transition-all duration-200 rounded-xl p-3"
													>
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-4">
																<div
																	className="w-12 h-12 rounded-full flex items-center justify-center"
																	style={{
																		backgroundColor: `${account.color}15`,
																		color: account.color,
																	}}
																>
																	{account.icon}
																</div>
																<div>
																	<Text className="font-medium text-lg text-gray-800 block">
																		{account.name}
																	</Text>
																	<Text className="text-gray-500">
																		{account.name === "TikTok" &&
																			"Share short-form videos and engage with trends"}
																		{account.name === "Facebook" &&
																			"Connect with customers and share updates"}
																		{account.name === "Instagram" &&
																			"Showcase products with visual content"}
																		{account.name === "YouTube" &&
																			"Share detailed product reviews and tutorials"}
																	</Text>
																</div>
															</div>
															{account.name === "YouTube" && !!youtube ? (
																<div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
																	<CheckCircleFilled className="text-green-500" />
																	<span className="text-green-600 font-medium">
																		Connected
																	</span>
																</div>
															) : (
																<Button
																	type="default"
																	className="border-1 hover:border-opacity-80 hover:text-opacity-80 transition-all duration-200 flex items-center gap-2 px-4 h-9"
																	style={{
																		borderColor: account.color,
																		color: account.color,
																	}}
																	onClick={() =>
																		handleSocialConnect(account.name)
																	}
																>
																	<LinkOutlined /> Connect
																</Button>
															)}
														</div>
													</div>
												))}
											</div>
										),
									},
									...SOCIAL_ACCOUNTS.map((account) => ({
										key: account.name.toLowerCase(),
										label: (
											<span
												className="flex items-center gap-2"
												style={{ color: account.color }}
											>
												{account.icon}
												{account.name}
												{account.name === "YouTube" && !!youtube && (
													<CheckCircleFilled className="text-green-500 text-sm" />
												)}
											</span>
										),
										children: (
											<div className="space-y-6">
												{account.name === "YouTube" && youtube ? (
													<>
														<div
															className="flex items-center gap-4 mb-6"
															style={{ color: account.color }}
														>
															<Avatar
																size={64}
																src={youtube?.snippet?.thumbnails?.default?.url}
																alt={youtube?.snippet?.title}
																className="border-2 border-gray-100"
															/>
															<div>
																<Text
																	strong
																	className="text-xl block text-gray-800"
																>
																	{youtube?.snippet?.title}
																</Text>
																<Text className="text-gray-500">
																	Joined{" "}
																	{new Date(
																		youtube?.snippet?.publishedAt
																	).toLocaleDateString("en-US", {
																		year: "numeric",
																		month: "long",
																	})}
																</Text>
															</div>
														</div>

														<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
															<div
																className="rounded-xl p-4"
																style={{
																	backgroundColor: `${account.color}15`,
																}}
															>
																<Text className="text-gray-500 text-sm block mb-1">
																	{account.name === "YouTube"
																		? "Subscribers"
																		: "Followers"}
																</Text>
																<Text
																	strong
																	className="text-xl block"
																	style={{ color: account.color }}
																>
																	{formatValue(
																		youtube?.statistics?.subscriberCount
																	)}
																</Text>
															</div>
															<div
																className="rounded-xl p-4"
																style={{
																	backgroundColor: `${account.color}15`,
																}}
															>
																<Text className="text-gray-500 text-sm block mb-1">
																	{account.name === "YouTube"
																		? "Total Views"
																		: "Engagement"}
																</Text>
																<Text
																	strong
																	className="text-xl block"
																	style={{ color: account.color }}
																>
																	{formatValue(youtube?.statistics?.viewCount)}
																</Text>
															</div>
															<div
																className="rounded-xl p-4"
																style={{
																	backgroundColor: `${account.color}15`,
																}}
															>
																<Text className="text-gray-500 text-sm block mb-1">
																	{account.name === "YouTube"
																		? "Videos"
																		: "Posts"}
																</Text>
																<Text
																	strong
																	className="text-xl block"
																	style={{ color: account.color }}
																>
																	{formatValue(youtube?.statistics?.videoCount)}
																</Text>
															</div>
														</div>

														<div className="bg-gray-50 rounded-xl p-6">
															<Text className="text-gray-500 text-sm font-medium mb-3 block">
																Channel Description
															</Text>
															<Text className="text-gray-800">
																{youtube?.snippet?.description ||
																	"No description available"}
															</Text>
														</div>
													</>
												) : (
													<div className="text-center py-8">
														<div
															className="mb-4"
															style={{ color: account.color }}
														>
															{account.icon}
														</div>
														<Text className="text-gray-500 block mb-4">
															Connect your {account.name} account to view
															analytics and manage integration
														</Text>
														<Button
															type="primary"
															icon={<LinkOutlined />}
															onClick={() => handleSocialConnect(account.name)}
															style={{
																backgroundColor: account.color,
																borderColor: account.color,
															}}
														>
															Connect {account.name}
														</Button>
													</div>
												)}

												<div className="bg-gray-50 rounded-xl p-6">
													<Text className="text-gray-500 text-sm font-medium mb-4 block">
														Integration Features
													</Text>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														{account.features.map((feature, index) => (
															<div
																key={index}
																className="bg-white rounded-xl p-4 border border-gray-100"
															>
																<Text strong className="block mb-1">
																	{feature.title}
																</Text>
																<Text className="text-gray-500 text-sm">
																	{feature.description}
																</Text>
															</div>
														))}
													</div>
												</div>
											</div>
										),
									})),
								]}
							/>
						</Card>
					</div>
				);

			case "security":
				return (
					<div className="space-y-4">
						{/* Security Overview */}
						<Card className="overflow-hidden !p-4">
							<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
										<SecurityScanOutlined className="text-blue-500 text-lg" />
									</div>
									<Title level={5} className="!mb-0">
										Security Settings
									</Title>
								</div>
							</div>

							<div className="space-y-6">
								{/* Two-Factor Authentication */}
								<div>
									<Text className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-4 block">
										Two-Factor Authentication (2FA)
									</Text>
									<div className="bg-gray-50 rounded-xl p-6">
										<div className="flex items-start justify-between">
											<div className="space-y-1">
												<Text strong className="text-lg block">
													Authenticator App
												</Text>
												<Text className="text-gray-500">
													Use an authenticator app to generate one-time codes
												</Text>
											</div>
											<Switch defaultChecked={false} />
										</div>
									</div>
								</div>

								{/* Login History */}
								<div>
									<Text className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-4 block">
										Recent Login Activity
									</Text>
									<div className="space-y-4">
										{loginHistory.map((session, index) => (
											<div
												key={index}
												className="bg-gray-50 rounded-xl p-4 flex items-center justify-between"
											>
												<div className="flex items-center gap-4">
													<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
														<HistoryOutlined className="text-blue-500" />
													</div>
													<div>
														<Text strong className="block">
															{session.browser} on {session.os}
															{session.status === "success" && (
																<Tag color="success" className="ml-2">
																	Success
																</Tag>
															)}
															{session.status === "failed" && (
																<Tag color="error" className="ml-2">
																	Failed
																</Tag>
															)}
														</Text>
														<Text className="text-gray-500 text-sm">
															{session.ipAddress} •{" "}
															{new Date(session.createdAt).toLocaleString()}
														</Text>
														{session.failureReason && (
															<Text className="text-red-500 text-sm">
																Reason: {session.failureReason}
															</Text>
														)}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Notification Preferences */}
								<div>
									<Text className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-4 block">
										Security Notifications
									</Text>
									<div className="space-y-3">
										{[
											{
												title: "Unusual Activity",
												description:
													"Get notified when we detect unusual activity in your account",
												icon: <ExclamationCircleOutlined />,
											},
											{
												title: "New Device Login",
												description:
													"Receive alerts when someone logs in from a new device",
												icon: <SafetyCertificateOutlined />,
											},
											{
												title: "Security Updates",
												description:
													"Stay informed about important security updates",
												icon: <BellOutlined />,
											},
										].map((setting, index) => (
											<div
												key={index}
												className="bg-gray-50 rounded-xl p-5 flex items-center justify-between"
											>
												<div className="flex items-center gap-4">
													<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
														{React.cloneElement(setting.icon, {
															className: "text-blue-500",
														})}
													</div>
													<div>
														<Text strong className="block">
															{setting.title}
														</Text>
														<Text className="text-gray-500 text-sm">
															{setting.description}
														</Text>
													</div>
												</div>
												<Switch defaultChecked />
											</div>
										))}
									</div>
								</div>
							</div>
						</Card>
					</div>
				);

			case "billing":
				return (
					<div className="space-y-4">
						{/* Billing Overview */}
						<Card className="overflow-hidden !p-4">
							<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
										<WalletOutlined className="text-blue-500 text-lg" />
									</div>
									<Title level={5} className="!mb-0">
										Billing & Payments
									</Title>
								</div>
							</div>

							<div className="space-y-6">
								{/* Payment Methods */}
								<div>
									<Text className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-4 block">
										Payment Methods
									</Text>
									<div className="space-y-4">
										<div className="bg-gray-50 rounded-xl p-6">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-4">
													<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
														<CreditCardFilled className="text-blue-500 text-xl" />
													</div>
													<div>
														<Text strong className="block">
															•••• •••• •••• 4242
														</Text>
														<Text className="text-gray-500">Expires 12/24</Text>
													</div>
												</div>
												<Button type="primary" ghost>
													Update
												</Button>
											</div>
										</div>
										<Button
											type="dashed"
											icon={<CreditCardOutlined />}
											block
											className="h-12"
										>
											Add New Payment Method
										</Button>
									</div>
								</div>

								{/* Billing History */}
								<div>
									<Text className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-4 block">
										Billing History
									</Text>
									<div className="bg-gray-50 rounded-xl overflow-hidden">
										<div className="divide-y divide-gray-200">
											{[
												{
													id: "INV-2024-001",
													date: "Mar 1, 2024",
													amount: "KES 3,499",
													status: "Paid",
												},
												{
													id: "INV-2024-002",
													date: "Feb 1, 2024",
													amount: "KES 3,499",
													status: "Paid",
												},
												{
													id: "INV-2024-003",
													date: "Jan 1, 2024",
													amount: "KES 3,499",
													status: "Paid",
												},
											].map((invoice, index) => (
												<div
													key={index}
													className="p-4 flex items-center justify-between hover:bg-gray-100 transition-colors duration-200"
												>
													<div>
														<Text strong className="block">
															{invoice.id}
														</Text>
														<Text className="text-gray-500">
															{invoice.date}
														</Text>
													</div>
													<div className="flex items-center gap-4">
														<Text strong>{invoice.amount}</Text>
														<Tag color="success">{invoice.status}</Tag>
														<Button type="link" size="small">
															Download
														</Button>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>

								{/* Subscription Plan */}
								<div>
									<Text className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-4 block">
										Current Plan
									</Text>
									<div className="bg-gray-50 rounded-xl p-6">
										<div className="flex items-center justify-between">
											<div>
												<Text strong className="text-xl block">
													Pro Plan
												</Text>
												<Text className="text-gray-500">
													KES 3,499/month • Renews on April 1, 2024
												</Text>
											</div>
											<Button type="primary">Upgrade Plan</Button>
										</div>
									</div>
								</div>
							</div>
						</Card>
					</div>
				);

			case "delete":
				return (
					<div className="space-y-4">
						<Card className="overflow-hidden !p-4">
							<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
										<ExclamationCircleOutlined className="text-red-500 text-lg" />
									</div>
									<Title level={5} className="!mb-0">
										Delete Account
									</Title>
								</div>
							</div>

							<div className="space-y-6">
								<Alert
									message="Warning: This action cannot be undone"
									description="Deleting your account will permanently remove all your data, including:"
									type="warning"
									showIcon
								/>

								<div className="pl-8">
									<ul className="list-disc space-y-2 text-gray-600">
										<li>All personal information and settings</li>
										<li>Store details and configurations</li>
										<li>Order history and customer data</li>
										<li>Payment information and billing history</li>
										<li>Access to all services and features</li>
									</ul>
								</div>

								<div className="bg-gray-50 rounded-xl p-6">
									<Text className="block mb-4">
										To confirm deletion, please type &quot;DELETE&quot; in the
										field below:
									</Text>
									<Input
										placeholder="Type DELETE to confirm"
										value={deleteText}
										onChange={(e) => setDeleteText(e.target.value)}
										className="mb-4"
									/>
									<Button
										danger
										type="primary"
										loading={deleteLoading}
										disabled={deleteText !== "DELETE"}
										onClick={() => setShowDeleteConfirm(true)}
										block
									>
										Delete My Account
									</Button>
								</div>
							</div>
						</Card>

						<Modal
							title="Confirm Account Deletion"
							open={showDeleteConfirm}
							onOk={handleDeleteAccount}
							onCancel={() => setShowDeleteConfirm(false)}
							okText="Yes, Delete My Account"
							cancelText="Cancel"
							okButtonProps={{
								danger: true,
								loading: deleteLoading,
							}}
						>
							<p>Are you absolutely sure you want to delete your account?</p>
							<p>
								This action cannot be undone and all your data will be
								permanently lost.
							</p>
						</Modal>
					</div>
				);

			default:
				return (
					<div className="bg-white rounded-lg p-8 text-center">
						<Text className="text-gray-500 text-lg">Coming Soon</Text>
					</div>
				);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Desktop View */}
			<div className="hidden md:flex h-screen">
				<div className="w-56 bg-white border-r border-gray-200">
					<div className="p-4">
						<Title level={4} className="!mb-4">
							Settings
						</Title>
						<Menu
							mode="inline"
							selectedKeys={[selectedMenu]}
							onClick={({ key }) => setSelectedMenu(key)}
							items={menuItems}
							className="border-r-0"
						/>
					</div>
				</div>
				<div className="flex-1 p-4 overflow-y-auto">
					<div className="max-w-3xl">{renderContent()}</div>
				</div>
			</div>

			{/* Mobile View */}
			<div className="block md:hidden">
				<div className="bg-white border-b border-gray-200 sticky top-0 z-10">
					<div className="p-3 flex items-center justify-between">
						<Title level={4}>Settings</Title>
						{selectedMenu === "profile" && renderEditButtons("profile")}
						{selectedMenu === "store" && renderEditButtons("store")}
					</div>
					<Tabs
						activeKey={selectedMenu}
						onChange={setSelectedMenu}
						items={menuItems
							.filter((item) => !item.type)
							.map((item) => ({
								key: item.key,
								label: (
									<span className="flex items-center gap-2">
										{item.icon}
										<span>{item.label}</span>
									</span>
								),
								className: item.danger ? "text-red-500" : "",
							}))}
						className="px-3"
					/>
				</div>
				<div className="p-3 mt-3">
					<div className="max-w-3xl mx-auto">{renderContent()}</div>
				</div>
			</div>
		</div>
	);
};

export default ProfileSettings;
