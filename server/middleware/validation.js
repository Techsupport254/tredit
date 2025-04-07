const Joi = require("joi");
const { BUSINESS_CONSTANTS } = require("../config/constants");

// Product validation schema
const productSchema = Joi.object({
	name: Joi.string().required(),
	description: Joi.string().required(),
	shortDescription: Joi.string().required(),
	category: Joi.string().required(),
	brand: Joi.string().allow(""),
	tags: Joi.array().items(Joi.string()),
	media: Joi.array().items(Joi.string().uri()),
	videoReviewUrl: Joi.string().uri().allow(""),
	businessId: Joi.string().uuid().required(),
	variants: Joi.array().items(
		Joi.object({
			name: Joi.string().required(),
			sku: Joi.string().required(),
			price: Joi.number().min(0).required(),
			stockQuantity: Joi.number().min(0).required(),
			isActive: Joi.boolean().default(true),
			attributes: Joi.object(),
		})
	),
});

// Validation middleware
const validateProduct = (req, res, next) => {
	const { error } = productSchema.validate(req.body, { abortEarly: false });
	if (error) {
		return res.status(400).json({
			success: false,
			message: "Validation error",
			errors: error.details.map((detail) => ({
				field: detail.path.join("."),
				message: detail.message,
			})),
		});
	}
	next();
};

const chatSessionSchema = Joi.object({
	buyerId: Joi.string().uuid().required(),
	businessId: Joi.string().uuid().required(),
	status: Joi.string()
		.valid("active", "completed", "archived")
		.default("active"),
	lastMessageAt: Joi.date(),
});

// Add validation middleware for chat sessions
const validateChatSession = (req, res, next) => {
	const { error } = chatSessionSchema.validate(req.body, { abortEarly: false });
	if (error) {
		return res.status(400).json({
			success: false,
			message: "Validation error",
			errors: error.details.map((detail) => ({
				field: detail.path.join("."),
				message: detail.message,
			})),
		});
	}
	next();
};

module.exports = {
	validateProduct,
	validateChatSession,
};
