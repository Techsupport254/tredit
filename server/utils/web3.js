const { ethers } = require("ethers");

const verifySignature = (message, signature, walletAddress) => {
	try {
		console.log("Verifying signature with parameters:", {
			message,
			signature,
			walletAddress: walletAddress.toLowerCase(),
		});

		// Normalize the message by removing any trailing whitespace
		const normalizedMessage = message.trim();
		console.log("Normalized message:", normalizedMessage);

		// Verify the signature using verifyMessage
		const recoveredAddress = ethers.verifyMessage(normalizedMessage, signature);
		console.log("Recovered address:", recoveredAddress);
		console.log("Expected address:", walletAddress);

		// Compare addresses (case-insensitive)
		const isValid =
			recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
		console.log("Signature valid:", isValid);

		return isValid;
	} catch (error) {
		console.error("Signature verification error:", error);
		console.error("Error details:", {
			code: error.code,
			name: error.name,
			stack: error.stack,
		});
		return false;
	}
};

module.exports = {
	verifySignature,
};
