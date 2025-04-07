const { BUSINESS_CONSTANTS } = require("../config/constants");

/**
 * Middleware to validate business data before sending to IPFS and blockchain
 * This prevents wasting resources on transactions that will fail validation
 */
const validateBusinessData = (req, res, next) => {
	const {
		name,
		description,
		type,
		category,
		businessModel,
		operationMode,
		email,
		phone,
		status,
		address,
		paymentMethods,
		productCategories,
		serviceCategories,
		businessHours,
		socialMedia,
	} = req.body;

	console.log("Validating business data:", {
		...req.body,
		phone: phone || "not provided",
	});

	const errors = [];

	// Check required fields
	if (!name) errors.push("Name is required");
	if (!description) errors.push("Description is required");
	if (!type) errors.push("Business type is required");
	if (!category) errors.push("Category is required");
	if (!businessModel) errors.push("Business model is required");
	if (!operationMode) errors.push("Operation mode is required");
	if (!email) errors.push("Email is required");
	if (!phone) errors.push("Phone number is required");

	// Validate phone format if provided
	if (phone) {
		if (typeof phone !== "string") {
			errors.push("Phone number must be a string");
		} else {
			const phoneRegex = BUSINESS_CONSTANTS.VALIDATION.PHONE_REGEX;
			if (!phone.match(phoneRegex)) {
				errors.push(
					`Invalid phone number format. Must match pattern: ${phoneRegex}`
				);
			}
		}
	}

	// Validate email format
	if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
		errors.push("Invalid email format");
	}

	// Validate type
	if (type && !Object.values(BUSINESS_CONSTANTS.TYPES).includes(type)) {
		errors.push(
			`Invalid business type: ${type}. Must be one of: ${Object.values(
				BUSINESS_CONSTANTS.TYPES
			).join(", ")}`
		);
	}

	// Validate category
	if (category && !BUSINESS_CONSTANTS.CATEGORIES.includes(category)) {
		errors.push(
			`Invalid category: ${category}. Must be one of: ${BUSINESS_CONSTANTS.CATEGORIES.join(
				", "
			)}`
		);
	}

	// Validate business model
	if (
		businessModel &&
		!Object.values(BUSINESS_CONSTANTS.MODELS).includes(businessModel)
	) {
		errors.push(
			`Invalid business model: ${businessModel}. Must be one of: ${Object.values(
				BUSINESS_CONSTANTS.MODELS
			).join(", ")}`
		);
	}

	// Validate operation mode
	if (
		operationMode &&
		!Object.values(BUSINESS_CONSTANTS.OPERATION_MODES).includes(operationMode)
	) {
		errors.push(
			`Invalid operation mode: ${operationMode}. Must be one of: ${Object.values(
				BUSINESS_CONSTANTS.OPERATION_MODES
			).join(", ")}`
		);
	}

	// Validate status if provided
	if (status && !Object.values(BUSINESS_CONSTANTS.STATUS).includes(status)) {
		errors.push(
			`Invalid status: ${status}. Must be one of: ${Object.values(
				BUSINESS_CONSTANTS.STATUS
			).join(", ")}`
		);
	}

	// Validate product categories if provided for product type business
	if (type === BUSINESS_CONSTANTS.TYPES.PRODUCT && productCategories) {
		if (!Array.isArray(productCategories)) {
			errors.push("Product categories must be an array");
		} else {
			productCategories.forEach((category) => {
				if (!BUSINESS_CONSTANTS.PRODUCT_CATEGORIES.includes(category)) {
					errors.push(
						`Invalid product category: ${category}. Must be one of: ${BUSINESS_CONSTANTS.PRODUCT_CATEGORIES.join(
							", "
						)}`
					);
				}
			});
		}
	}

	// Validate service categories if provided for service type business
	if (type === BUSINESS_CONSTANTS.TYPES.SERVICE && serviceCategories) {
		if (!Array.isArray(serviceCategories)) {
			errors.push("Service categories must be an array");
		} else {
			serviceCategories.forEach((category) => {
				if (!BUSINESS_CONSTANTS.SERVICE_CATEGORIES.includes(category)) {
					errors.push(
						`Invalid service category: ${category}. Must be one of: ${BUSINESS_CONSTANTS.SERVICE_CATEGORIES.join(
							", "
						)}`
					);
				}
			});
		}
	}

	// Validate payment methods if provided
	if (paymentMethods) {
		if (!Array.isArray(paymentMethods)) {
			errors.push("Payment methods must be an array");
		} else {
			paymentMethods.forEach((method) => {
				if (!BUSINESS_CONSTANTS.PAYMENT_METHODS.includes(method)) {
					errors.push(
						`Invalid payment method: ${method}. Must be one of: ${BUSINESS_CONSTANTS.PAYMENT_METHODS.join(
							", "
						)}`
					);
				}
			});
		}
	}

	// Validate address if provided
	if (address) {
		if (typeof address !== "object") {
			errors.push("Address must be an object");
		} else {
			BUSINESS_CONSTANTS.REQUIRED_ADDRESS_FIELDS.forEach((field) => {
				if (!address[field]) {
					errors.push(`Address field ${field} is required`);
				}
			});
		}
	}

	// Validate social media if provided
	if (socialMedia) {
		if (typeof socialMedia !== "object") {
			errors.push("Social media must be an object");
		} else {
			BUSINESS_CONSTANTS.SOCIAL_PLATFORMS.forEach((platform) => {
				if (socialMedia[platform]) {
					if (typeof socialMedia[platform] !== "object") {
						errors.push(`Social media ${platform} must be an object`);
					} else if (typeof socialMedia[platform].isConnected !== "boolean") {
						errors.push(
							`Social media ${platform}.isConnected must be a boolean`
						);
					}
				}
			});
		}
	}

	// Validate business hours if provided
	if (businessHours) {
		if (typeof businessHours !== "object") {
			errors.push("Business hours must be an object");
		} else {
			Object.keys(businessHours).forEach((day) => {
				if (!BUSINESS_CONSTANTS.BUSINESS_DAYS.includes(day)) {
					errors.push(
						`Invalid business day: ${day}. Must be one of: ${BUSINESS_CONSTANTS.BUSINESS_DAYS.join(
							", "
						)}`
					);
				}

				const hours = businessHours[day];
				if (hours && typeof hours === "object") {
					if (hours.open && !hours.open.match(/^([01]\d|2[0-3]):([0-5]\d)$/)) {
						errors.push(
							`Invalid opening time format for ${day}: ${hours.open}. Must be in 24-hour format (HH:MM)`
						);
					}
					if (
						hours.close &&
						!hours.close.match(/^([01]\d|2[0-3]):([0-5]\d)$/)
					) {
						errors.push(
							`Invalid closing time format for ${day}: ${hours.close}. Must be in 24-hour format (HH:MM)`
						);
					}
				} else if (hours !== null) {
					errors.push(
						`Business hours for ${day} must be an object with open and close fields or null`
					);
				}
			});
		}
	}

	if (errors.length > 0) {
		console.log("Validation errors:", errors);
		return res.status(400).json({
			success: false,
			errors,
			code: "VALIDATION_ERROR",
		});
	}

	next();
};

module.exports = {
	validateBusinessData,
};
