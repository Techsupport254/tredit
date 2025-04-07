const { sequelize } = require("../config/config");
const { QueryTypes } = require("sequelize");

async function createChatTables() {
	try {
		console.log("Starting chat tables creation...");

		// Enable UUID extension
		await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
		console.log("UUID extension enabled");

		// Drop existing tables if they exist
		console.log("Dropping existing tables...");
		await sequelize.query('DROP TABLE IF EXISTS "Messages" CASCADE');
		await sequelize.query('DROP TABLE IF EXISTS "ChatSessions" CASCADE');
		console.log("Existing tables dropped successfully");

		// Create ChatSessions table
		console.log("Creating ChatSessions table...");
		await sequelize.query(`
            CREATE TABLE "ChatSessions" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "buyerId" UUID NOT NULL REFERENCES "Users"(id),
                "businessId" UUID NOT NULL REFERENCES "Businesses"(id),
                "cartType" VARCHAR(10) NOT NULL CHECK ("cartType" IN ('product', 'service')),
                "cartId" UUID NOT NULL,
                "orderId" UUID,
                "serviceOrderId" UUID,
                "status" VARCHAR(10) NOT NULL DEFAULT 'active' CHECK ("status" IN ('active', 'archived', 'closed')),
                "lastMessageAt" TIMESTAMP WITH TIME ZONE,
                "metadata" JSONB DEFAULT '{}',
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
            )
        `);
		console.log("ChatSessions table created successfully");

		// Create Messages table
		console.log("Creating Messages table...");
		await sequelize.query(`
            CREATE TABLE "Messages" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "chatSessionId" UUID NOT NULL REFERENCES "ChatSessions"(id) ON DELETE CASCADE,
                "senderId" UUID NOT NULL REFERENCES "Users"(id),
                "senderType" VARCHAR(10) NOT NULL CHECK ("senderType" IN ('buyer', 'business')),
                "content" TEXT NOT NULL,
                "isRead" BOOLEAN DEFAULT false,
                "readBy" JSONB DEFAULT '[]',
                "metadata" JSONB DEFAULT '{}',
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
            )
        `);
		console.log("Messages table created successfully");

		// Add indexes
		console.log("Adding indexes...");
		await sequelize.query(
			'CREATE INDEX "idx_chat_session_buyer" ON "ChatSessions"("buyerId")'
		);
		await sequelize.query(
			'CREATE INDEX "idx_chat_session_business" ON "ChatSessions"("businessId")'
		);
		await sequelize.query(
			'CREATE INDEX "idx_chat_session_cart" ON "ChatSessions"("cartId")'
		);
		await sequelize.query(
			'CREATE INDEX "idx_chat_session_order" ON "ChatSessions"("orderId")'
		);
		await sequelize.query(
			'CREATE INDEX "idx_chat_session_status" ON "ChatSessions"("status")'
		);
		await sequelize.query(
			'CREATE INDEX "idx_chat_session_last_message" ON "ChatSessions"("lastMessageAt")'
		);

		await sequelize.query(
			'CREATE INDEX "idx_message_chat_session" ON "Messages"("chatSessionId")'
		);
		await sequelize.query(
			'CREATE INDEX "idx_message_sender" ON "Messages"("senderId")'
		);
		await sequelize.query(
			'CREATE INDEX "idx_message_created_at" ON "Messages"("createdAt")'
		);
		await sequelize.query(
			'CREATE INDEX "idx_message_is_read" ON "Messages"("isRead")'
		);

		console.log("Chat tables created successfully!");
	} catch (error) {
		console.error("Error creating chat tables:", error);
		throw error;
	}
}

// Execute if this script is run directly
if (require.main === module) {
	createChatTables()
		.then(() => {
			console.log("Script completed successfully");
			process.exit(0);
		})
		.catch((error) => {
			console.error("Script failed:", error);
			process.exit(1);
		});
}

module.exports = createChatTables;
