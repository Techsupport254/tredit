const { Model, DataTypes } = require("sequelize");

class ServiceCart extends Model {
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
		selectedMilestones: {
			type: DataTypes.JSONB,
			allowNull: false,
			defaultValue: [],
			validate: {
				isValidMilestoneSelection(value) {
					if (!Array.isArray(value)) {
						throw new Error("Selected milestones must be an array");
					}
					value.forEach((milestone) => {
						if (!milestone.order || !milestone.percentagePayment) {
							throw new Error(
								"Each selected milestone must have an order and percentagePayment"
							);
						}
					});
				},
			},
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
		startDate: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		requirements: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {},
		},
		notes: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		totalAmount: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
			validate: {
				min: 0,
			},
		},
		currency: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "USD",
		},
		status: {
			type: DataTypes.ENUM("active", "converted", "abandoned"),
			defaultValue: "active",
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
			ServiceCart.belongsTo(models.User, {
				foreignKey: "userId",
				as: "user",
				constraints: false,
			});
		}

		if (models.Service) {
			ServiceCart.belongsTo(models.Service, {
				foreignKey: "serviceId",
				as: "service",
				constraints: false,
			});
		}
	}

	static initModel(sequelize) {
		return ServiceCart.init(this.schema, {
			sequelize,
			modelName: "ServiceCart",
			tableName: "ServiceCarts",
			timestamps: true,
		});
	}
}

module.exports = ServiceCart;
