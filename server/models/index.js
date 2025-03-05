const { Sequelize } = require("sequelize");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const sequelize = new Sequelize({
	dialect: "postgres",
	host: process.env.DB_HOST || "localhost",
	port: process.env.DB_PORT || 5432,
	username: process.env.DB_USER || "postgres",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "tredit",
	logging: false,
	dialectOptions: {
		ssl:
			process.env.DB_SSL === "true"
				? {
						require: true,
						rejectUnauthorized: false,
				  }
				: false,
	},
});

// Export the sequelize instance first
module.exports = { sequelize };

// Import models after exporting sequelize
const Product = require("./Product");
const ProductSEO = require("./ProductSEO");
const ProductShipping = require("./ProductShipping");
const ProductAnalytics = require("./ProductAnalytics");
const ProductVariant = require("./ProductVariant");
const ProductReview = require("./ProductReview");
const ProductMedia = require("./ProductMedia");
const User = require("./User");
const Store = require("./Store");
const SocialAccount = require("./SocialAccount");

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

	// Social Account associations
	User.hasMany(SocialAccount, { foreignKey: "userId" });
	SocialAccount.belongsTo(User, { foreignKey: "userId" });
};

// Initialize associations
initializeModels();

// Update exports to include all models
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
	SocialAccount,
};
