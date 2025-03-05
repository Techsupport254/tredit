const { DataTypes } = require("sequelize");
const db = require("../config/database");

const SocialAccount = db.sequelize.define(
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
			type: DataTypes.STRING,
			allowNull: false,
		},
		platformUserId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		platformUsername: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		accessToken: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		refreshToken: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		tokenExpiry: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		metadata: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		lastSynced: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
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
