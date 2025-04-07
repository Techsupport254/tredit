const { Model, DataTypes } = require("sequelize");

class ServiceOrder extends Model {
	static schema = {
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
		businessId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Businesses",
				key: "id",
			},
		},
		serviceId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: "Services",
				key: "id",
			},
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		},
		serviceCartId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: "ServiceCarts",
				key: "id",
			},
		},
		status: {
			type: DataTypes.ENUM(
				"pending",
				"in-progress",
				"completed",
				"cancelled",
				"refunded",
				"disputed"
			),
			defaultValue: "pending",
		},
		milestones: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: [],
			validate: {
				isValidMilestones(value) {
					if (value && !Array.isArray(value)) {
						throw new Error("Milestones must be an array");
					}
					if (value) {
						value.forEach((milestone) => {
							if (
								!milestone.order ||
								!milestone.name ||
								!milestone.percentagePayment ||
								!milestone.amount ||
								!milestone.status
							) {
								throw new Error("Invalid milestone structure");
							}
						});
					}
				},
			},
		},
		currentMilestone: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		milestoneProgress: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {
				completedMilestones: 0,
				totalMilestones: 0,
				currentStatus: "pending",
				lastUpdated: null,
			},
		},
		totalAmount: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: true,
			validate: {
				min: 0,
			},
		},
		paidAmount: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
			defaultValue: 0,
			validate: {
				min: 0,
			},
		},
		remainingAmount: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: true,
			validate: {
				min: 0,
			},
		},
		currency: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "USD",
		},
		startDate: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		estimatedCompletionDate: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		actualCompletionDate: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		customizations: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {},
		},
		selectedPackage: {
			type: DataTypes.JSONB,
			allowNull: true,
		},
		requirements: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {},
		},
		deliverables: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: [],
		},
		communications: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: [],
		},
		rating: {
			type: DataTypes.FLOAT,
			allowNull: true,
			validate: {
				min: 0,
				max: 5,
			},
		},
		review: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		metadata: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {},
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	};

	static associate(models) {
		if (models.User) {
			ServiceOrder.belongsTo(models.User, {
				foreignKey: "userId",
				as: "user",
				constraints: false,
			});
		}

		if (models.Business) {
			ServiceOrder.belongsTo(models.Business, {
				foreignKey: "businessId",
				as: "business",
				constraints: false,
			});
		}

		if (models.Service) {
			ServiceOrder.belongsTo(models.Service, {
				foreignKey: "serviceId",
				as: "service",
				constraints: false,
			});
		}

		if (models.ServiceCart) {
			ServiceOrder.belongsTo(models.ServiceCart, {
				foreignKey: "serviceCartId",
				as: "serviceCart",
				constraints: false,
			});
		}
	}

	static initModel(sequelize) {
		return ServiceOrder.init(this.schema, {
			sequelize,
			modelName: "ServiceOrder",
			tableName: "ServiceOrders",
			timestamps: true,
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

module.exports = ServiceOrder;
