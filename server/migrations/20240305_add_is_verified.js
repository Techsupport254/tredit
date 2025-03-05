const { DataTypes } = require("sequelize");

module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.addColumn("Users", "isVerified", {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			});
		} catch (error) {
			if (
				error.name === "SequelizeDatabaseError" &&
				error.message.includes("already exists")
			) {
				console.log("Column isVerified already exists, skipping...");
				return;
			}
			throw error;
		}
	},

	down: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.removeColumn("Users", "isVerified");
		} catch (error) {
			if (
				error.name === "SequelizeDatabaseError" &&
				error.message.includes("does not exist")
			) {
				console.log("Column isVerified does not exist, skipping...");
				return;
			}
			throw error;
		}
	},
};
