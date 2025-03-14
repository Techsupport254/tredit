const { Model, DataTypes } = require("sequelize");
const crypto = require("crypto");

class BusinessTeamMember extends Model {
	static associate(models) {
		// Association with Business
		BusinessTeamMember.belongsTo(models.Business, {
			foreignKey: "businessId",
			as: "business",
		});

		// Association with User
		BusinessTeamMember.belongsTo(models.User, {
			foreignKey: "userId",
			as: "user",
		});
	}

	// Instance methods
	hasPermission(permission) {
		return this.permissions && this.permissions[permission] === true;
	}

	hasRole(role) {
		return this.role === role;
	}

	isOwner() {
		return this.role === "owner";
	}

	isAdmin() {
		return this.role === "admin";
	}

	canManageTeam() {
		return (
			this.hasPermission("manage_team") || this.isOwner() || this.isAdmin()
		);
	}

	canManageSettings() {
		return (
			this.hasPermission("manage_settings") || this.isOwner() || this.isAdmin()
		);
	}

	// Static methods
	static async findActiveMembers(businessId) {
		return await this.findAll({
			where: {
				businessId,
				status: "active",
			},
		});
	}

	static async isUserMember(businessId, userId) {
		const member = await this.findOne({
			where: {
				businessId,
				userId,
				status: "active",
			},
		});
		return !!member;
	}

	static initModel(sequelize) {
		return super.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
					allowNull: false,
				},
				businessId: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: "Businesses",
						key: "id",
					},
				},
				userId: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: "Users",
						key: "id",
					},
				},
				walletAddress: {
					type: DataTypes.STRING,
					allowNull: true,
					validate: {
						isLowercase: true,
						is: /^0x[a-fA-F0-9]{40}$/i,
					},
				},
				role: {
					type: DataTypes.ENUM(
						"owner",
						"admin",
						"manager",
						"accountant",
						"inventory_manager",
						"sales_representative",
						"marketing_specialist",
						"customer_service",
						"hr_manager",
						"content_creator",
						"logistics_coordinator",
						"quality_control",
						"procurement_specialist",
						"social_media_manager",
						"financial_analyst",
						"staff"
					),
					allowNull: false,
					defaultValue: "staff",
				},
				permissions: {
					type: DataTypes.JSONB,
					allowNull: true,
					defaultValue: {},
					validate: {
						isValidPermissions(value) {
							if (value) {
								const validPermissions = [
									// Product & Inventory Management
									"manage_products",
									"manage_inventory",
									"view_inventory",
									"manage_stock_levels",
									"manage_product_categories",
									"manage_suppliers",

									// Sales & Orders
									"manage_orders",
									"process_returns",
									"manage_invoices",
									"manage_shipping",
									"view_sales_reports",
									"manage_discounts",

									// Customer Management
									"manage_customers",
									"view_customer_data",
									"manage_customer_support",
									"manage_feedback",
									"manage_loyalty_programs",

									// Financial Management
									"manage_finances",
									"view_financial_reports",
									"manage_expenses",
									"manage_payroll",
									"manage_budgets",
									"manage_transactions",
									"manage_tax_settings",

									// Marketing & Content
									"manage_marketing",
									"manage_campaigns",
									"manage_social_media",
									"manage_content",
									"manage_blog",
									"manage_newsletters",
									"manage_promotions",
									"manage_seo",

									// Team & HR
									"manage_team",
									"manage_schedules",
									"manage_attendance",
									"manage_recruitment",
									"manage_training",
									"view_team_reports",

									// Analytics & Reporting
									"view_analytics",
									"view_reports",
									"export_reports",
									"manage_dashboards",

									// System & Settings
									"manage_settings",
									"manage_integrations",
									"manage_security",
									"manage_backups",

									// Services
									"manage_services",
									"schedule_services",
									"manage_appointments",
									"manage_service_providers",

									// Quality & Compliance
									"manage_quality_control",
									"manage_compliance",
									"manage_certifications",
									"manage_audits",
									"manage_communications",
									"send_notifications",
									"manage_chat",
									"manage_logistics",
									"manage_warehouses",
									"manage_deliveries",
									"track_shipments",
								];
								Object.keys(value).forEach((permission) => {
									if (!validPermissions.includes(permission)) {
										throw new Error(`Invalid permission: ${permission}`);
									}
									if (typeof value[permission] !== "boolean") {
										throw new Error(
											`Permission value must be boolean: ${permission}`
										);
									}
								});
							}
						},
					},
				},
				status: {
					type: DataTypes.ENUM("active", "inactive", "pending", "blocked"),
					allowNull: false,
					defaultValue: "pending",
				},
				position: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				department: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				employmentType: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				shift: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				salary: {
					type: DataTypes.JSONB,
					allowNull: true,
					defaultValue: {},
				},
				skills: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: true,
					defaultValue: [],
				},
				certifications: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: true,
					defaultValue: [],
				},
				emergencyContact: {
					type: DataTypes.JSONB,
					allowNull: true,
					defaultValue: {},
				},
				acceptedAt: {
					type: DataTypes.DATE,
					allowNull: true,
				},
				invitedBy: {
					type: DataTypes.UUID,
					allowNull: true,
					references: {
						model: "Users",
						key: "id",
					},
				},
				inviteToken: {
					type: DataTypes.STRING,
					allowNull: true,
					unique: true,
				},
				inviteEmail: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				invitedAt: {
					type: DataTypes.DATE,
					allowNull: true,
				},
				lastLoginAt: {
					type: DataTypes.DATE,
					allowNull: true,
				},
			},
			{
				sequelize,
				modelName: "BusinessTeamMember",
				tableName: "BusinessTeamMembers",
				timestamps: true,
				paranoid: false,
				hooks: {
					beforeValidate: async (teamMember) => {
						if (teamMember.walletAddress) {
							teamMember.walletAddress = teamMember.walletAddress.toLowerCase();
						}

						// Set default permissions based on role
						if (teamMember.role) {
							const rolePermissions = {
								owner: {
									// Owner has all permissions
									manage_products: true,
									manage_inventory: true,
									view_inventory: true,
									manage_stock_levels: true,
									manage_product_categories: true,
									manage_suppliers: true,
									manage_orders: true,
									process_returns: true,
									manage_invoices: true,
									manage_shipping: true,
									view_sales_reports: true,
									manage_discounts: true,
									manage_customers: true,
									view_customer_data: true,
									manage_customer_support: true,
									manage_feedback: true,
									manage_loyalty_programs: true,
									manage_finances: true,
									view_financial_reports: true,
									manage_expenses: true,
									manage_payroll: true,
									manage_budgets: true,
									manage_transactions: true,
									manage_tax_settings: true,
									manage_marketing: true,
									manage_campaigns: true,
									manage_social_media: true,
									manage_content: true,
									manage_blog: true,
									manage_newsletters: true,
									manage_promotions: true,
									manage_seo: true,
									manage_team: true,
									manage_schedules: true,
									manage_attendance: true,
									manage_recruitment: true,
									manage_training: true,
									view_team_reports: true,
									view_analytics: true,
									view_reports: true,
									export_reports: true,
									manage_dashboards: true,
									manage_settings: true,
									manage_integrations: true,
									manage_security: true,
									manage_backups: true,
									manage_services: true,
									schedule_services: true,
									manage_appointments: true,
									manage_service_providers: true,
									manage_quality_control: true,
									manage_compliance: true,
									manage_certifications: true,
									manage_audits: true,
									manage_communications: true,
									send_notifications: true,
									manage_chat: true,
									manage_logistics: true,
									manage_warehouses: true,
									manage_deliveries: true,
									track_shipments: true,
								},
								admin: {
									// Admin has most permissions except critical financial and security settings
									// ... similar to owner but without critical permissions ...
								},
								manager: {
									// Department manager permissions
									manage_team: true,
									manage_schedules: true,
									manage_attendance: true,
									view_team_reports: true,
									view_analytics: true,
									view_reports: true,
									manage_dashboards: true,
									// ... other relevant permissions ...
								},
								accountant: {
									manage_finances: true,
									view_financial_reports: true,
									manage_expenses: true,
									manage_payroll: true,
									manage_budgets: true,
									manage_transactions: true,
									manage_tax_settings: true,
									view_reports: true,
									export_reports: true,
								},
								inventory_manager: {
									manage_inventory: true,
									view_inventory: true,
									manage_stock_levels: true,
									manage_suppliers: true,
									manage_warehouses: true,
									view_reports: true,
								},
								sales_representative: {
									view_inventory: true,
									manage_orders: true,
									process_returns: true,
									manage_invoices: true,
									view_sales_reports: true,
									manage_customers: true,
									view_customer_data: true,
								},
								marketing_specialist: {
									manage_marketing: true,
									manage_campaigns: true,
									manage_social_media: true,
									manage_content: true,
									manage_blog: true,
									manage_newsletters: true,
									manage_promotions: true,
									manage_seo: true,
									view_analytics: true,
								},
								customer_service: {
									view_customer_data: true,
									manage_customer_support: true,
									manage_feedback: true,
									process_returns: true,
									manage_chat: true,
									send_notifications: true,
								},
								hr_manager: {
									manage_team: true,
									manage_schedules: true,
									manage_attendance: true,
									manage_recruitment: true,
									manage_training: true,
									view_team_reports: true,
									manage_payroll: true,
								},
								content_creator: {
									manage_content: true,
									manage_blog: true,
									manage_social_media: true,
									manage_promotions: true,
								},
								logistics_coordinator: {
									manage_logistics: true,
									manage_warehouses: true,
									manage_deliveries: true,
									track_shipments: true,
									manage_shipping: true,
								},
								quality_control: {
									manage_quality_control: true,
									manage_compliance: true,
									manage_certifications: true,
									manage_audits: true,
								},
								procurement_specialist: {
									manage_suppliers: true,
									manage_inventory: true,
									manage_stock_levels: true,
									manage_expenses: true,
								},
								social_media_manager: {
									manage_social_media: true,
									manage_content: true,
									manage_campaigns: true,
									view_analytics: true,
								},
								financial_analyst: {
									view_financial_reports: true,
									view_analytics: true,
									view_reports: true,
									export_reports: true,
									manage_budgets: true,
								},
								staff: {
									// Basic permissions for regular staff
									view_inventory: true,
									view_customer_data: true,
									manage_chat: true,
								},
							};

							teamMember.permissions = {
								...rolePermissions[teamMember.role],
								...teamMember.permissions,
							};
						}

						// Generate invite token if needed
						if (teamMember.status === "pending" && !teamMember.inviteToken) {
							teamMember.inviteToken = crypto.randomBytes(32).toString("hex");
						}
					},
					beforeCreate: async (teamMember) => {
						// Check if this is the first team member for the business
						const existingTeamMember = await BusinessTeamMember.findOne({
							where: {
								businessId: teamMember.businessId,
								status: "active",
							},
						});

						// If this is the first team member, they should be the owner
						if (!existingTeamMember) {
							teamMember.role = "owner";
							teamMember.status = "active";
							teamMember.acceptedAt = new Date();
						}
					},
					afterCreate: async (teamMember) => {
						// No need to update anything after create
					},
				},
				indexes: [
					{
						unique: true,
						fields: ["businessId", "userId"],
					},
					{
						fields: ["walletAddress"],
					},
					{
						fields: ["status"],
					},
					{
						fields: ["role"],
					},
					{
						fields: ["inviteToken"],
						unique: true,
					},
				],
				scopes: {
					active: {
						where: { status: "active" },
					},
					withUser: {
						include: [
							{
								model: sequelize.models.User,
								as: "user",
								attributes: ["id", "name", "email", "profileImage"],
							},
						],
					},
				},
			}
		);
	}
}

module.exports = BusinessTeamMember;
