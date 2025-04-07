const { Model, DataTypes } = require("sequelize");

class ProductCartItem extends Model {
	static schema = {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		cartId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "ProductCarts",
				key: "id",
			},
		},
		productId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Products",
				key: "id",
			},
		},
		variantId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: "ProductVariants",
				key: "id",
			},
		},
		businessId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: "Businesses",
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
			type: DataTypes.JSONB,
			defaultValue: {
				rate: 0,
				exempt: false,
				exemptRegions: [],
			},
		},
		selectedOptions: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		customizations: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		giftWrapping: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		giftMessage: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		notes: DataTypes.TEXT,
		isActive: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		taxInfo: {
			type: DataTypes.JSONB,
			allowNull: true,
		},
		discountInfo: {
			type: DataTypes.JSONB,
			allowNull: true,
		},
	};

	static initModel(sequelize) {
		return ProductCartItem.init(this.schema, {
			sequelize,
			modelName: "ProductCartItem",
			tableName: "ProductCartItems",
			timestamps: true,
			hooks: {
				afterCreate: async (item) => {
					try {
						console.log("After create hook triggered for cart item:", item.id);
						const cart = await sequelize.models.ProductCart.findByPk(
							item.cartId
						);
						if (cart) {
							console.log("Recalculating cart totals after item creation");
							await cart.calculateTotals();
						}
					} catch (error) {
						console.error("Error in afterCreate hook:", error);
					}
				},
				afterUpdate: async (item) => {
					try {
						console.log("After update hook triggered for cart item:", item.id);
						const cart = await sequelize.models.ProductCart.findByPk(
							item.cartId
						);
						if (cart) {
							console.log("Recalculating cart totals after item update");
							await cart.calculateTotals();
						}
					} catch (error) {
						console.error("Error in afterUpdate hook:", error);
					}
				},
				afterDestroy: async (item) => {
					try {
						console.log("After destroy hook triggered for cart item:", item.id);
						const cart = await sequelize.models.ProductCart.findByPk(
							item.cartId
						);
						if (cart) {
							console.log("Recalculating cart totals after item removal");
							await cart.calculateTotals();
						}
					} catch (error) {
						console.error("Error in afterDestroy hook:", error);
					}
				},
			},
		});
	}

	static associate(models) {
		if (models.ProductCart) {
			ProductCartItem.belongsTo(models.ProductCart, {
				foreignKey: "cartId",
				as: "cart",
				constraints: false,
			});
		}

		if (models.Product) {
			ProductCartItem.belongsTo(models.Product, {
				foreignKey: "productId",
				as: "product",
				constraints: false,
			});
		}

		if (models.ProductVariant) {
			ProductCartItem.belongsTo(models.ProductVariant, {
				foreignKey: "variantId",
				as: "variant",
				constraints: false,
			});
		}

		if (models.Business) {
			ProductCartItem.belongsTo(models.Business, {
				foreignKey: "businessId",
				as: "business",
				constraints: false,
			});
		}
	}
}

module.exports = ProductCartItem;
