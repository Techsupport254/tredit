const { sequelize } = require("../config/config");
const { Message } = require("../models");
const { QueryTypes } = require("sequelize");

async function recreateMessagesTable() {
	try {
		console.log("Starting Messages table recreation...");

		// Drop existing Messages table if it exists
		console.log("Dropping existing Messages table...");
		await sequelize.query('DROP TABLE IF EXISTS "Messages" CASCADE');
		console.log("Messages table dropped successfully");

		// Create new Messages table with correct structure
		console.log("Creating new Messages table...");
		await sequelize.query(`
      CREATE TABLE "Messages" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "chatSessionId" UUID NOT NULL REFERENCES "ChatSessions"(id) ON DELETE CASCADE,
        "senderId" UUID NOT NULL REFERENCES "Users"(id),
        "receiverId" UUID NOT NULL REFERENCES "Users"(id),
        "content" TEXT NOT NULL,
        "ipfsCid" VARCHAR(255),
        "ipfsUrl" VARCHAR(255),
        "attachments" JSONB DEFAULT '[]',
        "messageType" VARCHAR(20) DEFAULT 'text',
        "status" VARCHAR(20) DEFAULT 'sent',
        "metadata" JSONB DEFAULT '{}',
        "isCompliant" BOOLEAN DEFAULT true,
        "complianceDetails" JSONB,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `);

		// Add indexes
		console.log("Adding indexes...");
		await sequelize.query(
			'CREATE INDEX "messages_chatSessionId_idx" ON "Messages" ("chatSessionId")'
		);
		await sequelize.query(
			'CREATE INDEX "messages_senderId_idx" ON "Messages" ("senderId")'
		);
		await sequelize.query(
			'CREATE INDEX "messages_receiverId_idx" ON "Messages" ("receiverId")'
		);

		// Create enum type for message type if it doesn't exist
		try {
			await sequelize.query(`
        CREATE TYPE "enum_Messages_messageType" AS ENUM (
          'text', 'system', 'image', 'file', 'price_proposal', 
          'price_acceptance', 'delivery_details', 'security_key', 'dispute'
        )
      `);
		} catch (err) {
			console.log(
				"Message type enum already exists or could not be created:",
				err.message
			);
		}

		// Create enum type for status if it doesn't exist
		try {
			await sequelize.query(`
        CREATE TYPE "enum_Messages_status" AS ENUM (
          'sent', 'delivered', 'read', 'stored_ipfs'
        )
      `);
		} catch (err) {
			console.log(
				"Message status enum already exists or could not be created:",
				err.message
			);
		}

		console.log(
			"Messages table recreated successfully with all required fields"
		);

		// Create welcome message for existing chat sessions
		console.log("Adding welcome messages to existing chat sessions...");
		const chatSessions = await sequelize.query(
			'SELECT id, "buyerId" FROM "ChatSessions"',
			{ type: QueryTypes.SELECT }
		);

		console.log(`Found ${chatSessions.length} existing chat sessions`);

		for (const session of chatSessions) {
			// Create welcome message
			await sequelize.query(
				`
        INSERT INTO "Messages" (
          id, "chatSessionId", "senderId", "receiverId", content, 
          "messageType", status, "createdAt", "updatedAt"
        ) VALUES (
          uuid_generate_v4(), :chatSessionId, :userId, :userId, 
          'Welcome! How can I help you today?', 'system', 'sent', 
          NOW(), NOW()
        )
      `,
				{
					replacements: {
						chatSessionId: session.id,
						userId: session.buyerId,
					},
				}
			);
		}

		console.log("Welcome messages added successfully");
	} catch (error) {
		console.error("Error recreating Messages table:", error);
		throw error;
	}
}

// Run the function if this script is executed directly
if (require.main === module) {
	recreateMessagesTable()
		.then(() => {
			console.log("Script completed successfully");
			process.exit(0);
		})
		.catch((err) => {
			console.error("Script failed:", err);
			process.exit(1);
		});
}

module.exports = recreateMessagesTable;
