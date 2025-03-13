import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBusiness } from "../../Context/BusinessContext";
import { BUSINESS_CONSTANTS } from "../../constants/businessConstants";
import {
	Form,
	Input,
	Select,
	Switch,
	Upload,
	Button,
	Steps,
	Card,
	message,
	Typography,
	Divider,
	Space,
} from "antd";
import {
	FaBuilding,
	FaStore,
	FaGlobe,
	FaPhone,
	FaEnvelope,
	FaMapMarkerAlt,
	FaWallet,
	FaImage,
	FaInfoCircle,
} from "react-icons/fa";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

const CreateBusiness = () => {
	const navigate = useNavigate();
	const { createBusiness } = useBusiness();
	const [form] = Form.useForm();
	const [currentStep, setCurrentStep] = useState(0);
	const [loading, setLoading] = useState(false);
	const [businessType, setBusinessType] = useState(null);

	const steps = [
		{
			title: "Basic Info",
			icon: <FaInfoCircle />,
		},
		{
			title: "Business Details",
			icon: <FaBuilding />,
		},
		{
			title: "Contact & Location",
			icon: <FaMapMarkerAlt />,
		},
		{
			title: "Financial",
			icon: <FaWallet />,
		},
	];

	const handleSubmit = async (values) => {
		try {
			setLoading(true);
			await createBusiness(values);
			message.success("Business created successfully!");
			navigate("/businesses");
		} catch (error) {
			message.error(error.message || "Failed to create business");
		} finally {
			setLoading(false);
		}
	};

	const next = async () => {
		try {
			await form.validateFields();
			setCurrentStep(currentStep + 1);
		} catch (error) {
			console.error("Validation failed:", error);
		}
	};

	const prev = () => {
		setCurrentStep(currentStep - 1);
	};

	const renderBasicInfo = () => (
		<div className="space-y-6">
			<Form.Item
				label="Business Name"
				name="name"
				rules={[{ required: true, message: "Please enter business name" }]}
			>
				<Input
					prefix={<FaStore className="text-gray-400" />}
					placeholder="Enter business name"
				/>
			</Form.Item>

			<Form.Item
				label="Business Type"
				name="type"
				rules={[{ required: true, message: "Please select business type" }]}
			>
				<Select
					placeholder="Select business type"
					onChange={(value) => setBusinessType(value)}
				>
					<Select.Option value="product">Product-based</Select.Option>
					<Select.Option value="service">Service-based</Select.Option>
				</Select>
			</Form.Item>

			<Form.Item
				label="Description"
				name="description"
				rules={[
					{ required: true, message: "Please enter business description" },
				]}
			>
				<TextArea rows={4} placeholder="Describe your business" />
			</Form.Item>

			<Form.Item
				label={
					businessType === "product"
						? "Product Categories"
						: "Service Categories"
				}
				name={
					businessType === "product" ? "productCategories" : "serviceCategories"
				}
				rules={[
					{
						required: true,
						message: `Please select ${
							businessType === "product" ? "product" : "service"
						} categories`,
					},
					{
						validator: (_, value) => {
							if (!value || value.length === 0) {
								return Promise.reject(
									`Please select at least one ${businessType} category`
								);
							}
							const categories =
								businessType === "product"
									? BUSINESS_CONSTANTS.PRODUCT_CATEGORIES
									: BUSINESS_CONSTANTS.SERVICE_CATEGORIES;
							const invalidCategories = value.filter(
								(category) => !categories.includes(category)
							);
							if (invalidCategories.length > 0) {
								return Promise.reject(
									`Invalid ${businessType} categories: ${invalidCategories.join(
										", "
									)}`
								);
							}
							return Promise.resolve();
						},
					},
				]}
			>
				<Select
					mode="multiple"
					placeholder={`Select ${
						businessType === "product" ? "product" : "service"
					} categories`}
					options={(businessType === "product"
						? BUSINESS_CONSTANTS.PRODUCT_CATEGORIES
						: BUSINESS_CONSTANTS.SERVICE_CATEGORIES
					).map((category) => ({
						label: category,
						value: category,
					}))}
				/>
			</Form.Item>

			<Form.Item label="Logo" name="logo">
				<Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
					<div className="text-center">
						<FaImage className="text-2xl text-gray-400 mb-2" />
						<div>Upload Logo</div>
					</div>
				</Upload>
			</Form.Item>
		</div>
	);

	const renderBusinessDetails = () => (
		<div className="space-y-6">
			<Form.Item
				label="Business Model"
				name="businessModel"
				rules={[{ required: true, message: "Please select business model" }]}
			>
				<Select placeholder="Select business model">
					<Select.Option value="B2C">Business to Consumer (B2C)</Select.Option>
					<Select.Option value="B2B">Business to Business (B2B)</Select.Option>
					<Select.Option value="C2C">Consumer to Consumer (C2C)</Select.Option>
				</Select>
			</Form.Item>

			<Form.Item
				label="Operation Mode"
				name="operationMode"
				rules={[{ required: true, message: "Please select operation mode" }]}
			>
				<Select placeholder="Select operation mode">
					<Select.Option value="physical">Physical Store</Select.Option>
					<Select.Option value="online">Online Only</Select.Option>
					<Select.Option value="hybrid">Hybrid</Select.Option>
				</Select>
			</Form.Item>

			{businessType === "product" && (
				<Form.Item
					label="Inventory Management"
					name="inventoryManagement"
					valuePropName="checked"
				>
					<Switch />
				</Form.Item>
			)}
		</div>
	);

	const renderContactLocation = () => (
		<div className="space-y-6">
			<Form.Item
				label="Email"
				name="email"
				rules={[
					{ required: true, message: "Please enter email" },
					{ type: "email", message: "Please enter a valid email" },
				]}
			>
				<Input
					prefix={<FaEnvelope className="text-gray-400" />}
					placeholder="business@example.com"
				/>
			</Form.Item>

			<Form.Item
				label="Phone"
				name="phone"
				rules={[{ required: true, message: "Please enter phone number" }]}
			>
				<Input
					prefix={<FaPhone className="text-gray-400" />}
					placeholder="+1234567890"
				/>
			</Form.Item>

			<Form.Item
				label="Address"
				name="address"
				rules={[{ required: true, message: "Please enter business address" }]}
			>
				<Input
					prefix={<FaMapMarkerAlt className="text-gray-400" />}
					placeholder="Business address"
				/>
			</Form.Item>

			<Form.Item
				label="Website"
				name="website"
				rules={[{ type: "url", message: "Please enter a valid URL" }]}
			>
				<Input
					prefix={<FaGlobe className="text-gray-400" />}
					placeholder="https://example.com"
				/>
			</Form.Item>
		</div>
	);

	const renderFinancial = () => (
		<div className="space-y-6">
			<Form.Item
				label="Pricing Model"
				name="pricingModel"
				rules={[{ required: true, message: "Please select pricing model" }]}
			>
				<Select placeholder="Select pricing model">
					<Select.Option value="fixed">Fixed Pricing</Select.Option>
					<Select.Option value="negotiable">Negotiable</Select.Option>
					<Select.Option value="subscription">Subscription</Select.Option>
				</Select>
			</Form.Item>

			<Form.Item
				label="Currency"
				name="currency"
				rules={[{ required: true, message: "Please select currency" }]}
			>
				<Select placeholder="Select currency">
					<Select.Option value="USD">USD</Select.Option>
					<Select.Option value="EUR">EUR</Select.Option>
					<Select.Option value="GBP">GBP</Select.Option>
					<Select.Option value="JPY">JPY</Select.Option>
					<Select.Option value="KES">KES</Select.Option>
					<Select.Option value="NGN">NGN</Select.Option>
					<Select.Option value="ZAR">ZAR</Select.Option>
				</Select>
			</Form.Item>

			<Form.Item label="Payout Methods" name="payoutMethods">
				<Select mode="multiple" placeholder="Select payout methods">
					<Select.Option value="mobile_money">Mobile Money</Select.Option>
					<Select.Option value="bank_transfer">Bank Transfer</Select.Option>
					<Select.Option value="crypto_wallet">Crypto Wallet</Select.Option>
				</Select>
			</Form.Item>
		</div>
	);

	const renderStepContent = () => {
		switch (currentStep) {
			case 0:
				return renderBasicInfo();
			case 1:
				return renderBusinessDetails();
			case 2:
				return renderContactLocation();
			case 3:
				return renderFinancial();
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<Card className="shadow-sm">
					<div className="text-center mb-8">
						<Title level={2} className="!mb-2">
							Create New Business
						</Title>
						<Text className="text-gray-500">
							Fill in the details below to create your business profile
						</Text>
					</div>

					<Steps current={currentStep} items={steps} className="mb-8" />

					<Form
						form={form}
						layout="vertical"
						onFinish={handleSubmit}
						className="max-w-2xl mx-auto"
					>
						{renderStepContent()}

						<Divider />

						<div className="flex justify-between mt-8">
							{currentStep > 0 && <Button onClick={prev}>Previous</Button>}
							{currentStep < steps.length - 1 && (
								<Button type="primary" onClick={next}>
									Next
								</Button>
							)}
							{currentStep === steps.length - 1 && (
								<Button type="primary" htmlType="submit" loading={loading}>
									Create Business
								</Button>
							)}
						</div>
					</Form>
				</Card>
			</div>
		</div>
	);
};

export default CreateBusiness;
