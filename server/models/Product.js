const { Model, DataTypes } = require("sequelize");
const { BUSINESS_CONSTANTS } = require("../config/constants");

class Product extends Model {
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
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
			},
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		shortDescription: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		category: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isIn: [BUSINESS_CONSTANTS.PRODUCT_CATEGORIES],
			},
		},
		brand: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		tags: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			defaultValue: [],
		},
		rating: {
			type: DataTypes.FLOAT,
			defaultValue: 0,
			validate: {
				min: 0,
				max: 5,
			},
		},
		reviewsCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			validate: {
				min: 0,
			},
		},
		media: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			defaultValue: [],
			validate: {
				isValidUrls(value) {
					if (!Array.isArray(value)) return;
					value.forEach((url) => {
						if (!isValidUrl(url)) {
							throw new Error("Invalid URL in media array");
						}
					});
				},
			},
		},
		videoReviewUrl: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		isInStock: {
			type: DataTypes.VIRTUAL,
			get() {
				if (this.variants && this.variants.length > 0) {
					return this.variants.some((variant) => variant.stockQuantity > 0);
				}
				return false;
			},
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
		Product.belongsTo(models.Business, {
			foreignKey: "businessId",
			as: "business",
			onDelete: "CASCADE",
		});
		Product.hasMany(models.ProductVariant, {
			foreignKey: "productId",
			as: "variants",
			onDelete: "CASCADE",
		});
		Product.hasOne(models.ProductSEO, {
			foreignKey: "productId",
			as: "seo",
		});
		Product.hasOne(models.ProductAnalytics, {
			foreignKey: "productId",
			as: "analytics",
		});
		Product.hasMany(models.SocialMediaContent, {
			foreignKey: "productId",
			as: "socialMedia",
		});
		Product.hasMany(models.ProductCartItem, {
			foreignKey: "productId",
			as: "cartItems",
		});
	}

	static initModel(sequelize) {
		Product.init(Product.schema, {
			sequelize,
			modelName: "Product",
			tableName: "Products",
			timestamps: true,
			paranoid: true,
			hooks: {
				beforeValidate: async (product) => {
					// Only check for variants if the product is being updated
					if (!product.isNewRecord) {
						const variantCount = await sequelize.models.ProductVariant.count({
							where: { productId: product.id, isActive: true },
						});
						if (variantCount === 0) {
							throw new Error("Product must have at least one active variant");
						}
					}
				},
				afterFind: async (products) => {
					// Handle both single product and array of products
					const productArray = Array.isArray(products) ? products : [products];

					for (const product of productArray) {
						if (!product) continue;

						// Load variants if not already loaded
						if (!product.variants) {
							product.variants = await sequelize.models.ProductVariant.findAll({
								where: { productId: product.id, isActive: true },
							});
						}

						// Update stock status based on variants
						product.isInStock = product.variants.some(
							(variant) => variant.isActive && variant.stockQuantity > 0
						);

						// Set base price as minimum variant price
						if (product.variants.length > 0) {
							product.price = Math.min(...product.variants.map((v) => v.price));
						}
					}
				},
				afterSave: async (product) => {
					// Update product's stock status based on variants
					const variants = await sequelize.models.ProductVariant.findAll({
						where: { productId: product.id, isActive: true },
					});

					// Update stock status
					const isInStock = variants.some(
						(variant) => variant.isActive && variant.stockQuantity > 0
					);

					// Set base price as minimum variant price
					const minPrice =
						variants.length > 0
							? Math.min(...variants.map((v) => v.price))
							: product.price;

					// Update product if needed
					if (product.isInStock !== isInStock || product.price !== minPrice) {
						await product.update(
							{
								isInStock,
								price: minPrice,
							},
							{ hooks: false }
						); // Prevent infinite loop
					}
				},
			},
		});
		return Product;
	}
}

// Helper function to validate URLs
function isValidUrl(string) {
	try {
		new URL(string);
		return true;
	} catch (_) {
		return false;
	}
}

module.exports = Product;
