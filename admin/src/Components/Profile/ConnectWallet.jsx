import { useEffect, useState } from "react";
import { useAccount } from "../../Context/AccountContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Alert, Typography } from "antd";
import {
	SafetyOutlined,
	UserOutlined,
	ShopOutlined,
	CheckCircleFilled,
} from "@ant-design/icons";
import metamaskIcon from "../../assets/metamask.svg";

const { Title, Text } = Typography;

const ConnectWallet = () => {
	const { walletAddress, connectWallet, loading } = useAccount();
	const navigate = useNavigate();
	const location = useLocation();
	const [error, setError] = useState("");
	const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

	useEffect(() => {
		setIsMetaMaskInstalled(typeof window.ethereum !== "undefined");
	}, []);

	useEffect(() => {
		if (walletAddress) {
			const destination = location.state?.from || "/create-profile";
			navigate(destination, { replace: true });
		}
	}, [walletAddress, navigate, location.state]);

	const handleConnect = async () => {
		try {
			setError("");
			await connectWallet();
		} catch (error) {
			console.error("Connection error:", error);
			setError("Failed to connect wallet. Please try again.");
		}
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
			description: walletAddress
				? `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(
						-4
				  )} connected`
				: "Not connected",
			completed: !!walletAddress,
			current: isMetaMaskInstalled && !walletAddress,
		},
		{
			title: "Connect with Google",
			description: "Link your Google account to create your store",
			completed: false,
			current: !!walletAddress,
		},
		{
			title: "Create Store",
			description: "Set up your store profile",
			completed: false,
			current: false,
		},
	];

	const features = [
		{
			icon: <SafetyOutlined />,
			text: "Secure Authentication",
			desc: "Connect securely using your Web3 wallet",
		},
		{
			icon: <UserOutlined />,
			text: "Personalized Experience",
			desc: "Create and manage your vendor profile",
		},
		{
			icon: <ShopOutlined />,
			text: "Vendor Dashboard",
			desc: "Access your personalized dashboard",
		},
	];

	return (
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
								Connect Wallet
							</Title>
							<Text type="secondary">
								Connect your wallet to access the platform
							</Text>
						</div>

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
						<div className="flex-grow">
							{error && (
								<Alert message={error} type="error" showIcon className="mb-4" />
							)}

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
									disabled={loading}
									size="large"
								>
									{loading ? "Connecting..." : "Connect with MetaMask"}
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

export default ConnectWallet;
