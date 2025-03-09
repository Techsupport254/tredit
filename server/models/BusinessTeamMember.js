const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class BusinessTeamMember extends Model {
	static associate(models) {
		BusinessTeamMember.belongsTo(models.Business, {
			foreignKey: "businessId",
		});
		BusinessTeamMember.belongsTo(models.User, {
			foreignKey: "walletAddress",
			targetKey: "walletAddress",
		});
	}
}

BusinessTeamMember.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		businessId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Businesses",
				key: "id",
			},
		},
		walletAddress: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: "Users",
				key: "walletAddress",
			},
			validate: {
				isLowercase: true,
			},
		},
		role: {
			type: DataTypes.ENUM(
				"owner",
				"manager",
				"staff",
				"accountant",
				"support"
			),
			allowNull: false,
		},
		permissions: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			allowNull: false,
			defaultValue: [],
			validate: {
				isValidPermissions(value) {
					const validPermissions = [
						"manage_products",
						"handle_transactions",
						"edit_settings",
						"manage_team",
						"view_analytics",
					];
					if (!Array.isArray(value))
						throw new Error("Permissions must be an array");
					value.forEach((permission) => {
						if (!validPermissions.includes(permission)) {
							throw new Error(`Invalid permission: ${permission}`);
						}
					});
				},
			},
		},
		status: {
			type: DataTypes.ENUM("active", "inactive"),
			allowNull: false,
			defaultValue: "active",
		},
		metadata: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {},
			comment: "Additional metadata for team member",
		},
	},
	{
		sequelize,
		modelName: "BusinessTeamMember",
		tableName: "BusinessTeamMembers",
		timestamps: true,
		indexes: [
			{
				unique: true,
				fields: ["businessId", "walletAddress"],
			},
			{
				fields: ["role"],
			},
			{
				fields: ["status"],
			},
		],
		hooks: {
			beforeValidate: (member) => {
				if (member.walletAddress) {
					member.walletAddress = member.walletAddress.toLowerCase();
				}
			},
			beforeCreate: async (member) => {
				// Check if this is the first owner for the business
				if (member.role === "owner") {
					const existingOwner = await BusinessTeamMember.findOne({
						where: {
							businessId: member.businessId,
							role: "owner",
							status: "active",
						},
					});

					if (existingOwner) {
						throw new Error("Business already has an owner");
					}
				}
			},
		},
	}
);

module.exports = BusinessTeamMember;
