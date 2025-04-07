const AppError = require("./appError");
const { BUSINESS_CONSTANTS } = require("../config/constants");

const validateBusinessData = (data) => {
	const errors = [];
	const {
		name,
		description,
		type,
		category,
		businessModel,
		operationMode,
		email,
		paymentMethods = [],
	} = data;

	// Required fields
	if (!name) {
		errors.push("Business name is required");
	} else if (
		name.length < BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MIN ||
		name.length > BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MAX
	) {
		errors.push(
			`Business name must be between ${BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MIN} and ${BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MAX} characters`
		);
	}

	if (!description) {
		errors.push("Business description is required");
	} else if (
		description.length < BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MIN ||
		description.length > BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MAX
	) {
		errors.push(
			`Business description must be between ${BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MIN} and ${BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MAX} characters`
		);
	}

	if (!category) {
		errors.push("Business category is required");
	}

	if (!type) {
		errors.push("Business type is required");
	} else if (
		!Object.values(BUSINESS_CONSTANTS.TYPES).includes(type.toLowerCase())
	) {
		errors.push(
			`Invalid business type. Must be one of: ${Object.values(
				BUSINESS_CONSTANTS.TYPES
			).join(", ")}`
		);
	}

	if (!businessModel) {
		errors.push("Business model is required");
	} else if (
		!Object.values(BUSINESS_CONSTANTS.MODELS).includes(businessModel)
	) {
		errors.push(
			`Invalid business model. Must be one of: ${Object.values(
				BUSINESS_CONSTANTS.MODELS
			).join(", ")}`
		);
	}

	if (!operationMode) {
		errors.push("Operation mode is required");
	} else if (
		!Object.values(BUSINESS_CONSTANTS.OPERATION_MODES).includes(
			operationMode.toLowerCase()
		)
	) {
		errors.push(
			`Invalid operation mode. Must be one of: ${Object.values(
				BUSINESS_CONSTANTS.OPERATION_MODES
			).join(", ")}`
		);
	}

	// Optional fields with format validation
	if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
		errors.push("Invalid email format");
	}

	if (paymentMethods.length > 0) {
		const invalidMethods = paymentMethods.filter(
			(method) => !BUSINESS_CONSTANTS.PAYMENT_METHODS.includes(method)
		);
		if (invalidMethods.length > 0) {
			errors.push(
				`Invalid payment methods: ${invalidMethods.join(
					", "
				)}. Must be one of: ${BUSINESS_CONSTANTS.PAYMENT_METHODS.join(", ")}`
			);
		}
	}

	return errors;
};

module.exports = {
	validateBusinessData,
};
