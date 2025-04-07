const { Model, DataTypes } = require("sequelize");

class Order extends Model {
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
		cartId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: "ProductCarts",
				key: "id",
			},
		},
		orderNumber: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		status: {
			type: DataTypes.ENUM(
				"pending",
				"confirmed",
				"processing",
				"shipped",
				"delivered",
				"cancelled",
				"refunded"
			),
			defaultValue: "pending",
		},
		paymentStatus: {
			type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
			defaultValue: "pending",
		},
		subtotal: {
			type: DataTypes.DECIMAL(10, 2),
			defaultValue: 0,
		},
		tax: {
			type: DataTypes.DECIMAL(10, 2),
			defaultValue: 0,
		},
		shippingCost: {
			type: DataTypes.DECIMAL(10, 2),
			defaultValue: 0,
		},
		discount: {
			type: DataTypes.DECIMAL(10, 2),
			defaultValue: 0,
		},
		totalAmount: {
			type: DataTypes.DECIMAL(10, 2),
			defaultValue: 0,
		},
		currency: {
			type: DataTypes.STRING,
			defaultValue: "USD",
		},
		shippingAddress: {
			type: DataTypes.STRING(1000),
			allowNull: false,
		},
		billingAddress: {
			type: DataTypes.STRING(1000),
			allowNull: true,
		},
		estimatedDeliveryDate: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		notes: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		metadata: {
			type: DataTypes.JSONB,
			defaultValue: {},
		},
	};

	static initModel(sequelize) {
		return Order.init(this.schema, {
			sequelize,
			modelName: "Order",
			tableName: "Orders",
			timestamps: true,
		});
	}

	static associate(models) {
		this.belongsTo(models.User, {
			foreignKey: "userId",
			as: "user",
			constraints: false,
		});
		this.belongsTo(models.Business, {
			foreignKey: "businessId",
			as: "business",
			constraints: false,
		});
		this.belongsTo(models.ProductCart, {
			foreignKey: "cartId",
			as: "cart",
			constraints: false,
		});
		this.hasMany(models.OrderItem, {
			foreignKey: "orderId",
			as: "items",
			constraints: false,
		});
	}

	static config = {
		tableName: "Orders",
		timestamps: true,
	};
}

module.exports = Order;
