const { Model, DataTypes } = require("sequelize");
const { BUSINESS_CONSTANTS } = require("../config/constants");

class BusinessTeamMember extends Model {
	static schema = {
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
		role: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "staff",
			validate: {
				isIn: [["owner", "admin", "manager", "staff"]],
			},
		},
		status: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "pending",
			validate: {
				isIn: [["active", "inactive", "pending"]],
			},
		},
		employmentType: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "full-time",
			validate: {
				isIn: [["full-time", "part-time", "contract"]],
			},
		},
		employmentStatus: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "active",
			validate: {
				isIn: [["active", "on-leave", "terminated"]],
			},
		},
		startDate: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		endDate: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		salary: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
			defaultValue: 0,
		},
		commissionRate: {
			type: DataTypes.DECIMAL(5, 2),
			allowNull: false,
			defaultValue: 0,
		},
		permissions: {
			type: DataTypes.JSONB,
			allowNull: false,
			defaultValue: {
				manageTeam: false,
				manageProducts: false,
				manageServices: false,
				manageSettings: false,
				manageFinances: false,
				viewAnalytics: false,
				manageContent: false,
			},
		},
		metadata: {
			type: DataTypes.JSONB,
			allowNull: false,
			defaultValue: {},
		},
	};

	static initModel(sequelize) {
		return super.init(this.schema, {
			sequelize,
			modelName: "BusinessTeamMember",
			tableName: "BusinessTeamMembers",
			timestamps: true,
			paranoid: true,
			hooks: {},
			indexes: [
				{
					unique: true,
					fields: ["businessId", "userId"],
				},
				{
					fields: ["role"],
				},
				{
					fields: ["status"],
				},
			],
		});
	}

	static associate(models) {
		this.belongsTo(models.User, {
			foreignKey: "userId",
			as: "user",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		});

		this.belongsTo(models.Business, {
			foreignKey: "businessId",
			as: "business",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
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

	isManager() {
		return this.role === "manager";
	}

	isStaff() {
		return this.role === "staff";
	}

	isActive() {
		return this.status === "active";
	}

	canManageTeam() {
		return this.hasPermission("manageTeam") || this.isOwner() || this.isAdmin();
	}

	canManageSettings() {
		return (
			this.hasPermission("manageSettings") || this.isOwner() || this.isAdmin()
		);
	}

	canManageProducts() {
		return (
			this.hasPermission("manageProducts") || this.isOwner() || this.isAdmin()
		);
	}

	canManageServices() {
		return (
			this.hasPermission("manageServices") || this.isOwner() || this.isAdmin()
		);
	}

	canManageFinances() {
		return (
			this.hasPermission("manageFinances") || this.isOwner() || this.isAdmin()
		);
	}

	canViewAnalytics() {
		return (
			this.hasPermission("viewAnalytics") ||
			this.isOwner() ||
			this.isAdmin() ||
			this.isManager()
		);
	}

	canManageContent() {
		return (
			this.hasPermission("manageContent") || this.isOwner() || this.isAdmin()
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

	static async findUserRole(businessId, userId) {
		const member = await this.findOne({
			where: {
				businessId,
				userId,
				status: "active",
			},
		});
		return member?.role;
	}

	static async findUserPermissions(businessId, userId) {
		const member = await this.findOne({
			where: {
				businessId,
				userId,
				status: "active",
			},
		});
		return member?.permissions;
	}
}

module.exports = BusinessTeamMember;
