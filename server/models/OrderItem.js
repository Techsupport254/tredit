const { Model, DataTypes } = require("sequelize");

class OrderItem extends Model {
	static schema = {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		orderId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: false, // Disable foreign key constraint
		},
		type: {
			type: DataTypes.ENUM("product", "service"),
			allowNull: false,
			defaultValue: "product",
		},
		productId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: "Products",
				key: "id",
			},
		},
		serviceId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: false, // Disable foreign key constraint
		},
		variantId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: "ProductVariants",
				key: "id",
			},
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1,
		},
		unitPrice: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		subtotal: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		tax: {
			type: DataTypes.DECIMAL(10, 2),
			defaultValue: 0,
		},
		isService: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		serviceDate: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		serviceDuration: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		customizations: {
			type: DataTypes.JSONB,
			allowNull: true,
		},
		notes: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
	};

	static initModel(sequelize) {
		return OrderItem.init(this.schema, {
			sequelize,
			modelName: "OrderItem",
			tableName: "OrderItems",
			timestamps: true,
			indexes: [
				{
					fields: ["orderId"],
				},
				{
					fields: ["productId"],
				},
				{
					fields: ["serviceId"],
				},
				{
					fields: ["type"],
				},
			],
			validate: {
				productOrService() {
					if (this.type === "product" && !this.productId) {
						throw new Error("Product ID is required for product type");
					}
					if (this.type === "service" && !this.serviceId) {
						throw new Error("Service ID is required for service type");
					}
				},
			},
		});
	}

	static associate(models) {
		this.belongsTo(models.Order, {
			foreignKey: "orderId",
			as: "order",
			constraints: false,
		});

		this.belongsTo(models.Product, {
			foreignKey: "productId",
			as: "product",
			constraints: false,
		});

		this.belongsTo(models.Service, {
			foreignKey: "serviceId",
			as: "service",
			constraints: false,
		});

		this.belongsTo(models.ProductVariant, {
			foreignKey: "variantId",
			as: "variant",
			constraints: false,
		});
	}
}

module.exports = OrderItem;
