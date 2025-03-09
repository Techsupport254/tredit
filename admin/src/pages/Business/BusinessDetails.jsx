import { useState, useEffect } from "react";
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
} from "antd";
import LoadingSpinner from "../../Components/Common/LoadingSpinner";
import ErrorMessage from "../../Components/Common/ErrorMessage";
import ConfirmationModal from "../../Components/Common/ConfirmationModal";
import { showSuccess, showError, showInfo } from "../../utils/notifications";

const { Title, Text } = Typography;

const SOCIAL_ACCOUNTS = [
	{
		name: "TikTok",
		icon: <FaTiktok className="text-2xl" />,
		color: "#000",
		key: "tiktok",
	},
	{
		name: "Facebook",
		icon: <FaFacebook className="text-2xl" />,
		color: "#1877F2",
		key: "facebook",
	},
	{
		name: "Instagram",
		icon: <FaInstagram className="text-2xl" />,
		color: "#E1306C",
		key: "instagram",
	},
	{
		name: "YouTube",
		icon: <FaYoutube className="text-2xl" />,
		color: "#FF0000",
		key: "youtube",
	},
];

const BusinessDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [business, setBusiness] = useState(null);
	const [loading, setLoading] = useState(true);
	const [selectedMenu, setSelectedMenu] = useState("overview");
	const [showVerifyModal, setShowVerifyModal] = useState(false);
	const [verificationNote, setVerificationNote] = useState("");
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	useEffect(() => {
		fetchBusinessDetails();
	}, [id]);

	const fetchBusinessDetails = async () => {
		try {
			const response = await fetch(
				`http://localhost:8000/api/businesses/${id}`
			);
			if (response.ok) {
				const data = await response.json();
				setBusiness(data.data);
			} else {
				showError("Failed to fetch business details");
			}
		} catch (error) {
			console.error("Error fetching business details:", error);
			showError("An error occurred while fetching business details");
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
		try {
			const response = await fetch(
				`http://localhost:8000/api/businesses/${id}`,
				{
					method: "DELETE",
				}
			);

			if (response.ok) {
				showSuccess("Business deleted successfully");
				navigate("/businesses");
			} else {
				showError("Failed to delete business");
			}
		} catch (error) {
			console.error("Error deleting business:", error);
			showError("An error occurred while deleting the business");
		}
	};

	const handleConnect = (platform) => {
		showInfo(`${platform} connection coming soon!`);
	};

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

		if (teamMembers.length === 0) {
			return (
				<div className="text-center py-12">
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<FaUsers className="text-gray-400 text-2xl" />
					</div>
					<Text className="text-gray-500 block">No team members added yet</Text>
					<Button type="primary" className="mt-4">
						Add Team Member
					</Button>
				</div>
			);
		}

		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{teamMembers.map((member, index) => (
					<Card key={index} className="!p-4">
						<div className="flex items-start gap-4">
							<Avatar
								size={48}
								src={member.avatar}
								icon={<FaUserCircle />}
								className="bg-blue-100"
							/>
							<div className="flex-grow">
								<Text strong className="block">
									{member.name}
								</Text>
								<Text className="text-gray-500 text-sm block">
									{member.role}
								</Text>
								<div className="flex items-center gap-2 mt-2">
									{member.email && (
										<a
											href={`mailto:${member.email}`}
											className="text-gray-500 hover:text-blue-500"
										>
											<FaEnvelope />
										</a>
									)}
									{member.phone && (
										<a
											href={`tel:${member.phone}`}
											className="text-gray-500 hover:text-blue-500"
										>
											<FaPhone />
										</a>
									)}
								</div>
							</div>
							<Tag color={member.status === "active" ? "success" : "default"}>
								{member.status}
							</Tag>
						</div>
					</Card>
				))}
			</div>
		);
	};

	const renderOverview = () => (
		<div className="space-y-6">
			{/* Business Header */}
			<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
				<div className="p-4 sm:p-6">
					{/* Edit Button - Always at top right */}
					<div className="flex justify-end mb-4">
						<Button
							type="primary"
							icon={<FaEdit />}
							onClick={() => navigate(`/businesses/${id}/edit`)}
						>
							Edit Business
						</Button>
					</div>

					{/* Business Info */}
					<div className="flex flex-row gap-4 sm:gap-6">
						{/* Logo */}
						<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
							{business.logo ? (
								<img
									src={business.logo}
									alt={`${business.name} logo`}
									className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
								/>
							) : (
								<FaImage className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
							)}
						</div>

						{/* Business Details */}
						<div className="flex-grow min-w-0">
							<Title level={4} className="!mb-2 !text-lg sm:!text-xl">
								{business.name || "Unnamed Business"}
							</Title>
							<div className="flex flex-wrap items-center gap-2 mb-2">
								<Tag color={business.status === "active" ? "success" : "error"}>
									{business.status}
								</Tag>
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
							<Text className="text-gray-500 text-sm block">
								Created {new Date(business.createdAt).toLocaleDateString()}
							</Text>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Business Information */}
				<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
					<div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
						<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
							<FaBuilding className="text-blue-500 text-lg" />
						</div>
						<Title level={5} className="!mb-0">
							Business Information
						</Title>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-2 gap-6">
							{[
								{ label: "Type", value: business.type },
								{ label: "Category", value: business.category },
								{ label: "Business Model", value: business.businessModel },
								{ label: "Operation Mode", value: business.operationMode },
								{
									label: "Inventory Management",
									value: (
										<Tag
											color={
												business.inventoryManagement ? "success" : "default"
											}
										>
											{business.inventoryManagement ? "Enabled" : "Disabled"}
										</Tag>
									),
								},
								{ label: "Escrow Wallet", value: business.escrowWallet },
							].map((item, index) => (
								<div key={index}>
									<Text className="text-gray-500 text-sm">{item.label}</Text>
									<Text strong className="block mt-1">
										{item.value || "Not specified"}
									</Text>
								</div>
							))}
						</div>
						<div className="mt-6 pt-6 border-t border-gray-200">
							<Text className="text-gray-500 text-sm">Description</Text>
							<Text className="block mt-2">
								{business.description || "No description provided"}
							</Text>
						</div>
					</div>
				</div>

				{/* Contact Information */}
				<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
					<div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
						<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
							<FaEnvelope className="text-blue-500 text-lg" />
						</div>
						<Title level={5} className="!mb-0">
							Contact Information
						</Title>
					</div>
					<div className="p-6">
						<div className="space-y-4">
							{[
								{
									icon: <FaGlobe className="text-gray-400" />,
									label: "Website",
									value: business.website,
									link: business.website,
								},
								{
									icon: <FaEnvelope className="text-gray-400" />,
									label: "Email",
									value: business.email,
									link: `mailto:${business.email}`,
								},
								{
									icon: <FaPhone className="text-gray-400" />,
									label: "Phone",
									value: business.phone,
									link: `tel:${business.phone}`,
								},
							].map((item, index) => (
								<div key={index} className="flex items-center gap-4">
									<div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
										{item.icon}
									</div>
									<div className="min-w-0 flex-grow">
										<Text className="text-gray-500 text-sm">{item.label}</Text>
										{item.value ? (
											<a
												href={item.link}
												target={item.label === "Website" ? "_blank" : undefined}
												rel={
													item.label === "Website"
														? "noopener noreferrer"
														: undefined
												}
												className="text-blue-500 hover:text-blue-600 block mt-1"
											>
												{item.value}
											</a>
										) : (
											<Text className="text-gray-500 block mt-1">
												Not specified
											</Text>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Categories */}
				<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
					<div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
						<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
							<FaStore className="text-blue-500 text-lg" />
						</div>
						<Title level={5} className="!mb-0">
							Categories
						</Title>
					</div>
					<div className="p-6">
						<div className="space-y-6">
							<div>
								<Text className="text-gray-500 text-sm block mb-3">
									Product Categories
								</Text>
								{business.productCategories?.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{business.productCategories.map((category, index) => (
											<Tag key={index}>{category}</Tag>
										))}
									</div>
								) : (
									<Text className="text-gray-500 italic">
										No product categories specified
									</Text>
								)}
							</div>
							<div>
								<Text className="text-gray-500 text-sm block mb-3">
									Service Categories
								</Text>
								{business.serviceCategories?.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{business.serviceCategories.map((category, index) => (
											<Tag key={index}>{category}</Tag>
										))}
									</div>
								) : (
									<Text className="text-gray-500 italic">
										No service categories specified
									</Text>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	const renderContent = () => {
		switch (selectedMenu) {
			case "overview":
				return renderOverview();
			case "team":
				return (
					<Card className="overflow-hidden !p-4">
						<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
									<FaUsers className="text-blue-500 text-lg" />
								</div>
								<Title level={5} className="!mb-0">
									Team Members
								</Title>
							</div>
							<Button type="primary" icon={<FaEdit />}>
								Add Member
							</Button>
						</div>
						{renderTeamMembers()}
					</Card>
				);
			case "locations":
				return (
					<Card className="overflow-hidden !p-4">
						<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
									<FaMapMarkerAlt className="text-blue-500 text-lg" />
								</div>
								<Title level={5} className="!mb-0">
									Locations
								</Title>
							</div>
						</div>
						{renderList(business.locations, "No locations specified")}
					</Card>
				);
			case "financial":
				return (
					<Card className="overflow-hidden !p-4">
						<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
									<FaWallet className="text-blue-500 text-lg" />
								</div>
								<Title level={5} className="!mb-0">
									Pricing & Financial
								</Title>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Text className="text-gray-500 block mb-1">Pricing Model</Text>
								<Text strong>{business.pricingModel || "Not specified"}</Text>
							</div>
							<div>
								<Text className="text-gray-500 block mb-1">Currency</Text>
								<Text strong>{business.currency || "Not specified"}</Text>
							</div>
						</div>
						<div className="mt-6">
							<Text className="text-gray-500 block mb-2">Payout Methods</Text>
							{business.payoutMethods?.length > 0 ? (
								<div className="flex flex-wrap gap-2">
									{business.payoutMethods.map((method, index) => (
										<Tag key={index}>{method}</Tag>
									))}
								</div>
							) : (
								<Text className="text-sm italic">
									No payout methods specified
								</Text>
							)}
						</div>
					</Card>
				);
			case "social_media":
				return (
					<Card className="overflow-hidden !p-4">
						<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
									<FaGlobe className="text-blue-500 text-lg" />
								</div>
								<Title level={5} className="!mb-0">
									Social Media
								</Title>
							</div>
						</div>
						<Tabs
							defaultActiveKey="connect"
							className="social-media-tabs"
							tabPosition="top"
							items={[
								{
									key: "connect",
									label: (
										<span className="flex items-center gap-2 whitespace-nowrap">
											<FaGlobe className="text-lg" />
											<span>Connect Platforms</span>
										</span>
									),
									children: (
										<div className="space-y-4 mt-4">
											{SOCIAL_ACCOUNTS.map((account) => {
												const platformData =
													business.socialMedia?.[account.key.toLowerCase()];
												const isConnected = platformData?.connected || false;

												return (
													<div
														key={account.key}
														className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-sm transition-all"
													>
														<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
															<div className="flex items-center gap-4">
																<span
																	className="text-2xl"
																	style={{ color: account.color }}
																>
																	{account.icon}
																</span>
																<div>
																	<Text className="font-medium block">
																		{account.name}
																	</Text>
																	<Text className="text-gray-500 text-sm">
																		{isConnected
																			? "Account connected and active"
																			: "Connect your account to enable integration"}
																	</Text>
																</div>
															</div>
															<div className="flex items-center gap-3">
																<Tag
																	color={isConnected ? "success" : "default"}
																	className="min-w-[100px] text-center"
																>
																	{isConnected ? "Connected" : "Not Connected"}
																</Tag>
																<Button
																	type={isConnected ? "default" : "primary"}
																	ghost={!isConnected}
																	size="small"
																	onClick={() => handleConnect(account.name)}
																	style={
																		!isConnected
																			? {
																					color: account.color,
																					borderColor: account.color,
																			  }
																			: {}
																	}
																>
																	{isConnected ? "Manage" : "Connect"}
																</Button>
															</div>
														</div>
													</div>
												);
											})}
										</div>
									),
								},
								...SOCIAL_ACCOUNTS.map((account) => {
									const platformData =
										business.socialMedia?.[account.key.toLowerCase()];
									const isConnected = platformData?.connected || false;

									return {
										key: account.key,
										label: (
											<span className="flex items-center gap-2 whitespace-nowrap">
												<span style={{ color: account.color }}>
													{account.icon}
												</span>
												<span>{account.name}</span>
											</span>
										),
										disabled: !isConnected,
										children: isConnected ? (
											<div className="space-y-6 mt-4">
												{/* Platform Status */}
												<div className="bg-gray-50 rounded-lg p-4">
													<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
														<div>
															<Text className="text-gray-500 block">
																Connection Status
															</Text>
															<Text strong className="text-green-600">
																Active
															</Text>
														</div>
														<Button type="primary" ghost size="small">
															Refresh Connection
														</Button>
													</div>
												</div>

												{/* Platform Details */}
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
													{Object.entries(platformData)
														.filter(
															([key]) =>
																![
																	"connected",
																	"accessToken",
																	"refreshToken",
																].includes(key)
														)
														.map(([key, value]) => (
															<div
																key={key}
																className="bg-white p-4 rounded-lg border border-gray-100"
															>
																<Text className="text-gray-500 block capitalize">
																	{key.replace(/([A-Z])/g, " $1").trim()}
																</Text>
																<Text strong className="block">
																	{value || "Not available"}
																</Text>
															</div>
														))}
												</div>

												{/* Platform Actions */}
												<div className="flex justify-end gap-3">
													<Button type="default" size="small">
														Sync Data
													</Button>
													<Button danger size="small">
														Disconnect
													</Button>
												</div>
											</div>
										) : (
											<div className="text-center py-12">
												<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
													{account.icon}
												</div>
												<Text className="text-gray-500 block">
													Connect your {account.name} account to view insights
												</Text>
												<Button
													type="primary"
													ghost
													className="mt-4"
													style={{
														color: account.color,
														borderColor: account.color,
													}}
													onClick={() => handleConnect(account.name)}
												>
													Connect {account.name}
												</Button>
											</div>
										),
									};
								}),
							]}
						/>
					</Card>
				);
			case "reviews":
				return (
					<Card className="overflow-hidden !p-4">
						<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
									<FaUsers className="text-blue-500 text-lg" />
								</div>
								<Title level={5} className="!mb-0">
									Customer Reviews
								</Title>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Text className="text-gray-500 block mb-1">Total Reviews</Text>
								<Text strong>
									{business.customerReviews?.totalReviews || 0}
								</Text>
							</div>
							<div>
								<Text className="text-gray-500 block mb-1">Average Rating</Text>
								<Text strong>
									{business.customerReviews?.averageRating || 0}/5
								</Text>
							</div>
						</div>
					</Card>
				);
			case "compliance":
				return (
					<Card className="overflow-hidden !p-4">
						<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
									<FaShieldAlt className="text-blue-500 text-lg" />
								</div>
								<Title level={5} className="!mb-0">
									Compliance Documents
								</Title>
							</div>
						</div>
						{renderList(
							business.complianceDocuments,
							"No compliance documents uploaded"
						)}
					</Card>
				);
			case "blockchain":
				return (
					<Card className="overflow-hidden !p-4">
						<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
									<FaWallet className="text-blue-500 text-lg" />
								</div>
								<Title level={5} className="!mb-0">
									Blockchain Information
								</Title>
							</div>
						</div>
						<div className="space-y-4">
							<div>
								<Text className="text-gray-500">Wallet Address</Text>
								<Text strong className="block font-mono">
									{business.walletAddress || "Not specified"}
								</Text>
							</div>
							<div>
								<Text className="text-gray-500">IPFS CID</Text>
								<Text strong className="block font-mono">
									{business.ipfsCid || "Not specified"}
								</Text>
							</div>
							<div>
								<Text className="text-gray-500">Last Update</Text>
								<Text strong className="block">
									{business.lastBlockchainUpdate
										? new Date(business.lastBlockchainUpdate).toLocaleString()
										: "Not specified"}
								</Text>
							</div>
						</div>
					</Card>
				);
			case "delete":
				return (
					<Card className="overflow-hidden !p-4">
						<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
									<FaTrash className="text-red-500 text-lg" />
								</div>
								<Title level={5} className="!mb-0">
									Delete Business
								</Title>
							</div>
						</div>
						<div className="space-y-6">
							<div className="bg-red-50 p-4 rounded-lg">
								<Text className="text-red-600">
									Warning: This action cannot be undone. All business data will
									be permanently deleted.
								</Text>
							</div>
							<Button
								danger
								type="primary"
								onClick={() => setShowDeleteModal(true)}
							>
								Delete Business
							</Button>
						</div>
					</Card>
				);
			default:
				return null;
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<LoadingSpinner message="Loading business details..." />
			</div>
		);
	}

	if (!business) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<ErrorMessage message="Business not found" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Main Content */}
			<div className="h-full">
				{/* Mobile Tabs */}
				<div className="md:hidden w-full sticky top-0 z-10 bg-white shadow-sm">
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
						className="px-4"
					/>
				</div>

				{/* Desktop and Mobile Content Layout */}
				<div className="flex h-full">
					{/* Desktop Sidebar */}
					<div className="hidden md:block w-64 bg-white border-r border-gray-200 min-h-screen">
						<div className="sticky top-0 overflow-y-auto h-screen">
							<Menu
								mode="inline"
								selectedKeys={[selectedMenu]}
								onClick={({ key }) => setSelectedMenu(key)}
								items={menuItems}
								className="border-r-0"
							/>
						</div>
					</div>

					{/* Content Area */}
					<div className="flex-1 min-h-screen">
						<div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl">
							{renderContent()}
						</div>
					</div>
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
		</div>
	);
};

export default BusinessDetails;
