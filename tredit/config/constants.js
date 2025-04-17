const BUSINESS_CONSTANTS = {
	// Types
	TYPES: {
		PRODUCT: "product",
		SERVICE: "service",
	},

	// Operation Types
	OPERATION_MODES: {
		PHYSICAL: "physical",
		DIGITAL: "digital",
		HYBRID: "hybrid",
	},

	// Categories
	CATEGORIES: [
		"Technology",
		"Retail",
		"Food & Beverage",
		"Healthcare",
		"Education",
		"Finance",
		"Entertainment",
		"Professional Services",
		"Manufacturing",
		"Other",
	],

	// Service Categories
	SERVICE_CATEGORIES: [
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
	],

	// Product Categories
	PRODUCT_CATEGORIES: [
		"Electronics",
		"Computers & Accessories",
		"Smartphones & Tablets",
		"Home & Garden",
		"Fashion & Apparel",
		"Beauty & Personal Care",
		"Sports & Outdoors",
		"Toys & Games",
		"Books & Media",
		"Food & Beverages",
		"Health & Wellness",
		"Automotive",
		"Office Supplies",
		"Art & Crafts",
		"Pet Supplies",
		"Baby & Kids",
		"Jewelry & Watches",
		"Musical Instruments",
		"Industrial & Scientific",
		"Other",
	],

	// Models
	MODELS: {
		B2B: "B2B",
		B2C: "B2C",
		C2C: "C2C",
		B2B2C: "B2B2C",
	},

	// Status
	STATUS: {
		ACTIVE: "active",
		INACTIVE: "inactive",
		SUSPENDED: "suspended",
	},

	// Verification Status
	VERIFICATION_STATUS: {
		PENDING: "pending",
		VERIFIED: "verified",
		REJECTED: "rejected",
	},

	// Payment Methods
	PAYMENT_METHODS: ["crypto", "card", "bank_transfer", "cash", "mpesa"],

	// Currencies
	CURRENCIES: ["USD", "EUR", "GBP", "KES", "NGN", "ZAR", "ETH", "BTC"],

	// Business Days
	BUSINESS_DAYS: [
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
		"sunday",
	],

	// Social Platforms
	SOCIAL_PLATFORMS: ["tiktok", "facebook", "instagram", "youtube"],

	// Required Address Fields
	REQUIRED_ADDRESS_FIELDS: ["street", "city", "state", "country", "postalCode"],

	// Validation
	VALIDATION: {
		NAME_LENGTH: { MIN: 2, MAX: 100 },
		DESCRIPTION_LENGTH: { MIN: 10, MAX: 1000 },
		EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
		PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
		RATING: { MIN: 0, MAX: 5 },
		VALID_TYPES: ["physical", "digital", "hybrid"],
		VALID_OPERATION_MODES: ["online", "offline", "hybrid"],
		VALID_BUSINESS_MODELS: ["B2B", "B2C", "C2C", "B2G"],
		VALID_PAYMENT_METHODS: ["crypto", "card", "bank", "cash"],
		VALID_CURRENCIES: ["USD", "EUR", "GBP", "JPY", "KES"],
	},

	// Defaults
	DEFAULTS: {
		STATUS: "active",
		VERIFICATION_STATUS: "pending",
		BUSINESS_MODEL: "B2C",
		OPERATION_MODE: "digital",
		CURRENCY: "USD",
		REVENUE: 0,
		AVERAGE_RATING: 0,
		REVIEW_COUNT: 0,
	},
};

const USER_CONSTANTS = {
	// Roles
	ROLES: {
		USER: "user",
		ADMIN: "admin",
		SUPERADMIN: "superadmin",
		SYSTEM: "system",
	},

	// Status
	STATUS: {
		ACTIVE: "active",
		INACTIVE: "inactive",
		SUSPENDED: "suspended",
	},

	// Validation
	VALIDATION: {
		NAME_LENGTH: { MIN: 2, MAX: 50 },
		WALLET_ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
		EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
		PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
	},
};

module.exports = {
	BUSINESS_CONSTANTS,
	USER_CONSTANTS,
};
