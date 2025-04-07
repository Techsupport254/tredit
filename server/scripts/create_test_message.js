const { sequelize } = require("../config/config");
const { Message, ChatSession } = require("../models");

async function createTestMessage() {
	try {
		console.log("Setting up database connection...");
		await sequelize.authenticate();
		console.log("Database connection established successfully.");

		// Get the chat session to confirm it exists
		const sessionId = "e9f63772-cec8-4ea6-a218-f9f7d476f170";
		const chatSession = await ChatSession.findByPk(sessionId);

		if (!chatSession) {
			console.error("Chat session not found");
			process.exit(1);
		}

		console.log("Chat session found:", {
			id: chatSession.id,
			buyerId: chatSession.buyerId,
			businessId: chatSession.businessId,
		});

		// Prepare message data
		const messageData = {
			chatSessionId: sessionId,
			senderId: chatSession.businessId,
			receiverId: chatSession.buyerId,
			content: "This is a test message",
			messageType: "text",
			status: "sent",
			isCompliant: true,
			metadata: {},
			attachments: [],
		};

		console.log(
			"Creating message with data:",
			JSON.stringify(messageData, null, 2)
		);

		// Create the message
		const message = await Message.create(messageData);

		console.log("Message created successfully:", {
			id: message.id,
			chatSessionId: message.chatSessionId,
			content: message.content,
			createdAt: message.createdAt,
		});

		// Update chat session's last message timestamp
		await ChatSession.update(
			{ lastMessageAt: new Date() },
			{ where: { id: sessionId } }
		);

		console.log("Chat session updated with new timestamp");
		console.log("Test complete! Check the database to see the new message.");

		process.exit(0);
	} catch (error) {
		console.error("Error creating test message:", error);
		process.exit(1);
	}
}

createTestMessage();
