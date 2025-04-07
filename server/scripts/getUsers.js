const { sequelize } = require("../config/config");
const { Model, DataTypes } = require("sequelize");
const User = require("../models/User");

// Initialize User model with sequelize
User.init(User.schema, {
	sequelize,
	modelName: "User",
});

async function getUsers() {
	try {
		console.log("Fetching users from database...");
		const users = await User.findAll({
			attributes: [
				"id",
				"name",
				"email",
				"walletAddress",
				"role",
				"status",
				"createdAt",
			],
		});
		console.log("Users found:", users.length);
		console.log(JSON.stringify(users, null, 2));
	} catch (error) {
		console.error("Error fetching users:", error);
	} finally {
		await sequelize.close();
	}
}

getUsers();
