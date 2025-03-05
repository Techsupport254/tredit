const { DataTypes } = require("sequelize");

module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			// Add the role column using Sequelize's built-in ENUM handling
			await queryInterface.addColumn("Users", "role", {
				type: Sequelize.ENUM,
				values: ["user", "admin", "moderator"],
				allowNull: false,
				defaultValue: "user",
			});
		} catch (error) {
			if (
				error.name === "SequelizeDatabaseError" &&
				error.message.includes("already exists")
			) {
				console.log("Column role already exists, skipping...");
				return;
			}
			throw error;
		}
	},

	down: async (queryInterface, Sequelize) => {
		try {
			// Remove the role column
			await queryInterface.removeColumn("Users", "role");

			// Drop the enum type
			await queryInterface.sequelize.query(
				'DROP TYPE IF EXISTS "enum_Users_role";'
			);
		} catch (error) {
			if (
				error.name === "SequelizeDatabaseError" &&
				error.message.includes("does not exist")
			) {
				console.log("Column role does not exist, skipping...");
				return;
			}
			throw error;
		}
	},
};
