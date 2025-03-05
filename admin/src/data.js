export const sidebarData = [
	// 🔹 Dashboard (Common)
	{
		category: "Dashboard",
		path: "/dashboard",
		roles: ["Vendor", "Freelancer"],
		icon: "fas fa-tachometer-alt",
		description: "Business overview and key metrics",
	},

	// 🔹 Products (Vendor Only)
	{
		category: "Products",
		roles: ["Vendor"],
		icon: "fas fa-box-open",
		pages: [
			{ name: "Product Catalog", path: "/products", icon: "fas fa-boxes" },
			{
				name: "Add Product",
				path: "/products/add",
				icon: "fas fa-plus-square",
			},
			{
				name: "Inventory",
				path: "/products/inventory",
				icon: "fas fa-clipboard-list",
			},
		],
	},

	// 🔹 Services (Freelancer Only)
	{
		category: "Services",
		roles: ["Freelancer"],
		icon: "fas fa-handshake",
		pages: [
			{ name: "Service Listings", path: "/services", icon: "fas fa-briefcase" },
			{
				name: "New Service",
				path: "/services/create",
				icon: "fas fa-plus-circle",
			},
			{
				name: "Active Contracts",
				path: "/services/contracts",
				icon: "fas fa-file-contract",
			},
			{
				name: "Deliverables",
				path: "/services/deliverables",
				icon: "fas fa-cloud-upload-alt",
			},
		],
	},

	// 🔹 Transactions (Common)
	{
		category: "Transactions",
		roles: ["Vendor", "Freelancer"],
		icon: "fas fa-exchange-alt",
		pages: [
			{ name: "All Transactions", path: "/transactions", icon: "fas fa-list" },
			{
				name: "Escrow Status",
				path: "/transactions/escrow",
				icon: "fas fa-lock",
			},
			{
				name: "Dispute Center",
				path: "/transactions/disputes",
				icon: "fas fa-balance-scale",
			},
		],
	},

	// 🔹 Messaging & Notifications (Common)
	{
		category: "Communication",
		roles: ["Vendor", "Freelancer"],
		icon: "fas fa-comments",
		pages: [
			{
				name: "Messages",
				path: "/communication/messages",
				icon: "fas fa-comment-dots",
				submenu: [
					{
						name: "Inbox",
						path: "/communication/messages/inbox",
						icon: "fas fa-inbox",
					},
					{
						name: "Sent",
						path: "/communication/messages/sent",
						icon: "fas fa-paper-plane",
					},
					{
						name: "New Message",
						path: "/communication/messages/compose",
						icon: "fas fa-edit",
					},
				],
			},
			{
				name: "Notifications",
				path: "/communication/notifications",
				icon: "fas fa-bell",
				submenu: [
					{
						name: "Alerts",
						path: "/communication/notifications/alerts",
						icon: "fas fa-exclamation-circle",
					},
					{
						name: "System Updates",
						path: "/communication/notifications/system",
						icon: "fas fa-server",
					},
				],
			},
		],
	},

	// 🔹 Finance (Common)
	{
		category: "Finance",
		roles: ["Vendor", "Freelancer"],
		icon: "fas fa-wallet",
		pages: [
			{ name: "Earnings", path: "/finance", icon: "fas fa-chart-pie" },
			{
				name: "Payouts",
				path: "/finance/payouts",
				icon: "fas fa-money-check-alt",
			},
			{ name: "Tax Records", path: "/finance/taxes", icon: "fas fa-receipt" },
		],
	},

	// 🔹 Clients & Reviews (Common)
	{
		category: "Clients",
		roles: ["Vendor", "Freelancer"],
		icon: "fas fa-users",
		pages: [
			{
				name: "Client Directory",
				path: "/clients",
				icon: "fas fa-address-book",
			},
			{ name: "Reviews", path: "/clients/reviews", icon: "fas fa-star" },
			{ name: "Reputation", path: "/clients/reputation", icon: "fas fa-medal" },
		],
	},

	// 🔹 Platform Settings (Common)
	{
		category: "Settings",
		roles: ["Vendor", "Freelancer"],
		icon: "fas fa-cog",
		pages: [
			{
				category: "Profile",
				name: "Profile",
				path: "/settings/profile",
				icon: "fas fa-user-cog",
				showBadge: true,
			},
		],
	},

	// 🔹 Support (Common)
	{
		category: "Help",
		roles: ["Vendor", "Freelancer"],
		icon: "fas fa-question-circle",
		pages: [
			{ name: "Documentation", path: "/help/docs", icon: "fas fa-book-open" },
			{
				name: "Contact Support",
				path: "/help/contact",
				icon: "fas fa-headset",
			},
			{ name: "Escrow Guide", path: "/help/escrow", icon: "fas fa-lock" },
		],
	},

	// 🔹 Logout (Common)
	{
		category: "Logout",
		path: "/logout",
		roles: ["Vendor", "Freelancer"],
		icon: "fas fa-sign-out-alt",
		description: "Secure session termination",
	},
];
