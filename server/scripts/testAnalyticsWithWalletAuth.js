const axios = require("axios");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Config
const SERVER_URL = "http://localhost:8000";

async function main() {
	try {
		console.log("Starting wallet authentication test...");

		// Get user with wallet auth from getUsers script first
		const usersResults = await getExistingUser();
		const walletAddress = usersResults.walletAddress;

		console.log(`Using wallet address: ${walletAddress}`);

		// Step 1: Authenticate with wallet
		console.log("\nSTEP 1: Authenticating with wallet...");
		const authResponse = await axios.post(
			`${SERVER_URL}/api/users/wallet-auth`,
			{ walletAddress },
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		console.log(`Authentication response status: ${authResponse.status}`);

		// Extract token from response
		const { token, user } = authResponse.data.data;
		console.log(`Authenticated as: ${user.name} (${user.id})`);
		console.log(`Token received: ${token.substring(0, 20)}...`);

		// Step 2: Use the token to request analytics
		console.log("\nSTEP 2: Requesting user analytics...");
		const timeframe = "all";

		console.log(
			`Making request to: ${SERVER_URL}/api/users/analytics?timeframe=${timeframe}`
		);

		const analyticsResponse = await axios.get(
			`${SERVER_URL}/api/users/analytics?timeframe=${timeframe}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		console.log(`Analytics response status: ${analyticsResponse.status}`);

		// Print summary of analytics results
		const data = analyticsResponse.data.data;
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

		// Save full response to file
		const fs = require("fs");
		fs.writeFileSync(
			"user-analytics-with-wallet-auth.json",
			JSON.stringify(analyticsResponse.data, null, 2)
		);
		console.log(
			`Full analytics data saved to user-analytics-with-wallet-auth.json`
		);
	} catch (error) {
		console.error("Error in test:");

		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			console.error(`Status: ${error.response.status}`);
			console.error(`Data:`, error.response.data);
			console.error(`Headers:`, error.response.headers);
		} else if (error.request) {
			// The request was made but no response was received
			console.error("No response received from server");
		} else {
			// Something happened in setting up the request that triggered an Error
			console.error("Error message:", error.message);
		}
	}
}

// Helper function to get an existing user from database
async function getExistingUser() {
	try {
		const { db } = require("../models");
		await db.sequelize.authenticate();

		// Find a user with wallet address
		const user = await db.User.findOne({
			where: {
				status: "active",
				role: "user",
			},
			attributes: ["id", "name", "walletAddress", "email"],
		});

		if (!user) {
			throw new Error("No active users found in database");
		}

		return {
			id: user.id,
			name: user.name,
			walletAddress: user.walletAddress,
			email: user.email,
		};
	} catch (error) {
		console.error("Error getting existing user:", error);
		throw error;
	}
}

// Run the main function
main();
