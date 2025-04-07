import { useEffect, useState, useCallback, useMemo } from "react";
import { useAccount } from "../../Context/AccountContext";
import { CONNECTION_STATES, USER_STATES } from "../../Context/AccountContext";
import { useAuth } from "../../Context/AuthContext";
import { Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import {
	UserOutlined,
	CheckCircleFilled,
	LoadingOutlined,
	CloseCircleFilled,
	WalletOutlined,
	GlobalOutlined,
	AccountBookOutlined,
	SecurityScanOutlined,
	CloudOutlined,
	LockOutlined,
} from "@ant-design/icons";
import metamaskIcon from "../../assets/metamask.svg";
import PropTypes from "prop-types";
import axios from "axios";
import {
	setStorageItem,
	getStorageItem,
	STORAGE_KEYS,
} from "../../utils/storage";

const API_URL =
	import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8000/api";

const { Title, Text } = Typography;

// Define features array for the right panel
const features = [
	{
		icon: <SecurityScanOutlined />,
		text: "Secure Authentication",
		desc: "Connect securely with Web3 wallet integration",
	},
	{
		icon: <CloudOutlined />,
		text: "Cross-Platform Access",
		desc: "Access your account from any device",
	},
	{
		icon: <LockOutlined />,
		text: "Data Protection",
		desc: "Your data is encrypted and protected",
	},
];

// Define steps for the connection process
const steps = [
	{
		title: "Connect Wallet",
		description: "Connect your Web3 wallet to get started",
		completed: false,
		current: true,
	},
	{
		title: "Verify Account",
		description: "Verify your wallet ownership",
		completed: false,
		current: false,
	},
	{
		title: "Access Platform",
		description: "Start using the platform features",
		completed: false,
		current: false,
	},
];

// Memoize ConnectionStatus component
const ConnectionStatus = ({
	connectionState,
	connectionError,
	walletAddress,
	networkName,
	balance,
	loading,
}) => {
	const getStatusIcon = useCallback(() => {
		switch (connectionState) {
			case CONNECTION_STATES.INITIALIZING:
				return <LoadingOutlined className="text-blue-500" />;
			case CONNECTION_STATES.CONNECTED:
				return <CheckCircleFilled className="text-green-500" />;
			case CONNECTION_STATES.ERROR:
				return <CloseCircleFilled className="text-red-500" />;
			default:
				return null;
		}
	}, [connectionState]);

	const getStatusMessage = useCallback(() => {
		switch (connectionState) {
			case CONNECTION_STATES.INITIALIZING:
				return "Connecting Wallet";
			case CONNECTION_STATES.CONNECTED:
				return "Connection Successful";
			case CONNECTION_STATES.ERROR:
				return "Connection Error";
			default:
				return "";
		}
	}, [connectionState]);

	if (
		!loading &&
		connectionState === CONNECTION_STATES.DISCONNECTED &&
		!connectionError &&
		!walletAddress
	) {
		return null;
	}

	return (
		<div className="mb-6 p-4 bg-white rounded-lg border border-gray-100">
			<div className="flex items-center gap-2 mb-2">
				{getStatusIcon()}
				<Text
					strong
					className={
						connectionState === CONNECTION_STATES.ERROR
							? "text-red-500"
							: connectionState === CONNECTION_STATES.CONNECTED
							? "text-green-500"
							: "text-blue-500"
					}
				>
					{getStatusMessage()}
				</Text>
			</div>

			{connectionError && (
				<Text className="text-red-500 text-sm block mt-1">
					{connectionError}
				</Text>
			)}

			{walletAddress && connectionState === CONNECTION_STATES.CONNECTED && (
				<div className="mt-2 pt-2 border-t border-gray-100">
					<div className="text-sm text-gray-600">
						<div className="flex items-center gap-2">
							<WalletOutlined />
							<span>
								{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
							</span>
						</div>
						{networkName && (
							<div className="flex items-center gap-2 mt-1">
								<GlobalOutlined />
								<span>{networkName}</span>
							</div>
						)}
						{balance && (
							<div className="flex items-center gap-2 mt-1">
								<AccountBookOutlined />
								<span>{Number(balance).toFixed(4)} MATIC</span>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

ConnectionStatus.propTypes = {
	connectionState: PropTypes.string,
	connectionError: PropTypes.string,
	walletAddress: PropTypes.string,
	networkName: PropTypes.string,
	balance: PropTypes.string,
	loading: PropTypes.bool,
};

const ConnectWallet = ({ className = "" }) => {
	const navigate = useNavigate();
	const {
		walletAddress,
		connectWallet,
		loading: accountLoading,
		networkName,
		balance,
		connectionState,
		connectionError,
		userState,
		token,
		user,
		isConnected,
		isConnecting,
		errorMessage,
	} = useAccount();

	const [state, setState] = useState({
		isMetaMaskInstalled: false,
		isMobileDevice: false,
		loading: false,
		error: null,
		status: null,
	});

	// Add navigation effect
	useEffect(() => {
		// Only navigate if we have all the necessary authentication data
		if (connectionState === CONNECTION_STATES.CONNECTED && token && user) {
			console.log("✅ User authenticated, navigating to dashboard");
			navigate("/dashboard", { replace: true });
			return;
		}

		// Handle case where user needs to create profile
		if (
			connectionState === CONNECTION_STATES.CONNECTED &&
			userState === USER_STATES.NO_PROFILE
		) {
			console.log("⚠️ User needs profile, navigating to profile setup");
			navigate("/profile-setup", { replace: true });
			return;
		}
	}, [connectionState, token, user, userState, navigate]);

	// Handle connect button click
	const handleConnect = useCallback(async () => {
		try {
			await connectWallet();
		} catch (error) {
			console.error("Error in connect handler:", error);
		}
	}, [connectWallet]);

	// Clean up navigation flags when component unmounts
	useEffect(() => {
		return () => {
			sessionStorage.removeItem("hasNavigatedFromConnect");
		};
	}, []);

	// Check wallet detection and update UI based on error state
	useEffect(() => {
		if (connectionError && connectionError.includes("No connected accounts")) {
			setState((prev) => ({
				...prev,
				error: connectionError,
			}));
		}
	}, [connectionError]);

	// Check MetaMask installation and if using mobile device
	useEffect(() => {
		const checkMetaMaskAndDevice = async () => {
			// Check if mobile device
			const isMobile =
				/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
					navigator.userAgent
				);

			// Check for MetaMask - more robust detection
			let isInstalled = false;

			if (typeof window.ethereum !== "undefined") {
				// Primary check
				isInstalled = window.ethereum.isMetaMask;

				// Secondary checks
				if (!isInstalled && window.ethereum.providers) {
					// Check if MetaMask is in the providers array
					isInstalled = window.ethereum.providers.some(
						(provider) => provider.isMetaMask
					);
				}
			}

			console.log("Wallet detection:", {
				isMobile,
				isMetaMaskInstalled: isInstalled,
			});

			setState((prev) => ({
				...prev,
				isMobileDevice: isMobile,
				isMetaMaskInstalled: isInstalled,
			}));
		};
		checkMetaMaskAndDevice();
	}, []);

	// Memoize features array
	const features = useMemo(
		() => [
			{
				icon: <SecurityScanOutlined />,
				text: "Secure Authentication",
				desc: "Connect securely using your Web3 wallet",
			},
			{
				icon: <UserOutlined />,
				text: "Personalized Experience",
				desc: "Create and manage your profile",
			},
			{
				icon: <CloudOutlined />,
				text: "Decentralized Storage",
				desc: "Access all platform features securely",
			},
			{
				icon: <LockOutlined />,
				text: "Blockchain Integration",
				desc: "Store your data securely on the blockchain",
			},
		],
		[]
	);

	// Memoize getStepDescription callback
	const getStepDescription = useCallback(
		(step) => {
			if (step.completed) {
				return step.title === "Connect Wallet" && walletAddress
					? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(
							-4
					  )}${networkName ? ` (${networkName})` : ""}`
					: "Completed";
			}
			if (step.current) {
				if (step.title === "Install MetaMask") {
					return state.isMobileDevice
						? "Get the MetaMask mobile app"
						: "Get the MetaMask browser extension";
				}
				if (step.title === "Connect Wallet") {
					return state.loading
						? "Connecting..."
						: "Click to connect your wallet";
				}
				if (step.title === "Connect with Google") {
					return "Link your Google account to complete setup";
				}
			}
			return step.description;
		},
		[walletAddress, networkName, state.loading, state.isMobileDevice]
	);

	// Memoize steps array after getStepDescription is defined
	const steps = useMemo(
		() => [
			{
				title: "Install MetaMask",
				description:
					state.isMetaMaskInstalled || state.isMobileDevice
						? "MetaMask is available"
						: state.isMobileDevice
						? "Get the MetaMask mobile app"
						: "Get the MetaMask browser extension",
				completed: state.isMetaMaskInstalled || state.isMobileDevice,
				current: !state.isMetaMaskInstalled && !state.isMobileDevice,
			},
			{
				title: "Connect Wallet",
				description: getStepDescription({
					title: "Connect Wallet",
					completed:
						connectionState === CONNECTION_STATES.CONNECTED && !!walletAddress,
					current:
						(state.isMetaMaskInstalled || state.isMobileDevice) &&
						!walletAddress,
				}),
				completed:
					connectionState === CONNECTION_STATES.CONNECTED && !!walletAddress,
				current:
					(state.isMetaMaskInstalled || state.isMobileDevice) &&
					(!walletAddress || connectionState !== CONNECTION_STATES.CONNECTED),
			},
			{
				title: "Connect with Google",
				description: "Link your Google account to complete setup",
				completed: false,
				current:
					connectionState === CONNECTION_STATES.CONNECTED && !!walletAddress,
			},
		],
		[
			state.isMetaMaskInstalled,
			connectionState,
			walletAddress,
			getStepDescription,
			state.isMobileDevice,
		]
	);

	// Memoize button properties
	const buttonProps = useMemo(() => {
		if (isConnecting) {
			return {
				isLoading: true,
				loadingText: "Connecting...",
				disabled: true,
			};
		}

		if (isConnected && walletAddress) {
			return {
				disabled: true,
				children: `Connected: ${walletAddress.slice(
					0,
					6
				)}...${walletAddress.slice(-4)}`,
			};
		}

		if (errorMessage) {
			return {
				colorScheme: "red",
				children: errorMessage.includes("install")
					? "Install MetaMask"
					: "Try Again",
				onClick: handleConnect,
			};
		}

		return {
			onClick: handleConnect,
			children: "Connect Wallet",
		};
	}, [isConnecting, isConnected, walletAddress, errorMessage, handleConnect]);

	// Debug function to fetch wallet details
	const fetchWalletDetails = useCallback(async () => {
		if (!walletAddress || !import.meta.env.DEV) return;

		try {
			const storedToken = localStorage.getItem(STORAGE_KEYS.token);
			const storedUserString = localStorage.getItem(STORAGE_KEYS.USER);
			const authToken = token;

			if (storedToken !== authToken) {
				console.log("🔄 Token mismatch:", {
					hasStateToken: !!authToken,
					hasStoredToken: !!storedToken,
				});
			}

			// Only log user data if there's an issue
			if (storedUserString) {
				const storedUser = JSON.parse(storedUserString);
				if (
					!storedUser.walletAddress ||
					storedUser.walletAddress.toLowerCase() !== walletAddress.toLowerCase()
				) {
					console.log("⚠️ User data mismatch:", {
						storedWallet: storedUser.walletAddress,
						currentWallet: walletAddress,
					});
				}
			}

			console.log("===== WALLET CONNECTION DIAGNOSTICS =====");
			console.log("Current location:", window.location.pathname);
			console.log("Connected wallet address:", walletAddress);
			console.log("Connection state:", connectionState);
			console.log("Network information:", {
				networkName,
				balance: balance
					? Number(balance).toFixed(4) + " MATIC"
					: "Not available",
			});

			// Make API call to check user existence
			try {
				const userResponse = await axios.get(
					`${API_URL}/users/${walletAddress.toLowerCase()}`
				);
				const userExists = true;
				const userData = userResponse.data?.user;

				// Check if we're on profile setup but user exists
				if (window.location.pathname === "/profile-setup" && userExists) {
					console.error(
						"⚠️ NAVIGATION ISSUE: User exists but on profile setup page!"
					);
					message.warning(
						"User exists but you're on profile setup. Click 'Force navigate' below.",
						10
					);
				}

				return {
					success: true,
					userExists,
					userData,
					storedToken,
					storedUser: storedUserString ? JSON.parse(storedUserString) : null,
					currentPath: window.location.pathname,
					shouldBeOnProfileSetup: !userExists,
					navigationIssue:
						userExists && window.location.pathname === "/profile-setup",
				};
			} catch (error) {
				if (error.response?.status === 404) {
					console.log("User does not exist (confirmed by 404 response)");
					if (window.location.pathname !== "/profile-setup") {
						console.log(
							"Redirecting to profile setup since user doesn't exist"
						);
						navigate("/profile-setup");
					}
					return {
						success: false,
						userExists: false,
						shouldBeOnProfileSetup: true,
						currentPath: window.location.pathname,
					};
				}
				throw error;
			}
		} catch (error) {
			console.error("Error in fetchWalletDetails:", error);
			return { success: false, error: error.message };
		}
	}, [walletAddress, connectionState, networkName, balance, token, navigate]);

	return (
		<div
			className={`min-h-screen flex items-center justify-center bg-gray-50 py-8 ${className}`}
		>
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
								Connect Wallet
							</Title>
							<Text type="secondary">
								Connect your wallet to access the platform
							</Text>
						</div>

						<ConnectionStatus
							connectionState={connectionState}
							connectionError={connectionError}
							walletAddress={walletAddress}
							networkName={networkName}
							balance={balance}
							loading={state.loading}
						/>

						{/* Steps */}
						<div className="flex-grow mb-12">
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

						{/* Connect Button */}
						<div className="flex-grow space-y-4">
							<Button
								size="lg"
								colorScheme={errorMessage ? "red" : "blue"}
								variant="solid"
								{...buttonProps}
							>
								{buttonProps.children}
							</Button>

							{state.isMobileDevice && !state.isMetaMaskInstalled && (
								<Text type="secondary" className="text-center text-sm">
									<a
										href="https://metamask.app.link/dapp/"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-500 hover:text-blue-600"
									>
										Open or Install MetaMask Mobile
									</a>
								</Text>
							)}
						</div>

						{/* Footer */}
						<div className="mt-8 text-center">
							<Text type="secondary" className="text-sm">
								New to Web3?{" "}
								<a
									href="https://ethereum.org/wallets/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-500 hover:text-blue-600"
								>
									Learn about wallets
								</a>
								{/* Debug section - only visible when wallet is connected */}
								{walletAddress && (
									<div className="mt-4 space-y-2">
										<Button
											onClick={fetchWalletDetails}
											size="small"
											type="link"
											className="text-xs"
										>
											Run connection diagnostics
										</Button>

										{window.location.pathname === "/profile-setup" && (
											<>
												<div className="text-xs mt-2 text-red-500">
													⚠️ Stuck in profile setup page
												</div>
												<Button
													onClick={() => {
														console.log("Forcing navigation to dashboard");
														navigate("/dashboard");
													}}
													size="small"
													type="primary"
													danger
													className="text-xs"
												>
													Force navigate to dashboard
												</Button>
												<Button
													onClick={async () => {
														// Try direct authentication
														try {
															console.log("Attempting direct authentication");
															const result = await connectWallet();
															console.log(
																"Direct authentication result:",
																result
															);

															// Check for token after authentication
															const newToken = localStorage.getItem(
																STORAGE_KEYS.token
															);
															if (newToken) {
																console.log(
																	"Authentication successful, token acquired"
																);
																message.success("Token acquired successfully");
																// After a short delay, force navigation to dashboard
																setTimeout(() => navigate("/dashboard"), 1000);
															} else {
																message.error(
																	"Authentication failed - no token received"
																);
															}
														} catch (err) {
															console.error(
																"Direct authentication error:",
																err
															);
															message.error(
																"Authentication failed: " + err.message
															);
														}
													}}
													size="small"
													type="primary"
													className="text-xs mt-2"
												>
													Force authenticate
												</Button>
											</>
										)}
									</div>
								)}
							</Text>
						</div>
					</div>

					{/* Right Panel */}
					<div className="hidden md:flex flex-col justify-center p-12 bg-gray-50">
						<Title level={2} className="mb-8">
							Connect with every application
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
	);
};

ConnectWallet.propTypes = {
	className: PropTypes.string,
};

export default ConnectWallet;
