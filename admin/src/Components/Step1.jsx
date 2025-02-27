import { useState } from "react";
import { Input, DatePicker, Select, Upload, Button, message } from "antd";
import { UploadOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { useAccount } from "../Context/AccountContext"; // Import useAccount()
import PropTypes from "prop-types";

const { Text } = Typography;
const { Option } = Select;

const Step1 = () => {
	const { profileData, setProfileData, setCurrentStep } = useAccount(); // Get from context
	const [fileList, setFileList] = useState([]); // Handle profile picture upload

	// Handle input change
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setProfileData((prev) => ({ ...prev, [name]: value }));
	};

	// Handle date change
	const handleDateChange = (date, dateString) => {
		setProfileData((prev) => ({ ...prev, dob: dateString }));
	};

	// Handle gender selection
	const handleGenderChange = (value) => {
		setProfileData((prev) => ({ ...prev, gender: value }));
	};

	// Handle file selection and update state
	const handleFileChange = ({ file }) => {
		if (!file) return;

		const isImage = file.type.startsWith("image/");
		if (!isImage) {
			message.error("Please upload a valid image file.");
			return;
		}

		// Convert file to base64 to preview the image
		const reader = new FileReader();
		reader.onload = () => {
			setProfileData((prev) => ({ ...prev, profilePicture: reader.result }));
		};
		reader.readAsDataURL(file);

		setFileList([file]);
	};

	// Check if all required fields are filled
	const isFormComplete =
		profileData.name &&
		profileData.username &&
		profileData.email &&
		profileData.gender;

	return (
		<div className="mt-8 space-y-6">
			{/* Full Name */}
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

			{/* Username */}
			<div>
				<Text strong className="block text-gray-700 mb-2">
					Username
				</Text>
				<Input
					name="username"
					value={profileData.username || ""}
					onChange={handleInputChange}
					placeholder="Choose a unique username"
					className="w-full"
				/>
			</div>

			{/* Email */}
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

			{/* Date of Birth */}
			<div>
				<Text strong className="block text-gray-700 mb-2">
					Date of Birth
				</Text>
				<DatePicker
					onChange={handleDateChange}
					className="w-full"
					placeholder="Select your date of birth"
				/>
			</div>

			{/* Gender */}
			<div>
				<Text strong className="block text-gray-700 mb-2">
					Gender
				</Text>
				<Select
					placeholder="Select your gender"
					onChange={handleGenderChange}
					className="w-full"
					value={profileData.gender || undefined}
				>
					<Option value="male">Male</Option>
					<Option value="female">Female</Option>
					<Option value="other">Other</Option>
				</Select>
			</div>

			{/* Bio */}
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

			{/* Profile Picture Upload */}
			<div>
				<Text strong className="block text-gray-700 mb-2">
					Profile Picture
				</Text>
				<Upload
					beforeUpload={() => false}
					onChange={handleFileChange}
					listType="picture-card"
					fileList={fileList}
				>
					{profileData.profilePicture ? (
						<img
							src={profileData.profilePicture}
							alt="Profile"
							style={{ width: "100%" }}
						/>
					) : (
						<div>
							<UploadOutlined />
							<div style={{ marginTop: 8 }}>Upload</div>
						</div>
					)}
				</Upload>
			</div>
		</div>
	);
};

export default Step1;
