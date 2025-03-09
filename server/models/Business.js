const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class Business extends Model {
	static associate(models) {
		// Association with User (owner)
		Business.belongsTo(models.User, {
			foreignKey: "walletAddress",
			targetKey: "walletAddress",
			as: "owner",
		});

		// Association with team members (users)
		Business.belongsToMany(models.User, {
			through: "BusinessTeamMembers",
			foreignKey: "businessId",
			otherKey: "walletAddress",
			as: "teamMembers",
		});
	}
}

Business.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
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
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
			},
		},
		type: {
			type: DataTypes.ENUM("product", "service"),
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		category: {
			type: DataTypes.STRING,
			allowNull: false,
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
		website: {
			type: DataTypes.STRING(1024),
			allowNull: true,
			validate: {
				isUrl: {
					msg: "Invalid website URL",
				},
			},
		},
		businessModel: {
			type: DataTypes.ENUM("B2C", "B2B", "C2C"),
			allowNull: false,
		},
		operationMode: {
			type: DataTypes.ENUM("physical", "online", "hybrid"),
			allowNull: false,
		},
		// Locations as JSONB array
		locations: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: [],
			validate: {
				isValidLocations(value) {
					if (!Array.isArray(value))
						throw new Error("Locations must be an array");
					value.forEach((location) => {
						if (!location.name) throw new Error("Location name is required");
						if (!location.address)
							throw new Error("Location address is required");
						if (!location.latitude || !location.longitude)
							throw new Error("Location coordinates are required");
					});
				},
			},
		},
		// Team members handled through association table BusinessTeamMembers
		productCategories: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			allowNull: true,
			defaultValue: [],
		},
		serviceCategories: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			allowNull: true,
			defaultValue: [],
		},
		inventoryManagement: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		pricingModel: {
			type: DataTypes.ENUM("fixed", "negotiable", "subscription"),
			allowNull: false,
			defaultValue: "fixed",
		},
		escrowWallet: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		currency: {
			type: DataTypes.STRING(3),
			allowNull: false,
			defaultValue: "USD",
			validate: {
				isIn: [["USD", "EUR", "GBP", "JPY", "KES", "NGN", "ZAR"]], // Add more currencies as needed
			},
		},
		taxInformation: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {},
		},
		payoutMethods: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: [],
			validate: {
				isValidPayoutMethods(value) {
					if (!Array.isArray(value))
						throw new Error("Payout methods must be an array");
					value.forEach((method) => {
						if (!method.type) throw new Error("Payout method type is required");
						if (!method.details)
							throw new Error("Payout method details are required");
						if (
							!["mobile_money", "bank_transfer", "crypto_wallet"].includes(
								method.type
							)
						) {
							throw new Error("Invalid payout method type");
						}
					});
				},
			},
		},
		socialMedia: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {
				facebook: {
					clientId: null,
					accessToken: null,
					refreshToken: null,
					tokenExpiry: null,
					pageId: null,
					connected: false,
				},
				instagram: {
					clientId: null,
					accessToken: null,
					refreshToken: null,
					tokenExpiry: null,
					userId: null,
					connected: false,
				},
				tiktok: {
					clientId: null,
					accessToken: null,
					refreshToken: null,
					tokenExpiry: null,
					openId: null,
					connected: false,
				},
				youtube: {
					clientId: null,
					accessToken: null,
					refreshToken: null,
					tokenExpiry: null,
					channelId: null,
					connected: false,
				},
			},
			validate: {
				isValidSocialMedia(value) {
					if (value) {
						const platforms = ["facebook", "instagram", "tiktok", "youtube"];
						platforms.forEach((platform) => {
							const data = value[platform];
							if (data) {
								// Validate token expiry date
								if (data.tokenExpiry && isNaN(Date.parse(data.tokenExpiry))) {
									throw new Error(
										`${platform} tokenExpiry must be a valid date`
									);
								}

								// Validate connection status
								if (typeof data.connected !== "boolean") {
									throw new Error(`${platform} connected must be a boolean`);
								}

								// Validate required fields when connected
								if (data.connected) {
									if (!data.accessToken) {
										throw new Error(
											`${platform} accessToken is required when connected`
										);
									}
									if (!data.clientId) {
										throw new Error(
											`${platform} clientId is required when connected`
										);
									}
								}
							}
						});
					}
				},
			},
		},
		customerReviews: {
			type: DataTypes.JSONB,
			allowNull: false,
			defaultValue: {
				averageRating: 0,
				totalReviews: 0,
			},
		},
		ipfsCid: {
			type: DataTypes.STRING,
			allowNull: true,
			comment: "IPFS Content Identifier for business data",
		},
		ipfsUrl: {
			type: DataTypes.STRING(1024),
			allowNull: true,
			validate: {
				isUrl: {
					msg: "Invalid IPFS URL",
				},
			},
			comment: "IPFS Gateway URL for business data",
		},
		lastBlockchainUpdate: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		isVerified: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		complianceDocuments: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: [],
		},
		status: {
			type: DataTypes.ENUM("active", "closed"),
			allowNull: false,
			defaultValue: "active",
		},
		metadata: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {},
			comment: "Additional metadata for the business profile",
		},
		address: {
			type: DataTypes.STRING,
		},
		phone: {
			type: DataTypes.STRING,
		},
		email: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true,
			},
		},
		verificationStatus: {
			type: DataTypes.ENUM("pending", "verified", "rejected"),
			defaultValue: "pending",
		},
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
		updatedAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		sequelize,
		modelName: "Business",
		tableName: "businesses",
		timestamps: true,
		hooks: {
			beforeValidate: (business) => {
				if (business.walletAddress) {
					business.walletAddress = business.walletAddress.toLowerCase();
				}
			},
		},
	}
);

module.exports = Business;
