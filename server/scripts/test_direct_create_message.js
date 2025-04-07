const { sequelize } = require("../config/config");
const { ChatSession, Message } = require("../models");

async function testDirectMessageCreation() {
	try {
		console.log("Connecting to database...");
		await sequelize.authenticate();
		console.log("Database connection established successfully");

		const SESSION_ID = "e9f63772-cec8-4ea6-a218-f9f7d476f170";
		const USER_ID = "af3e3847-6c87-4f64-b94b-10d3e3c29dbd";

		// Get the chat session to confirm it exists and retrieve details
		console.log("Finding chat session...");
		const chatSession = await ChatSession.findByPk(SESSION_ID);

		if (!chatSession) {
			console.error("Chat session not found!");
			process.exit(1);
		}

		console.log("Chat session found:", {
			id: chatSession.id,
			buyerId: chatSession.buyerId,
			businessId: chatSession.businessId,
		});

		// Create a test message
		console.log("Creating test message...");

		const messageData = {
			chatSessionId: SESSION_ID,
			senderId: chatSession.businessId,
			receiverId: chatSession.buyerId,
			content: "This is a test message from the direct script",
			messageType: "text",
			status: "sent",
			isCompliant: true,
			metadata: {},
			attachments: [],
		};

		console.log("Message data:", JSON.stringify(messageData, null, 2));

		try {
			// Try direct create
			const message = await Message.create(messageData);
			console.log("Message created successfully:", {
				id: message.id,
				content: message.content,
				chatSessionId: message.chatSessionId,
			});
		} catch (createError) {
			console.error("Error creating message:", createError);

			// Try to diagnose the Message model
			console.log("\nDiagnosing Message model...");
			console.log(
				"Message model attributes:",
				Object.keys(Message.getAttributes())
			);

			// Check table structure with raw query
			try {
				console.log("\nChecking table structure...");
				const tableInfo = await sequelize.query(
					`SELECT column_name, data_type, is_nullable 
           FROM information_schema.columns 
           WHERE table_name = 'Messages'
           ORDER BY ordinal_position`,
					{ type: sequelize.QueryTypes.SELECT }
				);

				console.log("Table structure:");
				tableInfo.forEach((col) => {
					console.log(
						`${col.column_name}: ${col.data_type} (${
							col.is_nullable === "YES" ? "nullable" : "NOT NULL"
						})`
					);
				});
			} catch (dbError) {
				console.error("Error querying database structure:", dbError);
			}
		}
	} catch (error) {
		console.error("Script error:", error);
	} finally {
		process.exit(0);
	}
}

// Execute the function
testDirectMessageCreation();
