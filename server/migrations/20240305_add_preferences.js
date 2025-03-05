const { DataTypes } = require("sequelize");

module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.addColumn("Users", "preferences", {
				type: DataTypes.JSONB,
				allowNull: true,
				defaultValue: {},
			});
		} catch (error) {
			if (
				error.name === "SequelizeDatabaseError" &&
				error.message.includes("already exists")
			) {
				console.log("Column preferences already exists, skipping...");
				return;
			}
			throw error;
		}
	},

	down: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.removeColumn("Users", "preferences");
		} catch (error) {
			if (
				error.name === "SequelizeDatabaseError" &&
				error.message.includes("does not exist")
			) {
				console.log("Column preferences does not exist, skipping...");
				return;
			}
			throw error;
		}
	},
};
