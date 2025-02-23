import { useEffect, useState } from "react";
import { useWallet } from "../Context/WalletContext";
import { useDID } from "../Context/DIDContext";
import { Card, Row, Col, Typography, Spin } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import MetaMaskIcon from "../assets/metamask.svg";
import { useNavigate } from "react-router-dom"; // Updated for v6

const { Title, Text } = Typography;

const ConnectWallet = () => {
	const { isConnected, status, connectWallet } = useWallet();
	const { profileStatus, isLoading } = useDID();
	const navigate = useNavigate(); // Replaces useHistory()
	const [isRedirecting, setIsRedirecting] = useState(false);

	useEffect(() => {
		if (isConnected && !isLoading) {
			setIsRedirecting(true);
			const targetPath =
				profileStatus === "complete" ? "/dashboard" : "/create-profile";
			const timer = setTimeout(
				() => navigate(targetPath, { replace: true }),
				1500
			); // Updated from history.replace()
			return () => clearTimeout(timer);
		}
	}, [isConnected, isLoading, profileStatus, navigate]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<Card className="w-full max-w-2xl shadow-lg rounded-2xl">
				<div className="text-center p-6">
					<WalletOutlined className="text-4xl text-blue-500 mb-4" />
					<Title level={2} className="mb-2">
						{isConnected ? "Wallet Connected" : "Connect Your Wallet"}
					</Title>

					{status === "connecting" ? (
						<div className="py-8">
							<Spin size="large" />
							<Text type="secondary" className="block mt-4">
								Checking wallet connection...
							</Text>
						</div>
					) : (
						<>
							<Text type="secondary" className="block mb-8 text-gray-500">
								{isConnected
									? "You're successfully connected to the blockchain"
									: "Connect with MetaMask to continue"}
							</Text>

							<Row justify="center">
								<Col xs={24} sm={12} md={8}>
									<div
										className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl h-48 transition-all
                      cursor-pointer hover:border-blue-400 hover:shadow-md bg-white`}
										onClick={connectWallet}
									>
										<img
											src={MetaMaskIcon}
											alt="MetaMask"
											className="w-16 h-16 mb-4 object-contain"
										/>
										<Text strong className="text-gray-800">
											MetaMask
										</Text>
									</div>
								</Col>
							</Row>

							{isRedirecting && (
								<div className="flex justify-center mt-6">
									<Spin size="large" />
									<Text type="secondary" className="ml-2">
										Redirecting...
									</Text>
								</div>
							)}
						</>
					)}
				</div>
			</Card>
		</div>
	);
};

export default ConnectWallet;
