import { useNavigate } from "react-router-dom";
import { useAccount } from "../../Context/AccountContext";
import { useAuth } from "../../Context/AuthContext";
import {
	UserOutlined,
	SafetyOutlined,
	GoogleOutlined,
	CheckCircleFilled,
	ShopOutlined,
} from "@ant-design/icons";
import { Button, Typography, Avatar } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title, Text } = Typography;

const ProfileSetup = () => {
	const { walletAddress, linkGoogleProfile, googleUser } = useAccount();
	const { signInWithGoogle } = useAuth();
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(2);
	const [loading, setLoading] = useState(false);

	const steps = [
		{
			title: "Install MetaMask",
			description: "MetaMask extension is installed",
			completed: true,
			current: false,
		},
		{
			title: "Connect Wallet",
			description: walletAddress
				? `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(
						-4
				  )} connected`
				: "Not connected",
			completed: !!walletAddress,
			current: false,
		},
		{
			title: "Connect with Google",
			description: "Link your Google account to create your store",
			completed: !!googleUser,
			current: !googleUser,
		},
		{
			title: "Create Store",
			description: "Set up your store profile",
			completed: false,
			current: !!googleUser && currentStep === 3,
		},
	];

	const features = [
		{
			icon: <SafetyOutlined />,
			text: "Secure Authentication",
			desc: "Connect securely using your Google account",
		},
		{
			icon: <UserOutlined />,
			text: "Personalized Store",
			desc: "Create your store with your Google business profile",
		},
		{
			icon: <ShopOutlined />,
			text: "Business Dashboard",
			desc: "Access your personalized vendor dashboard",
		},
	];

	const handleGoogleConnect = async () => {
		try {
			setLoading(true);
			const loadingToast = toast.loading("Connecting to Google...");

			const googleUserData = await signInWithGoogle();

			if (!googleUserData) {
				throw new Error("Failed to get Google user data");
			}

			toast.update(loadingToast, {
				render: "Google account connected successfully!",
				type: "success",
				isLoading: false,
				autoClose: 3000,
			});

			setCurrentStep(3);
		} catch (error) {
			let errorMessage = "Failed to connect Google account";

			if (error.code === "auth/popup-closed-by-user") {
				errorMessage = "Google sign-in was cancelled";
			} else if (error.code === "auth/popup-blocked") {
				errorMessage =
					"Pop-up was blocked by browser. Please allow pop-ups for this site";
			} else if (error.message) {
				errorMessage = error.message;
			}

			toast.error(errorMessage);
			console.error("Google connection error:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateStore = async () => {
		try {
			setLoading(true);

			if (!googleUser || !walletAddress) {
				throw new Error("Please connect your Google account and wallet first");
			}

			const result = await linkGoogleProfile(walletAddress, {
				uid: googleUser.uid,
				email: googleUser.email,
				displayName: googleUser.name,
				photoURL: googleUser.photoURL,
				accessToken: googleUser.accessToken,
			});

			if (result) {
				toast.success(
					"Store created successfully! Redirecting to dashboard..."
				);
				setTimeout(() => {
					navigate("/dashboard");
				}, 2000);
			}
		} catch (error) {
			console.error("Store creation error:", error);
			toast.error(error.message || "Failed to create store");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
			<div className="w-[1000px] max-w-[90%] mx-auto bg-white rounded-xl overflow-hidden shadow-sm">
				<div className="grid grid-cols-1 md:grid-cols-[1fr,400px] min-h-[600px]">
					{/* Left Panel */}
					<div className="p-8 md:p-12 flex flex-col border-r border-gray-100">
						<Title level={3} className="mb-6">
							Create Your Store
						</Title>
						<Text type="secondary" className="block mb-8">
							Your wallet is connected. Continue with Google to create your
							store profile
						</Text>

						{/* Steps */}
						<div className="flex-grow mb-8">
							<div className="relative flex flex-col gap-8">
								{steps.map((step, index) => (
									<div key={index} className="flex items-start">
										{/* Step connector */}
										{index < steps.length - 1 && (
											<div
												className={`absolute left-[15px] h-8 w-[2px] mt-8
													${step.completed ? "bg-blue-500" : "bg-gray-200"}`}
												style={{ top: `${index * 80}px` }}
											/>
										)}

										{/* Step circle */}
										<div
											className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
												${
													step.completed
														? "bg-blue-500 text-white"
														: step.current
														? "bg-white border-2 border-blue-500 text-blue-500"
														: "bg-gray-100 text-gray-400"
												}`}
										>
											{step.completed ? (
												<CheckCircleFilled />
											) : (
												<Text className="text-sm">{index + 1}</Text>
											)}
										</div>

										{/* Step content */}
										<div className="ml-4 min-w-0">
											<Text
												strong
												className={step.current ? "text-blue-500" : ""}
											>
												{step.title}
											</Text>
											<Text type="secondary" className="text-sm block">
												{step.description}
											</Text>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Google Profile or Connect Button */}
						{googleUser ? (
							<>
								<div className="bg-white rounded-lg p-6 mb-6 border border-gray-100 flex gap-4 items-center">
									<Avatar
										size={48}
										src={googleUser.photoURL}
										alt={googleUser.name}
										className="flex-shrink-0"
									>
										{!googleUser.photoURL && <UserOutlined />}
									</Avatar>
									<div>
										<div className="font-medium">{googleUser.name}</div>
										<div className="text-gray-500 text-sm">
											{googleUser.email}
										</div>
									</div>
								</div>
								<Button
									type="primary"
									size="large"
									block
									onClick={handleCreateStore}
									className="mb-3"
									icon={<ShopOutlined />}
									loading={loading}
								>
									Create Store
								</Button>
								<Text type="secondary" className="text-sm text-center block">
									You can customize your store settings from the dashboard after
									creation
								</Text>
							</>
						) : (
							<Button
								icon={<GoogleOutlined />}
								onClick={handleGoogleConnect}
								size="large"
								block
								loading={loading}
								className="h-[45px] rounded-lg flex items-center justify-center gap-2"
							>
								Continue with Google
							</Button>
						)}
					</div>

					{/* Right Panel */}
					<div className="hidden md:flex flex-col justify-center p-12 bg-gray-50">
						<Title level={4} className="mb-8">
							Benefits of Google Integration
						</Title>

						<div className="space-y-8">
							{features.map((feature, index) => (
								<div key={index} className="flex items-start gap-4">
									<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">
										{feature.icon}
									</div>
									<div>
										<Text strong className="block mb-1">
											{feature.text}
										</Text>
										<Text type="secondary">{feature.desc}</Text>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfileSetup;
