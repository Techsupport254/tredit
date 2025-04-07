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
	LogoutOutlined,
	SwapOutlined,
} from "@ant-design/icons";
import {
	Button,
	Typography,
	Avatar,
	message,
	notification,
	Tooltip,
} from "antd";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { useAccount, USER_STATES } from "../../Context/AccountContext";
import { useAuth } from "../../Context/AuthContext";
import metamaskIcon from "../../assets/metamask.svg";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { setStorageItem, STORAGE_KEYS } from "../../utils/storage";
import { googleLogout } from "../../../firebaseConfig";

const API_URL =
	import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8000/api";

const { Title, Text } = Typography;

// Maximum number of EventSource reconnection attempts
const MAX_RECONNECT_ATTEMPTS = 3;

// Helper function to log token details
const logTokenDetails = (token, source) => {
	if (!token) {
		console.log(`❌ ProfileSetup: No token found from ${source}`);
		return;
	}

	try {
		// Split JWT and get payload part
		const parts = token.split(".");
		if (parts.length !== 3) {
			console.log(
				`⚠️ ProfileSetup: Invalid token format from ${source}:`,
				token
			);
			return;
		}

		// Decode the payload
		const payload = JSON.parse(atob(parts[1]));

		// Log token details including the full token
		console.log(`🔑 ProfileSetup: Token from ${source}:`, {
			token: token, // Full token for debugging
			iat: new Date(payload.iat * 1000).toLocaleString(),
			exp: new Date(payload.exp * 1000).toLocaleString(),
			expiresIn:
				Math.round((payload.exp - Date.now() / 1000) / 60) + " minutes",
			walletAddress: payload.walletAddress || payload.sub,
			id: payload.id,
		});
	} catch (error) {
		console.log(`⚠️ ProfileSetup: Error parsing token from ${source}:`, error);
		// Log the raw token even if parsing fails
		console.log(`🔑 ProfileSetup: Raw token from ${source}:`, token);
	}
};

const ProfileSetup = () => {
	const navigate = useNavigate();
	const { walletAddress, connectionState, userState, user } = useAccount();
	const {
		signInWithGoogle,
		googleUser,
		isLoading: authLoading,
		fetchUserData,
	} = useAuth();
	const [loading, setLoading] = useState(false);
	const [changingAccount, setChangingAccount] = useState(false);
	const [setupStatus, setSetupStatus] = useState({
		stage: "initial", // initial, google_auth, profile_creation, complete
		error: null,
	});

	const [messageApi, contextHolder] = message.useMessage();

	// Create refs to prevent re-renders due to function recreation
	const eventSourceRef = useRef(null);
	const redirectTimeoutRef = useRef(null);
	const isInitialRender = useRef(true);
	const reconnectAttemptsRef = useRef(0);
	const retryTimeoutRef = useRef(null);
	const isNavigatingRef = useRef(false);

	// Memoize steps to avoid re-rendering when they don't change
	const steps = useMemo(
		() => [
			{
				title: "Connect Wallet",
				description: walletAddress
					? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(
							-4
					  )}`
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
				completed: userState === USER_STATES.HAS_PROFILE && !changingAccount,
				current:
					!!walletAddress &&
					!!googleUser &&
					(userState !== USER_STATES.HAS_PROFILE || changingAccount),
				icon: <ProfileOutlined />,
			},
		],
		[walletAddress, googleUser, userState, changingAccount]
	);

	// Memoize features to avoid re-rendering when they don't change
	const features = useMemo(
		() => [
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
		],
		[]
	);

	// Check if user exists and redirect to dashboard
	useEffect(() => {
		if (
			userState === USER_STATES.HAS_PROFILE &&
			user &&
			!changingAccount &&
			!isNavigatingRef.current
		) {
			console.log("User has profile, redirecting to dashboard");
			isNavigatingRef.current = true;

			// Clear any existing timeout
			if (redirectTimeoutRef.current) {
				clearTimeout(redirectTimeoutRef.current);
			}

			// Use timeout to ensure state updates complete
			redirectTimeoutRef.current = setTimeout(() => {
				navigate("/dashboard");
				isNavigatingRef.current = false;
			}, 500);
		}

		return () => {
			if (redirectTimeoutRef.current) {
				clearTimeout(redirectTimeoutRef.current);
			}
		};
	}, [userState, user, navigate, changingAccount]);

	// Handle connection state changes with debounce
	useEffect(() => {
		if (connectionState === "disconnected" && !isNavigatingRef.current) {
			isNavigatingRef.current = true;
			const timeout = setTimeout(() => {
				navigate("/connect");
				isNavigatingRef.current = false;
			}, 500);
			return () => clearTimeout(timeout);
		}
	}, [connectionState, navigate]);

	// Handle Google user changes
	useEffect(() => {
		if (googleUser && !isInitialRender.current) {
			console.log("Google User Data:", {
				name: googleUser.name,
				email: googleUser.email,
				photoURL: googleUser.photoURL,
			});

			setSetupStatus((prev) => {
				if (prev.stage === "initial" || changingAccount) {
					return { ...prev, stage: "profile_creation" };
				}
				return prev;
			});

			if (changingAccount) {
				setChangingAccount(false);
			}
		}
		isInitialRender.current = false;
	}, [googleUser, changingAccount]);

	// Cleanup function for EventSource
	const cleanupEventSource = useCallback(() => {
		if (eventSourceRef.current) {
			console.log("Closing event source");
			eventSourceRef.current.close();
			eventSourceRef.current = null;
		}
		if (retryTimeoutRef.current) {
			clearTimeout(retryTimeoutRef.current);
			retryTimeoutRef.current = null;
		}
	}, []);

	// Memoize event handlers
	const handleIpfsUpdate = useCallback(
		(data) => {
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
									href={`${import.meta.env.VITE_PINATA_GATEWAY_URL}/ipfs/${
										data.data.cid
									}`}
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
		},
		[messageApi]
	);

	const handleBlockchainUpdate = useCallback(
		(data) => {
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
		},
		[messageApi]
	);

	// Setup event source for real-time updates with proper cleanup
	const setupEventSource = useCallback(() => {
		const token = localStorage.getItem(STORAGE_KEYS.token);

		if (!token || !walletAddress) {
			console.log("Missing token or wallet address for EventSource setup", {
				hasToken: !!token,
				hasWallet: !!walletAddress,
			});
			return;
		}

		// Log token being used for EventSource
		logTokenDetails(token, "EventSource setup");

		try {
			console.log("Setting up EventSource connection for profile setup events");
			cleanupEventSource(); // Clean up any existing connection

			const apiUrl =
				import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8000/api";
			const eventSourceUrl = `${apiUrl}/users/profile-setup-events?token=${token}`;

			console.log("EventSource URL:", eventSourceUrl);

			eventSourceRef.current = new EventSource(eventSourceUrl);

			eventSourceRef.current.onopen = () => {
				console.log("EventSource connection opened");
				reconnectAttemptsRef.current = 0;
			};

			eventSourceRef.current.addEventListener("ipfs-update", handleIpfsUpdate);
			eventSourceRef.current.addEventListener(
				"blockchain-update",
				handleBlockchainUpdate
			);
			eventSourceRef.current.addEventListener("error", (event) => {
				console.error("EventSource Error:", event);

				if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
					const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
					console.log(
						`Reconnecting in ${delay}ms... (attempt ${
							reconnectAttemptsRef.current + 1
						}/${MAX_RECONNECT_ATTEMPTS})`
					);

					cleanupEventSource();
					reconnectAttemptsRef.current++;

					retryTimeoutRef.current = setTimeout(setupEventSource, delay);
				} else {
					console.log(
						`Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached`
					);
					messageApi.error("Connection lost. Please refresh the page.");
					cleanupEventSource();
				}
			});
		} catch (error) {
			console.error("Error setting up EventSource:", error);
			messageApi.error("Failed to connect to server for live updates");
		}
	}, [
		messageApi,
		handleIpfsUpdate,
		handleBlockchainUpdate,
		cleanupEventSource,
		walletAddress,
	]);

	// Setup event source with proper cleanup
	useEffect(() => {
		if (setupStatus.stage === "profile_creation") {
			reconnectAttemptsRef.current = 0;
			setupEventSource();
		}
		return cleanupEventSource;
	}, [setupStatus.stage, setupEventSource, cleanupEventSource]);

	// Memoize showError function
	const showError = useCallback((error) => {
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
	}, []);

	const handleGoogleConnect = useCallback(async () => {
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
	}, [signInWithGoogle]);

	const handleChangeGoogleAccount = useCallback(async () => {
		try {
			setLoading(true);
			setChangingAccount(true);

			await googleLogout();

			message.loading({
				content: "Switching Google accounts...",
				key: "change-account",
			});

			setTimeout(() => {
				handleGoogleConnect();
			}, 500);
		} catch (error) {
			console.error("Error changing Google account:", error);
			message.error({
				content: "Failed to switch Google accounts: " + error.message,
				duration: 4,
			});
			setChangingAccount(false);
			setLoading(false);
		}
	}, [handleGoogleConnect]);

	const handleCreateProfile = useCallback(async () => {
		try {
			setLoading(true);
			messageApi.loading({
				content: "Creating profile...",
				key: "profile-creation",
			});

			console.log("Creating profile with data:", {
				walletAddress: walletAddress?.toLowerCase(),
				name: googleUser?.name,
				email: googleUser?.email,
			});

			// Correct API endpoint for user registration
			const response = await axios.post(`${API_URL}/register`, {
				walletAddress: walletAddress?.toLowerCase(),
				name: googleUser?.name,
				email: googleUser?.email,
				storeOnBlockchain: true,
			});

			console.log("Registration response:", response.data);

			if (response.data?.success) {
				// Store the new token and user data
				if (response.data.data?.token) {
					const token = response.data.data.token;
					const userData = response.data.data.user;

					// Log the new token from registration
					logTokenDetails(token, "profile registration");

					// Save to localStorage
					localStorage.setItem(STORAGE_KEYS.token, token);
					localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
					localStorage.setItem(
						STORAGE_KEYS.WALLET_ADDRESS,
						walletAddress?.toLowerCase()
					);

					// Set authorization header for future requests
					axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
					console.log(
						"ProfileSetup: Set Authorization header with token from registration"
					);

					// Show success message
					messageApi.success({
						content: "Profile created successfully!",
						key: "profile-creation",
						duration: 3,
					});

					// Try to fetch the profile using the correct endpoint
					try {
						const profileUrl = `${API_URL}/users/profile/${walletAddress?.toLowerCase()}`;
						console.log(
							"🔍 Fetching profile after registration from:",
							profileUrl
						);

						const profileResponse = await axios.get(profileUrl);
						console.log("👨‍💼 Profile response after registration:", {
							success: profileResponse.data?.success,
							hasUser: !!profileResponse.data?.user,
							statusCode: profileResponse.status,
						});

						// If profile is successfully fetched, update user data
						if (profileResponse.data?.success && profileResponse.data?.user) {
							const updatedUserData = profileResponse.data.user;
							localStorage.setItem(
								STORAGE_KEYS.USER,
								JSON.stringify(updatedUserData)
							);

							// Update AccountContext if possible
							if (typeof fetchUserData === "function") {
								try {
									console.log("Updating user data in AccountContext");
									await fetchUserData(token);
								} catch (fetchError) {
									console.error("Error updating account context:", fetchError);
								}
							}
						}
					} catch (profileError) {
						console.error(
							"Error fetching profile after registration:",
							profileError
						);
						// Continue with navigation even if profile fetch fails
					}

					// Navigate to dashboard after a short delay
					setTimeout(() => {
						navigate("/dashboard");
					}, 1000);
				} else {
					throw new Error("No token received after registration");
				}
			} else {
				throw new Error(response.data?.message || "Failed to create profile");
			}
		} catch (error) {
			console.error("Profile creation error:", error);
			messageApi.error({
				content:
					error.response?.data?.message ||
					error.message ||
					"Failed to create profile",
				key: "profile-creation",
				duration: 5,
			});

			// Handle specific error types based on API documentation
			if (error.response?.data) {
				// Handle validation errors (400)
				if (error.response.data.code === "VALIDATION_ERROR") {
					showError({
						message: "Validation Error",
						response: {
							data: {
								message: error.response.data.message || "Invalid input data",
								details: error.response.data.details,
							},
						},
					});
				}
				// Handle resource already exists (409)
				else if (error.response.data.code === "RESOURCE_EXISTS") {
					showError({
						message: "Registration Error",
						response: {
							data: {
								message:
									error.response.data.message || "Resource already exists",
							},
						},
					});
				}
				// Handle internal server errors (500)
				else if (error.response.data.code === "INTERNAL_ERROR") {
					showError({
						message: "Server Error",
						response: {
							data: {
								message: error.response.data.message || "Internal server error",
								details: error.response.data.details,
							},
						},
					});
				}
				// Handle any other errors
				else {
					showError(error);
				}
			} else {
				showError(error);
			}
		} finally {
			setLoading(false);
		}
	}, [
		walletAddress,
		googleUser,
		messageApi,
		navigate,
		fetchUserData,
		showError,
	]);

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
									<div className="bg-white rounded-lg p-6 mb-6 border border-gray-100">
										<div className="flex gap-4 items-center mb-3">
											<Avatar
												size={48}
												src={googleUser?.photoURL}
												icon={<UserOutlined />}
												alt={googleUser?.name || "User Avatar"}
												className="border border-gray-400 shrink-0"
												style={{
													objectFit: "cover",
													backgroundColor: !googleUser?.photoURL
														? "#1890ff"
														: undefined,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
												}}
												onError={(e) => {
													e.target.onerror = null; // Prevent infinite loop
													e.target.src = undefined; // Remove the broken image
												}}
												crossOrigin="anonymous"
											/>
											<div>
												<div className="font-medium">{googleUser?.name}</div>
												<div className="text-gray-500 text-sm">
													{googleUser?.email}
												</div>
											</div>
										</div>
										{/* Add change Google account button */}
										<Tooltip title="Connect different Google account">
											<Button
												icon={<SwapOutlined />}
												onClick={handleChangeGoogleAccount}
												size="small"
												disabled={loading}
												className="w-full"
											>
												Change Google Account
											</Button>
										</Tooltip>
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
