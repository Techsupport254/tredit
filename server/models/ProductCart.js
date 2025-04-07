const { Model, DataTypes } = require("sequelize");

class ProductCart extends Model {
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
		status: {
			type: DataTypes.ENUM("active", "abandoned", "converted"),
			defaultValue: "active",
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
		discountType: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		discountValue: {
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
		requiresShipping: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		shippingAddress: {
			type: DataTypes.STRING(1000),
			allowNull: true,
		},
		shippingMethod: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		estimatedDeliveryDate: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		lastActivity: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
		metadata: {
			type: DataTypes.JSONB,
			defaultValue: {},
		},
	};

	static initModel(sequelize) {
		return ProductCart.init(this.schema, {
			sequelize,
			modelName: "ProductCart",
			tableName: "ProductCarts",
			timestamps: true,
		});
	}

	static associate(models) {
		if (models.User) {
			ProductCart.belongsTo(models.User, {
				foreignKey: "userId",
				as: "user",
				constraints: false,
			});
		}

		if (models.Business) {
			ProductCart.belongsTo(models.Business, {
				foreignKey: "businessId",
				as: "business",
				constraints: false,
			});
		}

		if (models.ProductCartItem) {
			ProductCart.hasMany(models.ProductCartItem, {
				foreignKey: "cartId",
				as: "items",
				constraints: false,
			});
		}
	}

	async calculateTotals() {
		try {
			console.log("Starting calculateTotals for cart:", this.id);
			const items = await this.getItems();
			console.log("Found items:", items.length);

			let subtotal = 0;
			let tax = 0;
			let shippingCost = 0;

			// Calculate subtotal by summing up all item subtotals
			for (const item of items) {
				console.log(
					"Processing item:",
					item.id,
					"quantity:",
					item.quantity,
					"unitPrice:",
					item.unitPrice,
					"subtotal:",
					item.subtotal
				);
				// Calculate item subtotal based on quantity and unit price
				const itemSubtotal =
					parseFloat(item.quantity) * parseFloat(item.unitPrice);
				subtotal += itemSubtotal;

				if (item.tax && typeof item.tax === "object" && "rate" in item.tax) {
					tax += itemSubtotal * parseFloat(item.tax.rate);
				}
			}

			// Calculate shipping cost if needed
			if (this.requiresShipping && this.shippingAddress) {
				shippingCost = await this.calculateShippingCost();
			}

			// Apply discount if any
			let discount = 0;
			if (this.discountType && this.discountValue) {
				if (this.discountType === "percentage") {
					discount = (subtotal * parseFloat(this.discountValue)) / 100;
				} else {
					discount = parseFloat(this.discountValue);
				}
			}

			// Calculate total
			const totalAmount = subtotal + tax + shippingCost - discount;
			console.log(
				"Calculated totals - subtotal:",
				subtotal,
				"tax:",
				tax,
				"shippingCost:",
				shippingCost,
				"discount:",
				discount,
				"totalAmount:",
				totalAmount
			);

			// Update cart
			await this.update({
				subtotal: subtotal.toFixed(2),
				tax: tax.toFixed(2),
				shippingCost: shippingCost.toFixed(2),
				discount: discount.toFixed(2),
				totalAmount: totalAmount.toFixed(2),
				lastActivity: new Date(),
			});
			console.log("Updated cart with new totals");
		} catch (error) {
			console.error("Error in calculateTotals:", error);
			throw error;
		}
	}

	async calculateShippingCost() {
		try {
			// Return the manually set shipping cost
			return parseFloat(this.shippingCost || 0);
		} catch (error) {
			console.error("Error getting shipping cost:", error);
			return 0;
		}
	}
}

module.exports = ProductCart;
