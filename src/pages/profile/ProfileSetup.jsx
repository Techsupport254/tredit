import { useState } from "react";
import {
	Card,
	Typography,
	Avatar,
	Spin,
	Steps,
	Button,
	Alert,
	Divider,
} from "antd";
import {
	UserOutlined,
	SaveOutlined,
	CheckCircleFilled,
	LeftOutlined,
	RightOutlined,
} from "@ant-design/icons";
import Step1 from "../../Components/Step1";
import Step2 from "../../Components/Step2";
import { useAccount } from "../../Context/AccountContext";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Step } = Steps;

const ProfileSetup = () => {
	const {
		profileData,
		storageInitialized,
		setStorageInitialized,
		storageLoading,
		setStorageLoading,
		isLoading,
		currentStep,
		setCurrentStep,
		fetchUserProfile,
		userAddress,
		handleSaveProfile,
	} = useAccount();

	const [statusMessage, setStatusMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [saving, setSaving] = useState(false);

	const navigate = useNavigate();

	// Save profile using wallet address as the identifier
	const onSaveProfile = async () => {
		try {
			setSaving(true);
			setStatusMessage("Initializing storage...");
			setErrorMessage("");
			setStorageLoading(true);

			// Call the context's handleSaveProfile function without DID
			const { tx, ipfsUrl } = await handleSaveProfile({
				profileData,
				setStatusMessage,
			});
			console.log("Transaction details:", tx);
			setStorageInitialized(true);
			setStatusMessage("Profile saved successfully on blockchain!");

			// Retrieve updated on-chain profile data.
			await fetchUserProfile();
			// reload the page after saving the profile
			setTimeout(() => {
				window.location.reload();
			}, 1000);
		} catch (error) {
			setErrorMessage(`Error: ${error.message}`);
		} finally {
			setSaving(false);
			setStorageLoading(false);
		}
	};

	const isProcessing = isLoading || storageLoading || saving;
	const stepTitles = ["Basic Information", "Review & Save"];
	const stepDescriptions = [
		"Fill in your details to get started.",
		"Review and confirm your profile information before saving.",
	];

	return (
		<div className="flex justify-center items-center min-h-screen p-6">
			<Card className="w-full max-w-3xl shadow-xl rounded-3xl p-10 bg-white">
				{/* Avatar & Title Section */}
				<div className="text-center">
					<Avatar
						size={110}
						src={profileData?.profilePicture || null}
						alt="Profile"
						icon={<UserOutlined />}
						className="border-4 border-gray-300 shadow-lg"
					/>
					<Title level={3} className="mt-4 text-gray-800">
						{stepTitles[currentStep]}
					</Title>
					<Text type="secondary">{stepDescriptions[currentStep]}</Text>
				</div>

				{/* Steps Navigation */}
				<Steps current={currentStep} className="mt-8" progressDot>
					<Step title="Basic Info" icon={<UserOutlined />} />
					<Step title="Review & Save" icon={<SaveOutlined />} />
				</Steps>

				<Divider className="mt-6" />

				{/* Step Components */}
				<div className="mt-6">
					{currentStep === 0 && <Step1 key="step1" />}
					{currentStep === 1 && <Step2 key="step2" />}
				</div>

				{/* Status Messages */}
				{statusMessage && (
					<Alert
						message={statusMessage}
						type="info"
						showIcon
						className="mt-6"
					/>
				)}
				{errorMessage && (
					<Alert
						message={errorMessage}
						type="error"
						showIcon
						className="mt-4"
					/>
				)}

				{/* Loading Indicator */}
				{isProcessing && (
					<div className="flex justify-center items-center mt-6">
						<Spin size="large" />
						<Text type="secondary" className="ml-2">
							Processing...
						</Text>
					</div>
				)}

				{/* Navigation Buttons */}
				<div className="flex justify-between items-center mt-8">
					<Button
						icon={<LeftOutlined />}
						onClick={() => setCurrentStep(currentStep - 1)}
						disabled={currentStep === 0 || isProcessing}
						className="shadow-md"
					>
						Back
					</Button>
					{currentStep === 0 ? (
						<Button
							type="primary"
							icon={<RightOutlined />}
							onClick={() => setCurrentStep(1)}
							disabled={isProcessing}
							className="bg-blue-600 hover:bg-blue-700 shadow-lg"
						>
							Next
						</Button>
					) : (
						<Button
							type="primary"
							icon={
								storageInitialized ? <CheckCircleFilled /> : <SaveOutlined />
							}
							loading={saving}
							onClick={onSaveProfile}
							disabled={saving || storageInitialized}
							className={`shadow-lg ${
								storageInitialized
									? "bg-green-500 hover:bg-green-600"
									: "bg-blue-600 hover:bg-blue-700"
							}`}
						>
							{storageInitialized ? "Saved" : "Save Profile"}
						</Button>
					)}
				</div>
			</Card>
		</div>
	);
};

export default ProfileSetup;
