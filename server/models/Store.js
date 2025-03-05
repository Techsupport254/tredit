const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Store = sequelize.define(
	"Store",
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
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: {
					args: [1, 255],
					msg: "Store name must be between 1 and 255 characters",
				},
			},
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
			validate: {
				len: {
					args: [0, 1000],
					msg: "Description must be less than 1000 characters",
				},
			},
		},
		category: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "other",
			validate: {
				isIn: {
					args: [
						[
							"fashion",
							"electronics",
							"beauty",
							"home",
							"sports",
							"digital",
							"art",
							"food",
							"other",
						],
					],
					msg: "Invalid store category",
				},
			},
		},
		logo: {
			type: DataTypes.STRING(1024),
			allowNull: true,
			validate: {
				isUrl: {
					msg: "Invalid logo URL",
				},
			},
		},
		settings: {
			type: DataTypes.JSONB,
			allowNull: false,
			defaultValue: {
				enableYouTubeIntegration: false,
				enableSocialSharing: true,
				allowComments: true,
			},
		},
		socialMedias: {
			type: DataTypes.JSONB,
			defaultValue: [],
			allowNull: true,
			validate: {
				isValidSocialMedias(value) {
					if (value && !Array.isArray(value)) {
						throw new Error("Social medias must be an array");
					}
				},
			},
		},
		youtubeChannel: {
			type: DataTypes.JSONB,
			allowNull: true,
		},
		ipfsURI: {
			type: DataTypes.STRING(1024),
			allowNull: true,
			validate: {
				isUrl: {
					msg: "Invalid IPFS URI format",
				},
			},
		},
	},
	{
		timestamps: true,
	}
);

module.exports = Store;
