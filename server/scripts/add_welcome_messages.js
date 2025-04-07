#!/usr/bin/env node

const { Sequelize } = require("sequelize");
require("dotenv").config();

const DATABASE_URL =
	process.env.DATABASE_URL || "postgres://postgres:@localhost:5432/tredit_test";

async function main() {
	console.log("Starting to add welcome messages...");
	const sequelize = new Sequelize(DATABASE_URL, {
		logging: false,
		dialectOptions: {
			ssl:
				process.env.DB_SSL === "true"
					? {
							require: true,
							rejectUnauthorized: false,
					  }
					: false,
		},
	});

	try {
		await sequelize.authenticate();
		console.log("Database connection established successfully.");

		const transaction = await sequelize.transaction();

		try {
			// Get all chat sessions
			const chatSessions = await sequelize.query(
				`SELECT cs.id, cs."buyerId", cs."businessId", b.name as "businessName"
				 FROM "ChatSessions" cs
				 JOIN "Businesses" b ON cs."businessId" = b.id
				 WHERE cs."lastMessageAt" IS NULL`,
				{ type: sequelize.QueryTypes.SELECT }
			);

			console.log(`Found ${chatSessions.length} chat sessions.`);

			// For each chat session, check if there are any messages, and if not, add a welcome message
			for (const session of chatSessions) {
				const messageCount = await sequelize.query(
					`SELECT COUNT(*) FROM "Messages" WHERE "chatSessionId" = :sessionId`,
					{
						type: sequelize.QueryTypes.SELECT,
						replacements: { sessionId: session.id },
					}
				);

				// If messageCount[0].count is "0" or 0, add welcome messages
				if (messageCount[0].count == 0) {
					console.log(`Adding welcome messages to chat session ${session.id}`);

					// Get business name or fallback
					const businessName = session.businessName || "Business";

					// System welcome message
					await sequelize.query(
						`INSERT INTO "Messages" ("id", "chatSessionId", "senderId", "receiverId", 
              "content", "messageType", "status", "createdAt", "updatedAt") 
             VALUES (
               uuid_generate_v4(), 
               :sessionId, 
               :businessId, 
               :buyerId,
               :systemContent,
               'system',
               'sent',
               NOW(),
               NOW()
             )`,
						{
							replacements: {
								sessionId: session.id,
								businessId: session.businessId,
								buyerId: session.buyerId,
								systemContent: `Welcome to your chat with ${businessName}. You can discuss product details, negotiate prices, and arrange delivery.`,
							},
						}
					);

					// Seller welcome message
					await sequelize.query(
						`INSERT INTO "Messages" ("id", "chatSessionId", "senderId", "receiverId", 
              "content", "messageType", "status", "createdAt", "updatedAt") 
             VALUES (
               uuid_generate_v4(), 
               :sessionId, 
               :businessId, 
               :buyerId,
               :sellerContent,
               'text',
               'sent',
               NOW() + INTERVAL '1 minute',
               NOW() + INTERVAL '1 minute'
             )`,
						{
							replacements: {
								sessionId: session.id,
								businessId: session.businessId,
								buyerId: session.buyerId,
								sellerContent: `Hi there! Thank you for your interest in our products. How can I assist you today?`,
							},
						}
					);

					// Update the lastMessageAt timestamp for the chat session
					await sequelize.query(
						`UPDATE "ChatSessions" 
             SET "lastMessageAt" = NOW() + INTERVAL '1 minute'
             WHERE id = :sessionId`,
						{
							replacements: { sessionId: session.id },
						}
					);
				} else {
					console.log(
						`Chat session ${session.id} already has ${messageCount[0].count} messages.`
					);

					// Update any existing messages with null content
					await sequelize.query(
						`UPDATE "Messages"
             SET "content" = CASE
                WHEN "messageType" = 'system' THEN 'Welcome to your chat. You can discuss product details, negotiate prices, and arrange delivery.'
                WHEN "messageType" = 'text' THEN 'Hi there! Thank you for your interest in our products. How can I assist you today?'
                ELSE 'Message content'
              END
             WHERE "chatSessionId" = :sessionId AND "content" IS NULL`,
						{
							replacements: { sessionId: session.id },
						}
					);
				}
			}

			await transaction.commit();
			console.log("Successfully added welcome messages.");
		} catch (error) {
			await transaction.rollback();
			console.error("Error adding welcome messages:", error);
			throw error;
		}
	} catch (error) {
		console.error("Error:", error);
		throw error;
	} finally {
		await sequelize.close();
	}
}

// Run the script
main()
	.then(() => {
		console.log("Script completed successfully");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Script failed:", error);
		process.exit(1);
	});
