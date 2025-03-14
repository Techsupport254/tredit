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

	// Tags
	TAGS: [
		"Affordable",
		"Best Seller",
		"Featured",
		"New Arrival",
		"Popular",
		"Premium",
		"Sale",
		"Trending",
		"Verified",
		"Limited Edition",
		"Exclusive",
		"Handmade",
		"Custom",
		"Eco-friendly",
		"Organic",
		"Sustainable",
		"Fast Delivery",
		"24/7 Support",
		"Warranty",
		"Guaranteed",
	],
};

export const TEAM_MEMBER_CONSTANTS = {
	ROLES: [
		{ value: "owner", label: "Owner", icon: "👑" },
		{ value: "admin", label: "Administrator", icon: "🛡️" },
		{ value: "manager", label: "Manager", icon: "📊" },
		{ value: "accountant", label: "Accountant", icon: "💰" },
		{ value: "inventory_manager", label: "Inventory Manager", icon: "📦" },
		{
			value: "sales_representative",
			label: "Sales Representative",
			icon: "💼",
		},
		{
			value: "marketing_specialist",
			label: "Marketing Specialist",
			icon: "📢",
		},
		{ value: "customer_service", label: "Customer Service", icon: "🎯" },
		{ value: "hr_manager", label: "HR Manager", icon: "👥" },
		{ value: "content_creator", label: "Content Creator", icon: "✍️" },
		{
			value: "logistics_coordinator",
			label: "Logistics Coordinator",
			icon: "🚚",
		},
		{ value: "quality_control", label: "Quality Control", icon: "✅" },
		{
			value: "procurement_specialist",
			label: "Procurement Specialist",
			icon: "🔍",
		},
		{
			value: "social_media_manager",
			label: "Social Media Manager",
			icon: "📱",
		},
		{ value: "financial_analyst", label: "Financial Analyst", icon: "📈" },
		{ value: "staff", label: "Staff", icon: "👤" },
	],

	EMPLOYMENT_TYPES: [
		{ value: "full_time", label: "Full Time" },
		{ value: "part_time", label: "Part Time" },
		{ value: "contract", label: "Contract" },
		{ value: "temporary", label: "Temporary" },
		{ value: "intern", label: "Intern" },
		{ value: "consultant", label: "Consultant" },
	],

	SHIFTS: [
		{ value: "morning", label: "Morning Shift" },
		{ value: "afternoon", label: "Afternoon Shift" },
		{ value: "night", label: "Night Shift" },
		{ value: "flexible", label: "Flexible Hours" },
	],

	SALARY_PERIODS: [
		{ value: "hourly", label: "Per Hour" },
		{ value: "daily", label: "Per Day" },
		{ value: "weekly", label: "Per Week" },
		{ value: "monthly", label: "Per Month" },
		{ value: "yearly", label: "Per Year" },
	],

	PERMISSIONS: {
		PRODUCT_INVENTORY: [
			{ value: "manage_products", label: "Manage Products" },
			{ value: "manage_inventory", label: "Manage Inventory" },
			{ value: "view_inventory", label: "View Inventory" },
			{ value: "manage_stock_levels", label: "Manage Stock Levels" },
			{
				value: "manage_product_categories",
				label: "Manage Product Categories",
			},
			{ value: "manage_suppliers", label: "Manage Suppliers" },
		],
		SALES_ORDERS: [
			{ value: "manage_orders", label: "Manage Orders" },
			{ value: "process_returns", label: "Process Returns" },
			{ value: "manage_invoices", label: "Manage Invoices" },
			{ value: "manage_shipping", label: "Manage Shipping" },
			{ value: "view_sales_reports", label: "View Sales Reports" },
			{ value: "manage_discounts", label: "Manage Discounts" },
		],
		CUSTOMER: [
			{ value: "manage_customers", label: "Manage Customers" },
			{ value: "view_customer_data", label: "View Customer Data" },
			{ value: "manage_customer_support", label: "Manage Customer Support" },
			{ value: "manage_feedback", label: "Manage Feedback" },
			{ value: "manage_loyalty_programs", label: "Manage Loyalty Programs" },
		],
		FINANCIAL: [
			{ value: "manage_finances", label: "Manage Finances" },
			{ value: "view_financial_reports", label: "View Financial Reports" },
			{ value: "manage_expenses", label: "Manage Expenses" },
			{ value: "manage_payroll", label: "Manage Payroll" },
			{ value: "manage_budgets", label: "Manage Budgets" },
			{ value: "manage_transactions", label: "Manage Transactions" },
			{ value: "manage_tax_settings", label: "Manage Tax Settings" },
		],
		MARKETING_CONTENT: [
			{ value: "manage_marketing", label: "Manage Marketing" },
			{ value: "manage_campaigns", label: "Manage Campaigns" },
			{ value: "manage_social_media", label: "Manage Social Media" },
			{ value: "manage_content", label: "Manage Content" },
			{ value: "manage_blog", label: "Manage Blog" },
			{ value: "manage_newsletters", label: "Manage Newsletters" },
			{ value: "manage_promotions", label: "Manage Promotions" },
			{ value: "manage_seo", label: "Manage SEO" },
		],
		TEAM_HR: [
			{ value: "manage_team", label: "Manage Team" },
			{ value: "manage_schedules", label: "Manage Schedules" },
			{ value: "manage_attendance", label: "Manage Attendance" },
			{ value: "manage_recruitment", label: "Manage Recruitment" },
			{ value: "manage_training", label: "Manage Training" },
			{ value: "view_team_reports", label: "View Team Reports" },
		],
		ANALYTICS_REPORTING: [
			{ value: "view_analytics", label: "View Analytics" },
			{ value: "view_reports", label: "View Reports" },
			{ value: "export_reports", label: "Export Reports" },
			{ value: "manage_dashboards", label: "Manage Dashboards" },
		],
		SYSTEM_SETTINGS: [
			{ value: "manage_settings", label: "Manage Settings" },
			{ value: "manage_integrations", label: "Manage Integrations" },
			{ value: "manage_security", label: "Manage Security" },
			{ value: "manage_backups", label: "Manage Backups" },
		],
		SERVICES: [
			{ value: "manage_services", label: "Manage Services" },
			{ value: "schedule_services", label: "Schedule Services" },
			{ value: "manage_appointments", label: "Manage Appointments" },
			{ value: "manage_service_providers", label: "Manage Service Providers" },
		],
		QUALITY_COMPLIANCE: [
			{ value: "manage_quality_control", label: "Manage Quality Control" },
			{ value: "manage_compliance", label: "Manage Compliance" },
			{ value: "manage_certifications", label: "Manage Certifications" },
			{ value: "manage_audits", label: "Manage Audits" },
		],
		COMMUNICATION: [
			{ value: "manage_communications", label: "Manage Communications" },
			{ value: "send_notifications", label: "Send Notifications" },
			{ value: "manage_chat", label: "Manage Chat" },
		],
		LOGISTICS: [
			{ value: "manage_logistics", label: "Manage Logistics" },
			{ value: "manage_warehouses", label: "Manage Warehouses" },
			{ value: "manage_deliveries", label: "Manage Deliveries" },
			{ value: "track_shipments", label: "Track Shipments" },
		],
	},
};
