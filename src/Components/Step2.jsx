import { useAccount } from "../Context/AccountContext"; // Get data from context
import { Typography, Card, Avatar, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const { Text, Title } = Typography;

const Step2 = () => {
	const { profileData, loading } = useAccount(); // Use data from context

	return (
		<div className="mt-8 space-y-6">
			{/* Section Header */}
			<div className="text-center">
				<Title level={4} className="text-gray-800">
					Review Your Details
				</Title>
				<Text type="secondary">
					Ensure everything looks good before saving.
				</Text>
			</div>

			{/* Profile Card */}
			<Card className="p-6 shadow-md rounded-xl">
				{/* Avatar and Name */}
				<div className="flex items-center space-x-6 mb-6 gap-6">
					<Avatar
						size={80}
						src={profileData?.profilePicture || null}
						alt="Profile"
						icon={<UserOutlined />}
						className="border border-gray-300"
					/>
					<div>
						<Title level={5} className="text-gray-900">
							{profileData?.name || "Not set"}
						</Title>
						<Text type="secondary">@{profileData?.username || "Not set"}</Text>
					</div>
				</div>

				{/* Profile Details */}
				<div className="space-y-4 text-gray-700">
					<p>
						<strong>Email:</strong> {profileData?.email || "Not set"}
					</p>
					<p>
						<strong>Date of Birth:</strong> {profileData?.dob || "Not set"}
					</p>
					<p>
						<strong>Gender:</strong> {profileData?.gender || "Not set"}
					</p>
					<p>
						<strong>Bio:</strong> {profileData?.bio || "No bio provided"}
					</p>
				</div>
			</Card>

			{/* Loading Indicator */}
			{loading && (
				<div className="flex justify-center mt-4">
					<Spin size="large" />
				</div>
			)}
		</div>
	);
};

export default Step2;

// Props Validation
Step2.propTypes = {};
