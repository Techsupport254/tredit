import { useEffect, useState } from "react";
import { useAccount } from "../Context/AccountContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tag } from "antd"; // Import Ant Design Tag component
import metamaskIcon from "../assets/metamask.svg";

const ConnectWallet = () => {
	const { isConnected, userAddress, balance, connectWallet, disconnectWallet } =
		useAccount();
	const navigate = useNavigate();
	const [error, setError] = useState("");

	// Check if MetaMask is installed
	const isMetaMaskInstalled = typeof window.ethereum !== "undefined";

	// Redirect to dashboard if already connected
	useEffect(() => {
		if (isConnected) {
			navigate("/dashboard", { replace: true });
		}
	}, [isConnected, navigate]);

	// Handle Wallet Connection
	const handleConnect = async () => {
		if (!isMetaMaskInstalled) {
			setError("MetaMask is not installed. Please install it first.");
			return;
		}
		try {
			await connectWallet();
			setError("");
		} catch (err) {
			console.error("Error connecting wallet:", err);
			setError("Failed to connect. Make sure MetaMask is installed.");
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-6">
			<motion.div
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 w-full max-w-md text-center"
			>
				<h1 className="text-4xl font-bold text-gray-800">
					{isConnected ? "Wallet Connected" : "Connect Your Wallet"}
				</h1>
				<p className="mt-4 text-gray-600 text-base">
					{isConnected
						? "You are securely connected to MetaMask."
						: "Connect to MetaMask to access your personalized dashboard."}
				</p>

				{/* Render Connect or Install button */}
				{!isConnected && (
					<>
						{isMetaMaskInstalled ? (
							<button
								onClick={handleConnect}
								className="mt-8 flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition transform hover:scale-105 duration-300"
							>
								<img
									src={metamaskIcon}
									alt="MetaMask"
									className="w-6 h-6 mr-3"
								/>
								<span>Connect with MetaMask</span>
							</button>
						) : (
							<a
								href="https://metamask.io/download"
								target="_blank"
								rel="noopener noreferrer"
								className="mt-8 flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition transform hover:scale-105 duration-300"
							>
								<img
									src={metamaskIcon}
									alt="MetaMask"
									className="w-6 h-6 mr-3"
								/>
								<span>Install MetaMask</span>
							</a>
						)}
					</>
				)}

				{isConnected && (
					<div className="mt-8 p-6 bg-gray-100 rounded-xl text-gray-800">
						<div className="mb-4">
							<p className="font-medium text-sm text-gray-700">Address:</p>
							<p className="text-sm break-all text-gray-900">{userAddress}</p>
						</div>
						<div className="mb-4">
							<p className="font-medium text-sm text-gray-700">Balance:</p>
							<p className="text-xl font-bold text-gray-800">{balance} ETH</p>
						</div>
						<button
							onClick={disconnectWallet}
							className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition transform hover:scale-105 duration-300"
						>
							Disconnect Wallet
						</button>
					</div>
				)}

				{error && (
					<div className="mt-6 p-3 bg-red-100 border border-red-300 rounded-lg">
						<p className="text-sm text-red-600">{error}</p>
					</div>
				)}

				<div className="mt-10 border-t border-gray-300 pt-4">
					<h3 className="text-lg font-semibold text-gray-800">
						Supported Wallet
					</h3>
					<div className="mt-4 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<img src={metamaskIcon} alt="MetaMask" className="w-10 h-10" />
							<span className="text-base font-medium text-gray-700">
								MetaMask Wallet
							</span>
						</div>
						{/* Ant Design Badge for Installed Status */}
						<Tag
							color={isMetaMaskInstalled ? "green" : "red"}
							className="text-sm font-medium"
							style={{
								border: "none",
								borderRadius: "999px",
								padding: "4px 12px",
							}}
						>
							{isMetaMaskInstalled ? "Installed" : "Not Installed"}
						</Tag>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default ConnectWallet;
