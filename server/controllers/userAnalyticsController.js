const { db, sequelize } = require("../models");
const { Op } = require("sequelize");
const {
	successResponse,
	errorResponse,
	ResponseCodes,
} = require("../utils/responseHelper");

/**
 * Get comprehensive analytics for a user
 */
const getUserAnalytics = async (req, res) => {
	try {
		const userId = req.user.id; // Get authenticated user ID
		const timeframe = req.query.timeframe || "all"; // Options: 'week', 'month', 'year', 'all'

		// Build date filters based on timeframe
		let dateFilter = {};
		if (timeframe !== "all") {
			const now = new Date();
			let startDate;

			switch (timeframe) {
				case "week":
					startDate = new Date(now.setDate(now.getDate() - 7));
					break;
				case "month":
					startDate = new Date(now.setMonth(now.getMonth() - 1));
					break;
				case "year":
					startDate = new Date(now.setFullYear(now.getFullYear() - 1));
					break;
				default:
					startDate = null;
			}

			if (startDate) {
				dateFilter = {
					createdAt: { [Op.gte]: startDate },
				};
			}
		}

		// 1. Fetch user profile data
		const user = await db.User.findByPk(userId, {
			attributes: [
				"id",
				"name",
				"email",
				"walletAddress",
				"profileImage",
				"gender",
				"dob",
				"createdAt",
				"lastLogin",
				"status",
				"role",
			],
		});

		if (!user) {
			return res
				.status(404)
				.json(errorResponse("User not found", ResponseCodes.NOT_FOUND));
		}

		// Calculate account age in days
		const accountAge = Math.floor(
			(new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
		);

		// Calculate profile completion percentage
		const profileFields = [
			"name",
			"email",
			"walletAddress",
			"profileImage",
			"gender",
			"dob",
			"phoneNumber",
			"location",
			"bio",
		];
		const nonEmptyFields = profileFields.filter((field) => {
			const value = user[field];
			if (field === "location") {
				return (
					value && (value.country || value.state || value.city || value.address)
				);
			}
			return value && String(value).trim() !== "";
		});
		const profileCompletion = Math.round(
			(nonEmptyFields.length / profileFields.length) * 100
		);

		// 2. Fetch order statistics
		const orderStats = await Promise.all([
			// Total orders count
			db.Order.count({
				where: {
					userId,
					...dateFilter,
				},
			}),

			// Orders by status
			db.Order.findAll({
				attributes: [
					"status",
					[sequelize.fn("COUNT", sequelize.col("id")), "count"],
				],
				where: {
					userId,
					...dateFilter,
				},
				group: ["status"],
			}),

			// Total spending
			db.Order.sum("totalAmount", {
				where: {
					userId,
					...dateFilter,
				},
			}),

			// Recent orders
			db.Order.findAll({
				where: { userId },
				include: [
					{
						model: db.Business,
						as: "business",
						attributes: ["id", "name"],
					},
					{
						model: db.OrderItem,
						as: "items",
						include: [
							{
								model: db.Product,
								as: "product",
								attributes: ["id", "name"],
							},
						],
					},
				],
				order: [["createdAt", "DESC"]],
				limit: 5,
			}),
		]);

		// 3. Fetch service order statistics
		const serviceStats = await Promise.all([
			// Total service orders
			db.ServiceOrder.count({
				where: {
					userId,
					...dateFilter,
				},
			}),

			// Service orders by status
			db.ServiceOrder.findAll({
				attributes: [
					"status",
					[sequelize.fn("COUNT", sequelize.col("id")), "count"],
				],
				where: {
					userId,
					...dateFilter,
				},
				group: ["status"],
			}),

			// Total service spending
			db.ServiceOrder.sum("totalAmount", {
				where: {
					userId,
					status: "completed",
					...dateFilter,
				},
			}),

			// Upcoming service appointments
			db.ServiceOrder.findAll({
				where: {
					userId,
					status: {
						[Op.in]: ["confirmed", "scheduled"],
					},
					scheduledDate: {
						[Op.gte]: new Date(),
					},
				},
				include: [
					{
						model: db.Service,
						as: "service",
						include: [
							{
								model: db.Business,
								as: "business",
								attributes: ["id", "name"],
							},
						],
					},
				],
				order: [["scheduledDate", "ASC"]],
				limit: 5,
			}),
		]);

		// 4. Fetch business memberships
		const businessMemberships = await db.BusinessTeamMember.findAll({
			where: { userId },
			include: [
				{
					model: db.Business,
					as: "business",
					attributes: ["id", "name", "logo", "type", "status"],
				},
			],
		});

		// 5. Fetch dispute statistics
		const disputeStats = await Promise.all([
			// Open disputes count
			db.Dispute.count({
				where: {
					userId,
					status: {
						[Op.in]: ["open", "pending", "investigating"],
					},
					...dateFilter,
				},
			}),

			// All disputes count by status
			db.Dispute.findAll({
				attributes: [
					"status",
					[sequelize.fn("COUNT", sequelize.col("id")), "count"],
				],
				where: {
					userId,
					...dateFilter,
				},
				group: ["status"],
			}),
		]);

		// 6. Fetch message statistics
		const messageStats = await Promise.all([
			// Total chat sessions
			db.ChatSession.count({
				where: {
					buyerId: userId,
					...dateFilter,
				},
			}),

			// Unread messages count
			db.Message.count({
				where: {
					receiverId: userId,
					read: false,
				},
			}),

			// Active chat sessions
			db.ChatSession.findAll({
				where: {
					buyerId: userId,
					status: "active",
				},
				include: [
					{
						model: db.Business,
						as: "business",
						attributes: ["id", "name", "logo"],
					},
					{
						model: db.Message,
						as: "messages",
						limit: 1,
						order: [["createdAt", "DESC"]],
					},
				],
				limit: 5,
			}),
		]);

		// 7. Fetch shopping behavior
		const shoppingBehavior = await Promise.all([
			// Products in cart
			db.ProductCart.findAll({
				where: { userId },
				include: [
					{
						model: db.ProductCartItem,
						as: "items",
						include: [
							{
								model: db.Product,
								as: "product",
							},
						],
					},
				],
			}),

			// Services in cart
			db.ServiceCart.findAll({
				where: { userId },
				include: [
					{
						model: db.ServiceCartItem,
						as: "items",
						include: [
							{
								model: db.Service,
								as: "service",
							},
						],
					},
				],
			}),
		]);

		// 8. Compute favorite businesses
		const favoriteBusinesses = await db.Order.findAll({
			attributes: [
				"businessId",
				[sequelize.fn("COUNT", sequelize.col("id")), "orderCount"],
				[sequelize.fn("SUM", sequelize.col("totalAmount")), "totalSpent"],
			],
			where: {
				userId,
				...dateFilter,
			},
			include: [
				{
					model: db.Business,
					as: "business",
					attributes: ["id", "name", "logo", "type"],
				},
			],
			group: ["businessId", "business.id"],
			order: [[sequelize.literal("orderCount"), "DESC"]],
			limit: 5,
		});

		// Compile all analytics into a structured response
		const analytics = {
			accountSummary: {
				userId: user.id,
				name: user.name,
				email: user.email,
				walletAddress: user.walletAddress,
				profileImage: user.profileImage,
				accountAge,
				profileCompletion,
				lastLogin: user.lastLogin,
				status: user.status,
				role: user.role,
			},
			orderActivity: {
				totalOrders: orderStats[0],
				ordersByStatus: orderStats[1],
				totalSpending: orderStats[2] || 0,
				averageOrderValue:
					orderStats[0] > 0 ? (orderStats[2] || 0) / orderStats[0] : 0,
				recentOrders: orderStats[3],
			},
			serviceActivity: {
				totalServiceOrders: serviceStats[0],
				serviceOrdersByStatus: serviceStats[1],
				totalServiceSpending: serviceStats[2] || 0,
				upcomingAppointments: serviceStats[3],
			},
			businessEngagement: {
				teamMemberships: businessMemberships.map((membership) => ({
					businessId: membership.business.id,
					businessName: membership.business.name,
					businessLogo: membership.business.logo,
					role: membership.role,
					permissions: membership.permissions,
				})),
				ownedBusinesses: businessMemberships
					.filter((membership) => membership.role === "owner")
					.map((membership) => membership.business),
			},
			supportActivity: {
				openDisputes: disputeStats[0],
				disputesByStatus: disputeStats[1],
			},
			communication: {
				totalChatSessions: messageStats[0],
				unreadMessages: messageStats[1],
				activeChats: messageStats[2],
			},
			shoppingBehavior: {
				productsInCart: shoppingBehavior[0],
				servicesInCart: shoppingBehavior[1],
				favoriteBusinesses,
			},
			timeframe,
		};

		return res
			.status(200)
			.json(
				successResponse(analytics, "User analytics retrieved successfully")
			);
	} catch (error) {
		console.error("Error fetching user analytics:", error);
		return res
			.status(500)
			.json(
				errorResponse(
					error.message || "Failed to fetch user analytics",
					ResponseCodes.INTERNAL_SERVER_ERROR
				)
			);
	}
};

module.exports = {
	getUserAnalytics,
};
