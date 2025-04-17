const { db } = require("../models");

async function main() {
	try {
		// Load the database models
		await db.sequelize.authenticate();
		console.log("Database connection established successfully.");

		// Fetch all users with basic information
		const users = await db.User.findAll({
			attributes: [
				"id",
				"name",
				"email",
				"walletAddress",
				"role",
				"status",
				"createdAt",
				"lastLogin",
			],
			order: [["createdAt", "DESC"]],
		});

		// Print the results
		console.log(`\nTotal Users: ${users.length}`);
		console.log("\n=== User List ===");

		users.forEach((user, index) => {
			console.log(`\n[${index + 1}] User ID: ${user.id}`);
			console.log(`Name: ${user.name}`);
			console.log(`Email: ${user.email || "Not provided"}`);
			console.log(`Wallet: ${user.walletAddress}`);
			console.log(`Role: ${user.role}`);
			console.log(`Status: ${user.status}`);
			console.log(`Created: ${user.createdAt}`);
			console.log(`Last Login: ${user.lastLogin}`);
			console.log("-------------------");
		});

		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

// Run the main function
main();
