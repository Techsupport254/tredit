import { Button, Typography, Steps, message } from "antd";
import { WalletOutlined, GoogleOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import metamaskIcon from "../../assets/metamask.svg";
import { useAccount } from "../../Context/AccountContext";

const { Title, Text } = Typography;

const ConnectWallet = () => {
	const { connectWallet } = useAccount();

	const handleConnect = async () => {
		const messageKey = "wallet-connection";
		try {
			message.loading({
				content: "Connecting to MetaMask...",
				key: messageKey,
			});

			// Check if ethereum is available
			if (!window.ethereum) {
				throw new Error(
					"MetaMask is not installed. Please install MetaMask to continue."
				);
			}

			// Request account access
			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			});
			const account = accounts[0];

			if (!account) {
				throw new Error(
					"No account found. Please make sure you are logged into MetaMask."
				);
			}

			// Get provider and signer
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Get network information
			const network = await provider.getNetwork();
			const chainId = network.chainId;

			// Get account balance
			const balance = await provider.getBalance(account);

			// Create message for signature
			const message = `Welcome to Tredit!\n\nWallet: ${account}\nChain ID: ${chainId}\nNonce: ${Date.now()}\n\nBy signing this message, you confirm that this is your wallet address.`;

			message.loading({
				content: "Please sign the message in MetaMask...",
				key: messageKey,
			});

			// Request signature
			const signature = await signer.signMessage(message);

			// Connect wallet with signature
			await connectWallet(
				account,
				signature,
				message,
				chainId.toString(),
				ethers.formatEther(balance)
			);

			message.success({
				content: "Wallet connected successfully!",
				key: messageKey,
				duration: 3,
			});

			// Redirect to profile setup
			setTimeout(() => {
				window.location.href = "/settings/profile-setup";
			}, 1000);
		} catch (error) {
			let errorMessage = "Failed to connect wallet";

			if (error.code === 4001) {
				errorMessage = "You rejected the connection request. Please try again.";
			} else if (error.message.includes("MetaMask is not installed")) {
				errorMessage =
					"MetaMask is not installed. Please install MetaMask to continue.";
			} else if (error.message.includes("network")) {
				errorMessage =
					"Please connect to the Polygon Mumbai network in MetaMask.";
			}

			message.error({
				content: errorMessage,
				key: messageKey,
				duration: 4,
			});
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8">
				<div className="text-center mb-8">
					<img
						src={metamaskIcon}
						alt="MetaMask"
						className="h-16 mx-auto mb-6"
					/>
					<Title level={2} className="mb-2">
						Connect Your Wallet
					</Title>
					<Text type="secondary">
						Connect your MetaMask wallet to access the platform
					</Text>
				</div>

				<Steps
					direction="vertical"
					current={0}
					items={[
						{
							title: "Connect MetaMask",
							description: "Connect your wallet to get started",
							icon: <WalletOutlined />,
						},
						{
							title: "Google Account",
							description: "Link your Google account",
							icon: <GoogleOutlined />,
						},
					]}
					className="mb-8"
				/>

				<Button
					type="primary"
					size="large"
					block
					onClick={handleConnect}
					icon={<WalletOutlined />}
					className="h-12"
				>
					Connect with MetaMask
				</Button>

				<div className="mt-6 text-center">
					<Text type="secondary">
						New to Web3?{" "}
						<a
							href="https://metamask.io/download/"
							target="_blank"
							rel="noopener noreferrer"
						>
							Install MetaMask
						</a>
					</Text>
				</div>
			</div>
		</div>
	);
};

export default ConnectWallet;
