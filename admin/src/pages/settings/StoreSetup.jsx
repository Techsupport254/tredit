import { useNavigate } from "react-router-dom";
import { useAccount } from "../../Context/AccountContext";
import {
	UserOutlined,
	ShopOutlined,
	YoutubeOutlined,
	InstagramOutlined,
	TwitterOutlined,
	GlobalOutlined,
	LinkOutlined,
} from "@ant-design/icons";
import {
	Button,
	Typography,
	message,
	Avatar,
	Form,
	Input,
	Select,
	Switch,
	Divider,
} from "antd";
import styled from "styled-components";
import { useState } from "react";

const { Title, Text } = Typography;
const { TextArea } = Input;

const Container = styled.div`
	width: 1000px;
	max-width: 90%;
	margin: 32px auto;
`;

const StoreForm = styled.div`
	padding: 32px;
	background: white;
	border-radius: 16px;
	box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
`;

const FormSection = styled.div`
	margin-bottom: 24px;

	.section-title {
		margin-bottom: 16px;
		color: #1f1f1f;
		font-weight: 500;
	}
`;

const SocialInput = styled(Form.Item)`
	.ant-form-item-label > label {
		display: flex;
		align-items: center;
		gap: 8px;

		.anticon {
			font-size: 16px;
			color: #1890ff;
		}
	}
`;

const UserProfile = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 32px;

	.user-info {
		flex: 1;
	}

	.user-name {
		font-weight: 500;
		color: #1f1f1f;
		font-size: 16px;
	}

	.user-email {
		color: #666;
		font-size: 14px;
	}
`;

const StoreSetup = () => {
	const { walletAddress, linkGoogleProfile, googleUser } = useAccount();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();

	const categories = [
		{ value: "fashion", label: "Fashion & Apparel" },
		{ value: "electronics", label: "Electronics & Gadgets" },
		{ value: "beauty", label: "Beauty & Personal Care" },
		{ value: "home", label: "Home & Living" },
		{ value: "sports", label: "Sports & Outdoor" },
		{ value: "digital", label: "Digital Products" },
		{ value: "art", label: "Art & Collectibles" },
		{ value: "food", label: "Food & Beverages" },
		{ value: "other", label: "Other" },
	];

	const handleSubmit = async (values) => {
		try {
			setLoading(true);
			message.loading({
				content: "Creating your store...",
				key: "storeCreation",
				duration: 0,
			});

			// Prepare social media links
			const socialMedias = [];
			if (values.website) {
				socialMedias.push({ type: "website", url: values.website });
			}
			if (values.instagram) {
				socialMedias.push({ type: "instagram", url: values.instagram });
			}
			if (values.twitter) {
				socialMedias.push({ type: "twitter", url: values.twitter });
			}

			await linkGoogleProfile(walletAddress, {
				uid: googleUser.uid,
				email: googleUser.email,
				name: googleUser.name,
				photoURL: googleUser.photoURL,
				accessToken: googleUser.accessToken,
				storeName: values.storeName,
				description: values.description,
				category: values.category,
				socialMedias,
				youtube: googleUser.youtube,
				settings: {
					enableYouTubeIntegration: values.enableYouTube,
					enableSocialSharing: values.enableSocialSharing,
					allowComments: values.allowComments,
				},
			});

			message.success({
				content: "Store created successfully!",
				key: "storeCreation",
			});

			setTimeout(() => {
				navigate("/dashboard");
			}, 1000);
		} catch (error) {
			console.error("Store creation error:", error);
			message.error({
				content: error.message || "Failed to create store. Please try again.",
				key: "storeCreation",
			});
		} finally {
			setLoading(false);
		}
	};

	if (!googleUser) {
		navigate("/profile-setup");
		return null;
	}

	return (
		<Container>
			<Title level={2} style={{ marginBottom: 8 }}>
				Create Your Store
			</Title>
			<Text type="secondary" style={{ display: "block", marginBottom: 32 }}>
				Set up your store profile and start selling
			</Text>

			<StoreForm>
				<UserProfile>
					<Avatar
						size={48}
						src={googleUser.photoURL}
						alt={googleUser.name}
						icon={!googleUser.photoURL && <UserOutlined />}
					/>
					<div className="user-info">
						<div className="user-name">{googleUser.name}</div>
						<div className="user-email">{googleUser.email}</div>
					</div>
				</UserProfile>

				<Form
					form={form}
					layout="vertical"
					onFinish={handleSubmit}
					initialValues={{
						storeName: `${googleUser.name}'s Store`,
						enableYouTube: !!googleUser.youtube,
						enableSocialSharing: true,
						allowComments: true,
					}}
				>
					<FormSection>
						<Title level={5} className="section-title">
							Store Information
						</Title>
						<Form.Item
							name="storeName"
							label="Store Name"
							rules={[
								{ required: true, message: "Please enter your store name" },
							]}
						>
							<Input placeholder="Enter your store name" />
						</Form.Item>

						<Form.Item
							name="description"
							label="Store Description"
							rules={[
								{ required: true, message: "Please enter a store description" },
							]}
						>
							<TextArea
								placeholder="Describe your store and what you sell..."
								rows={4}
							/>
						</Form.Item>

						<Form.Item
							name="category"
							label="Store Category"
							rules={[{ required: true, message: "Please select a category" }]}
						>
							<Select
								placeholder="Select your store category"
								options={categories}
							/>
						</Form.Item>
					</FormSection>

					<Divider />

					<FormSection>
						<Title level={5} className="section-title">
							Social Media Links
						</Title>
						<SocialInput
							name="website"
							label={
								<>
									<GlobalOutlined /> Website
								</>
							}
						>
							<Input placeholder="https://your-website.com" />
						</SocialInput>

						<SocialInput
							name="instagram"
							label={
								<>
									<InstagramOutlined /> Instagram
								</>
							}
						>
							<Input placeholder="Instagram profile URL" />
						</SocialInput>

						<SocialInput
							name="twitter"
							label={
								<>
									<TwitterOutlined /> Twitter
								</>
							}
						>
							<Input placeholder="Twitter profile URL" />
						</SocialInput>
					</FormSection>

					<Divider />

					<FormSection>
						<Title level={5} className="section-title">
							Store Settings
						</Title>
						{googleUser.youtube && (
							<Form.Item
								name="enableYouTube"
								valuePropName="checked"
								label={
									<>
										<YoutubeOutlined /> Enable YouTube Integration
									</>
								}
							>
								<Switch />
							</Form.Item>
						)}

						<Form.Item
							name="enableSocialSharing"
							valuePropName="checked"
							label={
								<>
									<LinkOutlined /> Enable Social Sharing
								</>
							}
						>
							<Switch />
						</Form.Item>

						<Form.Item
							name="allowComments"
							valuePropName="checked"
							label="Allow Comments on Products"
						>
							<Switch />
						</Form.Item>
					</FormSection>

					<Button
						type="primary"
						size="large"
						block
						htmlType="submit"
						loading={loading}
						icon={<ShopOutlined />}
					>
						Create Store
					</Button>
				</Form>
			</StoreForm>
		</Container>
	);
};

export default StoreSetup;
