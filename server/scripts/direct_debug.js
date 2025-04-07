const { Message, ChatSession, User } = require("../models");
const { sequelize } = require("../config/config");

// Testing debugging bypassing the controller
async function testDirectSendMessage() {
	try {
		console.log("=== DIRECT DEBUG TESTING ===");
		console.log("1. Authenticating database connection...");
		await sequelize.authenticate();
		console.log("Database connection successful");

		// Test data
		const chatSessionId = "e9f63772-cec8-4ea6-a218-f9f7d476f170";
		const userId = "af3e3847-6c87-4f64-b94b-10d3e3c29dbd";
		const content = "Testing direct message sending with bypassed controller";

		// Get chat session to verify it exists
		console.log("2. Verifying chat session exists...");
		const chatSession = await ChatSession.findByPk(chatSessionId, {
			include: [
				{
					model: User,
					as: "buyer",
					attributes: ["id", "name", "email"],
				},
				{
					model: User,
					as: "seller",
					attributes: ["id", "name", "email"],
				},
			],
		});

		if (!chatSession) {
			console.error("Chat session not found");
			process.exit(1);
		}

		console.log("Chat session found:", {
			id: chatSession.id,
			buyerId: chatSession.buyerId,
			businessId: chatSession.businessId,
			buyer: chatSession.buyer
				? {
						id: chatSession.buyer.id,
						name: chatSession.buyer.name,
				  }
				: null,
			business: chatSession.business
				? {
						id: chatSession.business.id,
						name: chatSession.business.name,
				  }
				: null,
		});

		// Send a message directly using the Message model
		console.log("3. Creating message directly in database...");
		const messageData = {
			chatSessionId: chatSessionId,
			senderId: chatSession.businessId,
			receiverId: chatSession.buyerId,
			content: "This is a test message",
			messageType: "text",
			status: "sent",
		};
		const message = await Message.create(messageData);

		console.log("Message created successfully:", {
			id: message.id,
			content: message.content,
			createdAt: message.createdAt,
		});

		// Update the chat session's last message timestamp
		await ChatSession.update(
			{ lastMessageAt: new Date() },
			{ where: { id: chatSessionId } }
		);

		console.log("Chat session timestamp updated");
		console.log("=== TEST COMPLETE ===");
	} catch (error) {
		console.error("Error in direct debug test:", error);
	} finally {
		process.exit(0);
	}
}

// Run the test
testDirectSendMessage();
