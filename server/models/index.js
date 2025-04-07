const { Sequelize } = require("sequelize");
const config = require("../config/config.js");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
	dbConfig.database,
	dbConfig.username,
	dbConfig.password,
	{
		host: dbConfig.host,
		dialect: dbConfig.dialect,
		logging: false,
		define: {
			timestamps: true,
			underscored: false,
		},
	}
);

// Create an empty object to store models
const db = {};

// Import models
const User = require("./User");
const Business = require("./Business");
const BusinessTeamMember = require("./BusinessTeamMember");
const Product = require("./Product");
const ProductVariant = require("./ProductVariant");
const Service = require("./Service");
const ProductCart = require("./ProductCart");
const ProductCartItem = require("./ProductCartItem");
const ServiceCart = require("./ServiceCart");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const ServiceOrder = require("./ServiceOrder");
const ChatSession = require("./chatSession");
const Message = require("./message");
const ProductSEO = require("./ProductSEO");
const ProductAnalytics = require("./ProductAnalytics");
const SocialMediaContent = require("./SocialMediaContent");
const Dispute = require("./dispute");

// Initialize models in dependency order
db.User = User.initModel(sequelize);
db.Business = Business.initModel(sequelize);
db.BusinessTeamMember = BusinessTeamMember.initModel(sequelize);
db.Product = Product.initModel(sequelize);
db.ProductVariant = ProductVariant.initModel(sequelize);
db.Service = Service.initModel(sequelize);
db.Order = Order.initModel(sequelize);
db.OrderItem = OrderItem.initModel(sequelize);
db.ProductCart = ProductCart.initModel(sequelize);
db.ProductCartItem = ProductCartItem.initModel(sequelize);
db.ServiceCart = ServiceCart.initModel(sequelize);
db.ServiceOrder = ServiceOrder.initModel(sequelize);
db.ChatSession = ChatSession.initModel(sequelize);
db.Message = Message.initModel(sequelize);
db.ProductSEO = ProductSEO.initModel(sequelize);
db.ProductAnalytics = ProductAnalytics.initModel(sequelize);
db.SocialMediaContent = SocialMediaContent.initModel(sequelize);
db.Dispute = Dispute.initModel(sequelize);

// Attach models to sequelize.models
Object.keys(db).forEach((modelName) => {
	if (db[modelName] && db[modelName].prototype instanceof Sequelize.Model) {
		sequelize.models[modelName] = db[modelName];
	}
});

// Setup associations
function setupAssociations() {
	// User associations
	if (db.User && db.User.associate) {
		db.User.associate(sequelize.models);
	}
	// Service associations must be set up before Business associations
	if (db.Service && db.Service.associate) {
		db.Service.associate(sequelize.models);
	}
	if (db.Business && db.Business.associate) {
		db.Business.associate(sequelize.models);
	}
	if (db.BusinessTeamMember && db.BusinessTeamMember.associate) {
		db.BusinessTeamMember.associate(sequelize.models);
	}
	if (db.Product && db.Product.associate) {
		db.Product.associate(sequelize.models);
	}
	if (db.ProductVariant && db.ProductVariant.associate) {
		db.ProductVariant.associate(sequelize.models);
	}
	if (db.ProductCart && db.ProductCart.associate) {
		db.ProductCart.associate(sequelize.models);
	}
	if (db.ProductCartItem && db.ProductCartItem.associate) {
		db.ProductCartItem.associate(sequelize.models);
	}
	if (db.ServiceCart && db.ServiceCart.associate) {
		db.ServiceCart.associate(sequelize.models);
	}
	if (db.Order && db.Order.associate) {
		db.Order.associate(sequelize.models);
	}
	if (db.OrderItem && db.OrderItem.associate) {
		db.OrderItem.associate(sequelize.models);
	}
	if (db.ServiceOrder && db.ServiceOrder.associate) {
		db.ServiceOrder.associate(sequelize.models);
	}
	if (db.ChatSession && db.ChatSession.associate) {
		db.ChatSession.associate(sequelize.models);
	}
	if (db.Message && db.Message.associate) {
		db.Message.associate(sequelize.models);
	}
	if (db.ProductSEO && db.ProductSEO.associate) {
		db.ProductSEO.associate(sequelize.models);
	}
	if (db.ProductAnalytics && db.ProductAnalytics.associate) {
		db.ProductAnalytics.associate(sequelize.models);
	}
	if (db.SocialMediaContent && db.SocialMediaContent.associate) {
		db.SocialMediaContent.associate(sequelize.models);
	}
	if (db.Dispute && db.Dispute.associate) {
		db.Dispute.associate(sequelize.models);
	}
}

// Call setupAssociations after initializing models
setupAssociations();

// Function to sync database
async function syncDatabase() {
	try {
		// Don't force reset the database
		const syncOptions = {
			force: false,
			alter: false,
		};

		await sequelize.sync(syncOptions);
		console.log("✅ Database synchronized successfully");
	} catch (error) {
		console.error("❌ Error synchronizing database:", error);
		throw error;
	}
}

// Export db object with models and sequelize instance
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = { db, sequelize, syncDatabase };
