const BUSINESS_CONSTANTS = {
	VALIDATION: {
		WALLET_ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
		NAME_MIN_LENGTH: 2,
		NAME_MAX_LENGTH: 100,
		DESCRIPTION_MAX_LENGTH: 1000,
		VALID_TYPES: ["physical", "digital", "hybrid"],
		VALID_OPERATION_MODES: ["online", "offline", "hybrid"],
		VALID_BUSINESS_MODELS: ["B2B", "B2C", "C2C", "B2G"],
		VALID_PAYMENT_METHODS: ["crypto", "card", "bank", "cash"],
		VALID_CURRENCIES: ["USD", "EUR", "GBP", "JPY", "KES"],
	},
	DEFAULTS: {
		STATUS: "active",
		VERIFICATION_STATUS: "pending",
		BUSINESS_MODEL: "B2C",
		CURRENCY: "USD",
		REVENUE: 0,
		AVERAGE_RATING: 0,
		REVIEW_COUNT: 0,
	},
};

module.exports = {
	BUSINESS_CONSTANTS,
};
