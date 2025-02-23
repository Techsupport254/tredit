export const sidebarData = [
	{
		category: "Dashboard",
		path: "/",
		roles: ["Vendor"],
		icon: "fas fa-tachometer-alt",
		description: "Overview of your sales, products, and performance.",
	},

	{
		category: "Products",
		roles: ["Vendor"],
		icon: "fas fa-box",
		pages: [
			{ name: "All Products", path: "/products", icon: "fas fa-boxes" },
			{
				name: "Add Product",
				path: "/products/add",
				icon: "fas fa-plus-square",
			},
			{
				name: "Inventory",
				path: "/products/inventory",
				icon: "fas fa-warehouse",
			},
			{ name: "Categories", path: "/products/categories", icon: "fas fa-tags" },
		],
	},
	{
		category: "Orders",
		roles: ["Vendor"],
		icon: "fas fa-shopping-cart",
		pages: [
			{ name: "All Orders", path: "/orders", icon: "fas fa-receipt" },
			{
				name: "Pending Orders",
				path: "/orders/pending",
				icon: "fas fa-hourglass-half",
			},
			{
				name: "Completed Orders",
				path: "/orders/completed",
				icon: "fas fa-check-circle",
			},
			{
				name: "Returns & Refunds",
				path: "/orders/refunds",
				icon: "fas fa-undo-alt",
			},
		],
	},
	{
		category: "Payments",
		roles: ["Vendor"],
		icon: "fas fa-credit-card",
		pages: [
			{ name: "Payment Overview", path: "/payments", icon: "fas fa-wallet" },
			{
				name: "Payout Requests",
				path: "/payments/payouts",
				icon: "fas fa-money-bill-wave",
			},
			{
				name: "Transaction History",
				path: "/payments/history",
				icon: "fas fa-history",
			},
		],
	},
	{
		category: "Analytics",
		roles: ["Vendor"],
		icon: "fas fa-chart-line",
		pages: [
			{
				name: "Sales Analytics",
				path: "/analytics/sales",
				icon: "fas fa-chart-bar",
			},
			{
				name: "Product Performance",
				path: "/analytics/products",
				icon: "fas fa-chart-pie",
			},
			{
				name: "Customer Insights",
				path: "/analytics/customers",
				icon: "fas fa-user-friends",
			},
		],
	},
	{
		category: "Customers",
		roles: ["Vendor"],
		icon: "fas fa-users",
		pages: [
			{ name: "All Customers", path: "/customers", icon: "fas fa-user" },
			{
				name: "Feedback & Reviews",
				path: "/customers/reviews",
				icon: "fas fa-star",
			},
			{
				name: "Customer Queries",
				path: "/customers/queries",
				icon: "fas fa-question-circle",
			},
		],
	},
	{
		category: "Dispute",
		roles: ["Vendor"],
		icon: "fas fa-balance-scale",
		pages: [
			{ name: "All Disputes", path: "/disputes", icon: "fas fa-gavel" },
			{
				name: "Open Disputes",
				path: "/disputes/open",
				icon: "fas fa-exclamation-triangle",
			},
			{
				name: "Resolved Disputes",
				path: "/disputes/resolved",
				icon: "fas fa-check-double",
			},
		],
	},
	{
		category: "Settings",
		roles: ["Vendor"],
		icon: "fas fa-cog",
		pages: [
			{
				name: "Profile Settings",
				path: "/settings/profile",
				icon: "fas fa-user-circle",
			},
			{
				name: "Business Info",
				path: "/settings/business",
				icon: "fas fa-briefcase",
			},
			{
				name: "Payment Settings",
				path: "/settings/payments",
				icon: "fas fa-credit-card",
			},
			{
				name: "Security",
				path: "/settings/security",
				icon: "fas fa-shield-alt",
			},
		],
	},
	{
		category: "Support",
		roles: ["Vendor"],
		icon: "fas fa-headset",
		pages: [
			{ name: "Help Center", path: "/support/help", icon: "fas fa-life-ring" },
			{
				name: "Contact Support",
				path: "/support/contact",
				icon: "fas fa-envelope",
			},
			{ name: "FAQs", path: "/support/faqs", icon: "fas fa-info-circle" },
		],
	},
	{
		category: "Profile",
		roles: ["Vendor"],
		icon: "fas fa-user",
		pages: [
			{ name: "My Profile", path: "/profile", icon: "fas fa-user-circle" },
			{
				name: "Verification Status",
				path: "/profile/verification",
				icon: "fas fa-check-circle",
			},
			{
				name: "Account Security",
				path: "/profile/security",
				icon: "fas fa-lock",
			},
			{
				name: "Wallet",
				path: "/profile/wallet",
				icon: "fas fa-wallet",
			},
			{
				name: "Edit Profile",
				path: "/profile/edit",
				icon: "fas fa-edit",
			},
		],
	},
	{
		category: "Logout",
		path: "/logout",
		roles: ["Vendor"],
		icon: "fas fa-sign-out-alt",
		description: "Securely log out of your account.",
	},
];
