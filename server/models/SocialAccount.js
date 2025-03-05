const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SocialAccount = sequelize.define(
	"SocialAccount",
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
		platform: {
			type: DataTypes.ENUM("TikTok", "Facebook", "Instagram", "YouTube"),
			allowNull: false,
		},
		accessToken: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		refreshToken: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		platformUserId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		username: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		profileUrl: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		stats: {
			type: DataTypes.JSON,
			allowNull: true,
			defaultValue: {},
		},
		lastSynced: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
	},
	{
		timestamps: true,
		indexes: [
			{
				unique: true,
				fields: ["userId", "platform"],
			},
		],
	}
);

module.exports = SocialAccount;
