const { DataTypes } = require("sequelize");

module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.addColumn("Users", "verificationToken", {
				type: DataTypes.STRING,
				allowNull: true,
				unique: true,
			});
		} catch (error) {
			if (
				error.name === "SequelizeDatabaseError" &&
				error.message.includes("already exists")
			) {
				console.log("Column verificationToken already exists, skipping...");
				return;
			}
			throw error;
		}
	},

	down: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.removeColumn("Users", "verificationToken");
		} catch (error) {
			if (
				error.name === "SequelizeDatabaseError" &&
				error.message.includes("does not exist")
			) {
				console.log("Column verificationToken does not exist, skipping...");
				return;
			}
			throw error;
		}
	},
};
