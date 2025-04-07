const { sequelize } = require("../config/config");

async function recreateCartTable() {
	try {
		console.log("Starting Cart table recreation process");

		// Begin transaction
		const transaction = await sequelize.transaction();

		try {
			// First, drop dependencies (like ChatSessions that reference Cart)
			console.log("Dropping ChatSessions table...");
			await sequelize.query(`DROP TABLE IF EXISTS "Messages" CASCADE;`, {
				transaction,
			});
			await sequelize.query(`DROP TABLE IF EXISTS "ChatSessions" CASCADE;`, {
				transaction,
			});

			// Drop CartItems that reference Cart
			console.log("Dropping CartItems table...");
			await sequelize.query(`DROP TABLE IF EXISTS "CartItems" CASCADE;`, {
				transaction,
			});

			// Now drop the Cart table
			console.log("Dropping Cart table...");
			await sequelize.query(`DROP TABLE IF EXISTS "Carts" CASCADE;`, {
				transaction,
			});

			// Create Cart table with proper structure
			console.log("Creating new Cart table...");
			await sequelize.query(
				`
        CREATE TABLE "Carts" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" UUID NOT NULL,
          "status" VARCHAR(20) NOT NULL DEFAULT 'active',
          "subtotal" DECIMAL(10, 2) DEFAULT 0,
          "tax" DECIMAL(10, 2) DEFAULT 0,
          "discount" DECIMAL(10, 2) DEFAULT 0,
          "totalAmount" DECIMAL(10, 2) DEFAULT 0,
          "couponCode" VARCHAR(50),
          "discountType" VARCHAR(20),
          "discountValue" DECIMAL(10, 2) DEFAULT 0,
          "requiresShipping" BOOLEAN DEFAULT TRUE,
          "shippingMethod" VARCHAR(50),
          "shippingCost" DECIMAL(10, 2) DEFAULT 0,
          "shippingAddress" JSONB,
          "estimatedDeliveryDate" TIMESTAMP WITH TIME ZONE,
          "notes" TEXT,
          "metadata" JSONB,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `,
				{ transaction }
			);

			// Create CartItems table
			console.log("Creating new CartItems table...");
			await sequelize.query(
				`
        CREATE TABLE "CartItems" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "cartId" UUID NOT NULL REFERENCES "Carts"("id") ON DELETE CASCADE,
          "type" VARCHAR(20) NOT NULL,
          "itemId" UUID NOT NULL,
          "variantId" UUID,
          "quantity" INTEGER NOT NULL DEFAULT 1,
          "unitPrice" DECIMAL(10, 2) NOT NULL,
          "subtotal" DECIMAL(10, 2) NOT NULL,
          "tax" JSONB,
          "selectedOptions" JSONB,
          "customizations" JSONB,
          "giftWrapping" BOOLEAN DEFAULT FALSE,
          "giftMessage" TEXT,
          "notes" TEXT,
          "businessId" UUID,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `,
				{ transaction }
			);

			// Create enum types if they don't exist
			try {
				await sequelize.query(
					`DO $$ BEGIN CREATE TYPE "message_type" AS ENUM ('text', 'image', 'file', 'system', 'price_acceptance'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
					{ transaction }
				);
			} catch (error) {
				console.log("message_type enum type already exists, skipping...");
			}

			try {
				await sequelize.query(
					`DO $$ BEGIN CREATE TYPE "chat_type" AS ENUM ('product', 'service'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
					{ transaction }
				);
			} catch (error) {
				console.log("chat_type enum type already exists, skipping...");
			}

			try {
				await sequelize.query(
					`DO $$ BEGIN CREATE TYPE "message_status" AS ENUM ('sent', 'delivered', 'read'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
					{ transaction }
				);
			} catch (error) {
				console.log("message_status enum type already exists, skipping...");
			}

			// Create ChatSessions table
			console.log("Creating new ChatSessions table...");
			await sequelize.query(
				`
        CREATE TABLE "ChatSessions" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "buyerId" UUID NOT NULL,
          "businessId" UUID NOT NULL,
          "cartId" UUID REFERENCES "Carts"("id") ON DELETE SET NULL,
          "serviceCartId" UUID,
          "type" chat_type NOT NULL DEFAULT 'product',
          "status" VARCHAR(20) NOT NULL DEFAULT 'active',
          "agreedPrice" DECIMAL(10, 2),
          "agreedDeliveryDate" TIMESTAMP WITH TIME ZONE,
          "deliveryLocation" JSONB,
          "lastMessageAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "metadata" JSONB,
          "ipfsCid" VARCHAR(255),
          "ipfsUrl" VARCHAR(255),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `,
				{ transaction }
			);

			// Create Messages table with content field
			console.log("Creating new Messages table...");
			await sequelize.query(
				`
        CREATE TABLE "Messages" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "chatSessionId" UUID NOT NULL REFERENCES "ChatSessions"("id") ON DELETE CASCADE,
          "senderId" UUID,
          "receiverId" UUID,
          "content" TEXT NOT NULL,
          "messageType" message_type NOT NULL DEFAULT 'text',
          "status" message_status NOT NULL DEFAULT 'sent',
          "attachments" JSONB,
          "ipfsCid" VARCHAR(255),
          "ipfsUrl" VARCHAR(255),
          "isCompliant" BOOLEAN DEFAULT TRUE,
          "complianceDetails" JSONB,
          "metadata" JSONB,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `,
				{ transaction }
			);

			// Add indexes for better performance
			console.log("Adding indexes...");
			await sequelize.query(
				`CREATE INDEX "idx_cart_user" ON "Carts"("userId");`,
				{ transaction }
			);
			await sequelize.query(
				`CREATE INDEX "idx_cartitem_cart" ON "CartItems"("cartId");`,
				{ transaction }
			);
			await sequelize.query(
				`CREATE INDEX "idx_chat_session_buyer" ON "ChatSessions"("buyerId");`,
				{ transaction }
			);
			await sequelize.query(
				`CREATE INDEX "idx_chat_session_business" ON "ChatSessions"("businessId");`,
				{ transaction }
			);
			await sequelize.query(
				`CREATE INDEX "idx_chat_session_cart" ON "ChatSessions"("cartId");`,
				{ transaction }
			);
			await sequelize.query(
				`CREATE INDEX "idx_message_session" ON "Messages"("chatSessionId");`,
				{ transaction }
			);

			console.log("Committing transaction...");
			await transaction.commit();
			console.log("Tables recreated successfully!");

			return true;
		} catch (error) {
			console.error("Error during table recreation:", error);
			await transaction.rollback();
			throw error;
		}
	} catch (error) {
		console.error("Fatal error:", error);
		throw error;
	}
}

// Execute the function if this script is run directly
if (require.main === module) {
	recreateCartTable()
		.then(() => {
			console.log("Cart table recreation completed successfully");
			process.exit(0);
		})
		.catch((error) => {
			console.error("Cart table recreation failed:", error);
			process.exit(1);
		});
}

module.exports = recreateCartTable;
