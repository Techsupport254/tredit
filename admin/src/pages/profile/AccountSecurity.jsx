import React from "react";
import {
	FaLock,
	FaShieldAlt,
	FaHistory,
	FaEye,
	FaEyeSlash,
} from "react-icons/fa";
import { Button, Switch, List, Card } from "antd";
import { useState } from "react";

const loginActivities = [
	{
		id: 1,
		device: "Chrome - Windows",
		location: "Dubai, UAE",
		date: "Feb 22, 2025",
	},
	{
		id: 2,
		device: "Safari - iPhone",
		location: "Abu Dhabi, UAE",
		date: "Feb 20, 2025",
	},
	{
		id: 3,
		device: "Firefox - MacOS",
		location: "Sharjah, UAE",
		date: "Feb 18, 2025",
	},
];

const AccountSecurity = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(true);

	return (
		<div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Security Header */}
			<div className="flex items-center justify-between bg-gradient-to-r from-red-500 to-orange-600 p-6 rounded-lg text-white">
				<div className="flex items-center gap-4">
					<FaShieldAlt className="text-4xl" />
					<div>
						<h2 className="text-xl font-semibold">Account Security</h2>
						<p className="text-gray-200 text-sm">
							Manage your security settings
						</p>
					</div>
				</div>
			</div>

			{/* Password Management */}
			<div className="mt-6">
				<h3 className="text-lg font-semibold">Password</h3>
				<div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mt-2">
					<p className="text-gray-600">
						{showPassword ? "MySecurePass123!" : "••••••••"}
					</p>
					<Button
						type="text"
						icon={showPassword ? <FaEyeSlash /> : <FaEye />}
						onClick={() => setShowPassword(!showPassword)}
					/>
				</div>
				<Button
					type="primary"
					className="w-full mt-3 bg-blue-600 border-blue-600"
				>
					Change Password
				</Button>
			</div>

			{/* Two-Factor Authentication (2FA) */}
			<div className="mt-6">
				<h3 className="text-lg font-semibold">
					Two-Factor Authentication (2FA)
				</h3>
				<div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg mt-2">
					<p className="text-gray-600">Enable 2FA for extra security</p>
					<Switch
						checked={isTwoFactorEnabled}
						onChange={() => setIsTwoFactorEnabled(!isTwoFactorEnabled)}
					/>
				</div>
			</div>

			{/* Login Activity */}
			<div className="mt-6">
				<h3 className="text-lg font-semibold">Recent Login Activity</h3>
				<Card className="mt-2">
					<List
						dataSource={loginActivities}
						renderItem={({ id, device, location, date }) => (
							<List.Item className="flex justify-between items-center p-3 border-b">
								<div>
									<p className="font-medium">{device}</p>
									<span className="text-gray-500 text-sm">{location}</span>
								</div>
								<p className="text-gray-600">{date}</p>
							</List.Item>
						)}
					/>
				</Card>
			</div>
		</div>
	);
};

export default AccountSecurity;
