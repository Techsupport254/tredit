"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Form,
	Input,
	Select,
	Button,
	Card,
	Steps,
	Upload,
	DatePicker,
	Switch,
	InputNumber,
	Row,
	Col,
	Typography,
	Space,
	message,
	Divider,
	Tag,
	Progress,
	theme,
} from "antd";
import {
	UploadOutlined,
	ArrowLeftOutlined,
	BuildOutlined,
	ShopOutlined,
	BankOutlined,
	PictureOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import {
	BusinessType,
	BusinessModel,
	BusinessOperationMode,
	Currency,
	PaymentMethod,
	BusinessSize,
	BusinessStage,
	TaxCategory,
	ShippingMethod,
} from "@prisma/client";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface FormData {
	name?: string;
	type?: string;
	category?: string;
	description?: string;
	bio?: string;
	email?: string;
	phone?: string;
	address?: string;
	city?: string;
	country?: string;
	businessModel?: string;
	size?: string;
	stage?: string;
	paymentMethods?: string[];
}

const BusinessSetupPage = () => {
	const [form] = Form.useForm();
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(0);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<FormData>({});
	const { token } = theme.useToken();

	const onValuesChange = (_: unknown, allValues: FormData) => {
		setFormData(allValues);
	};

	const steps = [
		{
			title: "Basic Information",
			icon: <BuildOutlined />,
			content: (
				<div className="space-y-6">
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								name="name"
								label="Business Name"
								rules={[
									{
										required: true,
										message: "Please input your business name!",
									},
								]}
							>
								<Input placeholder="Enter your business name" />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name="type"
								label="Business Type"
								rules={[
									{ required: true, message: "Please select business type!" },
								]}
							>
								<Select placeholder="Select business type">
									{BusinessType &&
										Object.values(BusinessType).map((type) => (
											<Select.Option key={type} value={type}>
												{type}
											</Select.Option>
										))}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Form.Item
						name="category"
						label="Business Category"
						rules={[
							{ required: true, message: "Please input business category!" },
						]}
					>
						<Input placeholder="Enter business category" />
					</Form.Item>

					<Form.Item
						name="description"
						label="Business Description"
						rules={[
							{ required: true, message: "Please input business description!" },
						]}
					>
						<TextArea
							rows={4}
							placeholder="Describe your business"
							className="resize-none"
						/>
					</Form.Item>

					<Form.Item name="bio" label="Business Bio">
						<TextArea
							rows={2}
							placeholder="Short business bio"
							className="resize-none"
						/>
					</Form.Item>
				</div>
			),
		},
		{
			title: "Contact & Location",
			content: (
				<>
					<Form.Item
						name="email"
						label="Business Email"
						rules={[
							{ required: true, message: "Please input business email!" },
							{ type: "email", message: "Please enter a valid email!" },
						]}
					>
						<Input placeholder="Enter business email" />
					</Form.Item>

					<Form.Item
						name="phone"
						label="Business Phone"
						rules={[
							{ required: true, message: "Please input business phone!" },
						]}
					>
						<Input placeholder="Enter business phone" />
					</Form.Item>

					<Form.Item name="alternativePhone" label="Alternative Phone">
						<Input placeholder="Enter alternative phone" />
					</Form.Item>

					<Form.Item
						name="address"
						label="Business Address"
						rules={[
							{ required: true, message: "Please input business address!" },
						]}
					>
						<Input placeholder="Enter business address" />
					</Form.Item>

					<Form.Item
						name="city"
						label="City"
						rules={[{ required: true, message: "Please input city!" }]}
					>
						<Input placeholder="Enter city" />
					</Form.Item>

					<Form.Item name="country" label="Country" initialValue="Kenya">
						<Input disabled />
					</Form.Item>

					<Form.Item name="postalCode" label="Postal Code">
						<Input placeholder="Enter postal code" />
					</Form.Item>
				</>
			),
		},
		{
			title: "Business Details",
			content: (
				<>
					<Form.Item
						name="businessModel"
						label="Business Model"
						rules={[
							{ required: true, message: "Please select business model!" },
						]}
					>
						<Select placeholder="Select business model">
							{BusinessModel &&
								Object.values(BusinessModel).map((model) => (
									<Select.Option key={model} value={model}>
										{model}
									</Select.Option>
								))}
						</Select>
					</Form.Item>

					<Form.Item
						name="operationMode"
						label="Operation Mode"
						rules={[
							{ required: true, message: "Please select operation mode!" },
						]}
					>
						<Select placeholder="Select operation mode">
							{BusinessOperationMode &&
								Object.values(BusinessOperationMode).map((mode) => (
									<Select.Option key={mode} value={mode}>
										{mode}
									</Select.Option>
								))}
						</Select>
					</Form.Item>

					<Form.Item
						name="size"
						label="Business Size"
						rules={[
							{ required: true, message: "Please select business size!" },
						]}
					>
						<Select placeholder="Select business size">
							{BusinessSize &&
								Object.entries(BusinessSize).map(([key, value]) => (
									<Select.Option key={value} value={value}>
										{key}
									</Select.Option>
								))}
						</Select>
					</Form.Item>

					<Form.Item
						name="stage"
						label="Business Stage"
						rules={[
							{ required: true, message: "Please select business stage!" },
						]}
					>
						<Select placeholder="Select business stage">
							{BusinessStage &&
								Object.values(BusinessStage).map((stage) => (
									<Select.Option key={stage} value={stage}>
										{stage}
									</Select.Option>
								))}
						</Select>
					</Form.Item>

					<Form.Item
						name="employeeCount"
						label="Number of Employees"
						initialValue={1}
					>
						<InputNumber min={1} />
					</Form.Item>
				</>
			),
		},
		{
			title: "Financial & Legal",
			content: (
				<>
					<Form.Item
						name="currency"
						label="Primary Currency"
						initialValue={Currency.KES}
					>
						<Select>
							{Currency &&
								Object.values(Currency).map((currency) => (
									<Select.Option key={currency} value={currency}>
										{currency}
									</Select.Option>
								))}
						</Select>
					</Form.Item>

					<Form.Item
						name="paymentMethods"
						label="Accepted Payment Methods"
						rules={[
							{ required: true, message: "Please select payment methods!" },
						]}
					>
						<Select mode="multiple" placeholder="Select payment methods">
							{PaymentMethod &&
								Object.values(PaymentMethod).map((method) => (
									<Select.Option key={method} value={method}>
										{method}
									</Select.Option>
								))}
						</Select>
					</Form.Item>

					<Form.Item
						name="taxCategory"
						label="Tax Category"
						rules={[{ required: true, message: "Please select tax category!" }]}
					>
						<Select placeholder="Select tax category">
							{TaxCategory &&
								Object.values(TaxCategory).map((category) => (
									<Select.Option key={category} value={category}>
										{category}
									</Select.Option>
								))}
						</Select>
					</Form.Item>

					<Form.Item
						name="shippingMethod"
						label="Shipping Method"
						rules={[
							{ required: true, message: "Please select shipping method!" },
						]}
					>
						<Select placeholder="Select shipping method">
							{ShippingMethod &&
								Object.values(ShippingMethod).map((method) => (
									<Select.Option key={method} value={method}>
										{method}
									</Select.Option>
								))}
						</Select>
					</Form.Item>

					<Form.Item
						name="registrationNumber"
						label="Business Registration Number"
					>
						<Input placeholder="Enter registration number" />
					</Form.Item>

					<Form.Item name="taxId" label="Tax ID">
						<Input placeholder="Enter tax ID" />
					</Form.Item>
				</>
			),
		},
		{
			title: "Media & Documents",
			content: (
				<>
					<Form.Item
						name="logo"
						label="Business Logo"
						valuePropName="fileList"
						getValueFromEvent={(e) => {
							if (Array.isArray(e)) {
								return e;
							}
							return e?.fileList;
						}}
					>
						<Upload listType="picture" maxCount={1} beforeUpload={() => false}>
							<Button icon={<UploadOutlined />}>Upload Logo</Button>
						</Upload>
					</Form.Item>

					<Form.Item
						name="coverImage"
						label="Cover Image"
						valuePropName="fileList"
						getValueFromEvent={(e) => {
							if (Array.isArray(e)) {
								return e;
							}
							return e?.fileList;
						}}
					>
						<Upload listType="picture" maxCount={1} beforeUpload={() => false}>
							<Button icon={<UploadOutlined />}>Upload Cover Image</Button>
						</Upload>
					</Form.Item>

					<Form.Item
						name="images"
						label="Additional Images"
						valuePropName="fileList"
						getValueFromEvent={(e) => {
							if (Array.isArray(e)) {
								return e;
							}
							return e?.fileList;
						}}
					>
						<Upload listType="picture" multiple beforeUpload={() => false}>
							<Button icon={<UploadOutlined />}>Upload Images</Button>
						</Upload>
					</Form.Item>

					<Form.Item
						name="documents"
						label="Business Documents"
						valuePropName="fileList"
						getValueFromEvent={(e) => {
							if (Array.isArray(e)) {
								return e;
							}
							return e?.fileList;
						}}
					>
						<Upload multiple beforeUpload={() => false}>
							<Button icon={<UploadOutlined />}>Upload Documents</Button>
						</Upload>
					</Form.Item>
				</>
			),
		},
	];

	const handleSubmit = async (values: any) => {
		setLoading(true);
		try {
			// TODO: Implement API call to create business
			console.log("Form values:", values);
			message.success("Business setup completed successfully!");
			router.push("/dashboard/businesses");
		} catch (error) {
			message.error("Failed to setup business. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const next = () => {
		setCurrentStep(currentStep + 1);
	};

	const prev = () => {
		setCurrentStep(currentStep - 1);
	};

	const calculateProgress = () => {
		const totalFields = Object.keys(form.getFieldsValue()).length;
		const filledFields = Object.values(form.getFieldsValue()).filter(
			(value) => value !== undefined && value !== ""
		).length;
		return Math.round((filledFields / totalFields) * 100);
	};

	const PreviewPanel = () => (
		<div className="h-full flex flex-col">
			<Card
				className="flex-grow"
				style={{
					background: token.colorBgElevated,
					borderRadius: token.borderRadiusLG,
					boxShadow: token.boxShadowTertiary,
				}}
			>
				<div className="flex items-center justify-between mb-4">
					<Title level={4} style={{ margin: 0 }}>
						Business Preview
					</Title>
					<Progress
						type="circle"
						percent={calculateProgress()}
						width={40}
						format={(percent) => `${percent}%`}
					/>
				</div>

				<Divider style={{ margin: "12px 0" }} />

				<div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
					{formData.name && (
						<div>
							<Text type="secondary">Business Name</Text>
							<div className="mt-1">
								<Text strong>{formData.name}</Text>
							</div>
						</div>
					)}

					{formData.type && (
						<div>
							<Text type="secondary">Type</Text>
							<div className="mt-1">
								<Tag color="blue">{formData.type}</Tag>
							</div>
						</div>
					)}

					{formData.category && (
						<div>
							<Text type="secondary">Category</Text>
							<div className="mt-1">
								<Tag color="green">{formData.category}</Tag>
							</div>
						</div>
					)}

					{formData.description && (
						<div>
							<Text type="secondary">Description</Text>
							<div className="mt-1">
								<Paragraph style={{ margin: 0 }}>
									{formData.description}
								</Paragraph>
							</div>
						</div>
					)}

					{formData.bio && (
						<div>
							<Text type="secondary">Bio</Text>
							<div className="mt-1">
								<Paragraph style={{ margin: 0 }}>{formData.bio}</Paragraph>
							</div>
						</div>
					)}

					{(formData.email || formData.phone) && (
						<div>
							<Text type="secondary">Contact</Text>
							<div className="mt-1 space-y-1">
								{formData.email && <Text>{formData.email}</Text>}
								{formData.phone && <Text>{formData.phone}</Text>}
							</div>
						</div>
					)}

					{(formData.address || formData.city || formData.country) && (
						<div>
							<Text type="secondary">Location</Text>
							<div className="mt-1 space-y-1">
								{formData.address && <Text>{formData.address}</Text>}
								{formData.city && <Text>{formData.city}</Text>}
								{formData.country && <Text>{formData.country}</Text>}
							</div>
						</div>
					)}

					{formData.businessModel && (
						<div>
							<Text type="secondary">Business Model</Text>
							<div className="mt-1">
								<Tag color="purple">{formData.businessModel}</Tag>
							</div>
						</div>
					)}

					{formData.size && (
						<div>
							<Text type="secondary">Size</Text>
							<div className="mt-1">
								<Tag color="orange">{formData.size}</Tag>
							</div>
						</div>
					)}

					{formData.stage && (
						<div>
							<Text type="secondary">Stage</Text>
							<div className="mt-1">
								<Tag color="cyan">{formData.stage}</Tag>
							</div>
						</div>
					)}

					{formData.paymentMethods && formData.paymentMethods.length > 0 && (
						<div>
							<Text type="secondary">Payment Methods</Text>
							<div className="mt-1 flex flex-wrap gap-1">
								{formData.paymentMethods.map((method) => (
									<Tag key={method} color="gold">
										{method}
									</Tag>
								))}
							</div>
						</div>
					)}
				</div>
			</Card>
		</div>
	);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-[1600px] mx-auto p-6">
				<Card
					className="mb-6"
					style={{
						background: token.colorBgContainer,
						borderRadius: token.borderRadiusLG,
						boxShadow: token.boxShadowTertiary,
					}}
				>
					<div className="flex items-center justify-between">
						<div>
							<Title level={2} style={{ margin: 0 }}>
								Business Setup
							</Title>
							<Text type="secondary">
								Create and configure your business profile
							</Text>
						</div>
						<Space>
							<Button
								icon={<ArrowLeftOutlined />}
								onClick={() => router.back()}
							>
								Back to Businesses
							</Button>
						</Space>
					</div>
				</Card>

				<Row gutter={24}>
					<Col span={14}>
						<Card
							style={{
								background: token.colorBgContainer,
								borderRadius: token.borderRadiusLG,
								boxShadow: token.boxShadowTertiary,
							}}
							bodyStyle={{ padding: 0 }}
						>
							<div className="px-8 py-6 border-b border-gray-200">
								<Steps
									current={currentStep}
									items={steps.map((item) => ({
										title: item.title,
										icon: item.icon,
									}))}
									className="px-4"
								/>
							</div>

							<Form
								form={form}
								layout="vertical"
								onFinish={handleSubmit}
								onValuesChange={onValuesChange}
								className="p-8"
							>
								<div className="min-h-[400px]">
									{steps[currentStep].content}
								</div>

								<Divider />

								<div className="flex justify-between items-center pt-4">
									<Button
										size="large"
										onClick={prev}
										disabled={currentStep === 0}
									>
										Previous
									</Button>
									<Space>
										{currentStep < steps.length - 1 && (
											<Button type="primary" size="large" onClick={next}>
												Save & Continue
											</Button>
										)}
										{currentStep === steps.length - 1 && (
											<Button
												type="primary"
												size="large"
												htmlType="submit"
												loading={loading}
											>
												Complete Setup
											</Button>
										)}
									</Space>
								</div>
							</Form>
						</Card>
					</Col>

					<Col span={10} className="sticky top-6">
						<PreviewPanel />
					</Col>
				</Row>
			</div>
		</div>
	);
};

export default BusinessSetupPage;
