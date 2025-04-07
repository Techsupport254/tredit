import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { showErrorMessage } from "../../utils/errors";
import {
	Form,
	Input,
	Select,
	Button,
	Card,
	Typography,
	Row,
	Col,
	message,
	Divider,
	Space,
	Alert,
	Spin,
} from "antd";
import {
	ShopOutlined,
	SaveOutlined,
	EnvironmentOutlined,
	TagOutlined,
	InfoCircleOutlined,
	LoadingOutlined,
} from "@ant-design/icons";
import { BUSINESS_CONSTANTS } from "../../constants/businessConstants";

const { TextArea } = Input;
const { Title, Text } = Typography;

// Create a custom spinner with the loading icon
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

// Create options arrays for selects
// Make sure keys match exact server-side enum values
const businessTypeOptions = [
	{ label: "Product", value: "product" },
	{ label: "Service", value: "service" },
];

const categoryOptions = BUSINESS_CONSTANTS.CATEGORIES.map((category) => ({
	label: category,
	value: category,
}));

const businessModelOptions = Object.keys(BUSINESS_CONSTANTS.MODELS).map(
	(key) => ({
		label: BUSINESS_CONSTANTS.MODELS[key],
		value: BUSINESS_CONSTANTS.MODELS[key],
	})
);

const operationModeOptions = Object.keys(
	BUSINESS_CONSTANTS.OPERATION_MODES
).map((key) => ({
	label:
		BUSINESS_CONSTANTS.OPERATION_MODES[key].charAt(0).toUpperCase() +
		BUSINESS_CONSTANTS.OPERATION_MODES[key].slice(1),
	value: BUSINESS_CONSTANTS.OPERATION_MODES[key],
}));

// Service categories from the server
const SERVICE_CATEGORIES = [
	"Web Development",
	"Mobile Apps",
	"Cloud Solutions",
	"IT Consulting",
	"Software Development",
	"Digital Marketing",
	"Consulting",
	"Legal Services",
	"Financial Services",
	"Healthcare Services",
	"Education & Training",
	"Creative Services",
	"Business Services",
	"Technical Support",
	"Customer Service",
];

const serviceCategoryOptions = SERVICE_CATEGORIES.map((category) => ({
	label: category,
	value: category,
}));

// Product categories from the server
const PRODUCT_CATEGORIES = [
	"Electronics",
	"Clothing & Apparel",
	"Home & Garden",
	"Beauty & Personal Care",
	"Sports & Outdoors",
	"Toys & Games",
	"Books & Media",
	"Food & Beverage",
	"Health & Wellness",
	"Automotive",
	"Art & Crafts",
	"Office Supplies",
	"Pet Supplies",
	"Jewelry & Accessories",
	"Industrial Equipment",
	"Other Products",
];

const productCategoryOptions = PRODUCT_CATEGORIES.map((category) => ({
	label: category,
	value: category,
}));

const paymentMethodOptions = BUSINESS_CONSTANTS.PAYMENT_METHODS.map(
	(method) => ({
		label: method.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
		value: method,
	})
);

const currencyOptions = BUSINESS_CONSTANTS.CURRENCIES.map((currency) => ({
	label: currency,
	value: currency,
}));

const BusinessForm = ({ business = null, onSubmit, mode = "create" }) => {
	const [form] = Form.useForm();
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [businessType, setBusinessType] = useState(business?.type || "product");

	// Handle window resize for responsive behavior
	useEffect(() => {
		const handleResize = () => {
			setWindowWidth(window.innerWidth);
		};

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	// Set form values when business prop changes
	useEffect(() => {
		if (business) {
			form.setFieldsValue({
				...business,
				type: business.type || "product",
			});
			setBusinessType(business.type || "product");
		}
	}, [business, form]);

	const isMobile = windowWidth < 576;

	const validateForm = (values) => {
		// Perform custom validation
		const errors = {};

		// Name validation
		if (!values.name) {
			errors.name = "Business name is required";
		} else if (
			values.name.length < BUSINESS_CONSTANTS.VALIDATION?.NAME_LENGTH?.MIN ||
			values.name.length > BUSINESS_CONSTANTS.VALIDATION?.NAME_LENGTH?.MAX
		) {
			errors.name = `Name must be between ${BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MIN} and ${BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MAX} characters`;
		}

		// Description validation
		if (!values.description) {
			errors.description = "Business description is required";
		} else if (
			values.description.length <
				BUSINESS_CONSTANTS.VALIDATION?.DESCRIPTION_LENGTH?.MIN ||
			values.description.length >
				BUSINESS_CONSTANTS.VALIDATION?.DESCRIPTION_LENGTH?.MAX
		) {
			errors.description = `Description must be between ${BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MIN} and ${BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MAX} characters`;
		}

		// Email validation
		if (!values.email) {
			errors.email = "Business email is required";
		} else if (
			BUSINESS_CONSTANTS.VALIDATION?.EMAIL_REGEX &&
			!BUSINESS_CONSTANTS.VALIDATION.EMAIL_REGEX.test(values.email)
		) {
			errors.email = "Invalid email format";
		}

		// Address validation
		if (
			!values.address ||
			!values.address.street ||
			!values.address.city ||
			!values.address.state ||
			!values.address.country ||
			!values.address.postalCode
		) {
			errors.address = "Complete address information is required";
		}

		// Service/Product categories validation
		if (
			values.type === "service" &&
			(!values.serviceCategories || values.serviceCategories.length === 0)
		) {
			errors.serviceCategories =
				"Service businesses must have at least one service category";
		}

		if (
			values.type === "product" &&
			(!values.productCategories || values.productCategories.length === 0)
		) {
			errors.productCategories =
				"Product businesses must have at least one product category";
		}

		// Validate service category values against allowed list
		if (values.type === "service" && values.serviceCategories) {
			const invalidCategories = values.serviceCategories.filter(
				(category) => !SERVICE_CATEGORIES.includes(category)
			);
			if (invalidCategories.length > 0) {
				errors.serviceCategories = `Invalid service categories: ${invalidCategories.join(
					", "
				)}`;
			}
		}

		// Validate product category values against allowed list
		if (values.type === "product" && values.productCategories) {
			const invalidCategories = values.productCategories.filter(
				(category) => !PRODUCT_CATEGORIES.includes(category)
			);
			if (invalidCategories.length > 0) {
				errors.productCategories = `Invalid product categories: ${invalidCategories.join(
					", "
				)}`;
			}
		}

		return errors;
	};

	const handleSubmit = async (values) => {
		setLoading(true);
		setError(null);

		try {
			console.log("Form values before submission:", values);

			// Validate the form
			const validationErrors = validateForm(values);
			if (Object.keys(validationErrors).length > 0) {
				const errorMessage = Object.values(validationErrors).join(", ");
				throw new Error(errorMessage);
			}

			// Format the data based on the business type
			const formattedData = {
				...values,
				// Only include the categories relevant to the business type
				productCategories:
					businessType === "product"
						? values.productCategories || ["Electronics"]
						: [],
				serviceCategories:
					businessType === "service" ? values.serviceCategories || [] : [],
				// Add any missing required fields
				status: values.status || "active",
				paymentMethods: values.paymentMethods || ["crypto", "bank_transfer"],
				currency: values.currency || "USD",
				walletAddress: "0xe91388A436659f2c0b42BCea6f7a9B7004F2f265",
			};

			await onSubmit(formattedData);
			// Success notification will be handled by the parent component
		} catch (error) {
			console.error("Form submission error:", error);
			setError(error.message || "An error occurred while submitting the form");
			showErrorMessage(error, "form-submit");
		} finally {
			setLoading(false);
		}
	};

	const renderFormContent = () => (
		<>
			<Divider orientation="left">
				<Space>
					<InfoCircleOutlined />
					<span>Basic Information</span>
				</Space>
			</Divider>

			<Row gutter={24}>
				<Col xs={24} md={12}>
					<Form.Item
						name="name"
						label="Business Name"
						rules={[
							{ required: true, message: "Please enter business name" },
							{
								min: BUSINESS_CONSTANTS.VALIDATION?.NAME_LENGTH?.MIN || 3,
								message: `Minimum ${
									BUSINESS_CONSTANTS.VALIDATION?.NAME_LENGTH?.MIN || 3
								} characters`,
							},
							{
								max: BUSINESS_CONSTANTS.VALIDATION?.NAME_LENGTH?.MAX || 100,
								message: `Maximum ${
									BUSINESS_CONSTANTS.VALIDATION?.NAME_LENGTH?.MAX || 100
								} characters`,
							},
						]}
					>
						<Input placeholder="Enter your business name" />
					</Form.Item>
				</Col>
				<Col xs={24} md={12}>
					<Form.Item
						name="email"
						label="Business Email"
						rules={[
							{ required: true, message: "Please enter business email" },
							{ type: "email", message: "Please enter a valid email" },
						]}
					>
						<Input placeholder="business@example.com" />
					</Form.Item>
				</Col>
			</Row>

			<Form.Item
				name="description"
				label="Business Description"
				rules={[
					{ required: true, message: "Please describe your business" },
					{
						min: BUSINESS_CONSTANTS.VALIDATION?.DESCRIPTION_LENGTH?.MIN || 10,
						message: `Minimum ${
							BUSINESS_CONSTANTS.VALIDATION?.DESCRIPTION_LENGTH?.MIN || 10
						} characters`,
					},
					{
						max: BUSINESS_CONSTANTS.VALIDATION?.DESCRIPTION_LENGTH?.MAX || 1000,
						message: `Maximum ${
							BUSINESS_CONSTANTS.VALIDATION?.DESCRIPTION_LENGTH?.MAX || 1000
						} characters`,
					},
				]}
			>
				<TextArea rows={4} placeholder="Describe what your business does" />
			</Form.Item>

			<Row gutter={24}>
				<Col xs={24} md={12}>
					<Form.Item
						name="type"
						label="Business Type"
						rules={[{ required: true, message: "Please select business type" }]}
					>
						<Select
							placeholder="Select business type"
							options={businessTypeOptions}
							onChange={(value) => setBusinessType(value)}
						/>
					</Form.Item>
				</Col>
				<Col xs={24} md={12}>
					<Form.Item
						name="category"
						label="Category"
						rules={[{ required: true, message: "Please select a category" }]}
					>
						<Select
							placeholder="Select business category"
							options={categoryOptions}
						/>
					</Form.Item>
				</Col>
			</Row>

			<Row gutter={24}>
				<Col xs={24} md={12}>
					<Form.Item
						name="businessModel"
						label="Business Model"
						rules={[
							{ required: true, message: "Please select business model" },
						]}
					>
						<Select
							placeholder="Select business model"
							options={businessModelOptions}
						/>
					</Form.Item>
				</Col>
				<Col xs={24} md={12}>
					<Form.Item
						name="operationMode"
						label="Operation Mode"
						rules={[
							{ required: true, message: "Please select operation mode" },
						]}
					>
						<Select
							placeholder="Select operation mode"
							options={operationModeOptions}
						/>
					</Form.Item>
				</Col>
			</Row>

			<Row gutter={24}>
				<Col xs={24} md={12}>
					<Form.Item
						name="paymentMethods"
						label="Payment Methods"
						rules={[
							{
								required: true,
								message: "Please select at least one payment method",
							},
						]}
					>
						<Select
							mode="multiple"
							placeholder="Select payment methods"
							options={paymentMethodOptions}
							defaultValue={["crypto", "bank_transfer"]}
						/>
					</Form.Item>
				</Col>
				<Col xs={24} md={12}>
					<Form.Item
						name="currency"
						label="Primary Currency"
						rules={[{ required: true, message: "Please select a currency" }]}
					>
						<Select
							placeholder="Select primary currency"
							options={currencyOptions}
							defaultValue="USD"
						/>
					</Form.Item>
				</Col>
			</Row>

			<Form.Item
				name={
					businessType === "product" ? "productCategories" : "serviceCategories"
				}
				label={
					businessType === "product"
						? "Product Categories"
						: "Service Categories"
				}
				rules={[
					{
						required: true,
						message: `Please select at least one ${
							businessType === "product" ? "product" : "service"
						} category`,
					},
				]}
			>
				<Select
					mode="multiple"
					placeholder={`Select ${
						businessType === "product" ? "product" : "service"
					} categories`}
					options={
						businessType === "product"
							? productCategoryOptions
							: serviceCategoryOptions
					}
				/>
			</Form.Item>

			<Divider orientation="left">
				<Space>
					<EnvironmentOutlined />
					<span>Address Information</span>
				</Space>
			</Divider>

			<Form.Item
				label="Street Address"
				name={["address", "street"]}
				rules={[{ required: true, message: "Please enter street address" }]}
			>
				<Input placeholder="123 Main St" />
			</Form.Item>

			<Row gutter={24}>
				<Col xs={24} md={12}>
					<Form.Item
						label="City"
						name={["address", "city"]}
						rules={[{ required: true, message: "Please enter city" }]}
					>
						<Input placeholder="City" />
					</Form.Item>
				</Col>
				<Col xs={24} md={12}>
					<Form.Item
						label="State/Province"
						name={["address", "state"]}
						rules={[{ required: true, message: "Please enter state/province" }]}
					>
						<Input placeholder="State or Province" />
					</Form.Item>
				</Col>
			</Row>

			<Row gutter={24}>
				<Col xs={24} md={12}>
					<Form.Item
						label="Country"
						name={["address", "country"]}
						rules={[{ required: true, message: "Please enter country" }]}
					>
						<Input placeholder="Country" />
					</Form.Item>
				</Col>
				<Col xs={24} md={12}>
					<Form.Item
						label="Postal Code"
						name={["address", "postalCode"]}
						rules={[{ required: true, message: "Please enter postal code" }]}
					>
						<Input placeholder="Postal Code" />
					</Form.Item>
				</Col>
			</Row>

			<Divider orientation="left">
				<Space>
					<TagOutlined />
					<span>Additional Information</span>
				</Space>
			</Divider>

			<Form.Item name="tags" label="Tags">
				<Select
					mode="tags"
					placeholder="Add relevant tags"
					style={{ width: "100%" }}
				/>
			</Form.Item>

			<Form.Item>
				<Button
					type="primary"
					htmlType="submit"
					icon={loading ? <LoadingOutlined /> : <SaveOutlined />}
					loading={loading}
					style={{
						padding: "0 24px",
						height: "40px",
						fontSize: "16px",
						width: isMobile ? "100%" : "auto",
					}}
					disabled={loading}
				>
					{loading
						? mode === "create"
							? "Creating Business..."
							: "Saving Changes..."
						: mode === "create"
						? "Create Business"
						: "Save Changes"}
				</Button>
			</Form.Item>
		</>
	);

	return (
		<div
			style={{ background: "#f5f5f5", padding: "24px 0", minHeight: "100vh" }}
		>
			<div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px" }}>
				<Card
					style={{
						borderRadius: "8px",
						boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
						marginBottom: "24px",
					}}
				>
					<Title
						level={4}
						style={{
							marginBottom: "24px",
							display: "flex",
							alignItems: "center",
							gap: "10px",
						}}
					>
						<ShopOutlined />{" "}
						{mode === "create" ? "Create New Business" : "Edit Business"}
					</Title>

					{error && (
						<Alert
							message="Form Error"
							description={error}
							type="error"
							showIcon
							closable
							style={{ marginBottom: "24px" }}
							onClose={() => setError(null)}
						/>
					)}

					<Form
						form={form}
						layout="vertical"
						initialValues={
							business || {
								type: "product",
								category: "Technology",
								businessModel: "B2C",
								operationMode: "digital",
								status: "active",
								paymentMethods: ["crypto", "bank_transfer"],
								currency: "USD",
								address: {},
							}
						}
						onFinish={handleSubmit}
						requiredMark={false}
					>
						{loading ? (
							<div
								style={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									flexDirection: "column",
									padding: "40px 0",
								}}
							>
								<Spin indicator={antIcon} size="large" />
								<p style={{ marginTop: "20px" }}>
									{mode === "create"
										? "Creating business..."
										: "Updating business information..."}
								</p>
							</div>
						) : (
							renderFormContent()
						)}
					</Form>
				</Card>
			</div>
		</div>
	);
};

BusinessForm.propTypes = {
	business: PropTypes.object,
	onSubmit: PropTypes.func.isRequired,
	mode: PropTypes.oneOf(["create", "edit"]),
};

export default BusinessForm;
