export const sidebarData = [
	// 🔹 Dashboard - Main entry point with key metrics
	{
		category: "Dashboard",
		path: "/dashboard",
		icon: "fas fa-tachometer-alt",
		roles: ["Vendor", "Freelancer"],
		badge: {
			type: "notification",
			condition: (user) => user?.unreadNotifications > 0,
			content: (user) => user?.unreadNotifications || 0,
		},
	},

	// 🔹 Business Hub - Manage all stores and service portfolios
	{
		category: "Business Hub",
		icon: "fas fa-building",
		roles: ["Vendor", "Freelancer"],
		badge: {
			type: "counter",
			content: (user) => user?.activeBusinesses || 0,
		},
		pages: [
			{
				name: "My Businesses",
				path: "/businesses",
				exact: true, // Ensure exact path matching
				icon: "fas fa-store",
				roles: ["Vendor", "Freelancer"],
				badge: {
					type: "counter",
					content: (user) => user?.activeBusinesses || 0,
				},
			},
			{
				name: "Create New",
				path: "/businesses/create",
				icon: "fas fa-plus-circle",
				roles: ["Vendor", "Freelancer"],
			},
			{
				name: "Listings Manager",
				path: "/businesses/listings",
				icon: "fas fa-tags",
				roles: ["Vendor", "Freelancer"],
				badge: {
					type: "counter",
					content: (user) => user?.totalListings || 0,
				},
			},
			{
				name: "Stock Control",
				path: "/businesses/inventory",
				icon: "fas fa-boxes",
				roles: ["Vendor"],
				badge: {
					type: "status",
					condition: (user) => user?.lowStockItems > 0,
					content: (user) => `${user?.lowStockItems} low stock`,
					color: "warning",
				},
			},
			{
				name: "Service Contracts",
				path: "/businesses/contracts",
				icon: "fas fa-file-contract",
				roles: ["Freelancer"],
				badge: {
					type: "counter",
					content: (user) => user?.activeContracts || 0,
				},
			},
			{
				name: "Orders",
				path: "/businesses/orders",
				icon: "fas fa-shopping-cart",
				roles: ["Vendor", "Freelancer"],
				badge: {
					type: "counter",
					content: (user) => user?.pendingOrders || 0,
				},
				quickAccess: true,
			},
			{
				name: "Analytics",
				path: "/businesses/analytics",
				icon: "fas fa-chart-bar",
				roles: ["Vendor", "Freelancer"],
			},
		],
	},

	// 🔹 Transaction Hub - Combined financial operations and escrow
	{
		category: "Transactions",
		icon: "fas fa-exchange-alt",
		roles: ["Vendor", "Freelancer"],
		badge: {
			type: "status",
			condition: (user) => user?.pendingTransactions > 0,
			content: (user) => `${user?.pendingTransactions} pending`,
			color: "info",
		},
		pages: [
			{
				name: "Transaction Overview",
				path: "/transactions/overview",
				icon: "fas fa-chart-line",
				quickAccess: true,
			},
			{
				name: "Escrow Management",
				path: "/transactions/escrow",
				icon: "fas fa-lock",
				badge: {
					type: "status",
					condition: (user) => user?.activeEscrows > 0,
					content: (user) => `${user?.activeEscrows} active`,
					color: "info",
				},
			},
			{
				name: "Payment History",
				path: "/transactions/history",
				icon: "fas fa-history",
			},
			{
				name: "Payout Settings",
				path: "/transactions/payouts",
				icon: "fas fa-money-check-alt",
				quickAccess: true,
			},
		],
	},

	// 🔹 Dispute Management
	{
		category: "Disputes",
		icon: "fas fa-gavel",
		roles: ["Vendor", "Freelancer"],
		badge: {
			type: "counter",
			content: (user) => user?.openDisputes || 0,
		},
		pages: [
			{
				name: "Active Disputes",
				path: "/disputes/active",
				icon: "fas fa-exclamation-circle",
				badge: {
					type: "counter",
					content: (user) => user?.openDisputes || 0,
				},
			},
			{
				name: "Resolution Center",
				path: "/disputes/resolution",
				icon: "fas fa-balance-scale",
			},
			{
				name: "Dispute History",
				path: "/disputes/history",
				icon: "fas fa-history",
			},
		],
	},

	// 🔹 Communications - Streamlined messaging and notifications
	{
		category: "Communications",
		icon: "fas fa-comments",
		roles: ["Vendor", "Freelancer"],
		badge: {
			type: "counter",
			content: (user) =>
				(user?.unreadMessages || 0) + (user?.unreadNotifications || 0),
		},
		pages: [
			{
				name: "Messages",
				path: "/communications/messages",
				icon: "fas fa-inbox",
				badge: {
					type: "counter",
					content: (user) => user?.unreadMessages || 0,
				},
				quickAccess: true,
			},
			{
				name: "Announcements",
				path: "/communications/announcements",
				icon: "fas fa-bullhorn",
			},
			{
				name: "Notification Settings",
				path: "/communications/settings",
				icon: "fas fa-bell",
			},
		],
	},

	// 🔹 Account Settings
	{
		category: "Settings",
		icon: "fas fa-cog",
		roles: ["Vendor", "Freelancer"],
		pages: [
			{
				name: "Account Settings",
				path: "/settings/account",
				icon: "fas fa-user-cog",
				badge: {
					type: "status",
					condition: (user) => user?.incompleteProfile,
					content: "Incomplete",
					color: "warning",
				},
			},
			{
				name: "Security",
				path: "/settings/security",
				icon: "fas fa-shield-alt",
				badge: {
					type: "status",
					condition: (user) => !user?.twoFactorEnabled,
					content: "2FA disabled",
					color: "error",
				},
			},
			{
				name: "API Keys",
				path: "/settings/api",
				icon: "fas fa-key",
			},
		],
	},

	// 🔹 Logout
	{
		category: "Logout",
		path: "/logout",
		icon: "fas fa-sign-out-alt",
		roles: ["Vendor", "Freelancer"],
		quickAccess: false,
	},
];
