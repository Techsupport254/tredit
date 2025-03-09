import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FaArrowLeft, FaArrowRight, FaSave } from "react-icons/fa";

const BusinessForm = ({ business, onSubmit, mode = "create" }) => {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		type: "service",
		businessModel: "B2B",
		operationMode: "online",
		category: "Technology",
		website: "",
		email: "",
		phone: "",
		walletAddress: "",
		logo: "",
		locations: [],
		productCategories: [],
		serviceCategories: [],
		inventoryManagement: false,
		pricingModel: "fixed",
		currency: "USD",
		taxInformation: {},
		payoutMethods: [],
		address: "",
		...business,
	});

	const [errors, setErrors] = useState({});

	const steps = [
		{
			title: "Basic Information",
			fields: ["name", "description", "type", "category", "logo"],
		},
		{
			title: "Business Details",
			fields: [
				"businessModel",
				"operationMode",
				"inventoryManagement",
				"pricingModel",
				"currency",
			],
		},
		{
			title: "Contact Information",
			fields: ["website", "email", "phone", "walletAddress", "address"],
		},
		{
			title: "Additional Information",
			fields: ["productCategories", "serviceCategories"],
		},
		{
			title: "Review & Submit",
			fields: [],
		},
	];

	const validateStep = (step) => {
		const currentFields = steps[step - 1].fields;
		const stepErrors = {};

		currentFields.forEach((field) => {
			if (!formData[field] && field !== "logo") {
				stepErrors[field] = "This field is required";
			}

			if (field === "email" && formData.email) {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(formData.email)) {
					stepErrors.email = "Invalid email format";
				}
			}

			if (field === "website" && formData.website) {
				try {
					new URL(formData.website);
				} catch {
					stepErrors.website = "Invalid website URL";
				}
			}

			if (field === "walletAddress" && formData.walletAddress) {
				const walletRegex = /^0x[a-fA-F0-9]{40}$/;
				if (!walletRegex.test(formData.walletAddress)) {
					stepErrors.walletAddress = "Invalid wallet address";
				}
			}

			if (field === "phone" && formData.phone) {
				const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
				if (!phoneRegex.test(formData.phone)) {
					stepErrors.phone = "Invalid phone number";
				}
			}

			if (
				field === "address" &&
				formData.operationMode !== "online" &&
				!formData.address
			) {
				stepErrors.address =
					"Address is required for physical or hybrid businesses";
			}
		});

		setErrors(stepErrors);
		return Object.keys(stepErrors).length === 0;
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: undefined,
			}));
		}
	};

	const handleNext = () => {
		if (validateStep(currentStep)) {
			setCurrentStep((prev) => Math.min(prev + 1, steps.length));
		}
	};

	const handlePrevious = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (validateStep(currentStep)) {
			await onSubmit(formData);
		}
	};

	const renderField = (field) => {
		const commonClasses =
			"w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
		const errorClasses = errors[field] ? "border-red-500" : "border-gray-300";

		switch (field) {
			case "logo":
				return (
					<div className="flex items-center justify-center w-full">
						<label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed cursor-pointer hover:bg-gray-50 transition-colors">
							{formData.logo ? (
								<div className="relative w-full max-w-[200px] aspect-square">
									<img
										src={
											typeof formData.logo === "string"
												? formData.logo
												: URL.createObjectURL(formData.logo)
										}
										alt="Business Logo"
										className="w-full h-full object-cover rounded-lg"
									/>
									<button
										type="button"
										onClick={(e) => {
											e.preventDefault();
											setFormData((prev) => ({
												...prev,
												logo: "",
											}));
										}}
										className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-4 w-4"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
									<p className="text-sm text-gray-500 mt-2 text-center">
										Click to change logo
									</p>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<svg
										className="w-12 h-12 text-gray-400 mb-3"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 48 48"
									>
										<path
											d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									<p className="text-sm text-gray-600">Upload a logo</p>
									<p className="text-xs text-gray-500 mt-1">
										PNG, JPG up to 5MB
									</p>
								</div>
							)}
							<input
								type="file"
								className="hidden"
								accept="image/*"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										if (file.size > 5 * 1024 * 1024) {
											setErrors((prev) => ({
												...prev,
												logo: "File size should be less than 5MB",
											}));
											return;
										}
										setFormData((prev) => ({
											...prev,
											logo: file,
										}));
										setErrors((prev) => ({
											...prev,
											logo: undefined,
										}));
									}
								}}
							/>
						</label>
					</div>
				);

			case "description":
				return (
					<textarea
						name={field}
						value={formData[field]}
						onChange={handleChange}
						className={`${commonClasses} ${errorClasses} h-32`}
						placeholder="Enter business description"
					/>
				);

			case "type":
				return (
					<select
						name={field}
						value={formData[field]}
						onChange={handleChange}
						className={`${commonClasses} ${errorClasses}`}
					>
						<option value="service">Service</option>
						<option value="product">Product</option>
					</select>
				);

			case "businessModel":
				return (
					<select
						name={field}
						value={formData[field]}
						onChange={handleChange}
						className={`${commonClasses} ${errorClasses}`}
					>
						<option value="B2B">B2B</option>
						<option value="B2C">B2C</option>
						<option value="C2C">C2C</option>
					</select>
				);

			case "operationMode":
				return (
					<select
						name={field}
						value={formData[field]}
						onChange={handleChange}
						className={`${commonClasses} ${errorClasses}`}
					>
						<option value="online">Online</option>
						<option value="offline">Offline</option>
						<option value="hybrid">Hybrid</option>
					</select>
				);

			case "category":
				return (
					<select
						name={field}
						value={formData[field]}
						onChange={handleChange}
						className={`${commonClasses} ${errorClasses}`}
					>
						<option value="Technology">Technology</option>
						<option value="Retail">Retail</option>
						<option value="Healthcare">Healthcare</option>
						<option value="Finance">Finance</option>
						<option value="Education">Education</option>
						<option value="Entertainment">Entertainment</option>
						<option value="Other">Other</option>
					</select>
				);

			case "inventoryManagement":
				return (
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							name={field}
							checked={formData[field]}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									[field]: e.target.checked,
								}))
							}
							className="w-5 h-5"
						/>
						<span>Enable Inventory Management</span>
					</div>
				);

			case "pricingModel":
				return (
					<select
						name={field}
						value={formData[field]}
						onChange={handleChange}
						className={`${commonClasses} ${errorClasses}`}
					>
						<option value="fixed">Fixed</option>
						<option value="negotiable">Negotiable</option>
						<option value="subscription">Subscription</option>
					</select>
				);

			case "currency":
				return (
					<select
						name={field}
						value={formData[field]}
						onChange={handleChange}
						className={`${commonClasses} ${errorClasses}`}
					>
						<option value="USD">USD</option>
						<option value="EUR">EUR</option>
						<option value="GBP">GBP</option>
						<option value="KES">KES</option>
						<option value="NGN">NGN</option>
						<option value="ZAR">ZAR</option>
					</select>
				);

			default:
				return (
					<input
						type={field === "email" ? "email" : "text"}
						name={field}
						value={formData[field]}
						onChange={handleChange}
						className={`${commonClasses} ${errorClasses}`}
						placeholder={`Enter ${field
							.replace(/([A-Z])/g, " $1")
							.toLowerCase()}`}
					/>
				);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-3xl mx-auto p-4 md:p-6 pb-24">
				{/* Progress Bar */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-6">
					<div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
						<div className="flex min-w-max space-x-4 mb-4">
							{steps.map((step, index) => (
								<div
									key={index}
									className={`flex items-center ${
										index < steps.length - 1 ? "flex-1" : ""
									}`}
								>
									<div
										className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
											currentStep > index + 1
												? "border-green-500 bg-green-500 text-white"
												: currentStep === index + 1
												? "border-blue-600 bg-blue-600 text-white"
												: "border-gray-300 text-gray-500"
										}`}
									>
										{currentStep > index + 1 ? (
											"✓"
										) : (
											<span className="text-sm">{index + 1}</span>
										)}
									</div>
									<div className="ml-3">
										<p
											className={`text-sm font-medium ${
												currentStep === index + 1
													? "text-blue-600"
													: "text-gray-500"
											}`}
										>
											{step.title}
										</p>
									</div>
									{index < steps.length - 1 && (
										<div
											className={`flex-1 h-0.5 ml-3 ${
												currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"
											}`}
										/>
									)}
								</div>
							))}
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit}>
					{/* Current Step Fields */}
					<div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
						<h2 className="text-lg md:text-xl font-semibold mb-6">
							{steps[currentStep - 1].title}
						</h2>
						<div className="space-y-6">
							{steps[currentStep - 1].fields.map((field) => (
								<div key={field}>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										{field
											.replace(/([A-Z])/g, " $1")
											.charAt(0)
											.toUpperCase() +
											field
												.replace(/([A-Z])/g, " $1")
												.slice(1)
												.toLowerCase()}
									</label>
									{renderField(field)}
									{errors[field] && (
										<p className="mt-2 text-sm text-red-600">{errors[field]}</p>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Navigation Buttons - Fixed at bottom on mobile */}
					<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:relative md:border-none md:bg-transparent md:p-0">
						<div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
							<button
								type="button"
								onClick={handlePrevious}
								className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium ${
									currentStep === 1
										? "text-gray-400 bg-gray-100 cursor-not-allowed"
										: "text-gray-600 bg-white border border-gray-300 hover:bg-gray-50"
								}`}
								disabled={currentStep === 1}
							>
								<FaArrowLeft className="w-4 h-4 mr-2" />
								<span className="hidden md:inline">Previous</span>
							</button>

							<div className="flex-1 md:flex-none">
								{currentStep === steps.length ? (
									<button
										type="submit"
										className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center justify-center text-sm font-medium hover:bg-blue-700"
									>
										<FaSave className="w-4 h-4 mr-2" />
										{mode === "create" ? "Create Business" : "Save Changes"}
									</button>
								) : (
									<button
										type="button"
										onClick={handleNext}
										className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center justify-center text-sm font-medium hover:bg-blue-700"
									>
										<span className="mr-2">Next Step</span>
										<FaArrowRight className="w-4 h-4" />
									</button>
								)}
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

BusinessForm.propTypes = {
	business: PropTypes.object,
	onSubmit: PropTypes.func.isRequired,
	mode: PropTypes.oneOf(["create", "edit"]),
};

BusinessForm.defaultProps = {
	business: null,
	mode: "create",
};

export default BusinessForm;
