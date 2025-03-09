const axios = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const API_URL = process.env.BACKEND_URL || "http://localhost:8000";
const TEST_WALLET = "0x742d35cc6634c0532925a3b844bc454e4438f44e";

const testGoogleAuth = async () => {
	try {
		console.log("\n🧪 Testing Google Authentication\n");

		// 1. Get Google Auth URL
		console.log("1️⃣ Testing GET /api/auth/google/url");
		const urlResponse = await axios.get(`${API_URL}/api/auth/google/url`);
		console.log("✅ Auth URL generated:", urlResponse.data.url);
		console.log("\nTo test the complete flow:");
		console.log("1. Visit the URL above in your browser");
		console.log("2. Complete Google sign-in");
		console.log("3. You'll be redirected to:", process.env.GOOGLE_REDIRECT_URI);
		console.log("4. Copy the 'code' parameter from the URL");

		// For manual testing of the callback
		console.log("\nTo test the callback endpoint:");
		console.log(
			"curl -X POST http://localhost:8000/api/auth/google/callback \\"
		);
		console.log("  -H 'Content-Type: application/json' \\");
		console.log("  -d '{");
		console.log(`    "code": "PASTE_YOUR_CODE_HERE",`);
		console.log(`    "walletAddress": "${TEST_WALLET}"`);
		console.log("  }'");
	} catch (error) {
		console.error("\n❌ Error during testing:");
		if (error.response) {
			console.error("Status:", error.response.status);
			console.error("Data:", error.response.data);
		} else {
			console.error(error.message);
		}
	}
};

// Run the test
testGoogleAuth();
