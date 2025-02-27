const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define("User", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	walletAddress: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false,
		set(value) {
			this.setDataValue("walletAddress", value.toLowerCase()); // Store in lowercase
		},
	},
	role: {
		type: DataTypes.ENUM("buyer", "seller", "arbitrator", "admin"),
		allowNull: false,
		defaultValue: "buyer",
	},
	name: { type: DataTypes.STRING, allowNull: true }, // Optional profile data
	email: { type: DataTypes.STRING, allowNull: true, unique: true }, // Optional email
	phoneNumber: { type: DataTypes.STRING, allowNull: true }, // Optional phone number
	profileImage: { type: DataTypes.STRING, allowNull: true }, // Optional profile image
	gender: { type: DataTypes.STRING, allowNull: true },
	dob: { type: DataTypes.DATE, allowNull: true },
	bio: { type: DataTypes.TEXT, allowNull: true }, // Short bio
	location: { type: DataTypes.STRING, allowNull: true }, // City, Country
	socialMedias: {
		type: DataTypes.JSONB,
		defaultValue: [],
		allowNull: true,
	},
	createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = User;
