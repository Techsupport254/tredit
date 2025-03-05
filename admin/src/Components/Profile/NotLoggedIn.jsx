import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Typography, List } from "antd";
import {
	GoogleOutlined,
	DashboardOutlined,
	UserOutlined,
	TeamOutlined,
	BellOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { useAuth } from "../../Context/AuthContext";
import { useAccount } from "../../Context/AccountContext";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const { Title, Paragraph } = Typography;

const Card = styled(motion.div)`
	background: white;
	border-radius: 12px;
	box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
	width: 100%;
	max-width: 480px;
	padding: 32px;
	text-align: center;
	border: 1px solid #e9ecef;
`;

const GoogleButton = styled(Button)`
	width: 100%;
	height: 48px;
	border-radius: 8px;
	font-size: 16px;
	font-weight: 500;
	margin: 24px 0;
	background: white;
	border: 1px solid #e9ecef;
	color: #495057;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	transition: all 0.2s ease;

	&:hover {
		background: #f8f9fa;
		border-color: #dee2e6;
		color: #495057;
	}

	.anticon {
		font-size: 20px;
		color: #db4437;
	}
`;

const BenefitsList = styled(List)`
	margin-top: 32px;
	border: 1px solid #e9ecef;
	border-radius: 8px;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 8px;

	.ant-list-item {
		border-bottom: none;
		padding: 12px 0;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 12px;
		color: #495057;

		.anticon {
			font-size: 18px;
			color: #4dabf7;
		}
	}
`;

const StyledTitle = styled(Title)`
	margin-bottom: 16px !important;
	color: #212529;
	font-weight: 600 !important;
`;

const StyledParagraph = styled(Paragraph)`
	color: #6c757d;
	font-size: 15px;
	margin-bottom: 0;
	line-height: 1.6;
`;

// Component Logic
const NotLoggedIn = () => {
	const { signInWithGoogle } = useAuth();
	const { walletAddress } = useAccount();
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const benefits = [
		{
			icon: <DashboardOutlined />,
			text: "Access to personalized dashboard",
		},
		{
			icon: <UserOutlined />,
			text: "Manage your profile and settings",
		},
		{
			icon: <TeamOutlined />,
			text: "Connect with other users",
		},
		{
			icon: <BellOutlined />,
			text: "Receive notifications and updates",
		},
	];

	const handleSignIn = async () => {
		setIsLoading(true);
		try {
			const result = await signInWithGoogle();
			if (result && walletAddress) {
				console.log("Google auth successful, continuing with profile setup");
				navigate("/create-profile");
			}
		} catch (error) {
			console.error("Sign in error:", error);
			message.error("Failed to sign in. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-6">
			<Card
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<StyledTitle level={3}>Create Your Account</StyledTitle>
				<StyledParagraph>
					Sign in with Google to access your personalized dashboard and account
					features. We'll help you set up your profile in just a few steps.
				</StyledParagraph>

				<GoogleButton
					onClick={handleSignIn}
					loading={isLoading}
					icon={<GoogleOutlined />}
				>
					Continue with Google
				</GoogleButton>

				<BenefitsList
					header={
						<div style={{ textAlign: "left", paddingBottom: 8 }}>
							<Typography.Text strong style={{ color: "#212529" }}>
								Why sign up?
							</Typography.Text>
						</div>
					}
					dataSource={benefits}
					renderItem={(item) => (
						<List.Item>
							{item.icon}
							<span style={{ fontSize: 15 }}>{item.text}</span>
						</List.Item>
					)}
				/>
			</Card>
		</div>
	);
};

export default NotLoggedIn;
