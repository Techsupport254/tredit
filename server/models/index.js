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

// Import models
const User = require("./User");
const UserLoginHistory = require("./UserLoginHistory");
const Business = require("./Business");
const TestUser = require("./TestUser");

const initializeModels = () => {
	// User Login History associations
	User.hasMany(UserLoginHistory, {
		foreignKey: "userAddress",
		sourceKey: "walletAddress",
		as: "loginHistory",
	});
	UserLoginHistory.belongsTo(User, {
		foreignKey: "userAddress",
		targetKey: "walletAddress",
	});

	// Business associations
	Business.belongsTo(User, {
		foreignKey: "walletAddress",
		targetKey: "walletAddress",
		as: "owner",
	});

	Business.belongsToMany(User, {
		through: "BusinessTeamMembers",
		foreignKey: "businessId",
		otherKey: "walletAddress",
		as: "teamMembers",
	});
};

// Initialize associations
initializeModels();

// Export all models
module.exports = {
	sequelize,
	User,
	UserLoginHistory,
	Business,
	TestUser,
};
