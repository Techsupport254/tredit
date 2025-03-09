import {
	UserOutlined,
	GoogleOutlined,
	CheckCircleFilled,
	WalletOutlined,
	SecurityScanOutlined,
	ProfileOutlined,
	CloudOutlined,
	LockOutlined,
	InfoCircleOutlined,
	WarningOutlined,
	CloseCircleFilled,
} from "@ant-design/icons";
import { Button, Typography, Avatar, message, notification } from "antd";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAccount } from "../../Context/AccountContext";
import { useAuth } from "../../Context/AuthContext";
import metamaskIcon from "../../assets/metamask.svg";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ProfileSetup = () => {
	const navigate = useNavigate();
	const { walletAddress, connectionState } = useAccount();
	const {
		signInWithGoogle,
		googleUser,
		isLoading: authLoading,
		fetchUserData,
	} = useAuth();
	const [loading, setLoading] = useState(false);
	const [setupStatus, setSetupStatus] = useState({
		stage: "initial", // initial, google_auth, profile_creation, complete
		error: null,
	});

	const [messageApi, contextHolder] = message.useMessage();

	// Listen for wallet disconnection
	useEffect(() => {
		const handleDisconnect = () => {
			navigate("/connect");
		};

		window.addEventListener("walletDisconnected", handleDisconnect);
		return () =>
			window.removeEventListener("walletDisconnected", handleDisconnect);
	}, [navigate]);

	// Handle connection state changes
	useEffect(() => {
		if (connectionState === "disconnected") {
			navigate("/connect");
		}
	}, [connectionState, navigate]);

	// Handle Google user changes
	useEffect(() => {
		if (googleUser) {
			setSetupStatus((prev) => ({
				...prev,
				stage: prev.stage === "initial" ? "profile_creation" : prev.stage,
			}));
		}
	}, [googleUser]);

	// Setup event source for real-time updates
	useEffect(() => {
		let eventSource;

		const setupEventSource = () => {
			eventSource = new EventSource("/api/events");

			eventSource.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					if (data.type === "ipfs") {
						handleIpfsUpdate(data);
					} else if (data.type === "blockchain") {
						handleBlockchainUpdate(data);
					}
				} catch (error) {
					console.error("Error parsing event data:", error);
				}
			};

			eventSource.onerror = (error) => {
				console.error("EventSource failed:", error);
				eventSource.close();
			};
		};

		if (setupStatus.stage === "profile_creation") {
			setupEventSource();
		}

		return () => {
			if (eventSource) {
				eventSource.close();
			}
		};
	}, [setupStatus.stage]);

	const handleIpfsUpdate = (data) => {
		if (data.error) {
			notification.error({
				message: "IPFS Upload Failed",
				description: data.error,
				duration: 0,
				icon: <CloseCircleFilled className="text-red-500" />,
			});
			return;
		}

		if (data.state === "COMPLETED" && data.data) {
			notification.success({
				message: "IPFS Upload Successful",
				description: (
					<div className="space-y-2">
						<p>Your profile has been stored on IPFS</p>
						<div className="text-sm">
							<p>CID: {data.data.cid}</p>
							<a
								href={`https://gateway.pinata.cloud/ipfs/${data.data.cid}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-500 hover:text-blue-600"
							>
								View on IPFS
							</a>
						</div>
					</div>
				),
				icon: <CheckCircleFilled className="text-green-500" />,
				duration: 0,
			});
		} else if (data.message) {
			messageApi.info(data.message);
		}
	};

	const handleBlockchainUpdate = (data) => {
		if (data.error) {
			notification.error({
				message: "Blockchain Transaction Failed",
				description: data.error,
				duration: 0,
				icon: <CloseCircleFilled className="text-red-500" />,
			});
			return;
		}

		if (data.state === "COMPLETED" && data.data) {
			notification.success({
				message: "Transaction Successful",
				description: (
					<div className="space-y-2">
						<p>Your profile has been stored on the blockchain</p>
						<div className="text-sm">
							<p>Transaction Hash: {data.data.txHash}</p>
							<a
								href={data.data.explorerUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-500 hover:text-blue-600"
							>
								View on Explorer
							</a>
						</div>
					</div>
				),
				icon: <CheckCircleFilled className="text-green-500" />,
				duration: 0,
			});
		} else if (data.message) {
			messageApi.info(data.message);
		}
	};

	const steps = [
		{
			title: "Connect Wallet",
			description: walletAddress
				? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
				: "Not connected",
			completed: !!walletAddress,
			current: false,
			icon: <WalletOutlined />,
		},
		{
			title: "Connect with Google",
			description: googleUser
				? `Connected as ${googleUser.email}`
				: "Sign in with Google",
			completed: !!googleUser,
			current: !googleUser && !!walletAddress,
			icon: <GoogleOutlined />,
		},
		{
			title: "Create Profile",
			description: "Complete your profile setup",
			completed: setupStatus.stage === "complete",
			current:
				!!walletAddress && !!googleUser && setupStatus.stage !== "complete",
			icon: <ProfileOutlined />,
		},
	];

	const features = [
		{
			icon: <SecurityScanOutlined />,
			text: "Secure Profile",
			desc: "Your profile data is securely stored on IPFS and blockchain",
		},
		{
			icon: <UserOutlined />,
			text: "Google Integration",
			desc: "Seamlessly import your Google profile information",
		},
		{
			icon: <CloudOutlined />,
			text: "Decentralized Storage",
			desc: "Profile data stored on IPFS for permanent accessibility",
		},
		{
			icon: <LockOutlined />,
			text: "Verified Identity",
			desc: "Link your wallet and Google account for enhanced security",
		},
	];

	const showError = (error) => {
		const errorMessage = error.response?.data?.message || error.message;
		const errorDetails = error.response?.data?.error || error;

		notification.error({
			message: "Error Creating Profile",
			description: (
				<div>
					<p>{errorMessage}</p>
					{errorDetails.code && (
						<p className="text-sm text-red-600 mt-2">
							Error Code: {errorDetails.code}
							{errorDetails.shortMessage && ` - ${errorDetails.shortMessage}`}
						</p>
					)}
					{errorDetails.argument && (
						<p className="text-sm text-red-600">
							Invalid Argument: {errorDetails.argument}
						</p>
					)}
				</div>
			),
			duration: 0,
			icon: <WarningOutlined className="text-red-500" />,
		});
	};

	const handleGoogleConnect = async () => {
		const messageKey = "google-connect";
		try {
			setLoading(true);
			message.loading({ content: "Connecting to Google...", key: messageKey });

			const result = await signInWithGoogle();
			if (result?.userData) {
				message.success({
					content: "Google account connected successfully!",
					key: messageKey,
					duration: 3,
				});
				setSetupStatus((prev) => ({ ...prev, stage: "profile_creation" }));
			} else {
				throw new Error(result?.error || "Failed to connect Google account");
			}
		} catch (error) {
			console.error("Google sign-in error:", error);
			message.error({
				content: error.message,
				key: messageKey,
				duration: 4,
			});
			setSetupStatus((prev) => ({
				...prev,
				error: error.message,
			}));
		} finally {
			setLoading(false);
		}
	};

	const handleCreateProfile = async () => {
		setSetupStatus({ stage: "profile_creation", error: null });
		const key = "profile-creation";

		try {
			if (!walletAddress || !googleUser) {
				showError(
					new Error("Please connect your wallet and Google account first")
				);
				return;
			}

			setLoading(true);
			message.loading({
				content: "Starting profile creation...",
				key,
				duration: 0,
			});

			// Get provider and signer
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Create message for signature
			const signatureMessage =
				`Welcome to Tredit!\n\nPlease sign this message to verify your wallet ownership.\n\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}\n\nThis signature will not trigger a blockchain transaction or cost any gas fees.`.trim();

			notification.info({
				message: "Signature Required",
				description: "Please sign the message in your wallet to continue",
				icon: <InfoCircleOutlined className="text-blue-500" />,
			});

			const signature = await signer.signMessage(signatureMessage);

			message.loading({
				content: "Creating your profile...",
				key,
				duration: 0,
			});

			// Prepare user profile data
			const profileData = {
				walletAddress: walletAddress.toLowerCase(),
				email: googleUser.email,
				name: googleUser.name,
				profileImage: googleUser.photoURL,
				uid: googleUser.uid,
				acceptBlockchainStorage: true,
				signature,
				signatureMessage,
				preferences: {
					theme: "light",
					language: "en",
					notifications: {
						push: true,
						email: true,
					},
				},
			};

			// Register user
			const response = await axios.post("/users/register", profileData);

			if (response.data?.success) {
				const token = response.data.token;
				if (token) {
					axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
				}

				setSetupStatus({ stage: "complete", error: null });
				message.success({
					content: "Profile created successfully!",
					key,
					duration: 2,
				});

				// Update user data in auth context
				if (response.data.user && fetchUserData) {
					await fetchUserData();
				}

				// Navigate to dashboard immediately
				navigate("/dashboard");
			}
		} catch (error) {
			console.error("Profile creation error:", error);
			message.error({
				content: error.message,
				key,
				duration: 4,
			});
			showError(error);
			setSetupStatus({
				stage: "profile_creation",
				error: error.response?.data?.message || error.message,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{contextHolder}
			<div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
				<div className="w-[1000px] max-w-[90%] mx-auto bg-white rounded-xl overflow-hidden shadow-sm">
					<div className="grid grid-cols-1 md:grid-cols-2">
						{/* Left Panel */}
						<div className="p-8 md:p-12 flex flex-col border-r border-gray-100">
							<div className="mb-12">
								<img
									src={metamaskIcon}
									alt="MetaMask"
									className="h-8 w-auto mb-6"
								/>
								<Title level={2} className="mb-2">
									Complete Your Profile
								</Title>
								<Text type="secondary">
									Your wallet is connected. Continue with Google to complete
									your profile setup
								</Text>
							</div>

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
												{step.completed ? <CheckCircleFilled /> : step.icon}
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
										onClick={handleCreateProfile}
										className="h-[45px] rounded-lg"
										loading={loading}
										disabled={loading || !walletAddress || !googleUser}
									>
										{loading ? "Creating Profile..." : "Create Profile"}
									</Button>
								</>
							) : (
								<Button
									icon={<GoogleOutlined />}
									onClick={handleGoogleConnect}
									size="large"
									block
									loading={loading || authLoading}
									disabled={loading || authLoading || !walletAddress}
									className="h-[45px] rounded-lg flex items-center justify-center gap-2"
								>
									Continue with Google
								</Button>
							)}
						</div>

						{/* Right Panel */}
						<div className="hidden md:flex flex-col justify-center p-12 bg-gray-50">
							<Title level={4} className="mb-8">
								Benefits of Profile Setup
							</Title>

							<div className="space-y-8">
								{features.map((feature, index) => (
									<div key={index} className="flex items-start gap-4">
										<div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 text-xl">
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
		</>
	);
};

export default ProfileSetup;
