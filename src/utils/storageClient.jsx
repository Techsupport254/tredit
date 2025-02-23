import { create } from "@web3-storage/w3up-client";

let client;

/**
 * Initializes the W3UP client and sets up a storage space.
 * This should be done only once per user registration.
 * @param {string} email - The user's email for login.
 * @returns {Promise<object>} The initialized client.
 */
export async function initializeStorage(email) {
	if (!client) {
		console.log("🚀 Initializing W3UP client...");
		client = await create();

		try {
			// Log in with the provided email
			const account = await client.login(email);
			console.log("📧 Verification email sent to", email);

			// Wait for email verification (Only needed once)
			console.log("⏳ Waiting for email verification...");
			await account.waitForVerification();
			console.log("Email verified.");

			// Check if storage space exists
			const spaces = await client.spaces();
			let space = spaces.length ? spaces[0] : null;

			// Create a new storage space if none exists
			if (!space) {
				console.log("🚀 Creating new storage space 'profile-storage'...");
				space = await client.createSpace("profile-storage");
				await client.setCurrentSpace(space.did());
				await client.registerSpace(email);
				console.log("Storage space created:", space.did());
			} else {
				console.log("Using existing storage space:", space.did());
				await client.setCurrentSpace(space.did());
			}
		} catch (error) {
			console.error("Storage initialization failed:", error);
			throw new Error(`Initialization failed: ${error.message}`);
		}
	}
	return client;
}
