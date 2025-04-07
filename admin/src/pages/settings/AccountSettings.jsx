import React, { useEffect, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useAccount } from "../../Context/AccountContext";
import {
	UserOutlined,
	EditOutlined,
	EnvironmentOutlined,
	ShopOutlined,
	SecurityScanOutlined,
	DeleteOutlined,
	ExclamationCircleOutlined,
	SafetyCertificateOutlined,
	WalletOutlined,
	SettingOutlined,
	MobileOutlined,
	TabletOutlined,
	DesktopOutlined,
} from "@ant-design/icons";
import {
	Avatar,
	Typography,
	Button,
	Card,
	Menu,
	Switch,
	message,
	Input,
	Form,
	Select,
	Tag,
	Modal,
	Alert,
	Empty,
	Tabs,
	Tooltip,
} from "antd";
import axios from "axios";
import debounce from "lodash/debounce";
import { STORAGE_KEYS } from "../../utils/storage";

const { Title, Text } = Typography;

const API_URL =
	import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8000/api";

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

const formatDate = (dateString) => {
	const date = new Date(dateString);
	const now = new Date();
	const diffInSeconds = Math.floor((now - date) / 1000);

	if (diffInSeconds < 60) {
		return `${diffInSeconds} seconds ago`;
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
	}

	// For anything over 24 hours, show the exact date and time
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
};

const getDeviceIcon = (deviceType) => {
	switch (deviceType?.toLowerCase()) {
		case "mobile":
			return <MobileOutlined />;
		case "tablet":
			return <TabletOutlined />;
		case "desktop":
		default:
			return <DesktopOutlined />;
	}
};

const formatLocation = (location) => {
	if (!location || location === "Not set") return location;
	// Split the address by commas and take the first 2-3 meaningful parts
	const parts = location.split(",").map((part) => part.trim());
	if (parts.length <= 3) return location;
	return `${parts[0]}, ${parts[1]}, ${parts[parts.length - 1]}`;
};

const AccountSettings = () => {
	const { user: authUser } = useAuth();
	const { user: accountUser } = useAccount();
	const [selectedMenu, setSelectedMenu] = useState("profile");
	const [editingSection, setEditingSection] = useState(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteText, setDeleteText] = useState("");
	const [locations, setLocations] = useState([]);
	const [searchingLocation, setSearchingLocation] = useState(false);

	const [form] = Form.useForm();

	// Use accountUser as primary source, fallback to authUser
	const user = accountUser || authUser;

	const searchLocation = debounce(async (query) => {
		if (!query) {
			setLocations([]);
			return;
		}

		setSearchingLocation(true);
		try {
			const response = await axios.get(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					query
				)}`,
				{
					headers: {
						// Browser will set User-Agent automatically, no need to specify it
						"Accept-Language": "en-US,en;q=0.9",
					},
				}
			);

			const formattedLocations = response.data
				.map((location) => ({
					label: formatLocation(location.display_name),
					value: location.display_name, // Keep the full address as the value
					coordinates: {
						lat: location.lat,
						lng: location.lon,
					},
					fullAddress: location.display_name, // Store full address for tooltip
				}))
				.slice(0, 5);

			setLocations(formattedLocations);
		} catch (error) {
			console.error("Failed to fetch locations:", error);
			message.error("Failed to fetch locations. Please try again.");
		} finally {
			setSearchingLocation(false);
		}
	}, 1000);

	// Menu items for the sidebar
	const menuItems = [
		{
			key: "profile",
			label: "Personal Info",
			icon: <UserOutlined />,
		},
		{
			key: "preferences",
			label: "Preferences",
			icon: <SettingOutlined />,
		},
		{
			key: "security",
			label: "Security",
			icon: <SecurityScanOutlined />,
		},
		{
			key: "blockchain",
			label: "Blockchain",
			icon: <WalletOutlined />,
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
		firstName: user?.name?.split(" ")[0] || "",
		lastName: user?.name?.split(" ")[1] || "",
		email: user?.email || "",
		phone: user?.phoneNumber || "Not set",
		bio: user?.bio || "Not set",
		role: user?.role || "User",
		gender: user?.gender || "Not set",
		dob: user?.dob || "Not set",
		location: user?.location || "Not set",
	};

	const storeInfo = {
		name: user?.store?.name || "Not set",
		description: user?.store?.description || "Not set",
		category: user?.store?.category || "Not set",
		logo: user?.store?.logo || user?.profileImage,
		settings: user?.store?.settings || {
			allowComments: true,
			enableSocialSharing: true,
			enableYouTubeIntegration: false,
		},
	};

	const handleSettingToggle = (setting, checked) => {
		// Remove the notification since it's redundant with the actual update notification
	};

	const toggleEditMode = (section) => {
		if (!editingSection) {
			// When entering edit mode, set form values for the specific section
			if (section === "profile") {
				form.setFieldsValue({
					firstName: personalInfo.firstName,
					lastName: personalInfo.lastName,
					email: personalInfo.email,
					phone: personalInfo.phone,
					bio: personalInfo.bio,
					gender:
						personalInfo.gender === "Not set" ? undefined : personalInfo.gender,
					dob: personalInfo.dob === "Not set" ? undefined : personalInfo.dob,
					location:
						personalInfo.location === "Not set"
							? undefined
							: personalInfo.location,
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
			form.resetFields();
			setEditingSection(null);
		}
	};

	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			console.log("Form values:", values);

			if (editingSection === "profile") {
				// Validate phone number format
				if (values.phone && values.phone !== "Not set") {
					const phoneRegex = /^\+?[1-9]\d{1,14}$/;
					if (!phoneRegex.test(values.phone)) {
						message.error("Please enter a valid phone number");
						return;
					}
				}

				// Validate email format
				if (values.email) {
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					if (!emailRegex.test(values.email)) {
						message.error("Please enter a valid email address");
						return;
					}
				}

				// Prepare the update data
				const updateData = {
					name: `${values.firstName} ${values.lastName}`.trim(),
					email: values.email,
					phoneNumber: values.phone === "Not set" ? null : values.phone,
					bio: values.bio === "Not set" ? null : values.bio,
					gender: values.gender === "Not set" ? undefined : values.gender,
					dob: values.dob === "Not set" ? undefined : values.dob,
					location: values.location === "Not set" ? undefined : values.location,
					// Preserve existing values
					profileImage: user?.profileImage,
					preferences: user?.preferences,
					acceptBlockchainStorage: user?.acceptBlockchainStorage,
				};

				console.log("Sending update data:", updateData);

				try {
					// Call updateProfile from AccountContext
					const { success, user: updatedUser } = await updateProfile(
						updateData
					);

					if (success) {
						// Update personalInfo object with the new values
						Object.assign(personalInfo, {
							firstName: updatedUser.name.split(" ")[0] || "",
							lastName: updatedUser.name.split(" ")[1] || "",
							email: updatedUser.email || "",
							phone: updatedUser.phoneNumber || "Not set",
							bio: updatedUser.bio || "Not set",
							gender: updatedUser.gender || "Not set",
							dob: updatedUser.dob || "Not set",
							location: updatedUser.location || "Not set",
						});

						setEditingSection(null);
					}
				} catch (error) {
					console.error("Profile update error:", error);
					message.error(error.message || "Failed to update profile");
					return;
				}
			} else if (editingSection === "store") {
				const storeData = {
					name: values.name === "Not set" ? null : values.name,
					category: values.category === "Not set" ? null : values.category,
					description:
						values.description === "Not set" ? null : values.description,
				};

				try {
					// Call updateProfile with store data
					const { success } = await updateProfile({ store: storeData });

					if (success) {
						Object.assign(storeInfo, {
							name: values.name,
							category: values.category,
							description: values.description,
						});
						setEditingSection(null);
					}
				} catch (error) {
					console.error("Store update error:", error);
					message.error(error.message || "Failed to update store");
					return;
				}
			}
		} catch (error) {
			console.error("Form validation error:", error);
			message.error("Please check your input and try again");
		}
	};

	const renderEditableField = (label, value, fieldName, type = "input") => {
		const getFieldRules = (fieldName) => {
			switch (fieldName) {
				case "email":
					return [
						{ required: true, message: "Email is required" },
						{ type: "email", message: "Please enter a valid email address" },
					];
				case "phone":
					return [
						{
							pattern: /^\+?[1-9]\d{1,14}$/,
							message: "Please enter a valid phone number",
						},
					];
				case "firstName":
				case "lastName":
					return [
						{ required: true, message: `${label} is required` },
						{ min: 2, message: `${label} must be at least 2 characters` },
					];
				default:
					return [];
			}
		};

		return (
			<div>
				<Text className="text-gray-500 block mb-1">{label}</Text>
				<Form.Item
					name={fieldName}
					className="!mb-0"
					rules={getFieldRules(fieldName)}
				>
					{type === "select" ? (
						<Select className="w-full">
							<Select.Option value="male">Male</Select.Option>
							<Select.Option value="female">Female</Select.Option>
						</Select>
					) : type === "date" ? (
						<Input type="date" defaultValue={value} className="!bg-gray-50" />
					) : type === "location" ? (
						<Select
							showSearch
							className="w-full"
							placeholder="Search location"
							defaultActiveFirstOption={false}
							showArrow={false}
							filterOption={false}
							onSearch={searchLocation}
							loading={searchingLocation}
							options={locations.map((loc) => ({
								...loc,
								label: (
									<Tooltip title={loc.fullAddress}>
										<div className="truncate">{loc.label}</div>
									</Tooltip>
								),
							}))}
							notFoundContent={
								searchingLocation ? (
									<span>Searching...</span>
								) : (
									<span>No locations found</span>
								)
							}
						/>
					) : (
						<Input defaultValue={value} className="!bg-gray-50" />
					)}
				</Form.Item>
			</div>
		);
	};

	const renderReadOnlyField = (label, value) => {
		return (
			<div>
				<Text className="text-gray-500 block mb-1">{label}</Text>
				{label === "Location" && value !== "Not set" ? (
					<Tooltip title={value}>
						<Text strong className="block truncate">
							{formatLocation(value)}
						</Text>
					</Tooltip>
				) : (
					<Text strong>{value === null ? "Not set" : value}</Text>
				)}
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
			// Assuming updateStoreSettings is called elsewhere in the component
			// await updateStoreSettings({
			// 	deleted: true,
			// });
			// Redirect to login page or home page
		} catch (error) {
			message.error("Failed to delete account");
		} finally {
			setDeleteLoading(false);
			setShowDeleteConfirm(false);
		}
	};

	const renderStoreStats = () => (
		<div className="grid grid-cols-3 gap-4">
			<div className="bg-blue-50 rounded-xl p-4">
				<div className="flex items-center justify-center mb-2">
					<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
						<WalletOutlined className="text-blue-500" />
					</div>
				</div>
				<div className="text-center">
					<Text className="text-2xl font-semibold text-blue-600 block">0</Text>
					<Text className="text-sm text-blue-600">Transactions</Text>
				</div>
			</div>
			<div className="bg-green-50 rounded-xl p-4">
				<div className="flex items-center justify-center mb-2">
					<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
						<SafetyCertificateOutlined className="text-green-500" />
					</div>
				</div>
				<div className="text-center">
					<Text className="text-2xl font-semibold text-green-600 block">0</Text>
					<Text className="text-sm text-green-600">Verified</Text>
				</div>
			</div>
			<div className="bg-purple-50 rounded-xl p-4">
				<div className="flex items-center justify-center mb-2">
					<div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
						<UserOutlined className="text-purple-500" />
					</div>
				</div>
				<div className="text-center">
					<Text className="text-2xl font-semibold text-purple-600 block">
						0
					</Text>
					<Text className="text-sm text-purple-600">Connections</Text>
				</div>
			</div>
		</div>
	);

	const renderBlockchainInfo = () => (
		<div className="space-y-4">
			<Card className="overflow-hidden !p-4">
				<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
							<WalletOutlined className="text-blue-500 text-lg" />
						</div>
						<Title level={5} className="!mb-0">
							Blockchain Information
						</Title>
					</div>
				</div>

				<div className="space-y-6">
					<div>
						<Text className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-4 block">
							IPFS Information
						</Text>
						<div className="bg-gray-50 rounded-xl p-6">
							<div className="space-y-4">
								<div>
									<Text className="text-gray-500">IPFS CID</Text>
									<Text strong className="block font-mono">
										{user?.ipfsCid || "Not available"}
									</Text>
								</div>
								<div>
									<Text className="text-gray-500">IPFS URL</Text>
									<a
										href={user?.ipfsUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="block break-all text-blue-500 hover:text-blue-600"
									>
										{user?.ipfsUrl || "Not available"}
									</a>
								</div>
							</div>
						</div>
					</div>

					<div>
						<Text className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-4 block">
							Transaction Information
						</Text>
						<div className="bg-gray-50 rounded-xl p-6">
							<div className="space-y-4">
								<div>
									<Text className="text-gray-500">Transaction Hash</Text>
									<Text strong className="block font-mono">
										{user?.blockchainTxHash || "Not available"}
									</Text>
								</div>
								<div>
									<Text className="text-gray-500">Last Update</Text>
									<Text strong className="block">
										{user?.lastBlockchainUpdate
											? formatDate(user.lastBlockchainUpdate)
											: "Not available"}
									</Text>
								</div>
							</div>
						</div>
					</div>

					<div>
						<Text className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-4 block">
							Storage Settings
						</Text>
						<div className="bg-gray-50 rounded-xl p-6">
							<div className="flex items-center justify-between">
								<div>
									<Text strong className="block">
										Blockchain Storage
									</Text>
									<Text className="text-gray-500">
										Allow storing data on blockchain
									</Text>
								</div>
								<Switch
									checked={user?.acceptBlockchainStorage || false}
									onChange={(checked) =>
										handleSettingToggle("Blockchain Storage", checked)
									}
									className={`${
										user?.acceptBlockchainStorage
											? "bg-blue-500"
											: "bg-gray-200"
									} relative inline-flex h-6 w-11 items-center rounded-full`}
								/>
							</div>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);

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
									src={user?.photoURL || user?.profileImage}
									icon={<UserOutlined />}
									className="border-2 border-gray-200"
									referrerPolicy="no-referrer"
									crossOrigin="anonymous"
									onError={(e) => {
										if (e && e.target) {
											e.target.style.display = "none";
											// Add a small delay before showing the icon to prevent flickering
											setTimeout(() => {
												const avatarElement = e.target.parentElement;
												if (avatarElement) {
													avatarElement.style.backgroundColor = "#f5f5f5";
												}
											}, 100);
										}
									}}
								/>
								<div>
									<Title level={4} className="!mb-0">
										{user?.name}
									</Title>
									<Text className="text-gray-500">{personalInfo.role}</Text>
									{user?.location && (
										<div className="flex items-center gap-1 mt-1">
											<EnvironmentOutlined className="text-gray-400" />
											<Tooltip title={user.location}>
												<Text className="text-gray-500 truncate max-w-[300px]">
													{formatLocation(user.location)}
												</Text>
											</Tooltip>
										</div>
									)}
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
												"Email",
												personalInfo.email,
												"email"
											)}
											{renderEditableField(
												"Phone",
												personalInfo.phone,
												"phone"
											)}
											{renderEditableField(
												"Gender",
												personalInfo.gender,
												"gender",
												"select"
											)}
											{renderEditableField(
												"Date of Birth",
												personalInfo.dob,
												"dob",
												"date"
											)}
											{renderEditableField(
												"Location",
												personalInfo.location,
												"location",
												"location"
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
											{renderReadOnlyField("Email", personalInfo.email)}
											{renderReadOnlyField("Phone", personalInfo.phone)}
											{renderReadOnlyField("Gender", personalInfo.gender)}
											{renderReadOnlyField(
												"Date of Birth",
												personalInfo.dob || "Not set"
											)}
											{renderReadOnlyField("Location", personalInfo.location)}
											<div className="col-span-2">
												{renderReadOnlyField("Bio", personalInfo.bio)}
											</div>
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
													referrerPolicy="no-referrer"
													crossOrigin="anonymous"
													style={{
														backgroundColor: "#f5f5f5",
														objectFit: "cover",
													}}
													onError={(e) => {
														if (e && e.target) {
															e.target.style.display = "none";
															// Add a small delay before showing the icon to prevent flickering
															setTimeout(() => {
																const avatarElement = e.target.parentElement;
																if (avatarElement) {
																	avatarElement.style.backgroundColor =
																		"#f5f5f5";
																}
															}, 100);
														}
													}}
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
																value ? "bg-blue-500" : "bg-gray-200"
															} relative inline-flex h-6 w-11 items-center rounded-full`}
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
										{renderStoreStats()}
									</div>
								</div>
							</Form>
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
												icon: <SafetyCertificateOutlined />,
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

			case "blockchain":
				return renderBlockchainInfo();

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

	// Add updateProfile function since it's not available in context
	const updateProfile = async (updateData) => {
		try {
			// Get token from localStorage using the constant
			const token = localStorage.getItem(STORAGE_KEYS.token);
			if (!token) {
				throw new Error(
					"Authentication token not found. Please reconnect your wallet."
				);
			}

			// Make sure we have a walletAddress
			if (!user?.walletAddress) {
				throw new Error(
					"Wallet address not found. Please reconnect your wallet."
				);
			}

			// Log the update data for debugging
			console.log("Sending profile update request with data:", updateData);

			// Based on the API structure, try the likely endpoint for profile updates
			try {
				// Try the profile-update endpoint
				const response = await axios.post(
					`${API_URL}/users/profile-update`,
					{
						...updateData,
						walletAddress: user.walletAddress.toLowerCase()
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					}
				);

				// Handle success
				if (response.data?.success) {
					message.success("Profile updated successfully");
					// Return standardized response
					return {
						success: true,
						user: response.data.user || response.data.data || response.data.message,
					};
				} else {
					throw new Error(response.data?.message || "Failed to update profile");
				}
			} catch (firstError) {
				console.log("First endpoint attempt failed, trying alternate endpoint...", firstError);
				
				// Try alternate endpoint formats
				try {
					// This endpoint pattern matches how profiles are fetched
					const alternateResponse = await axios.put(
						`${API_URL}/users/profile/${user.walletAddress.toLowerCase()}`,
						updateData,
						{
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`,
							},
						}
					);

					if (alternateResponse.data?.success) {
						message.success("Profile updated successfully");
						return {
							success: true,
							user: alternateResponse.data.user || alternateResponse.data.data || alternateResponse.data.message,
						};
					}
				} catch (secondError) {
					console.log("Second endpoint attempt also failed", secondError);
					
					// One more attempt with a direct user update endpoint
					try {
						// Try a direct update to the user endpoint
						const thirdResponse = await axios.post(
							`${API_URL}/users/update`,
							{
								...updateData,
								walletAddress: user.walletAddress.toLowerCase(),
							},
							{
								headers: {
									"Content-Type": "application/json",
									Authorization: `Bearer ${token}`,
								},
							}
						);

						if (thirdResponse.data?.success) {
							message.success("Profile updated successfully");
							return {
								success: true,
								user: thirdResponse.data.user || thirdResponse.data.data || thirdResponse.data.message,
							};
						}
					} catch (thirdError) {
						// Handle the scenario where the server responds with something other than a 2xx status code
						console.error("All API endpoint attempts failed. Details:", {
							firstAttempt: { endpoint: "/users/profile-update", error: firstError.message },
							secondAttempt: { endpoint: `/users/profile/${user.walletAddress.toLowerCase()}`, error: secondError.message },
							thirdAttempt: { endpoint: "/users/update", error: thirdError.message }
						});
						
						// Check for specific error conditions
						const errorCodes = [firstError.response?.status, secondError.response?.status, thirdError.response?.status];
						
						if (errorCodes.includes(401)) {
							throw new Error("Authentication failed. Please log in again.");
						} else if (errorCodes.includes(403)) {
							throw new Error("You don't have permission to update this profile.");
						} else {
							throw new Error("Failed to update profile: API endpoint not found");
						}
					}
				}
				
				// If we reached here, none of the endpoints worked
				throw new Error("Failed to update profile: No valid API endpoint found");
			}
		} catch (error) {
			console.error("Profile update error:", error);
			message.error(error.message || "Failed to update profile");
			throw error;
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

export default AccountSettings;
