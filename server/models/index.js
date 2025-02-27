const Product = require("./Product");
const ProductSEO = require("./ProductSEO");
const ProductShipping = require("./ProductShipping");
const ProductAnalytics = require("./ProductAnalytics");
const ProductVariant = require("./ProductVariant");
const ProductReview = require("./ProductReview");

// Define associations
Product.hasOne(ProductSEO, { foreignKey: "product_id" });
Product.hasOne(ProductShipping, { foreignKey: "product_id" });
Product.hasOne(ProductAnalytics, { foreignKey: "product_id" });

Product.hasMany(ProductVariant, { foreignKey: "product_id" });
Product.hasMany(ProductReview, { foreignKey: "product_id" });

// Optional: Define reverse associations
ProductSEO.belongsTo(Product, { foreignKey: "product_id" });
ProductShipping.belongsTo(Product, { foreignKey: "product_id" });
ProductAnalytics.belongsTo(Product, { foreignKey: "product_id" });

ProductVariant.belongsTo(Product, { foreignKey: "product_id" });
ProductReview.belongsTo(Product, { foreignKey: "product_id" });

module.exports = {
	Product,
	ProductSEO,
	ProductShipping,
	ProductAnalytics,
	ProductVariant,
	ProductReview,
};
