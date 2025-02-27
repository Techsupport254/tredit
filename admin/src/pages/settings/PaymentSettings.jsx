import React, { useState } from "react";
import {
	Input,
	Button,
	Card,
	Select,
	Switch,
	message,
	Divider,
	Tooltip,
} from "antd";
import {
	FaCreditCard,
	FaPaypal,
	FaSave,
	FaLock,
	FaUniversity,
	FaRegQuestionCircle,
} from "react-icons/fa";

const { Option } = Select;

const PaymentSettings = () => {
	const [settings, setSettings] = useState({
		defaultMethod: "PayPal",
		bankAccount: "",
		paypalEmail: "",
		cardNumber: "",
		cardHolder: "",
		expiryDate: "",
		cvv: "",
		autoWithdraw: false,
		minBalance: 50,
	});

	const handleChange = (name, value) => {
		setSettings({ ...settings, [name]: value });
	};

	const handleSave = () => {
		message.success("Payment settings updated successfully!");
	};

	return (
		<div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header Section */}
			<div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
				<h2 className="text-xl font-bold">Payment Settings</h2>
				<p className="text-gray-200 text-sm">
					Manage your preferred payment method, withdrawals, and security
					settings.
				</p>
			</div>

			{/* Payment Preferences */}
			<Card className="mt-6 p-4 shadow-md">
				<h3 className="text-lg font-semibold mb-4 text-gray-700">
					Payment Preferences
				</h3>

				{/* Default Payment Method */}
				<label className="text-sm font-semibold text-gray-600">
					Default Payment Method
				</label>
				<Select
					value={settings.defaultMethod}
					onChange={(value) => handleChange("defaultMethod", value)}
					className="w-full mt-1 mb-4"
					size="large"
				>
					<Option value="PayPal">
						<div className="flex items-center gap-2">
							<FaPaypal className="text-blue-500" /> PayPal
						</div>
					</Option>
					<Option value="Bank Transfer">
						<div className="flex items-center gap-2">
							<FaUniversity className="text-green-500" /> Bank Transfer
						</div>
					</Option>
					<Option value="Credit Card">
						<div className="flex items-center gap-2">
							<FaCreditCard className="text-orange-500" /> Credit Card
						</div>
					</Option>
				</Select>

				{/* Bank Account Input */}
				{settings.defaultMethod === "Bank Transfer" && (
					<div className="mb-4">
						<label className="text-sm font-semibold text-gray-600">
							Bank Account Number
						</label>
						<Input
							value={settings.bankAccount}
							onChange={(e) => handleChange("bankAccount", e.target.value)}
							prefix={<FaUniversity className="text-gray-400" />}
							className="mt-1 p-2"
							size="large"
							placeholder="Enter your bank account number"
						/>
					</div>
				)}

				{/* PayPal Email Input */}
				{settings.defaultMethod === "PayPal" && (
					<div className="mb-4">
						<label className="text-sm font-semibold text-gray-600">
							PayPal Email
						</label>
						<Input
							type="email"
							value={settings.paypalEmail}
							onChange={(e) => handleChange("paypalEmail", e.target.value)}
							prefix={<FaPaypal className="text-gray-400" />}
							className="mt-1 p-2"
							size="large"
							placeholder="Enter your PayPal email"
						/>
					</div>
				)}

				{/* Credit Card Details */}
				{settings.defaultMethod === "Credit Card" && (
					<div className="mb-4">
						<label className="text-sm font-semibold text-gray-600">
							Card Number
						</label>
						<Input
							value={settings.cardNumber}
							onChange={(e) => handleChange("cardNumber", e.target.value)}
							prefix={<FaCreditCard className="text-gray-400" />}
							className="mt-1 p-2"
							size="large"
							placeholder="Enter your card number"
						/>
						<div className="grid grid-cols-2 gap-2 mt-3">
							<Input
								value={settings.expiryDate}
								onChange={(e) => handleChange("expiryDate", e.target.value)}
								placeholder="MM/YY"
								className="p-2"
							/>
							<Input
								type="password"
								value={settings.cvv}
								onChange={(e) => handleChange("cvv", e.target.value)}
								placeholder="CVV"
								className="p-2"
							/>
						</div>
					</div>
				)}

				<Divider />

				{/* Auto Withdraw Settings */}
				<div className="flex justify-between items-center mt-4 p-3 bg-gray-100 rounded-lg">
					<label className="text-sm font-semibold text-gray-700 flex items-center">
						Enable Auto Withdraw{" "}
						<Tooltip title="Automatically withdraw funds when balance exceeds minimum threshold">
							<FaRegQuestionCircle className="ml-2 text-gray-400 cursor-pointer" />
						</Tooltip>
					</label>
					<Switch
						checked={settings.autoWithdraw}
						onChange={(checked) => handleChange("autoWithdraw", checked)}
					/>
				</div>

				{/* Minimum Balance for Auto Withdraw */}
				{settings.autoWithdraw && (
					<div className="mt-3">
						<label className="text-sm font-semibold text-gray-600">
							Minimum Balance for Auto Withdraw ($)
						</label>
						<Input
							type="number"
							value={settings.minBalance}
							onChange={(e) => handleChange("minBalance", e.target.value)}
							className="p-2 mt-1"
						/>
					</div>
				)}

				<Divider />

				{/* Security Section */}
				<h3 className="text-lg font-semibold mb-3 text-gray-700">Security</h3>
				<div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
					<label className="text-sm font-semibold text-gray-700">
						Two-Factor Authentication
					</label>
					<Switch />
				</div>

				<div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg mt-3">
					<label className="text-sm font-semibold text-gray-700">
						Require PIN for Transactions
					</label>
					<Switch />
				</div>

				{/* Save Button */}
				<Button
					type="primary"
					icon={<FaSave />}
					className="w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold p-2 rounded-lg shadow-md hover:opacity-90 transition"
					size="large"
					onClick={handleSave}
				>
					Save Changes
				</Button>
			</Card>
		</div>
	);
};

export default PaymentSettings;
