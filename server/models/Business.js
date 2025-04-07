const { Model, DataTypes, Op } = require("sequelize");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { BUSINESS_CONSTANTS } = require("../config/constants");
const socialMediaSchema = require("../schemas/socialMediaSchema");

class Business extends Model {
	static schema = {
		// 1. Basic Business Details
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false,
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Users",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
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
			validate: {
				isIn: [BUSINESS_CONSTANTS.CATEGORIES],
			},
		},
		productCategories: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			allowNull: true,
			validate: {
				isValidProductCategories(value) {
					if (
						this.type === BUSINESS_CONSTANTS.TYPES.PRODUCT &&
						(!value || !value.length)
					) {
						throw new Error(
							"Product businesses must have at least one product category"
						);
					}
					if (value) {
						value.forEach((category) => {
							if (!BUSINESS_CONSTANTS.PRODUCT_CATEGORIES.includes(category)) {
								throw new Error(
									`Invalid product category: ${category}. Must be one of: ${BUSINESS_CONSTANTS.PRODUCT_CATEGORIES.join(
										", "
									)}`
								);
							}
						});
					}
				},
			},
		},
		serviceCategories: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			allowNull: true,
			validate: {
				isValidServiceCategories(value) {
					if (
						this.type === BUSINESS_CONSTANTS.TYPES.SERVICE &&
						(!value || !value.length)
					) {
						throw new Error(
							"Service businesses must have at least one service category"
						);
					}
					if (value) {
						value.forEach((category) => {
							if (!BUSINESS_CONSTANTS.SERVICE_CATEGORIES.includes(category)) {
								throw new Error(
									`Invalid service category: ${category}. Must be one of: ${BUSINESS_CONSTANTS.SERVICE_CATEGORIES.join(
										", "
									)}`
								);
							}
						});
					}
				},
			},
		},

		// 2. Business Contact Information
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isEmail: true,
			},
		},
		phone: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				is: BUSINESS_CONSTANTS.VALIDATION.PHONE_REGEX,
			},
		},
		address: {
			type: DataTypes.JSONB,
			allowNull: false,
			validate: {
				isValidAddress(value) {
					if (!value) {
						throw new Error("Address is required");
					}
					BUSINESS_CONSTANTS.REQUIRED_ADDRESS_FIELDS.forEach((field) => {
						if (!value[field]) {
							throw new Error(`Address must include ${field}`);
						}
					});
				},
			},
		},

		// 3. Social Media Integration
		socialMedia: {
			type: DataTypes.JSONB,
			allowNull: false,
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
							`Invalid social media data: ${ajv.errorsText(validate.errors)}`
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
			type: DataTypes.ENUM(Object.values(BUSINESS_CONSTANTS.OPERATION_MODES)),
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

		// 5. Payment & Financial Information
		paymentMethods: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			allowNull: false,
			defaultValue: [],
			validate: {
				isValidPaymentMethods(value) {
					if (!Array.isArray(value)) {
						throw new Error("Payment methods must be an array");
					}
					value.forEach((method) => {
						if (!BUSINESS_CONSTANTS.PAYMENT_METHODS.includes(method)) {
							throw new Error(
								`Invalid payment method: ${method}. Must be one of: ${BUSINESS_CONSTANTS.PAYMENT_METHODS.join(
									", "
								)}`
							);
						}
					});
				},
			},
		},
		currency: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: BUSINESS_CONSTANTS.DEFAULTS.CURRENCY,
			validate: {
				isIn: [BUSINESS_CONSTANTS.CURRENCIES],
			},
		},
		revenue: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
			defaultValue: BUSINESS_CONSTANTS.DEFAULTS.REVENUE,
		},

		// 6. Business Hours & Availability
		businessHours: {
			type: DataTypes.JSONB,
			allowNull: false,
			defaultValue: {},
			validate: {
				isValidBusinessHours(value) {
					if (!value) {
						throw new Error("Business hours are required");
					}

					const validDays = BUSINESS_CONSTANTS.BUSINESS_DAYS;
					const validTimeFormat = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

					Object.entries(value).forEach(([day, hours]) => {
						// Check if day is valid
						if (!validDays.includes(day.toLowerCase())) {
							throw new Error(
								`Invalid day: ${day}. Must be one of: ${validDays.join(", ")}`
							);
						}

						// Check if hours are properly formatted
						if (hours.open && !validTimeFormat.test(hours.open)) {
							throw new Error(
								`Invalid opening time format for ${day}: ${hours.open}`
							);
						}
						if (hours.close && !validTimeFormat.test(hours.close)) {
							throw new Error(
								`Invalid closing time format for ${day}: ${hours.close}`
							);
						}

						// Check if closed is boolean when present
						if (
							hours.closed !== undefined &&
							typeof hours.closed !== "boolean"
						) {
							throw new Error(
								`Invalid closed value for ${day}: must be boolean`
							);
						}
					});
				},
			},
		},

		// 7. Ratings & Reviews
		averageRating: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: BUSINESS_CONSTANTS.DEFAULTS.AVERAGE_RATING,
			validate: {
				min: BUSINESS_CONSTANTS.VALIDATION.RATING.MIN,
				max: BUSINESS_CONSTANTS.VALIDATION.RATING.MAX,
			},
		},
		reviewCount: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: BUSINESS_CONSTANTS.DEFAULTS.REVIEW_COUNT,
		},

		// 8. Blockchain & IPFS Integration
		blockchainTxHash: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		ipfsUrl: {
			type: DataTypes.STRING,
			allowNull: true,
		},

		// 9. Additional Fields
		logo: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "",
		},
		coverImage: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "",
		},
		images: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			allowNull: false,
			defaultValue: [],
		},
		documents: {
			type: DataTypes.JSONB,
			allowNull: false,
			defaultValue: {},
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
			modelName: "Business",
			tableName: "Businesses",
			timestamps: true,
			paranoid: true,
			hooks: {
				beforeCreate: async (business) => {
					// Ensure email is lowercase
					if (business.email) {
						business.email = business.email.toLowerCase();
					}
				},
				beforeUpdate: async (business) => {
					// Ensure email is lowercase
					if (business.email) {
						business.email = business.email.toLowerCase();
					}
				},
				afterCreate: async (business, options) => {
					const transaction = options.transaction;
					const user = await sequelize.models.User.findByPk(business.userId, {
						transaction,
					});

					if (!user) {
						throw new Error("User not found");
					}

					try {
						// Check if owner already exists
						const existingOwner =
							await sequelize.models.BusinessTeamMember.findOne({
								where: {
									businessId: business.id,
									userId: user.id,
									role: "owner",
								},
								transaction,
							});

						if (!existingOwner) {
							// Create team member with proper owner permissions
							await sequelize.models.BusinessTeamMember.create(
								{
									businessId: business.id,
									userId: user.id,
									role: "owner",
									status: "active",
									acceptedAt: new Date(),
									permissions: {
										all: true,
										manageTeam: true,
										manageProducts: true,
										manageServices: true,
										manageSettings: true,
										manageFinances: true,
										viewAnalytics: true,
										manageContent: true,
									},
								},
								{ transaction }
							);

							// Update user metadata with business information
							await user.update(
								{
									metadata: {
										...user.metadata,
										businesses: [
											...(user.metadata?.businesses || []).filter(
												(b) => b.id !== business.id
											),
											{
												id: business.id,
												name: business.name,
												role: "owner",
												joinedAt: new Date(),
												permissions: {
													all: true,
													manageTeam: true,
													manageProducts: true,
													manageServices: true,
													manageSettings: true,
													manageFinances: true,
													viewAnalytics: true,
													manageContent: true,
												},
											},
										],
									},
								},
								{ transaction }
							);
						}
					} catch (error) {
						console.error("Error in business afterCreate hook:", error);
						throw error;
					}
				},
				afterDestroy: async (business, options) => {
					const transaction = options.transaction;
					try {
						// Get the user
						const user = await sequelize.models.User.findByPk(business.userId, {
							transaction,
						});

						if (!user) {
							throw new Error("User not found");
						}

						// Remove business from user metadata
						await user.update(
							{
								metadata: {
									...user.metadata,
									businesses: (user.metadata?.businesses || []).filter(
										(b) => b.id !== business.id
									),
								},
							},
							{ transaction }
						);
					} catch (error) {
						console.error("Error in business afterDestroy hook:", error);
						throw error;
					}
				},
			},
			indexes: [
				{
					unique: true,
					fields: ["email"],
				},
				{
					fields: ["userId"],
				},
				{
					fields: ["type"],
				},
				{
					fields: ["category"],
				},
				{
					fields: ["status"],
				},
				{
					fields: ["verificationStatus"],
				},
			],
		});
	}

	static associate(models) {
		// User associations
		this.belongsTo(models.User, {
			foreignKey: "userId",
			as: "owner",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
			constraints: false,
		});

		// Team member associations
		this.hasMany(models.BusinessTeamMember, {
			foreignKey: "businessId",
			as: "teamMembers",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		});

		// Product associations
		this.hasMany(models.Product, {
			foreignKey: "businessId",
			as: "products",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		});

		// Service associations
		this.hasMany(models.Service, {
			foreignKey: "businessId",
			as: "services",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		});

		// Order associations
		this.hasMany(models.Order, {
			foreignKey: "businessId",
			as: "orders",
			onDelete: "SET NULL",
			onUpdate: "CASCADE",
			constraints: false,
		});

		// Chat session associations
		this.hasMany(models.ChatSession, {
			foreignKey: "businessId",
			as: "chatSessions",
			onDelete: "SET NULL",
			onUpdate: "CASCADE",
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

	static async findVerifiedBusinesses() {
		return await this.findAll({
			where: {
				verificationStatus: BUSINESS_CONSTANTS.VERIFICATION_STATUS.VERIFIED,
				status: BUSINESS_CONSTANTS.STATUS.ACTIVE,
			},
		});
	}

	static async findBusinessesByType(type) {
		return await this.findAll({
			where: {
				type,
				status: BUSINESS_CONSTANTS.STATUS.ACTIVE,
			},
		});
	}

	static async findBusinessesByCategory(category) {
		return await this.findAll({
			where: {
				category,
				status: BUSINESS_CONSTANTS.STATUS.ACTIVE,
			},
		});
	}
}

module.exports = Business;
