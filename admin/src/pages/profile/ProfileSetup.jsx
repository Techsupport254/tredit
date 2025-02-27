import { useEffect, useState } from "react";
import {
	Typography,
	Avatar,
	Spin,
	Button,
	Grid,
	Card,
	Modal,
	Form,
	message,
} from "antd";
import {
	GoogleOutlined,
	LogoutOutlined,
	UserOutlined,
	EditOutlined,
	PhoneOutlined,
	CalendarOutlined,
	EnvironmentFilled,
	LoadingOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { useAuth } from "../../Context/AuthContext";
import moment from "moment";
import ModalForm from "../../Components/Profile/ModalForm";
import SocialMedia from "../../Components/Profile/SocialMedia";
import NotLoggedIn from "../../Components/NotLoggedIn";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Styled Components
const ProfileContainer = styled(motion.div)`
	background: linear-gradient(145deg, #ffffff, #f8f9fa);
	border-radius: 2rem;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
	overflow: hidden;
	position: relative;
	max-width: 2xl;
	padding: 0;
	margin: 0;
`;

const HeaderSection = styled.div`
	background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
	padding: 3rem 2rem;
	text-align: center;
	position: relative;
	overflow: hidden;

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			45deg,
			rgba(255, 255, 255, 0.05) 25%,
			transparent 25%,
			transparent 50%,
			rgba(255, 255, 255, 0.05) 50%,
			rgba(255, 255, 255, 0.05) 75%,
			transparent 75%,
			transparent
		);
		background-size: 50px 50px;
		opacity: 0.1;
	}

	@media (min-width: 1024px) {
		padding: 4rem 3rem;
	}
`;

const EditableField = styled(motion.div)`
	padding: 1.5rem;
	background: ${(props) => (props.theme === "dark" ? "#f8fafc" : "#fff")};
	border-radius: 1rem;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
	border: 1px solid rgba(209, 213, 219, 0.3);

	&:hover {
		transform: translateY(-3px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -4px rgba(0, 0, 0, 0.1);
		border-color: #3b82f6;
	}
`;

const ActionButton = styled(Button)`
	height: 50px;
	font-size: 1rem;
	border-radius: 0.75rem;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;

	&:hover {
		transform: translateY(-2px);
	}
`;

const StyledAvatar = styled(Avatar)`
	border: 3px solid rgba(255, 255, 255, 0.2);
	box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
`;

const ProfileSetup = () => {
	const {
		user,
		setUser,
		logout,
		loading,
		signInWithGoogle,
		fetchYouTubeData,
		registerUser,
	} = useAuth();
	const screens = useBreakpoint();
	const [editData, setEditData] = useState({});
	const [isEditing, setIsEditing] = useState(false);
	const [expandedSocial, setExpandedSocial] = useState(null);
	const [form] = Form.useForm();
	const [savingChanges, setSavingChanges] = useState(false);

	// Update editData when user changes
	useEffect(() => {
		if (user) {
			setEditData({
				name: user.name || "",
				email: user.email || "",
				phone: user.phone || "",
				gender: user.gender || "",
				dob: user.dob || "",
				location: user.location || "",
				bio: user.bio || "",
			});
			form.setFieldsValue({
				...user,
				dob: user.dob ? moment(user.dob) : null,
			});
		}
	}, [user, form]);

	// Profile fields configuration
	const profileFields = [
		{ label: "Name", key: "name", icon: <UserOutlined /> },
		{ label: "Email", key: "email", icon: <GoogleOutlined /> },
		{ label: "Phone", key: "phone", icon: <PhoneOutlined /> },
		{ label: "Gender", key: "gender", icon: <UserOutlined /> },
		{ label: "Birth Date", key: "dob", icon: <CalendarOutlined /> },
		{ label: "Location", key: "location", icon: <EnvironmentFilled /> },
	];

	// Handle saving profile changes
	const handleSave = async (values) => {
		console.log("Saving profile with values:", values);
		setSavingChanges(true);

		try {
			const formattedValues = {
				...values,
				dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
			};

			// Update local user state
			setUser((prevUser) => ({ ...prevUser, ...formattedValues }));

			// Notify user of success
			message.success("Profile updated successfully");
			setIsEditing(false);
		} catch (error) {
			console.error("Profile update error:", error);
			message.error("Error updating profile. Please try again.");
		} finally {
			setSavingChanges(false);
		}
	};

	// Check if profile is complete
	const isProfileComplete = () => {
		const requiredFields = [
			"name",
			"email",
			"phone",
			"gender",
			"dob",
			"location",
		];
		const missingFields = requiredFields.filter((field) => !editData[field]);
		return missingFields.length === 0;
	};

	return (
		<div className="flex justify-center items-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
			{user?.uid === null ? (
				<NotLoggedIn />
			) : (
				<ProfileContainer
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.4, type: "spring" }}
					className="w-full max-w-2xl"
				>
					<AnimatePresence>
						{loading && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50 rounded-2xl backdrop-blur-sm"
							>
								<Spin
									size="large"
									tip={
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
										>
											Loading Profile...
										</motion.div>
									}
								/>
							</motion.div>
						)}
					</AnimatePresence>

					<HeaderSection>
						<motion.div
							initial={{ scale: 0, rotate: -45 }}
							animate={{ scale: 1, rotate: 0 }}
							transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
						>
							<StyledAvatar
								size={screens.xs ? 96 : 120}
								src={user?.photoURL}
								icon={<UserOutlined />}
								className="shadow-xl"
							/>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
						>
							<Title
								level={2}
								className="mt-6 text-white mb-1 lg:text-4xl font-bold"
							>
								{editData.name}
							</Title>
							<Text className="text-blue-100 font-medium text-lg opacity-90">
								{editData.email}
							</Text>
						</motion.div>
					</HeaderSection>

					<div className="p-6 lg:p-8 space-y-8">
						<motion.div
							className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.6 }}
						>
							{profileFields.map((field, index) => (
								<EditableField
									key={field.key}
									theme={index % 2 === 0 ? "light" : "dark"}
									onClick={() => setIsEditing(true)}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.8 + index * 0.1 }}
								>
									<div className="flex items-center gap-4 text-gray-600">
										<span className="text-blue-500 text-xl">{field.icon}</span>
										<div className="w-full">
											<div className="text-sm text-gray-400 mb-1">
												{field.label}
											</div>
											<div className="font-medium text-gray-800 text-lg truncate">
												{editData[field.key] || (
													<span className="text-gray-400">Not set</span>
												)}
											</div>
										</div>
									</div>
								</EditableField>
							))}
						</motion.div>

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 1 }}
						>
							<Card
								title={
									<span className="text-xl font-semibold text-gray-800">
										About Me
									</span>
								}
								bordered={false}
								className="shadow-lg rounded-xl mt-4 border border-gray-100"
								headStyle={{ borderBottom: "1px solid #e5e7eb" }}
							>
								<Text className="text-gray-600 text-base leading-relaxed">
									{editData.bio || (
										<span className="text-gray-400 italic">
											No bio available
										</span>
									)}
								</Text>
							</Card>
						</motion.div>

						{user?.uid !== null && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 1.2 }}
							>
								<SocialMedia
									expandedSocial={expandedSocial}
									setExpandedSocial={setExpandedSocial}
									fetchYouTubeData={fetchYouTubeData}
								/>
							</motion.div>
						)}

						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 w-full">
							{user?.uid !== null && (
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="w-full sm:w-auto"
								>
									<ActionButton
										type="primary"
										icon={<EditOutlined />}
										size="large"
										className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white w-full sm:w-auto"
										onClick={() => setIsEditing(true)}
									>
										Edit Profile
									</ActionButton>
								</motion.div>
							)}

							<div className="flex flex-col sm:flex-row gap-4 w-full">
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="w-full"
								>
									{user?.uid ? (
										<ActionButton
											danger
											icon={<LogoutOutlined />}
											onClick={logout}
											size="large"
											className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white w-full sm:w-auto"
										>
											Logout
										</ActionButton>
									) : (
										<ActionButton
											type="primary"
											size="large"
											className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white w-full sm:w-auto"
											onClick={signInWithGoogle}
										>
											<GoogleOutlined /> Sign In
										</ActionButton>
									)}
								</motion.div>

								{user?.uid !== null && (
									<motion.div
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="w-full sm:w-auto"
									>
										<ActionButton
											type="primary"
											size="large"
											className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white w-full sm:w-auto"
											onClick={() => registerUser(user)}
											disabled={
												!isProfileComplete() || savingChanges || loading
											}
										>
											{loading ? (
												<div className="flex items-center gap-2">
													<Spin
														indicator={
															<LoadingOutlined
																spin
																style={{ color: "white" }}
															/>
														}
														size="medium"
													/>
													Saving
												</div>
											) : (
												<div className="flex items-center gap-2">Continue</div>
											)}
										</ActionButton>
									</motion.div>
								)}
							</div>
						</div>
					</div>

					{/* Edit Profile Modal */}
					<Modal
						title={
							<div className="text-xl font-semibold text-gray-800">
								Edit Profile
							</div>
						}
						open={isEditing}
						onCancel={() => setIsEditing(false)}
						footer={[
							<div key="spacer" className="flex justify-between">
								<ActionButton
									key="cancel"
									onClick={() => setIsEditing(false)}
									className="h-10 px-6 rounded-lg"
								>
									Cancel
								</ActionButton>
								<ActionButton
									key="save"
									type="primary"
									onClick={() => form.submit()}
									className="h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 border-none"
								>
									{savingChanges ? (
										<div className="flex items-center gap-2">
											<Spin
												indicator={
													<LoadingOutlined spin style={{ color: "white" }} />
												}
												size="medium"
											/>
											Saving
										</div>
									) : (
										<div className="flex items-center gap-2">Save Changes</div>
									)}
								</ActionButton>
							</div>,
						]}
						bodyStyle={{ padding: "24px 0" }}
						className="rounded-xl"
					>
						<ModalForm
							form={form}
							editData={editData}
							initialValues={editData}
							profileFields={profileFields}
							setIsEditing={setIsEditing}
							savingChanges={savingChanges}
							handleSave={handleSave}
						/>
					</Modal>
				</ProfileContainer>
			)}
		</div>
	);
};

export default ProfileSetup;
