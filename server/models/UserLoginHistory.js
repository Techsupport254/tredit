const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class UserLoginHistory extends Model {
	static associate(models) {
		UserLoginHistory.belongsTo(models.User, {
			foreignKey: "userAddress",
			targetKey: "walletAddress",
		});
	}
}

UserLoginHistory.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		userAddress: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: "Users",
				key: "walletAddress",
			},
		},
		ipAddress: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		userAgent: {
			type: DataTypes.STRING(1024),
			allowNull: true,
		},
		browser: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		browserVersion: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		os: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		osVersion: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		device: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		deviceType: {
			type: DataTypes.ENUM("desktop", "mobile", "tablet", "other"),
			allowNull: true,
		},
		status: {
			type: DataTypes.ENUM("success", "failed"),
			allowNull: false,
			defaultValue: "success",
		},
		failureReason: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		loginMethod: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "wallet",
		},
		location: {
			type: DataTypes.JSON,
			allowNull: true,
			comment: "Stores geolocation data like city, country, etc.",
		},
	},
	{
		sequelize,
		modelName: "UserLoginHistory",
		tableName: "UserLoginHistories",
		timestamps: true,
		hooks: {
			beforeValidate: (loginHistory) => {
				if (loginHistory.userAddress) {
					loginHistory.userAddress = loginHistory.userAddress.toLowerCase();
				}
			},
		},
		indexes: [
			{
				fields: ["userAddress"],
			},
			{
				fields: ["createdAt"],
			},
		],
	}
);

module.exports = UserLoginHistory;
