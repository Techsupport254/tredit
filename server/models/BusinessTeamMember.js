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
					allowNull: false,
					validate: {
						isLowercase: true,
						notEmpty: true,
						is: /^0x[a-fA-F0-9]{40}$/i,
					},
				},
				role: {
					type: DataTypes.ENUM(
						"owner",
						"admin",
						"manager",
						"staff",
						"viewer",
						"consultant"
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
									"manage_products",
									"manage_services",
									"manage_inventory",
									"manage_orders",
									"manage_customers",
									"manage_team",
									"view_analytics",
									"manage_settings",
									"manage_content",
									"manage_payments",
									"manage_marketing",
									"manage_support",
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
					validate: {
						isEmail: true,
					},
				},
				position: {
					type: DataTypes.STRING,
					allowNull: true,
					validate: {
						len: [2, 100],
					},
				},
				department: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				startDate: {
					type: DataTypes.DATE,
					allowNull: true,
				},
				endDate: {
					type: DataTypes.DATE,
					allowNull: true,
					validate: {
						isAfterStartDate(value) {
							if (value && this.startDate && value <= this.startDate) {
								throw new Error("End date must be after start date");
							}
						},
					},
				},
				workHours: {
					type: DataTypes.JSONB,
					allowNull: true,
					defaultValue: {},
					validate: {
						isValidWorkHours(value) {
							if (value) {
								const days = [
									"monday",
									"tuesday",
									"wednesday",
									"thursday",
									"friday",
									"saturday",
									"sunday",
								];
								Object.keys(value).forEach((day) => {
									if (!days.includes(day.toLowerCase())) {
										throw new Error(`Invalid day: ${day}`);
									}
									if (!value[day].start || !value[day].end) {
										throw new Error(`Missing start or end time for ${day}`);
									}
								});
							}
						},
					},
				},
				metadata: {
					type: DataTypes.JSONB,
					allowNull: true,
					defaultValue: {},
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
									manage_products: true,
									manage_services: true,
									manage_inventory: true,
									manage_orders: true,
									manage_customers: true,
									manage_team: true,
									view_analytics: true,
									manage_settings: true,
									manage_content: true,
									manage_payments: true,
									manage_marketing: true,
									manage_support: true,
								},
								admin: {
									manage_products: true,
									manage_services: true,
									manage_inventory: true,
									manage_orders: true,
									manage_customers: true,
									manage_team: true,
									view_analytics: true,
									manage_settings: true,
									manage_content: true,
									manage_payments: true,
									manage_marketing: true,
									manage_support: true,
								},
								manager: {
									manage_products: true,
									manage_services: true,
									manage_inventory: true,
									manage_orders: true,
									manage_customers: true,
									manage_team: false,
									view_analytics: true,
									manage_settings: false,
									manage_content: true,
									manage_payments: true,
									manage_marketing: true,
									manage_support: true,
								},
								staff: {
									manage_products: false,
									manage_services: false,
									manage_inventory: true,
									manage_orders: true,
									manage_customers: true,
									manage_team: false,
									view_analytics: false,
									manage_settings: false,
									manage_content: false,
									manage_payments: false,
									manage_marketing: false,
									manage_support: true,
								},
								viewer: {
									manage_products: false,
									manage_services: false,
									manage_inventory: false,
									manage_orders: false,
									manage_customers: false,
									manage_team: false,
									view_analytics: true,
									manage_settings: false,
									manage_content: false,
									manage_payments: false,
									manage_marketing: false,
									manage_support: false,
								},
								consultant: {
									manage_products: false,
									manage_services: false,
									manage_inventory: false,
									manage_orders: false,
									manage_customers: false,
									manage_team: false,
									view_analytics: true,
									manage_settings: false,
									manage_content: false,
									manage_payments: false,
									manage_marketing: true,
									manage_support: false,
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
						// Update user's last activity in the business
						if (teamMember.status === "active") {
							await teamMember.update({
								startDate: teamMember.startDate || new Date(),
							});
						}
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
