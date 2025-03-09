import { useEffect, useState } from "react";
import { useAccount } from "../../Context/AccountContext";
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

const { Title, Text } = Typography;

const WalletStatus = ({ status }) => {
	if (!status) return null;

	const getStatusIcon = (stepStatus) => {
		switch (stepStatus) {
			case "pending":
				return <LoadingOutlined className="text-blue-500 text-xl" />;
			case "success":
				return <CheckCircleFilled className="text-green-500 text-xl" />;
			case "error":
				return <CloseCircleFilled className="text-red-500 text-xl" />;
			default:
				return null;
		}
	};

	return (
		<div className="mt-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-xl">
			<div className="flex items-center gap-3 mb-4">
				{getStatusIcon(status.status)}
				<Text
					strong
					className={`text-lg ${
						status.status === "error"
							? "text-red-500"
							: status.status === "success"
							? "text-green-500"
							: "text-blue-500"
					}`}
				>
					{status.message}
				</Text>
			</div>
			{status.steps && status.steps.length > 0 && (
				<div className="space-y-2">
					{status.steps.map((step, index) => (
						<div key={index} className="flex items-start gap-2 text-gray-600">
							<div className="mt-1.5">
								{status.status === "success" ? (
									<CheckCircleFilled className="text-green-500" />
								) : status.status === "error" ? (
									<CloseCircleFilled className="text-red-500" />
								) : (
									<div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
								)}
							</div>
							<Text className="flex-1">{step}</Text>
						</div>
					))}
				</div>
			)}
			{status.error && (
				<div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
					<Text className="text-red-600">{status.error}</Text>
				</div>
			)}
			{status.data && (
				<div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
					{Object.entries(status.data).map(([key, value]) => (
						<div key={key} className="flex items-center gap-2">
							<Text strong className="capitalize">
								{key.replace(/([A-Z])/g, " $1").trim()}:
							</Text>
							<Text className="font-mono text-sm">{value}</Text>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

WalletStatus.propTypes = {
	status: PropTypes.shape({
		status: PropTypes.string,
		message: PropTypes.string,
		steps: PropTypes.arrayOf(PropTypes.string),
		error: PropTypes.string,
		data: PropTypes.object,
	}),
};

const ConnectWallet = ({ className = "" }) => {
	const navigate = useNavigate();
	const {
		walletAddress,
		connectWallet,
		loading,
		networkName,
		balance,
		connectionState,
		connectionError,
	} = useAccount();
	const { fetchLoginHistory } = useAuth();

	const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
	const [status, setStatus] = useState(null);

	// Check MetaMask installation and connection status on mount
	useEffect(() => {
		const checkMetaMask = async () => {
			const isInstalled =
				typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask;
			setIsMetaMaskInstalled(isInstalled);
		};
		checkMetaMask();
	}, []);

	// Update useEffect for connection status
	useEffect(() => {
		if (connectionState === "connected" && walletAddress) {
			// Only check wallet status without creating login history
			checkWalletStatus(walletAddress, null, null, null, true);
		}
	}, [connectionState, walletAddress]);

	const checkWalletStatus = async (
		account,
		signature = null,
		message = null,
		chainId = null,
		skipLoginHistory = false
	) => {
		try {
			const response = await fetch(
				`${
					import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8000/api"
				}/users/wallet-auth`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						walletAddress: account.toLowerCase(),
						...(signature && { signature }),
						...(message && { message }),
						...(chainId && { chainId: chainId.toString() }),
						skipLoginHistory,
					}),
				}
			);
			const data = await response.json();

			if (!data.success) {
				throw new Error(data.message || "Failed to authenticate");
			}

			if (!signature) {
				// Just checking wallet status
				if (data.exists && data.hasProfile) {
					navigate("/dashboard");
				} else if (data.exists) {
					navigate("/profile-setup");
				}
			}
			return data;
		} catch (error) {
			console.error("Error checking wallet status:", error);
			throw error;
		}
	};

	const handleConnect = async () => {
		const messageKey = "wallet-connection";
		try {
			setStatus({
				status: "pending",
				message: "Connecting to MetaMask...",
				steps: ["Requesting wallet connection"],
			});

			// Check if ethereum is available
			if (!window.ethereum) {
				throw new Error(
					"MetaMask is not installed. Please install MetaMask to continue."
				);
			}

			message.loading({
				content: "Connecting to MetaMask...",
				key: messageKey,
			});

			// Request account access
			let accounts;
			try {
				accounts = await window.ethereum.request({
					method: "eth_requestAccounts",
				});
			} catch (err) {
				if (err.code === 4001) {
					throw new Error(
						"You rejected the connection request. Please try again."
					);
				} else if (err.code === -32002) {
					throw new Error(
						"MetaMask is already processing a connection request. Please check your MetaMask extension."
					);
				} else {
					throw new Error(`Failed to connect to MetaMask: ${err.message}`);
				}
			}

			const account = accounts[0];
			if (!account) {
				throw new Error(
					"No account found. Please make sure you are logged into MetaMask."
				);
			}

			// Get provider and signer
			let provider, network, balance;
			try {
				provider = new ethers.BrowserProvider(window.ethereum);
				await provider.getSigner(); // Just to verify signer is available

				// Get network information
				network = await provider.getNetwork();

				// Verify network is Polygon Amoy and attempt to switch if it's not
				if (network.chainId !== 80002n) {
					try {
						await window.ethereum.request({
							method: "wallet_switchEthereumChain",
							params: [{ chainId: "0x13882" }], // 80002 in hex
						});
					} catch (switchError) {
						// This error code indicates that the chain has not been added to MetaMask
						if (switchError.code === 4902) {
							try {
								await window.ethereum.request({
									method: "wallet_addEthereumChain",
									params: [
										{
											chainId: "0x13882",
											chainName: "Polygon Amoy",
											nativeCurrency: {
												name: "MATIC",
												symbol: "MATIC",
												decimals: 18,
											},
											rpcUrls: [
												"https://polygon-amoy.infura.io/v3/58c6d521bff64b6fbb0ca83aba68e550",
											],
											blockExplorerUrls: ["https://www.oklink.com/amoy"],
										},
									],
								});
							} catch (addError) {
								throw new Error(
									`Failed to add Polygon Amoy network: ${addError.message}`
								);
							}
						} else {
							throw new Error(
								`Failed to switch to Polygon Amoy network: ${switchError.message}`
							);
						}
					}

					// After switching/adding network, get updated network info
					network = await provider.getNetwork();

					// Verify the switch was successful
					if (network.chainId !== 80002n) {
						throw new Error(
							"Please switch to the Polygon Amoy network in MetaMask. Current network: " +
								network.name
						);
					}
				}

				// Get account balance
				balance = await provider.getBalance(account);

				if (balance === 0n) {
					message.warning({
						content:
							"Your wallet has 0 MATIC. You may need some MATIC for transactions.",
						duration: 6,
					});
				}
			} catch (err) {
				if (err.message.includes("network")) {
					throw err;
				}
				throw new Error(`Failed to initialize Web3: ${err.message}`);
			}

			setStatus({
				status: "pending",
				message: "Requesting signature...",
				steps: [
					"✓ Wallet connection established",
					"✓ Network verified: Polygon Amoy",
					"Waiting for signature...",
				],
			});

			// Create message for signature with proper format
			const timestamp = Date.now();
			const signatureMessage =
				`Welcome to Tredit!\n\nPlease sign this message to authenticate your wallet.\n\nWallet: ${account}\nChain ID: ${network.chainId}\nTimestamp: ${timestamp}\n\nThis signature will not trigger a blockchain transaction or cost any gas fees.`.trim();

			message.loading({
				content: "Please sign the message in MetaMask...",
				key: messageKey,
			});

			// Request signature
			let signature;
			try {
				setStatus({
					status: "pending",
					message: "Waiting for signature...",
					steps: [
						"✓ Wallet connection initiated",
						"✓ Network verified: Polygon Amoy",
						"Please sign the message in MetaMask to complete connection",
					],
				});

				// Request signature using personal_sign (safer than eth_sign)
				signature = await window.ethereum.request({
					method: "personal_sign",
					params: [signatureMessage, account],
				});

				// Verify the signature using ethers
				const recoveredAddress = ethers.verifyMessage(
					signatureMessage,
					signature
				);

				if (recoveredAddress.toLowerCase() !== account.toLowerCase()) {
					throw new Error("Signature verification failed: Address mismatch");
				}
			} catch (err) {
				if (err.code === 4001) {
					throw new Error(
						"Connection cancelled: You rejected the signature request. Please try again to connect your wallet."
					);
				}
				throw new Error(
					`Connection incomplete: Failed to sign message: ${err.message}`
				);
			}

			setStatus({
				status: "pending",
				message: "Verifying signature...",
				steps: [
					"✓ Wallet connection initiated",
					"✓ Network verified: Polygon Amoy",
					"✓ Message signed",
					"✓ Signature verified",
					"Completing connection...",
				],
			});

			// Connect wallet with signature
			try {
				// Connect the wallet through AccountContext
				const result = await connectWallet(signature, signatureMessage);

				if (!result.success) {
					throw new Error("Failed to authenticate wallet");
				}

				// If user doesn't exist, redirect to registration
				if (!result.exists) {
					setStatus({
						status: "success",
						message: "Wallet connected! Please complete registration.",
						steps: [
							"✓ Wallet connection initiated",
							"✓ Network verified: Polygon Amoy",
							"✓ Message signed",
							"✓ Signature verified",
							"✓ Wallet connected",
							"Redirecting to registration...",
						],
					});

					message.success({
						content: "Please complete your registration to continue",
						key: messageKey,
						duration: 3,
					});

					setTimeout(() => navigate("/register"), 1500);
					return;
				}

				// Fetch login history after successful connection
				await fetchLoginHistory();

				setStatus({
					status: "success",
					message: "Wallet connected successfully!",
					steps: [
						"✓ Wallet connection initiated",
						"✓ Network verified: Polygon Amoy",
						"✓ Message signed",
						"✓ Signature verified",
						"✓ Wallet connected and authenticated",
						"✓ Login history updated",
					],
					data: {
						address: result.address,
						network: network.name,
						chainId: result.chainId,
						balance: `${ethers.formatEther(balance)} MATIC`,
					},
				});

				message.success({
					content: "Wallet connected and authenticated successfully!",
					key: messageKey,
					duration: 3,
				});

				// Check if user has a complete profile before navigating
				if (result.hasProfile) {
					setTimeout(() => navigate("/dashboard"), 1500);
				} else {
					setTimeout(() => navigate("/profile-setup"), 1500);
				}
			} catch (err) {
				throw new Error(
					`Authentication failed: ${err.message}. Please try connecting again.`
				);
			}
		} catch (error) {
			console.error("Wallet connection error:", error);
			let errorMessage = error.message || "Failed to connect wallet";
			let steps = [];

			if (error.code === 4001) {
				steps = ["✗ Connection cancelled", "Signature was rejected"];
			} else if (error.code === -32002) {
				steps = ["✗ Connection request pending", "Please check MetaMask"];
			} else if (error.message.includes("MetaMask is not installed")) {
				steps = [
					"✗ MetaMask not detected",
					"Please install MetaMask to continue",
				];
			} else if (error.message.includes("network")) {
				steps = ["✗ Wrong network", "Please switch to Polygon Amoy"];
			} else if (error.message.includes("signature")) {
				steps = ["✗ Signature required", "Please sign the message to connect"];
			} else {
				steps = ["✗ Connection failed", error.message];
			}

			setStatus({
				status: "error",
				message: "Connection not completed",
				error: errorMessage,
				steps,
			});

			message.error({
				content: errorMessage,
				key: messageKey,
				duration: 6,
			});
		}
	};

	const getStepDescription = (step) => {
		if (step.completed) {
			return step.title === "Connect Wallet" && walletAddress
				? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(
						-4
				  )}${networkName ? ` (${networkName})` : ""}`
				: "Completed";
		}
		if (step.current) {
			if (step.title === "Install MetaMask") {
				return "Get the MetaMask browser extension";
			}
			if (step.title === "Connect Wallet") {
				return loading ? "Connecting..." : "Click to connect your wallet";
			}
			if (step.title === "Connect with Google") {
				return "Link your Google account to complete setup";
			}
		}
		return step.description;
	};

	const steps = [
		{
			title: "Install MetaMask",
			description: isMetaMaskInstalled
				? "MetaMask extension is installed"
				: "Get the MetaMask browser extension",
			completed: isMetaMaskInstalled,
			current: !isMetaMaskInstalled,
		},
		{
			title: "Connect Wallet",
			description: getStepDescription({
				title: "Connect Wallet",
				completed: connectionState === "connected" && !!walletAddress,
				current: isMetaMaskInstalled && !walletAddress,
			}),
			completed: connectionState === "connected" && !!walletAddress,
			current:
				isMetaMaskInstalled &&
				(!walletAddress || connectionState !== "connected"),
		},
		{
			title: "Connect with Google",
			description: "Link your Google account to complete setup",
			completed: false,
			current: connectionState === "connected" && !!walletAddress,
		},
	];

	const features = [
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
	];

	const ConnectionStatus = () => {
		// Only show status when there's actual connection activity or wallet is connected
		if (
			!loading &&
			connectionState === "disconnected" &&
			!connectionError &&
			!walletAddress
		)
			return null;

		const getStatusIcon = () => {
			switch (connectionState) {
				case "connecting":
					return <LoadingOutlined className="text-blue-500" />;
				case "connected":
					return <CheckCircleFilled className="text-green-500" />;
				case "error":
					return <CloseCircleFilled className="text-red-500" />;
				default:
					return null;
			}
		};

		const getStatusMessage = () => {
			switch (connectionState) {
				case "connecting":
					return "Connecting Wallet";
				case "connected":
					return "Connection Successful";
				case "error":
					return "Connection Error";
				default:
					return "";
			}
		};

		return (
			<div className="mb-6 p-4 bg-white rounded-lg border border-gray-100">
				<div className="flex items-center gap-2 mb-2">
					{getStatusIcon()}
					<Text
						strong
						className={
							connectionState === "error"
								? "text-red-500"
								: connectionState === "connected"
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

				{walletAddress && connectionState === "connected" && (
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

						<ConnectionStatus />

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
							<WalletStatus status={status} />
							{!isMetaMaskInstalled ? (
								<Button
									href="https://metamask.io/download"
									target="_blank"
									rel="noopener noreferrer"
									type="primary"
									size="large"
									className="w-full h-12"
								>
									Install MetaMask Extension
								</Button>
							) : (
								<Button
									onClick={handleConnect}
									icon={
										<img src={metamaskIcon} alt="" className="w-5 h-5 mr-2" />
									}
									className="w-full h-12"
									type="primary"
									loading={loading}
									disabled={loading || connectionState === "connected"}
									size="large"
								>
									{loading
										? "Connecting..."
										: connectionState === "connected"
										? "Connected"
										: "Connect with MetaMask"}
								</Button>
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
