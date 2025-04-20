"use client";

import { useState, useMemo } from "react";
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
	DollarOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Define enums directly
const BusinessSize = {
	MICRO: "MICRO",
	SMALL: "SMALL",
	MEDIUM: "MEDIUM",
	LARGE: "LARGE",
} as const;

const BusinessStage = {
	STARTUP: "STARTUP",
	GROWTH: "GROWTH",
	ESTABLISHED: "ESTABLISHED",
	ENTERPRISE: "ENTERPRISE",
} as const;

const BusinessType = {
	PRODUCT: "PRODUCT",
	SERVICE: "SERVICE",
} as const;

const BusinessModel = {
	B2B: "B2B",
	B2C: "B2C",
	D2C: "D2C",
	MARKETPLACE: "MARKETPLACE",
} as const;

const BusinessOperationMode = {
	ONLINE: "ONLINE",
	PHYSICAL: "PHYSICAL",
	HYBRID: "HYBRID",
} as const;

const Currency = {
	KES: "KES",
	USD: "USD",
	EUR: "EUR",
	GBP: "GBP",
} as const;

const PaymentMethod = {
	MPESA: "MPESA",
	CARD: "CARD",
	BANK_TRANSFER: "BANK_TRANSFER",
	CASH: "CASH",
	CRYPTO: "CRYPTO",
} as const;

const TaxCategory = {
	VAT_REGISTERED: "VAT_REGISTERED",
	NON_VAT: "NON_VAT",
	TURNOVER_TAX: "TURNOVER_TAX",
} as const;

const ShippingMethod = {
	LOCAL_DELIVERY: "LOCAL_DELIVERY",
	NATIONWIDE: "NATIONWIDE",
	INTERNATIONAL: "INTERNATIONAL",
	PICKUP_ONLY: "PICKUP_ONLY",
} as const;

// Type definitions
type BusinessSizeType = (typeof BusinessSize)[keyof typeof BusinessSize];
type BusinessStageType = (typeof BusinessStage)[keyof typeof BusinessStage];
type BusinessTypeType = (typeof BusinessType)[keyof typeof BusinessType];
type BusinessModelType = (typeof BusinessModel)[keyof typeof BusinessModel];
type BusinessOperationModeType =
	(typeof BusinessOperationMode)[keyof typeof BusinessOperationMode];
type CurrencyType = (typeof Currency)[keyof typeof Currency];
type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod];
type TaxCategoryType = (typeof TaxCategory)[keyof typeof TaxCategory];
type ShippingMethodType = (typeof ShippingMethod)[keyof typeof ShippingMethod];

interface FormData {
	name?: string;
	type?: BusinessTypeType;
	category?: string;
	description?: string;
	bio?: string;
	email?: string;
	phone?: string;
	address?: string;
	city?: string;
	country?: string;
	businessModel?: BusinessModelType;
	size?: BusinessSizeType;
	stage?: BusinessStageType;
	paymentMethods?: PaymentMethodType[];
}

interface StepField {
	field: string;
	required: boolean;
}

const STEP_FIELDS = {
	0: ["name", "type", "category", "description"],
	1: ["email", "phone", "address", "city"],
	2: ["businessModel", "operationMode", "size", "stage"],
	3: ["currency", "paymentMethods", "taxCategory", "shippingMethod"],
} as const;

interface FormValues {
	logo?: { originFileObj: File }[];
	coverImage?: { originFileObj: File }[];
	[key: string]: any;
}

const BusinessSetupPage = () => {
	const [form] = Form.useForm();
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(0);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<FormData>({});
	const { token } = theme.useToken();

	// Convert enums to arrays using useMemo to cache the results
	const businessSizes = useMemo(() => Object.values(BusinessSize), []);
	const businessStages = useMemo(() => Object.values(BusinessStage), []);
	const businessTypes = useMemo(() => Object.values(BusinessType), []);
	const businessModels = useMemo(() => Object.values(BusinessModel), []);
	const operationModes = useMemo(
		() => Object.values(BusinessOperationMode),
		[]
	);
	const currencies = useMemo(() => Object.values(Currency), []);
	const paymentMethods = useMemo(() => Object.values(PaymentMethod), []);
	const taxCategories = useMemo(() => Object.values(TaxCategory), []);
	const shippingMethods = useMemo(() => Object.values(ShippingMethod), []);

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
									{businessTypes.map((type) => (
										<Select.Option key={type} value={type}>
											{type.charAt(0) + type.slice(1).toLowerCase()}
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
			title: "Contact Details",
			icon: <ShopOutlined />,
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
			title: "Business Model",
			icon: <BankOutlined />,
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
							{businessModels.map((model) => (
								<Select.Option key={model} value={model}>
									{model
										.split("_")
										.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
										.join(" ")}
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
							{operationModes.map((mode) => (
								<Select.Option key={mode} value={mode}>
									{mode.charAt(0) + mode.slice(1).toLowerCase()}
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
							{businessSizes.map((size) => (
								<Select.Option key={size} value={size}>
									{size.charAt(0) + size.slice(1).toLowerCase()}
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
							{businessStages.map((stage) => (
								<Select.Option key={stage} value={stage}>
									{stage.charAt(0) + stage.slice(1).toLowerCase()}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
				</>
			),
		},
		{
			title: "Payment & Shipping",
			icon: <DollarOutlined />,
			content: (
				<>
					<Form.Item
						name="currency"
						label="Primary Currency"
						initialValue={Currency.KES}
						rules={[{ required: true, message: "Please select currency!" }]}
					>
						<Select>
							{currencies.map((currency) => (
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
							{paymentMethods.map((method) => (
								<Select.Option key={method} value={method}>
									{method
										.split("_")
										.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
										.join(" ")}
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
							{taxCategories.map((category) => (
								<Select.Option key={category} value={category}>
									{category
										.split("_")
										.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
										.join(" ")}
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
							{shippingMethods.map((method) => (
								<Select.Option key={method} value={method}>
									{method
										.split("_")
										.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
										.join(" ")}
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
	];

	const isStepComplete = (stepIndex: number) => {
		try {
			const fields = STEP_FIELDS[stepIndex as keyof typeof STEP_FIELDS];
			if (!fields) return false;

			return fields.every((field: string) => {
				const value = form.getFieldValue(field);
				if (Array.isArray(value)) return value.length > 0;
				if (field === "logo" || field === "coverImage")
					return value && value.length > 0;
				return value !== undefined && value !== "" && value !== null;
			});
		} catch (error) {
			console.error("Error checking step completion:", error);
			return false;
		}
	};

	const handleSubmit = async (values: FormValues) => {
		setLoading(true);
		const startTime = Date.now();
		console.log("🚀 Starting business setup process...");
		const messageKey = "business-setup-progress";

		try {
			// Get all form values
			const allFormValues = form.getFieldsValue(true);
			console.log("📝 Complete form values:", allFormValues);

			// Create form data for file upload
			const formData = new FormData();

			// Add all non-file form values first
			for (const [key, value] of Object.entries(allFormValues)) {
				if (
					key !== "logo" &&
					key !== "coverImage" &&
					value !== undefined &&
					value !== null
				) {
					const stringValue =
						typeof value === "object" ? JSON.stringify(value) : String(value);
					formData.append(key, stringValue);
					console.log(`📌 Appending field: ${key}, value:`, value);
				}
			}

			// Add files if present
			if (allFormValues.logo?.[0]?.originFileObj) {
				formData.append("logo", allFormValues.logo[0].originFileObj);
				console.log(
					`📎 Appending logo, size: ${allFormValues.logo[0].originFileObj.size} bytes`
				);
			}

			if (allFormValues.coverImage?.[0]?.originFileObj) {
				formData.append(
					"coverImage",
					allFormValues.coverImage[0].originFileObj
				);
				console.log(
					`📎 Appending cover image, size: ${allFormValues.coverImage[0].originFileObj.size} bytes`
				);
			}

			console.log("📦 FormData prepared");
			message.loading({
				content: "Starting business setup...",
				key: messageKey,
			});

			// Create business with streaming response
			console.log("🌐 Sending request to /api/business/create");
			const response = await fetch("/api/business/create", {
				method: "POST",
				body: formData,
			});

			console.log("📡 Response status:", response.status);
			if (!response.ok) {
				const errorText = await response.text();
				console.error("❌ Server error response:", errorText);
				try {
					const errorJson = JSON.parse(errorText);
					if (errorJson.error) {
						throw new Error(errorJson.error);
					}
				} catch (e) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
			}

			// Handle streaming response
			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error("No response stream available");
			}

			console.log("📥 Starting to read response stream");

			// Read the stream
			let lastProgressMessage = "";
			let streamComplete = false;

			while (true) {
				try {
					const { done, value } = await reader.read();

					if (done) {
						console.log("✅ Stream reading complete");
						streamComplete = true;
						break;
					}

					// Convert the chunk to text
					const chunk = new TextDecoder().decode(value);
					console.log("📨 Received chunk:", chunk);

					try {
						// Try to parse as JSON for final response or error
						const result = JSON.parse(chunk);
						console.log("🔍 Parsed JSON result:", result);

						if (result.error) {
							console.error("❌ Error from server:", result.error);
							message.error({
								content: result.error,
								key: messageKey,
								duration: 5,
							});
							throw new Error(result.error);
						}

						if (result.success) {
							console.log("✨ Success response received:", result);
							message.success({
								content: "Business setup completed successfully!",
								key: messageKey,
								duration: 3,
							});

							const processingTime = ((Date.now() - startTime) / 1000).toFixed(
								2
							);
							console.log(
								`⏱️ Total processing time: ${processingTime} seconds`
							);

							router.push("/dashboard/businesses");
							return;
						}
					} catch (e) {
						// If not JSON, it's a progress message
						const progressMessage = chunk.trim();
						if (progressMessage && progressMessage !== lastProgressMessage) {
							console.log("📢 Progress update:", progressMessage);
							message.loading({
								content: progressMessage,
								key: messageKey,
							});
							lastProgressMessage = progressMessage;
						}
					}
				} catch (streamError) {
					console.error("❌ Error reading stream:", streamError);
					throw streamError;
				}
			}

			if (!streamComplete) {
				throw new Error("Stream ended unexpectedly");
			}
		} catch (error) {
			const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
			console.error("❌ Form submission error:", error);
			console.error(`⏱️ Failed after ${processingTime} seconds`);

			message.error({
				content:
					error instanceof Error
						? `Error: ${error.message}`
						: "Failed to setup business. Please try again.",
				key: messageKey,
				duration: 5,
			});
		} finally {
			setLoading(false);
			console.log("🏁 Business setup process ended");
		}
	};

	const next = async () => {
		try {
			// Get all fields for current step
			const currentStepFields: Record<number, string[]> = {
				0: ["name", "type", "category", "description"],
				1: ["email", "phone", "address", "city"],
				2: ["businessModel", "operationMode", "size", "stage"],
				3: ["currency", "paymentMethods", "taxCategory", "shippingMethod"],
			};

			// Validate current step fields
			const fieldsToValidate = currentStepFields[currentStep];
			const values = await form.validateFields(fieldsToValidate);

			// Check if all required fields in the current step are filled
			const hasEmptyFields = fieldsToValidate.some((field) => {
				const value = form.getFieldValue(field);
				return (
					value === undefined ||
					value === "" ||
					(Array.isArray(value) && value.length === 0)
				);
			});

			if (hasEmptyFields) {
				message.error(
					"Please complete all required fields in this step before continuing."
				);
				return;
			}

			if (values) {
				setCurrentStep(currentStep + 1);
			}
		} catch (error) {
			// Form validation failed
			message.error(
				"Please complete all required fields in this step before continuing."
			);
		}
	};

	const prev = () => {
		setCurrentStep(currentStep - 1);
	};

	const calculateProgress = () => {
		try {
			// Count total required fields
			const totalRequiredFields = Object.values(STEP_FIELDS).flat().length;

			// Count completed fields
			let completedFields = 0;
			for (let i = 0; i <= currentStep; i++) {
				const fields = STEP_FIELDS[i as keyof typeof STEP_FIELDS] || [];
				completedFields += fields.filter((field: string) => {
					const value = form.getFieldValue(field);
					if (Array.isArray(value)) return value.length > 0;
					if (field === "logo" || field === "coverImage")
						return value && value.length > 0;
					return value !== undefined && value !== "" && value !== null;
				}).length;
			}

			// Calculate progress percentage
			const progress = Math.floor(
				(completedFields / totalRequiredFields) * 100
			);

			// Debug information
			console.debug({
				currentStep,
				totalRequiredFields,
				completedFields,
				progress,
				formValues: form.getFieldsValue(true),
			});

			return progress;
		} catch (error) {
			console.error("Error calculating progress:", error);
			return 0;
		}
	};

	const PreviewPanel = () => {
		const allFormData = form.getFieldsValue(true); // Get all form values

		const renderField = (
			label: string,
			value: any,
			type: "text" | "tag" = "text",
			color?: string
		) => {
			if (!value) return null;

			return (
				<div className={type === "text" ? "col-span-1" : "col-span-2"}>
					<Text type="secondary">{label}</Text>
					<div className="mt-1">
						{type === "tag" ? (
							Array.isArray(value) ? (
								<div className="flex flex-wrap gap-1">
									{value.map((item: string, index: number) => (
										<Tag key={index} color={color}>
											{item
												.split("_")
												.map(
													(word: string) =>
														word.charAt(0) + word.slice(1).toLowerCase()
												)
												.join(" ")}
										</Tag>
									))}
								</div>
							) : (
								<Tag color={color}>
									{value
										.split("_")
										.map(
											(word: string) =>
												word.charAt(0) + word.slice(1).toLowerCase()
										)
										.join(" ")}
								</Tag>
							)
						) : (
							<Text strong>{value}</Text>
						)}
					</div>
				</div>
			);
		};

		return (
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

					<div className="grid grid-cols-2 gap-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
						{/* Basic Information */}
						{renderField("Business Name", allFormData.name)}
						{renderField("Type", allFormData.type, "tag", "blue")}
						{renderField("Category", allFormData.category, "tag", "green")}
						{allFormData.description && (
							<div className="col-span-2">
								<Text type="secondary">Description</Text>
								<div className="mt-1">
									<Paragraph style={{ margin: 0 }}>
										{allFormData.description}
									</Paragraph>
								</div>
							</div>
						)}
						{allFormData.bio && (
							<div className="col-span-2">
								<Text type="secondary">Bio</Text>
								<div className="mt-1">
									<Paragraph style={{ margin: 0 }}>{allFormData.bio}</Paragraph>
								</div>
							</div>
						)}

						{/* Contact Information */}
						{(allFormData.email ||
							allFormData.phone ||
							allFormData.alternativePhone) && (
							<div className="col-span-2">
								<Text type="secondary">Contact Information</Text>
								<div className="mt-1 space-y-1">
									{allFormData.email && <Text>Email: {allFormData.email}</Text>}
									{allFormData.phone && <Text>Phone: {allFormData.phone}</Text>}
									{allFormData.alternativePhone && (
										<Text>
											Alternative Phone: {allFormData.alternativePhone}
										</Text>
									)}
								</div>
							</div>
						)}

						{/* Location */}
						{(allFormData.address ||
							allFormData.city ||
							allFormData.country ||
							allFormData.postalCode) && (
							<div className="col-span-2">
								<Text type="secondary">Location</Text>
								<div className="mt-1 space-y-1">
									{allFormData.address && (
										<Text>Address: {allFormData.address}</Text>
									)}
									{allFormData.city && <Text>City: {allFormData.city}</Text>}
									{allFormData.country && (
										<Text>Country: {allFormData.country}</Text>
									)}
									{allFormData.postalCode && (
										<Text>Postal Code: {allFormData.postalCode}</Text>
									)}
								</div>
							</div>
						)}

						{/* Business Details */}
						{renderField(
							"Business Model",
							allFormData.businessModel,
							"tag",
							"purple"
						)}
						{renderField(
							"Operation Mode",
							allFormData.operationMode,
							"tag",
							"cyan"
						)}
						{renderField("Size", allFormData.size, "tag", "orange")}
						{renderField("Stage", allFormData.stage, "tag", "magenta")}

						{/* Financial Information */}
						{renderField("Currency", allFormData.currency, "tag", "gold")}
						{renderField(
							"Payment Methods",
							allFormData.paymentMethods,
							"tag",
							"lime"
						)}
						{renderField(
							"Tax Category",
							allFormData.taxCategory,
							"tag",
							"volcano"
						)}
						{renderField(
							"Shipping Method",
							allFormData.shippingMethod,
							"tag",
							"geekblue"
						)}

						{/* Additional Information */}
						{renderField("Registration Number", allFormData.registrationNumber)}
						{renderField("Tax ID", allFormData.taxId)}

						{/* Media */}
						{(allFormData.logo || allFormData.coverImage) && (
							<div className="col-span-2">
								<Text type="secondary">Uploaded Media</Text>
								<div className="mt-1 space-y-1">
									{allFormData.logo && (
										<Text>Logo: {allFormData.logo[0]?.name}</Text>
									)}
									{allFormData.coverImage && (
										<Text>Cover Image: {allFormData.coverImage[0]?.name}</Text>
									)}
								</div>
							</div>
						)}
					</div>
				</Card>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="w-full">
				<Card
					style={{
						background: token.colorBgContainer,
						borderRadius: 0,
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

				<Row gutter={0}>
					<Col span={18}>
						<Card
							style={{
								background: token.colorBgContainer,
								borderRadius: 0,
								boxShadow: token.boxShadowTertiary,
							}}
							bodyStyle={{ padding: 0 }}
						>
							<div className="px-8 py-6 border-b border-gray-200">
								<Steps
									current={currentStep}
									labelPlacement="vertical"
									items={steps.map((step, index) => ({
										...step,
										status:
											index < currentStep
												? isStepComplete(index)
													? "finish"
													: "error"
												: undefined,
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
									{currentStep === 0 && (
										<>
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
															{
																required: true,
																message: "Please select business type!",
															},
														]}
													>
														<Select placeholder="Select business type">
															{Object.values(BusinessType).map((type) => (
																<Select.Option key={type} value={type}>
																	{type.charAt(0) + type.slice(1).toLowerCase()}
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
													{
														required: true,
														message: "Please input business category!",
													},
												]}
											>
												<Input placeholder="Enter business category" />
											</Form.Item>

											<Form.Item
												name="description"
												label="Business Description"
												rules={[
													{
														required: true,
														message: "Please input business description!",
													},
												]}
											>
												<TextArea
													rows={4}
													placeholder="Describe your business"
													className="resize-none"
												/>
											</Form.Item>
										</>
									)}

									{currentStep === 1 && (
										<>
											<Form.Item
												name="email"
												label="Business Email"
												rules={[
													{
														required: true,
														message: "Please input business email!",
													},
													{
														type: "email",
														message: "Please enter a valid email!",
													},
												]}
											>
												<Input placeholder="Enter business email" />
											</Form.Item>

											<Form.Item
												name="phone"
												label="Business Phone"
												rules={[
													{
														required: true,
														message: "Please input business phone!",
													},
												]}
											>
												<Input placeholder="Enter business phone" />
											</Form.Item>

											<Form.Item
												name="address"
												label="Business Address"
												rules={[
													{
														required: true,
														message: "Please input business address!",
													},
												]}
											>
												<Input placeholder="Enter business address" />
											</Form.Item>

											<Form.Item
												name="city"
												label="City"
												rules={[
													{
														required: true,
														message: "Please input city!",
													},
												]}
											>
												<Input placeholder="Enter city" />
											</Form.Item>
										</>
									)}

									{currentStep === 2 && (
										<>
											<Form.Item
												name="businessModel"
												label="Business Model"
												rules={[
													{
														required: true,
														message: "Please select business model!",
													},
												]}
											>
												<Select placeholder="Select business model">
													{businessModels.map((model) => (
														<Select.Option key={model} value={model}>
															{model
																.split("_")
																.map(
																	(word) =>
																		word.charAt(0) + word.slice(1).toLowerCase()
																)
																.join(" ")}
														</Select.Option>
													))}
												</Select>
											</Form.Item>

											<Form.Item
												name="operationMode"
												label="Operation Mode"
												rules={[
													{
														required: true,
														message: "Please select operation mode!",
													},
												]}
											>
												<Select placeholder="Select operation mode">
													{operationModes.map((mode) => (
														<Select.Option key={mode} value={mode}>
															{mode.charAt(0) + mode.slice(1).toLowerCase()}
														</Select.Option>
													))}
												</Select>
											</Form.Item>

											<Form.Item
												name="size"
												label="Business Size"
												rules={[
													{
														required: true,
														message: "Please select business size!",
													},
												]}
											>
												<Select placeholder="Select business size">
													{businessSizes.map((size) => (
														<Select.Option key={size} value={size}>
															{size.charAt(0) + size.slice(1).toLowerCase()}
														</Select.Option>
													))}
												</Select>
											</Form.Item>

											<Form.Item
												name="stage"
												label="Business Stage"
												rules={[
													{
														required: true,
														message: "Please select business stage!",
													},
												]}
											>
												<Select placeholder="Select business stage">
													{businessStages.map((stage) => (
														<Select.Option key={stage} value={stage}>
															{stage.charAt(0) + stage.slice(1).toLowerCase()}
														</Select.Option>
													))}
												</Select>
											</Form.Item>
										</>
									)}

									{currentStep === 3 && (
										<>
											<Form.Item
												name="currency"
												label="Primary Currency"
												initialValue={Currency.KES}
												rules={[
													{
														required: true,
														message: "Please select currency!",
													},
												]}
											>
												<Select>
													{currencies.map((currency) => (
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
													{
														required: true,
														message: "Please select payment methods!",
													},
												]}
											>
												<Select
													mode="multiple"
													placeholder="Select payment methods"
												>
													{paymentMethods.map((method) => (
														<Select.Option key={method} value={method}>
															{method
																.split("_")
																.map(
																	(word) =>
																		word.charAt(0) + word.slice(1).toLowerCase()
																)
																.join(" ")}
														</Select.Option>
													))}
												</Select>
											</Form.Item>

											<Form.Item
												name="taxCategory"
												label="Tax Category"
												rules={[
													{
														required: true,
														message: "Please select tax category!",
													},
												]}
											>
												<Select placeholder="Select tax category">
													{taxCategories.map((category) => (
														<Select.Option key={category} value={category}>
															{category
																.split("_")
																.map(
																	(word) =>
																		word.charAt(0) + word.slice(1).toLowerCase()
																)
																.join(" ")}
														</Select.Option>
													))}
												</Select>
											</Form.Item>

											<Form.Item
												name="shippingMethod"
												label="Shipping Method"
												rules={[
													{
														required: true,
														message: "Please select shipping method!",
													},
												]}
											>
												<Select placeholder="Select shipping method">
													{shippingMethods.map((method) => (
														<Select.Option key={method} value={method}>
															{method
																.split("_")
																.map(
																	(word) =>
																		word.charAt(0) + word.slice(1).toLowerCase()
																)
																.join(" ")}
														</Select.Option>
													))}
												</Select>
											</Form.Item>
										</>
									)}
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
										<Button
											type="primary"
											size="large"
											onClick={next}
											style={{
												visibility:
													currentStep < steps.length - 1 ? "visible" : "hidden",
												backgroundColor: token.colorPrimary,
												borderColor: token.colorPrimary,
											}}
										>
											Save & Continue
										</Button>
										{currentStep === steps.length - 1 && (
											<Button
												type="primary"
												size="large"
												htmlType="submit"
												loading={loading}
												style={{
													backgroundColor: token.colorPrimary,
													borderColor: token.colorPrimary,
												}}
											>
												Complete Setup
											</Button>
										)}
									</Space>
								</div>
							</Form>
						</Card>
					</Col>

					<Col span={6}>
						<PreviewPanel />
					</Col>
				</Row>
			</div>
		</div>
	);
};

export default BusinessSetupPage;
