import React, { useState } from "react";
import { Input, Button, Card, Upload, message } from "antd";
import { FaUserCircle, FaUpload, FaSave } from "react-icons/fa";
import { UploadOutlined } from "@ant-design/icons";
import { useAccount } from "../../Context/AccountContext";

const ProfileSettings = () => {
	const { profile } = useAccount();

	const [profilePicture, setProfilePicture] = useState(
		profile.profilePicture || null
	);

	const handleInputChange = (e) => {
		setProfile({ ...profile, [e.target.name]: e.target.value });
	};

	const handleUpload = (file) => {
		setProfilePicture(URL.createObjectURL(file));
		message.success("Profile picture updated successfully!");
		return false;
	};

	const handleSave = () => {
		message.success("Profile updated successfully!");
	};

	return (
		<div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header */}
			<div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
				<h2 className="text-xl font-semibold">Profile Settings</h2>
				<p className="text-gray-200 text-sm">Update your profile details</p>
			</div>

			{/* Profile Picture Upload */}
			<div className="flex justify-center mt-4">
				{profilePicture ? (
					<img
						src={profilePicture}
						alt="Profile"
						className="w-24 h-24 rounded-full border-4 border-gray-300 shadow-md"
					/>
				) : (
					<FaUserCircle className="w-24 h-24 text-gray-300" />
				)}
			</div>
			<div className="flex justify-center mt-3">
				<Upload showUploadList={false} beforeUpload={handleUpload}>
					<Button icon={<UploadOutlined />} className="bg-blue-500 text-white">
						Upload Picture
					</Button>
				</Upload>
			</div>

			{/* Profile Form */}
			<Card className="mt-6">
				<h3 className="text-lg font-semibold mb-3">Edit Profile</h3>

				<label className="text-sm font-semibold">Full Name</label>
				<Input
					name="name"
					value={profile.name}
					onChange={handleInputChange}
					className="mb-3"
				/>

				<label className="text-sm font-semibold">Username</label>
				<Input
					name="username"
					value={profile.username}
					onChange={handleInputChange}
					className="mb-3"
				/>

				<label className="text-sm font-semibold">Email</label>
				<Input
					name="email"
					type="email"
					value={profile.email}
					onChange={handleInputChange}
					className="mb-3"
				/>

				<label className="text-sm font-semibold">Bio</label>
				<Input.TextArea
					name="bio"
					value={profile.bio}
					onChange={handleInputChange}
					rows={3}
					className="mb-3"
				/>

				<Button
					type="primary"
					icon={<FaSave />}
					className="w-full bg-green-500 mt-4"
					onClick={handleSave}
				>
					Save Changes
				</Button>
			</Card>
		</div>
	);
};

export default ProfileSettings;
