import React, { useState } from "react";
import {
	Card,
	Button,
	Form,
	Input,
	Switch,
	message,
	notification,
	Modal,
	Space,
	Divider,
} from "antd";
import {
	LockOutlined,
	SafetyCertificateOutlined,
	MobileOutlined,
	MailOutlined,
	KeyOutlined,
} from "@ant-design/icons";

const Security = () => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);

	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);
			// Add your API call here
			message.success("Security settings updated successfully");
		} catch (error) {
			message.error("Please fill in all required fields");
		} finally {
			setLoading(false);
		}
	};

	const handleEnable2FA = () => {
		Modal.confirm({
			title: "Enable Two-Factor Authentication",
			content:
				"Are you sure you want to enable 2FA? You'll need to set up an authenticator app.",
			okText: "Enable",
			onOk: async () => {
				try {
					// Add your 2FA setup API call here
					message.success("Two-factor authentication enabled successfully");
				} catch (error) {
					message.error("Failed to enable two-factor authentication");
				}
			},
		});
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold mb-6">Security Settings</h1>

			<Card className="mb-6">
				<Form
					form={form}
					layout="vertical"
					initialValues={{
						twoFactorAuth: false,
						emailNotifications: true,
						smsNotifications: true,
						requirePin: true,
						autoLogout: true,
						loginAlerts: true,
					}}
				>
					<div className="mb-6">
						<h2 className="text-lg font-medium mb-4">
							Two-Factor Authentication
						</h2>
						<Space direction="vertical" style={{ width: "100%" }}>
							<div className="flex justify-between items-center">
								<div>
									<h3 className="font-medium">
										Two-Factor Authentication (2FA)
									</h3>
									<p className="text-gray-500 text-sm">
										Add an extra layer of security to your account
									</p>
								</div>
								<Button
									type="primary"
									icon={<SafetyCertificateOutlined />}
									onClick={handleEnable2FA}
								>
									Enable 2FA
								</Button>
							</div>
						</Space>
					</div>

					<Divider />

					<div className="mb-6">
						<h2 className="text-lg font-medium mb-4">Login Security</h2>
						<Form.Item
							name="requirePin"
							valuePropName="checked"
							label="Require PIN for Transactions"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							name="autoLogout"
							valuePropName="checked"
							label="Auto Logout After Inactivity"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							name="loginAlerts"
							valuePropName="checked"
							label="Login Alerts"
						>
							<Switch />
						</Form.Item>
					</div>

					<Divider />

					<div className="mb-6">
						<h2 className="text-lg font-medium mb-4">Notifications</h2>
						<Form.Item
							name="emailNotifications"
							valuePropName="checked"
							label="Email Notifications"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							name="smsNotifications"
							valuePropName="checked"
							label="SMS Notifications"
						>
							<Switch />
						</Form.Item>
					</div>

					<Divider />

					<div className="mb-6">
						<h2 className="text-lg font-medium mb-4">Password</h2>
						<Form.Item
							name="currentPassword"
							label="Current Password"
							rules={[
								{
									required: true,
									message: "Please enter your current password",
								},
							]}
						>
							<Input.Password prefix={<LockOutlined />} />
						</Form.Item>
						<Form.Item
							name="newPassword"
							label="New Password"
							rules={[
								{ required: true, message: "Please enter a new password" },
								{ min: 8, message: "Password must be at least 8 characters" },
							]}
						>
							<Input.Password prefix={<KeyOutlined />} />
						</Form.Item>
						<Form.Item
							name="confirmPassword"
							label="Confirm New Password"
							dependencies={["newPassword"]}
							rules={[
								{ required: true, message: "Please confirm your new password" },
								({ getFieldValue }) => ({
									validator(_, value) {
										if (!value || getFieldValue("newPassword") === value) {
											return Promise.resolve();
										}
										return Promise.reject(new Error("Passwords do not match"));
									},
								}),
							]}
						>
							<Input.Password prefix={<KeyOutlined />} />
						</Form.Item>
					</div>

					<Button
						type="primary"
						onClick={handleSave}
						loading={loading}
						className="w-full"
					>
						Save Changes
					</Button>
				</Form>
			</Card>
		</div>
	);
};

export default Security;
