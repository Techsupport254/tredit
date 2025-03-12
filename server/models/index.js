const path = require("path");
const Sequelize = require("sequelize");
const { sequelize } = require("../config/config");

// Import models
const User = require("./User");
const Business = require("./Business");
const BusinessTeamMember = require("./BusinessTeamMember");

// Initialize models
User.initModel(sequelize);
Business.initModel(sequelize);
BusinessTeamMember.initModel(sequelize);

// Define associations
User.associate({ Business, BusinessTeamMember });
Business.associate({ User, BusinessTeamMember });
BusinessTeamMember.associate({ User, Business });

// Export models and sequelize instance
module.exports = {
	sequelize,
	Sequelize,
	User,
	Business,
	BusinessTeamMember,
};
