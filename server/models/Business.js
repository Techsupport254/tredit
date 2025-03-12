const { Model, DataTypes, Op } = require("sequelize");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

// Business Constants
const BUSINESS_CONSTANTS = {
	// Types
	TYPES: {
		PRODUCT: "product",
		SERVICE: "service",
	},

	// Operation Types
	OPERATION_MODES: {
		PHYSICAL: "physical",
		DIGITAL: "digital",
		HYBRID: "hybrid",
	},

	// Categories
	CATEGORIES: [
		"Technology",
		"Retail",
		"Food & Beverage",
		"Healthcare",
		"Education",
		"Finance",
		"Entertainment",
		"Professional Services",
		"Manufacturing",
		"Other",
	],

	// Models
	MODELS: {
		B2B: "B2B",
		B2C: "B2C",
		C2C: "C2C",
		B2B2C: "B2B2C",
	},

	// Status
	STATUS: {
		ACTIVE: "active",
		INACTIVE: "inactive",
		SUSPENDED: "suspended",
	},

	// Verification Status
	VERIFICATION_STATUS: {
		PENDING: "pending",
		VERIFIED: "verified",
		REJECTED: "rejected",
	},

	// Payment Methods
	PAYMENT_METHODS: ["crypto", "card", "bank_transfer", "cash"],

	// Currencies
	CURRENCIES: ["USD", "EUR", "GBP", "JPY", "KES"],

	// Business Days
	BUSINESS_DAYS: [
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
		"sunday",
	],

	// Social Platforms
	SOCIAL_PLATFORMS: ["tiktok", "facebook", "instagram", "youtube"],

	// Social Media Integration Fields
	SOCIAL_MEDIA_FIELDS: {
		accessToken: { type: "string", required: true },
		refreshToken: { type: "string", required: false },
		expiresAt: { type: "date", required: false },
		username: { type: "string", required: true },
		profileId: { type: "string", required: true },
		isConnected: { type: "boolean", required: true },
		lastSyncedAt: { type: "date", required: false },
		permissions: { type: "array", required: true },
		metadata: { type: "object", required: false },
	},

	// Required Address Fields
	REQUIRED_ADDRESS_FIELDS: ["street", "city", "state", "country", "postalCode"],

	// Validation
	VALIDATION: {
		NAME_LENGTH: { MIN: 2, MAX: 100 },
		DESCRIPTION_LENGTH: { MIN: 10, MAX: 1000 },
		WALLET_ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
		EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
		PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
		RATING: { MIN: 0, MAX: 5 },
	},

	// Defaults
	DEFAULTS: {
		STATUS: "active",
		VERIFICATION_STATUS: "pending",
		BUSINESS_MODEL: "B2C",
		OPERATION_MODE: "digital",
		CURRENCY: "USD",
		REVENUE: 0,
		AVERAGE_RATING: 0,
		REVIEW_COUNT: 0,
	},
};

const socialMediaSchema = {
	type: "object",
	properties: {
		facebook: {
			type: "object",
			properties: {
				accessToken: { type: "string", nullable: true },
				refreshToken: { type: "string", nullable: true },
				expiresAt: { type: "string", format: "date-time", nullable: true },
				username: { type: "string", nullable: true },
				profileId: { type: "string", nullable: true },
				pageId: { type: "string", nullable: true },
				isConnected: { type: "boolean", default: false },
				lastSyncedAt: { type: "string", format: "date-time", nullable: true },
				permissions: {
					type: "array",
					items: { type: "string" },
					default: [],
				},
				metadata: {
					type: "object",
					properties: {
						pageName: { type: "string", nullable: true },
						pageUrl: { type: "string", nullable: true },
						pageCategory: { type: "string", nullable: true },
						followerCount: { type: "number", default: 0 },
						pageVerified: { type: "boolean", default: false },
					},
					default: {},
				},
			},
			default: {
				isConnected: false,
				permissions: [],
				metadata: {},
			},
		},
		instagram: {
			type: "object",
			properties: {
				accessToken: { type: "string", nullable: true },
				refreshToken: { type: "string", nullable: true },
				expiresAt: { type: "string", format: "date-time", nullable: true },
				username: { type: "string", nullable: true },
				profileId: { type: "string", nullable: true },
				businessAccountId: { type: "string", nullable: true },
				isConnected: { type: "boolean", default: false },
				lastSyncedAt: { type: "string", format: "date-time", nullable: true },
				permissions: {
					type: "array",
					items: { type: "string" },
					default: [],
				},
				metadata: {
					type: "object",
					properties: {
						accountType: { type: "string", nullable: true },
						accountUrl: { type: "string", nullable: true },
						followerCount: { type: "number", default: 0 },
						mediaCount: { type: "number", default: 0 },
						isBusinessAccount: { type: "boolean", default: false },
						isPrivate: { type: "boolean", default: false },
					},
					default: {},
				},
			},
			default: {
				isConnected: false,
				permissions: [],
				metadata: {},
			},
		},
		tiktok: {
			type: "object",
			properties: {
				accessToken: { type: "string", nullable: true },
				refreshToken: { type: "string", nullable: true },
				expiresAt: { type: "string", format: "date-time", nullable: true },
				username: { type: "string", nullable: true },
				profileId: { type: "string", nullable: true },
				isConnected: { type: "boolean", default: false },
				lastSyncedAt: { type: "string", format: "date-time", nullable: true },
				permissions: {
					type: "array",
					items: { type: "string" },
					default: [],
				},
				metadata: {
					type: "object",
					properties: {
						displayName: { type: "string", nullable: true },
						profileUrl: { type: "string", nullable: true },
						followerCount: { type: "number", default: 0 },
						videoCount: { type: "number", default: 0 },
						isVerified: { type: "boolean", default: false },
						bio: { type: "string", nullable: true },
					},
					default: {},
				},
			},
			default: {
				isConnected: false,
				permissions: [],
				metadata: {},
			},
		},
		youtube: {
			type: "object",
			properties: {
				accessToken: { type: "string", nullable: true },
				refreshToken: { type: "string", nullable: true },
				expiresAt: { type: "string", format: "date-time", nullable: true },
				username: { type: "string", nullable: true },
				profileId: { type: "string", nullable: true },
				channelId: { type: "string", nullable: true },
				isConnected: { type: "boolean", default: false },
				lastSyncedAt: { type: "string", format: "date-time", nullable: true },
				permissions: {
					type: "array",
					items: { type: "string" },
					default: [],
				},
				metadata: {
					type: "object",
					properties: {
						channelName: { type: "string", nullable: true },
						channelUrl: { type: "string", nullable: true },
						subscriberCount: { type: "number", default: 0 },
						videoCount: { type: "number", default: 0 },
						isVerified: { type: "boolean", default: false },
						customUrl: { type: "string", nullable: true },
					},
					default: {},
				},
			},
			default: {
				isConnected: false,
				permissions: [],
				metadata: {},
			},
		},
	},
	additionalProperties: false,
	default: {},
};

class Business extends Model {
	static associate(models) {
		// Association with User (owner)
		Business.belongsTo(models.User, {
			foreignKey: "userId",
			as: "owner",
		});

		// Association with team members
		Business.hasMany(models.BusinessTeamMember, {
			foreignKey: "businessId",
			as: "teamMembers",
		});

		// Many-to-Many with Users through BusinessTeamMember
		Business.belongsToMany(models.User, {
			through: models.BusinessTeamMember,
			foreignKey: "businessId",
			otherKey: "userId",
			as: "members",
		});
	}

	// Instance methods
	isActive() {
		return this.status === BUSINESS_CONSTANTS.STATUS.ACTIVE;
	}

	isVerified() {
		return (
			this.verificationStatus ===
			BUSINESS_CONSTANTS.VERIFICATION_STATUS.VERIFIED
		);
	}

	async getOwner() {
		return await this.getUser();
	}

	async getActiveTeamMembers() {
		return await this.getTeamMembers({
			where: { status: BUSINESS_CONSTANTS.STATUS.ACTIVE },
		});
	}

	calculateRevenueMetrics() {
		return {
			totalRevenue: this.revenue || 0,
			averageRating: this.averageRating || 0,
			reviewCount: this.reviewCount || 0,
		};
	}

	// Static methods
	static async findByWallet(walletAddress) {
		return await this.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
		});
	}

	static async findActiveBusinesses() {
		return await this.findAll({
			where: { status: BUSINESS_CONSTANTS.STATUS.ACTIVE },
		});
	}

	static async findUserBusinesses(userId) {
		return await this.findAll({
			where: { userId },
			include: [
				{
					model: this.sequelize.models.BusinessTeamMember,
					as: "teamMembers",
					where: {
						userId,
						role: "owner",
						status: BUSINESS_CONSTANTS.STATUS.ACTIVE,
					},
					required: true,
				},
			],
		});
	}

	static initModel(sequelize) {
		return super.init(
			{
				// 1. Basic Business Details
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
						len: [
							BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MIN,
							BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MAX,
						],
					},
				},
				description: {
					type: DataTypes.TEXT,
					allowNull: false,
					validate: {
						len: [
							BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MIN,
							BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MAX,
						],
					},
				},
				type: {
					type: DataTypes.ENUM(Object.values(BUSINESS_CONSTANTS.TYPES)),
					allowNull: false,
				},
				category: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				productCategories: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					defaultValue: [],
					validate: {
						isValidCategories(value) {
							if (
								this.type === BUSINESS_CONSTANTS.TYPES.SERVICE &&
								value.length > 0
							) {
								throw new Error(
									"Service businesses cannot have product categories"
								);
							}
						},
					},
				},
				serviceCategories: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					defaultValue: [],
					validate: {
						isValidCategories(value) {
							if (
								this.type === BUSINESS_CONSTANTS.TYPES.PRODUCT &&
								value.length > 0
							) {
								throw new Error(
									"Product businesses cannot have service categories"
								);
							}
						},
					},
				},

				// 2. Business Contact Information
				email: {
					type: DataTypes.STRING,
					allowNull: true,
					validate: {
						isEmail: true,
					},
				},
				phone: {
					type: DataTypes.STRING,
					allowNull: true,
					validate: {
						is: BUSINESS_CONSTANTS.VALIDATION.PHONE_REGEX,
					},
				},
				address: {
					type: DataTypes.JSONB,
					allowNull: true,
					defaultValue: {},
					validate: {
						isValidAddress(value) {
							if (
								value &&
								this.operationMode !==
									BUSINESS_CONSTANTS.OPERATION_MODES.DIGITAL
							) {
								BUSINESS_CONSTANTS.REQUIRED_ADDRESS_FIELDS.forEach((field) => {
									if (!value[field]) {
										throw new Error(`Address must include ${field}`);
									}
								});
							}
						},
					},
				},

				// 3. Social Media Integration
				socialMedia: {
					type: DataTypes.JSONB,
					allowNull: true,
					defaultValue: {
						facebook: {
							isConnected: false,
							permissions: [],
							metadata: {},
						},
						instagram: {
							isConnected: false,
							permissions: [],
							metadata: {},
						},
						tiktok: {
							isConnected: false,
							permissions: [],
							metadata: {},
						},
						youtube: {
							isConnected: false,
							permissions: [],
							metadata: {},
						},
					},
					validate: {
						isValidSocialMedia(value) {
							const ajv = new Ajv({ useDefaults: true });
							addFormats(ajv);
							const validate = ajv.compile(socialMediaSchema);
							const valid = validate(value);
							if (!valid) {
								throw new Error(
									`Invalid social media data: ${ajv.errorsText(
										validate.errors
									)}`
								);
							}
						},
					},
				},

				// 4. Business Model & Operations
				businessModel: {
					type: DataTypes.ENUM(Object.values(BUSINESS_CONSTANTS.MODELS)),
					allowNull: false,
					defaultValue: BUSINESS_CONSTANTS.DEFAULTS.BUSINESS_MODEL,
				},
				operationMode: {
					type: DataTypes.ENUM(
						Object.values(BUSINESS_CONSTANTS.OPERATION_MODES)
					),
					allowNull: false,
					defaultValue: BUSINESS_CONSTANTS.DEFAULTS.OPERATION_MODE,
				},
				status: {
					type: DataTypes.ENUM(Object.values(BUSINESS_CONSTANTS.STATUS)),
					allowNull: false,
					defaultValue: BUSINESS_CONSTANTS.DEFAULTS.STATUS,
				},
				verificationStatus: {
					type: DataTypes.ENUM(
						Object.values(BUSINESS_CONSTANTS.VERIFICATION_STATUS)
					),
					allowNull: false,
					defaultValue: BUSINESS_CONSTANTS.DEFAULTS.VERIFICATION_STATUS,
				},
				verificationNote: {
					type: DataTypes.TEXT,
					allowNull: true,
				},

				// 5. Financial & Blockchain Data
				paymentMethods: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					defaultValue: [],
					validate: {
						isValidPaymentMethods(value) {
							if (value) {
								value.forEach((method) => {
									if (!BUSINESS_CONSTANTS.PAYMENT_METHODS.includes(method)) {
										throw new Error(`Invalid payment method: ${method}`);
									}
								});
							}
						},
					},
				},
				revenue: {
					type: DataTypes.DECIMAL(20, 2),
					allowNull: true,
					defaultValue: BUSINESS_CONSTANTS.DEFAULTS.REVENUE,
					validate: {
						min: BUSINESS_CONSTANTS.VALIDATION.RATING.MIN,
					},
				},
				currency: {
					type: DataTypes.STRING,
					allowNull: false,
					defaultValue: BUSINESS_CONSTANTS.DEFAULTS.CURRENCY,
				},

				// 6. IPFS & Blockchain Data
				ipfsCid: {
					type: DataTypes.STRING,
					allowNull: true,
					validate: {
						notEmpty: true,
					},
				},
				ipfsUrl: {
					type: DataTypes.STRING(1024),
					allowNull: true,
					validate: {
						isUrl: true,
					},
				},
				lastBlockchainUpdate: {
					type: DataTypes.DATE,
					allowNull: true,
				},

				// 7. Ratings & Reviews
				averageRating: {
					type: DataTypes.FLOAT,
					allowNull: true,
					defaultValue: BUSINESS_CONSTANTS.DEFAULTS.AVERAGE_RATING,
					validate: {
						min: BUSINESS_CONSTANTS.VALIDATION.RATING.MIN,
						max: BUSINESS_CONSTANTS.VALIDATION.RATING.MAX,
					},
				},
				reviewCount: {
					type: DataTypes.INTEGER,
					allowNull: true,
					defaultValue: BUSINESS_CONSTANTS.DEFAULTS.REVIEW_COUNT,
					validate: {
						min: BUSINESS_CONSTANTS.VALIDATION.RATING.MIN,
					},
				},

				// 8. Metadata & Custom Fields
				metadata: {
					type: DataTypes.JSONB,
					allowNull: true,
					defaultValue: {},
				},

				// Additional Business Fields
				logo: {
					type: DataTypes.STRING(1024),
					allowNull: true,
					validate: {
						isUrl: true,
					},
				},
				coverImage: {
					type: DataTypes.STRING(1024),
					allowNull: true,
					validate: {
						isUrl: true,
					},
				},
				businessHours: {
					type: DataTypes.JSONB,
					allowNull: true,
					defaultValue: {},
					validate: {
						isValidBusinessHours(value) {
							if (value) {
								Object.keys(value).forEach((day) => {
									if (
										!BUSINESS_CONSTANTS.BUSINESS_DAYS.includes(
											day.toLowerCase()
										)
									) {
										throw new Error(`Invalid day: ${day}`);
									}
									if (!value[day].open && !value[day].closed) {
										if (!value[day].start || !value[day].end) {
											throw new Error(`Missing business hours for ${day}`);
										}
									}
								});
							}
						},
					},
				},
				tags: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					defaultValue: [],
				},
			},
			{
				sequelize,
				modelName: "Business",
				tableName: "Businesses",
				timestamps: true,
				paranoid: false,
				hooks: {
					beforeValidate: (business) => {
						if (business.email) {
							business.email = business.email.toLowerCase();
						}
					},
					beforeCreate: async (business, options) => {
						if (!business.userId) {
							throw new Error(
								"Cannot create business without an owner (userId)"
							);
						}

						const user = await sequelize.models.User.findByPk(business.userId, {
							transaction: options.transaction,
						});
						if (!user) {
							throw new Error("User not found");
						}

						business.status = BUSINESS_CONSTANTS.DEFAULTS.STATUS;
						business.verificationStatus =
							BUSINESS_CONSTANTS.DEFAULTS.VERIFICATION_STATUS;
					},
					afterCreate: async (business, options) => {
						const transaction = options.transaction;
						try {
							// Find the user by ID
							const user = await sequelize.models.User.findByPk(
								business.userId,
								{
									transaction,
								}
							);

							if (!user) {
								throw new Error("User not found");
							}

							// Check if team member already exists
							const existingTeamMember =
								await sequelize.models.BusinessTeamMember.findOne({
									where: {
										businessId: business.id,
										userId: user.id,
									},
									transaction,
								});

							if (!existingTeamMember) {
								// Create team member using model method
								await sequelize.models.BusinessTeamMember.create(
									{
										businessId: business.id,
										userId: user.id,
										walletAddress: user.walletAddress,
										role: "owner",
										status: "active",
										acceptedAt: new Date(),
									},
									{ transaction }
								);
							}

							// Update user metadata
							await user.update(
								{
									metadata: {
										...user.metadata,
										businesses: [
											...(user.metadata?.businesses || []),
											{ id: business.id, role: "owner" },
										],
									},
								},
								{ transaction }
							);
						} catch (error) {
							// If anything fails, throw the error to trigger transaction rollback
							throw error;
						}
					},
				},
				indexes: [
					{ fields: ["userId"] },
					{ fields: ["status"] },
					{ fields: ["verificationStatus"] },
					{ fields: ["type"] },
					{ fields: ["category"] },
					{ fields: ["createdAt"] },
				],
				scopes: {
					active: {
						where: { status: BUSINESS_CONSTANTS.STATUS.ACTIVE },
					},
					verified: {
						where: {
							verificationStatus:
								BUSINESS_CONSTANTS.VERIFICATION_STATUS.VERIFIED,
						},
					},
					withOwner: {
						include: [
							{
								model: sequelize.models.User,
								as: "owner",
								attributes: ["id", "name", "email", "profileImage"],
							},
						],
					},
					withTeam: {
						include: [
							{
								model: sequelize.models.BusinessTeamMember,
								as: "teamMembers",
								where: { status: BUSINESS_CONSTANTS.STATUS.ACTIVE },
							},
						],
					},
				},
			}
		);
	}
}

module.exports = Business;
