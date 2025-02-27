import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Typography, Card, Row, Col, Avatar } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useAuth } from "../Context/AuthContext";
import metamaskIcon from "../assets/metamask.svg";

const { Title, Text } = Typography;

// Styled Components
const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
`;

const ProfileCard = styled(motion.div)`
	background: rgba(255, 255, 255, 0.95);
	border-radius: 1.5rem;
	box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(10px);
	max-width: 500px;
	width: 100%;
	padding: 3rem 2rem;
	text-align: center;
	border: 1px solid rgba(255, 255, 255, 0.3);
`;

const FeatureList = styled.div`
	display: grid;
	gap: 1rem;
	margin: 2rem 0;
`;

const FeatureItem = styled.div`
	display: flex;
	align-items: center;
	gap: 0.8rem;
	padding: 1rem;
	background: rgba(59, 130, 246, 0.05);
	border-radius: 0.75rem;
	transition: all 0.2s ease;

	&:hover {
		transform: translateX(5px);
		background: rgba(59, 130, 246, 0.1);
	}
`;

const StyledIllustration = styled(motion.div)`
	margin: 0 auto 2rem;
	width: 100%;
	height: 150px;
	background: url("data:image/svg+xml,...") no-repeat center; /* Add your SVG illustration */
`;

const SignInButton = styled(Button)`
	width: 100%;
	height: 50px;
	font-size: 1.1rem;
	background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	border: none;
	color: white;
	border-radius: 0.75rem;
	transition: all 0.2s ease;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
	}
`;

const NotLoggedIn = () => {
	const { signInWithGoogle } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	const handleSignIn = async () => {
		setIsLoading(true);
		try {
			await signInWithGoogle();
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Container>
			<ProfileCard
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
			>
				<StyledIllustration
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
                    <Avatar
                        src={metamaskIcon}
                        size={150}
                        style={{ backgroundColor: "transparent" }}
                    />
				</StyledIllustration>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}
				>
					<Title level={2} style={{ color: "#1e293b", marginBottom: "1rem" }}>
						Welcome to Your Dashboard
					</Title>
					<Text type="secondary" style={{ fontSize: "1rem", color: "#64748b" }}>
						Sign in to access personalized features and settings
					</Text>
				</motion.div>

				<FeatureList>
					<FeatureItem>
						<GoogleOutlined style={{ color: "#3b82f6", fontSize: "1.2rem" }} />
						<Text style={{ color: "#1e293b" }}>
							Secure Google Authentication
						</Text>
					</FeatureItem>
					<FeatureItem>
						<span style={{ color: "#3b82f6", fontSize: "1.2rem" }}>⚙️</span>
						<Text style={{ color: "#1e293b" }}>Personalized Settings</Text>
					</FeatureItem>
					<FeatureItem>
						<span style={{ color: "#3b82f6", fontSize: "1.2rem" }}>🔒</span>
						<Text style={{ color: "#1e293b" }}>Encrypted Data Protection</Text>
					</FeatureItem>
				</FeatureList>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
				>
					<SignInButton
						onClick={handleSignIn}
						icon={<GoogleOutlined />}
						loading={isLoading}
					>
						Continue with Google
					</SignInButton>
				</motion.div>

				<Text
					style={{
						display: "block",
						marginTop: "1.5rem",
						color: "#64748b",
						fontSize: "0.875rem",
					}}
				>
					By continuing, you agree to our Terms and Privacy Policy
				</Text>
			</ProfileCard>
		</Container>
	);
};

export default NotLoggedIn;
