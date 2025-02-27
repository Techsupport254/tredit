export const sidebarData = [
	// 🔹 Dashboard
	{
		category: "Dashboard",
		path: "/",
		roles: ["Vendor"],
		icon: "fas fa-tachometer-alt",
		description: "Overview of your sales, performance, and statistics.",
	},

	// 🔹 Products Management
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
		],
	},

	// 🔹 Orders Management
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
		],
	},

	// 🔹 Uploads Management
	{
		category: "Uploads",
		roles: ["Vendor"],
		icon: "fas fa-cloud-upload-alt",
		pages: [
			{
				name: "Uploads Overview",
				path: "/uploads",
				icon: "fas fa-cloud-upload-alt",
			},
			{ name: "New Upload", path: "/uploads/new", icon: "fas fa-upload" },
			{
				name: "Manage Uploads",
				path: "/uploads/manage",
				icon: "fas fa-folder-open",
			},
		],
	},

	// 🔹 Payments & Earnings
	{
		category: "Payments",
		roles: ["Vendor"],
		icon: "fas fa-credit-card",
		pages: [
			{ name: "Earnings Overview", path: "/payments", icon: "fas fa-wallet" },
			{
				name: "Payout Requests",
				path: "/payments/payouts",
				icon: "fas fa-money-bill-wave",
			},
		],
	},

	// 🔹 Analytics & Reports
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
				name: "Customer Insights",
				path: "/analytics/customers",
				icon: "fas fa-user-friends",
			},
		],
	},

	// 🔹 Customer Management
	{
		category: "Customers",
		roles: ["Vendor"],
		icon: "fas fa-users",
		pages: [
			{ name: "All Customers", path: "/customers", icon: "fas fa-user" },
			{
				name: "Reviews & Feedback",
				path: "/customers/reviews",
				icon: "fas fa-star",
			},
		],
	},

	// 🔹 Dispute Resolution
	{
		category: "Disputes",
		roles: ["Vendor"],
		icon: "fas fa-balance-scale",
		pages: [
			{ name: "Manage Disputes", path: "/disputes", icon: "fas fa-gavel" },
			{
				name: "Open Disputes",
				path: "/disputes/open",
				icon: "fas fa-exclamation-triangle",
			},
		],
	},

	// 🔹 Settings & Preferences
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
				name: "Security",
				path: "/settings/security",
				icon: "fas fa-shield-alt",
			},
		],
	},

	// 🔹 Support & Help
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
		],
	},

	// 🔹 User Profile
	{
		category: "Profile",
		roles: ["Vendor"],
		icon: "fas fa-user",
		pages: [
			{ name: "My Profile", path: "/profile", icon: "fas fa-user-circle" },
			{ name: "Wallet", path: "/profile/wallet", icon: "fas fa-wallet" },
		],
	},

	// 🔹 Logout
	{
		category: "Logout",
		path: "/logout",
		roles: ["Vendor"],
		icon: "fas fa-sign-out-alt",
		description: "Securely log out of your account.",
	},
];
