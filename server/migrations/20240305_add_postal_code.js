const { DataTypes } = require("sequelize");

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("Users", "postalCode", {
			type: DataTypes.STRING,
			allowNull: true,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("Users", "postalCode");
	},
};
