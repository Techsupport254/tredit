import React from "react";
import { useAccount } from "../../Context/AccountContext";
import {
	FaEnvelope,
	FaUserCircle,
	FaCalendarAlt,
	FaMars,
} from "react-icons/fa";
import SocialMedia from "../../Components/Profile/SocialMedia";

const UserProfile = () => {
	const { profile } = useAccount();

	return (
		<div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
			{/* Profile Header */}
			<div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-center">
				<div className="flex justify-center">
					{profile.profilePicture ? (
						<img
							src={profile.profilePicture}
							alt="Profile"
							className="w-24 h-24 rounded-full border-4 border-white shadow-md"
						/>
					) : (
						<FaUserCircle className="w-24 h-24 text-gray-200" />
					)}
				</div>
				<h2 className="text-white text-xl font-semibold mt-3">
					{profile.name}
				</h2>
				<p className="text-gray-200 text-sm">@{profile.username}</p>
				<p className="text-gray-300 mt-2">{profile.bio}</p>
			</div>

			{/* Profile Details */}
			<div className="p-6 space-y-4">
				<div className="flex items-center space-x-3">
					<FaEnvelope className="text-blue-500" />
					<p className="text-gray-700">
						<span className="font-semibold">Email:</span> {profile.email}
					</p>
				</div>

				<div className="flex items-center space-x-3">
					<FaCalendarAlt className="text-green-500" />
					<p className="text-gray-700">
						<span className="font-semibold">Date of Birth:</span> {profile.dob}
					</p>
				</div>

				<div className="flex items-center space-x-3">
					<FaMars className="text-pink-500" />
					<p className="text-gray-700">
						<span className="font-semibold">Gender:</span> {profile.gender}
					</p>
				</div>
			</div>

			{/* Social Media Links */}
			<SocialMedia />
		</div>
	);
};

export default UserProfile;
