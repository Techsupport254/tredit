const { DataTypes } = require("sequelize");

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const addColumns = [];

		// Add lastLogin if it doesn't exist
		addColumns.push(
			queryInterface
				.addColumn("Users", "lastLogin", {
					type: DataTypes.DATE,
					allowNull: true,
				})
				.catch((error) => {
					if (
						error.name === "SequelizeDatabaseError" &&
						error.message.includes("already exists")
					) {
						console.log("Column lastLogin already exists, skipping...");
						return null;
					}
					throw error;
				})
		);

		// Verify other recently added columns exist, add them if they don't
		const columnsToVerify = [
			{
				name: "taxId",
				config: {
					type: DataTypes.STRING,
					allowNull: true,
				},
			},
			{
				name: "country",
				config: {
					type: DataTypes.STRING,
					allowNull: true,
				},
			},
			{
				name: "cityState",
				config: {
					type: DataTypes.STRING,
					allowNull: true,
				},
			},
			{
				name: "address",
				config: {
					type: DataTypes.STRING,
					allowNull: true,
				},
			},
			{
				name: "isVerified",
				config: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
				},
			},
			{
				name: "verificationToken",
				config: {
					type: DataTypes.STRING,
					allowNull: true,
					unique: true,
				},
			},
		];

		// Try to add each column if it doesn't exist
		columnsToVerify.forEach((column) => {
			addColumns.push(
				queryInterface
					.addColumn("Users", column.name, column.config)
					.catch((error) => {
						if (
							error.name === "SequelizeDatabaseError" &&
							error.message.includes("already exists")
						) {
							console.log(`Column ${column.name} already exists, skipping...`);
							return null;
						}
						throw error;
					})
			);
		});

		// Execute all column additions
		await Promise.all(addColumns);
	},

	down: async (queryInterface, Sequelize) => {
		const columnsToRemove = [
			"lastLogin",
			"taxId",
			"country",
			"cityState",
			"address",
			"isVerified",
			"verificationToken",
		];

		await Promise.all(
			columnsToRemove.map((columnName) =>
				queryInterface.removeColumn("Users", columnName).catch((error) => {
					if (
						error.name === "SequelizeDatabaseError" &&
						error.message.includes("does not exist")
					) {
						console.log(`Column ${columnName} does not exist, skipping...`);
						return null;
					}
					throw error;
				})
			)
		);
	},
};
