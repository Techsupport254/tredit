export const BUSINESS_CONSTANTS = {
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
		"Software Development",
		"Web Design",
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
		"Marketing & Advertising",
		"Real Estate Services",
		"Transportation Services",
		"Installation Services",
		"Maintenance & Repair",
		"Event Planning",
		"Personal Services",
		"Other Services",
	],

	// Product Categories
	PRODUCT_CATEGORIES: [
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
	PAYMENT_METHODS: ["crypto", "card", "bank_transfer", "cash"],

	// Currencies
	CURRENCIES: ["USD", "EUR", "GBP", "JPY", "KES"],

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

	// Validation
	VALIDATION: {
		NAME_LENGTH: { MIN: 2, MAX: 100 },
		DESCRIPTION_LENGTH: { MIN: 10, MAX: 1000 },
		WALLET_ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
		EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
		PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
		RATING: { MIN: 0, MAX: 5 },
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
