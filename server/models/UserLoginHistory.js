const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserLoginHistory = sequelize.define(
	"UserLoginHistory",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Users",
				key: "id",
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
		timestamps: true,
		indexes: [
			{
				fields: ["userId"],
			},
			{
				fields: ["createdAt"],
			},
			{
				fields: ["status"],
			},
		],
	}
);

module.exports = UserLoginHistory;
