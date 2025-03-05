const { DataTypes } = require("sequelize");

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const addColumns = [];

		// Add taxId if it doesn't exist
		addColumns.push(
			queryInterface.addColumn("Users", "taxId", {
				type: DataTypes.STRING,
				allowNull: true,
			})
		);

		// Add country if it doesn't exist
		addColumns.push(
			queryInterface.addColumn("Users", "country", {
				type: DataTypes.STRING,
				allowNull: true,
			})
		);

		// Add cityState if it doesn't exist
		addColumns.push(
			queryInterface.addColumn("Users", "cityState", {
				type: DataTypes.STRING,
				allowNull: true,
			})
		);

		// Add address if it doesn't exist
		addColumns.push(
			queryInterface.addColumn("Users", "address", {
				type: DataTypes.STRING,
				allowNull: true,
			})
		);

		// Execute all column additions, catching and ignoring errors if columns already exist
		await Promise.all(
			addColumns.map((promise) =>
				promise.catch((error) => {
					if (
						error.name === "SequelizeDatabaseError" &&
						error.message.includes("already exists")
					) {
						console.log("Column already exists, skipping...");
						return null;
					}
					throw error;
				})
			)
		);
	},

	down: async (queryInterface, Sequelize) => {
		const removeColumns = [];

		removeColumns.push(queryInterface.removeColumn("Users", "taxId"));
		removeColumns.push(queryInterface.removeColumn("Users", "country"));
		removeColumns.push(queryInterface.removeColumn("Users", "cityState"));
		removeColumns.push(queryInterface.removeColumn("Users", "address"));

		// Execute all column removals, catching and ignoring errors if columns don't exist
		await Promise.all(
			removeColumns.map((promise) =>
				promise.catch((error) => {
					if (
						error.name === "SequelizeDatabaseError" &&
						error.message.includes("does not exist")
					) {
						console.log("Column does not exist, skipping...");
						return null;
					}
					throw error;
				})
			)
		);
	},
};
