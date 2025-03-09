const axios = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const API_URL = process.env.BACKEND_URL || "http://localhost:8000"; // Updated to match .env
const TEST_WALLET = "0x742d35cc6634c0532925a3b844bc454e4438f44e";

// Generate a valid JWT token using the secret from .env
const getAuthToken = () => {
	const payload = {
		walletAddress: TEST_WALLET,
		role: "vendor",
	};

	return jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE || "30d",
	});
};

const testYouTubeIntegration = async () => {
	try {
		const authToken = getAuthToken();
		console.log("\n🧪 Testing YouTube Integration Endpoints\n");
		console.log("Using wallet address:", TEST_WALLET);
		console.log("JWT Token generated successfully\n");

		// 1. Test Get Connect URL
		console.log("1️⃣ Testing GET /api/social/youtube/connect");
		const connectResponse = await axios.get(
			`${API_URL}/api/social/youtube/connect`,
			{
				headers: { Authorization: `Bearer ${authToken}` },
			}
		);
		console.log("✅ Connect URL generated:", connectResponse.data.url);

		// Note: OAuth callback cannot be tested automatically
		console.log("\n⚠️ OAuth callback must be tested manually in browser");
		console.log("Visit the URL above and complete OAuth flow");
		console.log(
			"Redirect URI configured as:",
			process.env.YOUTUBE_REDIRECT_URI
		);

		// To test the remaining endpoints, you need to:
		// 1. Visit the URL above in your browser
		// 2. Complete the YouTube OAuth flow
		// 3. Copy the code from the callback URL
		// 4. Replace the code below with your actual code
		const code = "ENTER_CODE_HERE"; // ⚠️ Replace with your actual OAuth code

		if (code !== "ENTER_CODE_HERE") {
			// 2. Test Save Tokens
			console.log("\n2️⃣ Testing POST /api/social/youtube/save-tokens");
			const saveTokensResponse = await axios.post(
				`${API_URL}/api/social/youtube/save-tokens`,
				{ code },
				{ headers: { Authorization: `Bearer ${authToken}` } }
			);
			console.log("✅ Tokens saved:", saveTokensResponse.data);

			// 3. Test Get Channel Details
			console.log("\n3️⃣ Testing GET /api/social/youtube/channel");
			const channelResponse = await axios.get(
				`${API_URL}/api/social/youtube/channel`,
				{ headers: { Authorization: `Bearer ${authToken}` } }
			);
			console.log("✅ Channel details retrieved:", channelResponse.data);

			// 4. Test Get Recent Videos
			console.log("\n4️⃣ Testing GET /api/social/youtube/videos");
			const videosResponse = await axios.get(
				`${API_URL}/api/social/youtube/videos?maxResults=5`,
				{ headers: { Authorization: `Bearer ${authToken}` } }
			);
			console.log("✅ Recent videos retrieved:", videosResponse.data);

			// 5. Test Get Specific Video
			if (videosResponse.data.videos && videosResponse.data.videos.length > 0) {
				const videoId = videosResponse.data.videos[0].id.videoId;
				console.log("\n5️⃣ Testing GET /api/social/youtube/videos/:videoId");
				const videoDetailsResponse = await axios.get(
					`${API_URL}/api/social/youtube/videos/${videoId}`,
					{ headers: { Authorization: `Bearer ${authToken}` } }
				);
				console.log("✅ Video details retrieved:", videoDetailsResponse.data);
			}
		} else {
			console.log(
				"\n⚠️ Skipping remaining tests until you provide an OAuth code"
			);
			console.log("To continue testing:");
			console.log("1. Visit the Connect URL above in your browser");
			console.log("2. Complete the YouTube OAuth flow");
			console.log("3. Copy the code from the callback URL");
			console.log("4. Replace 'ENTER_CODE_HERE' with the actual code");
		}
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

// Run the tests
testYouTubeIntegration();
