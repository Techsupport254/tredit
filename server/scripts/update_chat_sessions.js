const { sequelize } = require("../models");

async function updateChatSessions() {
	try {
		console.log("Starting ChatSessions table update...");

		// Create chat_type enum if it doesn't exist
		try {
			await sequelize.query(
				`CREATE TYPE "chat_type" AS ENUM ('product', 'service');`
			);
			console.log("Created chat_type enum");
		} catch (error) {
			console.log("chat_type enum already exists, skipping...");
		}

		// Drop existing ChatSessions table if it exists
		try {
			await sequelize.query(`DROP TABLE IF EXISTS "ChatSessions" CASCADE;`);
			console.log("Dropped existing ChatSessions table");
		} catch (error) {
			console.log("Error dropping ChatSessions table:", error);
		}

		// Create new ChatSessions table
		await sequelize.query(`
      CREATE TABLE "ChatSessions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "buyerId" UUID NOT NULL,
        "businessId" UUID NOT NULL,
        "cartId" UUID REFERENCES "Carts"("id") ON DELETE SET NULL,
        "serviceCartId" UUID REFERENCES "ServiceCarts"("id") ON DELETE SET NULL,
        "orderId" UUID REFERENCES "Orders"("id") ON DELETE SET NULL,
        "serviceOrderId" UUID REFERENCES "ServiceOrders"("id") ON DELETE SET NULL,
        "type" chat_type NOT NULL DEFAULT 'product',
        "status" VARCHAR(20) NOT NULL DEFAULT 'active',
        "agreedPrice" DECIMAL(10, 2),
        "agreedDeliveryDate" TIMESTAMP WITH TIME ZONE,
        "deliveryLocation" JSONB,
        "lastMessageAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "metadata" JSONB,
        "ipfsCid" VARCHAR(255),
        "ipfsUrl" VARCHAR(255),
        "securityKey" VARCHAR(255),
        "milestoneContext" JSONB,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "deletedAt" TIMESTAMP WITH TIME ZONE
      );
    `);
		console.log("Created new ChatSessions table");

		// Add indexes
		await sequelize.query(
			`CREATE INDEX "idx_chat_session_buyer" ON "ChatSessions"("buyerId");`
		);
		await sequelize.query(
			`CREATE INDEX "idx_chat_session_business" ON "ChatSessions"("businessId");`
		);
		await sequelize.query(
			`CREATE INDEX "idx_chat_session_cart" ON "ChatSessions"("cartId");`
		);
		await sequelize.query(
			`CREATE INDEX "idx_chat_session_service_cart" ON "ChatSessions"("serviceCartId");`
		);
		await sequelize.query(
			`CREATE INDEX "idx_chat_session_order" ON "ChatSessions"("orderId");`
		);
		await sequelize.query(
			`CREATE INDEX "idx_chat_session_service_order" ON "ChatSessions"("serviceOrderId");`
		);
		await sequelize.query(
			`CREATE INDEX "idx_chat_session_deleted_at" ON "ChatSessions"("deletedAt");`
		);
		console.log("Added indexes");

		console.log("ChatSessions table update completed successfully!");
		return true;
	} catch (error) {
		console.error("Error updating ChatSessions table:", error);
		throw error;
	}
}

// Execute the function if this script is run directly
if (require.main === module) {
	updateChatSessions()
		.then(() => {
			console.log("ChatSessions table update completed successfully");
			process.exit(0);
		})
		.catch((error) => {
			console.error("ChatSessions table update failed:", error);
			process.exit(1);
		});
}

module.exports = updateChatSessions;
