const { Model, DataTypes } = require("sequelize");
const { BUSINESS_CONSTANTS } = require("../config/constants");

class Service extends Model {
	static schema = {
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
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
			validate: {
				len: [2, 100],
			},
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
			validate: {
				len: [10, 1000],
			},
		},
		shortDescription: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		category: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isIn: [BUSINESS_CONSTANTS.SERVICE_CATEGORIES],
			},
		},
		basePrice: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
			validate: {
				min: 0,
			},
		},
		maxPrice: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: true,
			validate: {
				min: 0,
				isGreaterThanBasePrice(value) {
					if (value && value < this.basePrice) {
						throw new Error("Maximum price must be greater than base price");
					}
				},
			},
		},
		currency: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "USD",
			validate: {
				isIn: [BUSINESS_CONSTANTS.CURRENCIES],
			},
		},
		duration: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {
				value: 1,
				unit: "days",
			},
			validate: {
				isValidDuration(value) {
					if (!value || typeof value !== "object") {
						throw new Error("Duration must be an object with value and unit");
					}
					if (
						!value.value ||
						typeof value.value !== "number" ||
						value.value < 1
					) {
						throw new Error("Duration value must be a positive number");
					}
					if (
						!value.unit ||
						!["days", "weeks", "months"].includes(value.unit)
					) {
						throw new Error(
							"Duration unit must be one of: days, weeks, months"
						);
					}
				},
			},
		},
		estimatedCompletionTime: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		serviceType: {
			type: DataTypes.ENUM("one-time", "recurring", "subscription"),
			allowNull: false,
			defaultValue: "one-time",
		},
		recurringInterval: {
			type: DataTypes.ENUM("daily", "weekly", "monthly", "yearly"),
			allowNull: true,
		},
		deliverables: {
			type: DataTypes.JSONB,
			defaultValue: {},
		},
		requirements: {
			type: DataTypes.JSONB,
			defaultValue: {},
		},
		packages: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {},
			validate: {
				isValidPackages(value) {
					if (value && Array.isArray(value)) {
						value.forEach((pkg) => {
							if (!pkg.name || !pkg.price || !pkg.features || !pkg.items) {
								throw new Error(
									"Each package must have a name, price, features, and items array"
								);
							}
							if (pkg.price < this.basePrice) {
								throw new Error("Package price cannot be less than base price");
							}
							if (!Array.isArray(pkg.items)) {
								throw new Error("Package items must be an array");
							}
							pkg.items.forEach((item) => {
								if (!item.name || !item.description) {
									throw new Error(
										"Each package item must have a name and description"
									);
								}
							});
							if (!Array.isArray(pkg.features)) {
								throw new Error("Package features must be an array");
							}
						});
					}
				},
			},
		},
		customizationOptions: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {},
		},
		isAvailable: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		maxClientsPerSlot: {
			type: DataTypes.INTEGER,
			allowNull: true,
			validate: {
				min: 1,
			},
		},
		availability: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {},
		},
		rating: {
			type: DataTypes.FLOAT,
			allowNull: true,
			defaultValue: 0,
			validate: {
				min: 0,
				max: 5,
			},
		},
		reviewsCount: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 0,
		},
		completedServices: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 0,
		},
		media: {
			type: DataTypes.JSONB,
			defaultValue: {},
		},
		documents: {
			type: DataTypes.JSONB,
			defaultValue: {},
		},
		tags: {
			type: DataTypes.JSONB,
			defaultValue: {},
		},
		seoMetadata: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {},
		},
		metadata: {
			type: DataTypes.JSONB,
			allowNull: true,
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		milestones: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: [],
			validate: {
				isValidMilestones(value) {
					if (value && Array.isArray(value)) {
						let totalPercentage = 0;
						value.forEach((milestone, index) => {
							if (
								!milestone.name ||
								!milestone.description ||
								!milestone.timeline ||
								!milestone.deliverables ||
								typeof milestone.percentagePayment !== "number"
							) {
								throw new Error(
									"Each milestone must have a name, description, timeline, deliverables, and percentagePayment"
								);
							}

							// Validate timeline
							if (!milestone.timeline.duration || !milestone.timeline.unit) {
								throw new Error(
									"Timeline must specify duration and unit (days/weeks/months)"
								);
							}

							if (
								!["days", "weeks", "months"].includes(milestone.timeline.unit)
							) {
								throw new Error(
									"Timeline unit must be one of: days, weeks, months"
								);
							}

							// Validate deliverables
							if (!Array.isArray(milestone.deliverables)) {
								throw new Error("Deliverables must be an array");
							}

							// Accumulate percentage payments
							totalPercentage += milestone.percentagePayment;

							// If it's the last milestone, check the total percentage
							if (index === value.length - 1 && totalPercentage !== 100) {
								throw new Error(
									"Total percentage payments across all milestones must equal 100%"
								);
							}
						});
					}
				},
			},
		},
	};

	static associate(models) {
		// Basic association with Business model
		if (models.Business) {
			Service.belongsTo(models.Business, {
				foreignKey: "businessId",
				as: "business",
			});
		}

		// Association with SocialMediaContent model if it exists
		if (models.SocialMediaContent) {
			Service.hasMany(models.SocialMediaContent, {
				foreignKey: "serviceId",
				as: "socialMedia",
				constraints: false, // Disable foreign key constraint
			});
		}

		// Association with OrderItem model if it exists
		if (models.OrderItem) {
			Service.hasMany(models.OrderItem, {
				foreignKey: "serviceId",
				constraints: false, // Disable foreign key constraint
			});
		}

		// Association with ProductCartItem model if it exists
		if (models.ProductCartItem) {
			Service.hasMany(models.ProductCartItem, {
				foreignKey: "serviceId",
				as: "cartItems",
				onDelete: "SET NULL",
				onUpdate: "CASCADE",
			});
		}

		// Add associations for ServiceCart and ServiceOrder
		if (models.ServiceCart) {
			Service.hasMany(models.ServiceCart, {
				foreignKey: "serviceId",
				as: "serviceCarts",
				onDelete: "SET NULL",
				onUpdate: "CASCADE",
			});
		}

		if (models.ServiceOrder) {
			Service.hasMany(models.ServiceOrder, {
				foreignKey: "serviceId",
				as: "serviceOrders",
			});
		}
	}

	static initModel(sequelize) {
		return Service.init(this.schema, {
			sequelize,
			modelName: "Service",
			tableName: "Services",
			timestamps: true,
			dialectOptions: {
				typeCast: function (field, next) {
					if (field.type === "UUID") {
						return field.string();
					}
					return next();
				},
			},
		});
	}

	async updateMilestoneStatus(milestoneOrder, newStatus, feedback = null) {
		const milestones = [...this.milestones];
		const milestone = milestones.find((m) => m.order === milestoneOrder);

		if (!milestone) {
			throw new Error("Milestone not found");
		}

		milestone.status = newStatus;
		if (newStatus === "completed") {
			milestone.completedDate = new Date();
			milestone.feedback = feedback;
		} else if (newStatus === "in-progress" && !milestone.startDate) {
			milestone.startDate = new Date();
		}

		// Update milestone progress
		const completedCount = milestones.filter(
			(m) => m.status === "completed"
		).length;
		const progress = {
			completedMilestones: completedCount,
			totalMilestones: milestones.length,
			currentStatus: newStatus,
			lastUpdated: new Date(),
		};

		await this.update({
			milestones,
			currentMilestone: milestoneOrder,
			milestoneProgress: progress,
		});

		return milestone;
	}
}

module.exports = Service;
