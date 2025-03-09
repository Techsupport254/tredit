const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Business = sequelize.define("Business", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	category: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	address: {
		type: DataTypes.STRING,
	},
	phone: {
		type: DataTypes.STRING,
	},
	email: {
		type: DataTypes.STRING,
		validate: {
			isEmail: true,
		},
	},
	ownerId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	verificationStatus: {
		type: DataTypes.ENUM("pending", "verified", "rejected"),
		defaultValue: "pending",
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW,
	},
	updatedAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW,
	},
});

module.exports = Business;
