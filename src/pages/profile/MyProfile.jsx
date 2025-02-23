import { useState, useEffect } from "react";
import {
	Card,
	Input,
	Button,
	Typography,
	Avatar,
	Spin,
	message,
	Steps,
} from "antd";
import {
	UserOutlined,
	CheckCircleOutlined,
	SaveOutlined,
	ArrowRightOutlined,
	ArrowLeftOutlined,
} from "@ant-design/icons";
import defaultAvatar from "../../assets/react.svg";
import { useAccount } from "../../Context/AccountContext";

const { Title, Text } = Typography;
const { Step } = Steps;

const MyProfile = () => {
	const { profile, isLoading, fetchUserProfile, saveProfileToIPFS } =
		useAccount();
	const [profileData, setProfileData] = useState(profile || {});
	const [currentStep, setCurrentStep] = useState(0);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (profile?.profileURI) {
			fetchUserProfile();
		} else if (profile) {
			setProfileData(profile);
		}
	}, [profile, fetchUserProfile]);

	const handleInputChange = (e) => {
		setProfileData({ ...profileData, [e.target.name]: e.target.value });
	};

	const handleTikTokAuth = () => {
		const clientKey = "YOUR_TIKTOK_CLIENT_KEY";
		const redirectURI = encodeURIComponent("YOUR_REDIRECT_URI");
		const state = Math.random().toString(36).substring(7);
		const scope = "user.info.basic";
		const authURL = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&response_type=code&scope=${scope}&redirect_uri=${redirectURI}&state=${state}`;
		window.location.href = authURL;
	};

	const handleSave = async () => {
		setLoading(true);
		try {
			const ipfsHash = await saveProfileToIPFS(profileData);
			console.log("Profile saved to IPFS:", ipfsHash);
			message.success("Profile updated successfully!");
			fetchUserProfile();
		} catch (error) {
			message.error("Failed to save profile.");
			console.error("Error saving profile:", error);
		} finally {
			setLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
			<Card className="w-full max-w-2xl shadow-xl rounded-2xl p-8 bg-white">
				<div className="text-center">
					<Avatar
						size={100}
						src={profileData.profileURI || defaultAvatar}
						icon={<UserOutlined />}
						className="border-2 border-gray-200"
					/>
					<Title level={3} className="mt-4 text-gray-800">
						{currentStep === 0 ? "Create Your Profile" : "My Profile"}
					</Title>
					<Text type="secondary" className="text-sm">
						{currentStep === 0
							? "Complete your profile to get started."
							: "Your blockchain-verified profile details"}
					</Text>
				</div>

				<Steps
					current={currentStep}
					className="mt-8"
					progressDot
					labelPlacement="vertical"
				>
					<Step title="Basic Info" icon={<UserOutlined />} />
					<Step
						title="Connect TikTok (Optional)"
						icon={<CheckCircleOutlined />}
					/>
					<Step title="Confirm & Save" icon={<SaveOutlined />} />
				</Steps>

				{currentStep === 0 && (
					<div className="mt-8 space-y-6">
						<div>
							<Text strong className="block text-gray-700 mb-2">
								Full Name
							</Text>
							<Input
								name="name"
								value={profileData.name || ""}
								onChange={handleInputChange}
								placeholder="Enter your full name"
								className="w-full"
							/>
						</div>
						<div>
							<Text strong className="block text-gray-700 mb-2">
								Email
							</Text>
							<Input
								name="email"
								type="email"
								value={profileData.email || ""}
								onChange={handleInputChange}
								placeholder="Enter your email"
								className="w-full"
							/>
						</div>
						<div>
							<Text strong className="block text-gray-700 mb-2">
								Bio
							</Text>
							<Input.TextArea
								name="bio"
								value={profileData.bio || ""}
								onChange={handleInputChange}
								placeholder="Tell us about yourself..."
								rows={4}
								className="w-full"
							/>
						</div>
						<div className="flex justify-end mt-8">
							<Button
								type="primary"
								icon={<ArrowRightOutlined />}
								onClick={() => setCurrentStep(1)}
								className="flex items-center"
							>
								Next
							</Button>
						</div>
					</div>
				)}

				{currentStep === 1 && (
					<div className="mt-8 space-y-6 text-center">
						<Text strong className="block text-gray-700 mb-2">
							Connect Your TikTok Account (Optional)
						</Text>
						<Text type="secondary" className="block mb-6">
							You can skip this step if you don&apos;t want to connect TikTok
							now.
						</Text>
						<Button
							type="primary"
							onClick={handleTikTokAuth}
							className="w-full max-w-xs mx-auto"
						>
							Connect TikTok
						</Button>
						<div className="flex justify-between mt-8">
							<Button
								icon={<ArrowLeftOutlined />}
								onClick={() => setCurrentStep(0)}
								className="flex items-center"
							>
								Back
							</Button>
							<Button
								type="default"
								onClick={() => setCurrentStep(2)}
								className="flex items-center"
							>
								Skip TikTok
							</Button>
							<Button
								type="primary"
								icon={<ArrowRightOutlined />}
								onClick={() => setCurrentStep(2)}
								className="flex items-center"
							>
								Next
							</Button>
						</div>
					</div>
				)}

				{currentStep === 2 && (
					<div className="mt-8 space-y-6">
						<div>
							<Text strong className="block text-gray-700 mb-2">
								DID
							</Text>
							<Input
								name="did"
								value={profileData.did || ""}
								disabled
								className="w-full bg-gray-100"
							/>
						</div>
						<div>
							<Text strong className="block text-gray-700 mb-2">
								Reputation Score
							</Text>
							<Input
								value={profileData.reputationScore || "0"}
								disabled
								className="w-full bg-gray-100"
							/>
						</div>
						<div className="flex justify-between mt-8">
							<Button
								icon={<ArrowLeftOutlined />}
								onClick={() => setCurrentStep(1)}
								className="flex items-center"
							>
								Back
							</Button>
							<Button
								type="primary"
								loading={loading}
								icon={<SaveOutlined />}
								onClick={handleSave}
								className="flex items-center"
							>
								Save Profile
							</Button>
						</div>
					</div>
				)}
			</Card>
		</div>
	);
};

export default MyProfile;
