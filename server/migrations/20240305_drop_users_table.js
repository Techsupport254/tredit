const { DataTypes } = require("sequelize");

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Drop the existing Users table
		await queryInterface.dropTable("Users", { cascade: true });

		// Create a new Users table with all required fields
		await queryInterface.createTable("Users", {
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			walletAddress: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: false,
			},
			username: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: true,
			},
			email: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: true,
			},
			taxId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			country: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			cityState: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			address: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			postalCode: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			isVerified: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			verificationToken: {
				type: DataTypes.STRING,
				allowNull: true,
				unique: true,
			},
			lastLogin: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			preferences: {
				type: DataTypes.JSONB,
				allowNull: true,
				defaultValue: {},
			},
			socialSettings: {
				type: DataTypes.JSONB,
				allowNull: true,
				defaultValue: {},
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
		});

		// Add any necessary indexes
		await queryInterface.addIndex("Users", ["walletAddress"]);
		await queryInterface.addIndex("Users", ["email"]);
		await queryInterface.addIndex("Users", ["username"]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Users");
	},
};
