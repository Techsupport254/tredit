const { ethers } = require("ethers");

async function generateTestSignature() {
	// Use the private key from .env
	const privateKey =
		"0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709";
	const wallet = new ethers.Wallet(privateKey);
	const walletAddress = wallet.address;

	// Prepare test data
	const userData = {
		walletAddress: walletAddress,
		name: "Test User 2",
		email: "testuser2@example.com",
		profileImage: "https://example.com/profile2.jpg",
		role: "user",
	};

	// Create the message
	const timestamp = Date.now();
	const message = `I accept the storage of my profile data on IPFS and the blockchain.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\nData Hash: ${ethers.keccak256(
		ethers.toUtf8Bytes(JSON.stringify(userData))
	)}`;

	// Sign the message
	const signature = await wallet.signMessage(message);

	console.log("Test Data:");
	console.log("Wallet Address:", walletAddress);
	console.log("Message:", message);
	console.log("Signature:", signature);
	console.log("\nCURL Command:");
	console.log(`curl -X POST http://localhost:8000/api/users/link-google \\
-H "Content-Type: application/json" \\
-d '{
    "walletAddress": "${walletAddress}",
    "name": "Test User 2",
    "email": "testuser2@example.com",
    "profileImage": "https://example.com/profile2.jpg",
    "role": "user",
    "acceptBlockchainStorage": true,
    "signature": "${signature}"
}' | json_pp`);
}

generateTestSignature().catch(console.error);
