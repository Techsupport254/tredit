const { sequelize } = require("../config/database");

// Import models
const Product = require("./Product");
const ProductSEO = require("./ProductSEO");
const ProductShipping = require("./ProductShipping");
const ProductAnalytics = require("./ProductAnalytics");
const ProductVariant = require("./ProductVariant");
const ProductReview = require("./ProductReview");
const ProductMedia = require("./ProductMedia");
const User = require("./User");
const Store = require("./Store");

const initializeModels = () => {
	// Define associations
	Product.hasOne(ProductSEO, { foreignKey: "product_id", as: "seo" });
	Product.hasOne(ProductShipping, { foreignKey: "product_id", as: "shipping" });
	Product.hasOne(ProductAnalytics, {
		foreignKey: "product_id",
		as: "analytics",
	});
	Product.hasMany(ProductVariant, { foreignKey: "product_id", as: "variants" });
	Product.hasMany(ProductReview, { foreignKey: "product_id", as: "reviews" });
	Product.hasMany(ProductMedia, { foreignKey: "productId", as: "media" });

	// Define reverse associations
	ProductSEO.belongsTo(Product, { foreignKey: "product_id" });
	ProductShipping.belongsTo(Product, { foreignKey: "product_id" });
	ProductAnalytics.belongsTo(Product, { foreignKey: "product_id" });
	ProductVariant.belongsTo(Product, { foreignKey: "product_id" });
	ProductReview.belongsTo(Product, { foreignKey: "product_id" });
	ProductMedia.belongsTo(Product, { foreignKey: "productId" });

	// Store associations
	Store.belongsTo(User, {
		foreignKey: "ownerAddress",
		targetKey: "walletAddress",
		as: "owner",
	});
	User.hasOne(Store, {
		foreignKey: "ownerAddress",
		sourceKey: "walletAddress",
		as: "store",
	});
};

// Initialize associations
initializeModels();

// Export models
module.exports = {
	sequelize,
	Product,
	ProductSEO,
	ProductShipping,
	ProductAnalytics,
	ProductVariant,
	ProductReview,
	ProductMedia,
	User,
	Store,
};
