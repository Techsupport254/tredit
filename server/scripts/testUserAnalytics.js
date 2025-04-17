const { db } = require("../models");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Function to generate JWT token for a user
const generateToken = (userId) => {
	return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

async function main() {
	try {
		// Connect to database
		await db.sequelize.authenticate();
		console.log("Database connection established successfully.");

		// Get first user from database
		const user = await db.User.findOne({
			where: { role: "user", status: "active" },
			attributes: ["id", "name", "email", "walletAddress"],
		});

		if (!user) {
			console.error("No active users found in the database.");
			process.exit(1);
		}

		console.log(`\nUsing user: ${user.name} (${user.id})`);

		// Generate JWT token for this user
		const token = generateToken(user.id);
		console.log(`JWT token generated successfully.`);
		console.log(`JWT token: ${token}`);

		// Use the correct port from environment or default to 8000
		const serverUrl = "http://localhost:8000";
		console.log(`Using server URL: ${serverUrl}`);

		// Only test the 'all' timeframe for simplicity
		const timeframe = "all";
		console.log(`\n=== Testing analytics with timeframe: ${timeframe} ===`);

		try {
			// Make request to the analytics endpoint
			console.log(
				`Making request to: ${serverUrl}/api/users/analytics?timeframe=${timeframe}`
			);

			const response = await axios.get(
				`${serverUrl}/api/users/analytics?timeframe=${timeframe}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			console.log(`Response status: ${response.status}`);

			// Print summary of results
			const data = response.data.data;
			console.log("\nAnalytics Summary:");
			console.log("------------------");
			console.log(`Account Age: ${data.accountSummary.accountAge} days`);
			console.log(
				`Profile Completion: ${data.accountSummary.profileCompletion}%`
			);
			console.log(`Total Orders: ${data.orderActivity.totalOrders}`);
			console.log(`Total Spending: $${data.orderActivity.totalSpending || 0}`);
			console.log(`Service Orders: ${data.serviceActivity.totalServiceOrders}`);
			console.log(
				`Team Memberships: ${data.businessEngagement.teamMemberships.length}`
			);
			console.log(`Open Disputes: ${data.supportActivity.openDisputes}`);
			console.log(`Unread Messages: ${data.communication.unreadMessages}`);

			// Print full JSON to a file
			const fs = require("fs");
			fs.writeFileSync(
				`user-analytics-${timeframe}.json`,
				JSON.stringify(response.data, null, 2)
			);
			console.log(`Full response saved to user-analytics-${timeframe}.json`);
		} catch (error) {
			console.error(`Error testing analytics:`);

			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				console.error(`Status: ${error.response.status}`);
				console.error(`Data:`, error.response.data);
				console.error(`Headers:`, error.response.headers);
			} else if (error.request) {
				// The request was made but no response was received
				console.error("No response received:", error.request);
			} else {
				// Something happened in setting up the request that triggered an Error
				console.error("Error:", error.message);
			}
		}

		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

// Run the script
main();
