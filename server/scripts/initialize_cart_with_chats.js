const { sequelize } = require("../config/config");
const { v4: uuidv4 } = require("uuid");
const { QueryTypes } = require("sequelize");

async function initializeCartWithChats(userId) {
	try {
		console.log(`Starting cart and chat initialization for user: ${userId}`);

		// Begin transaction
		const transaction = await sequelize.transaction();

		try {
			// Create a new cart
			console.log("Creating new cart...");
			const cartId = uuidv4();

			await sequelize.query(
				`
        INSERT INTO "Carts" (
          "id", "userId", "status", "subtotal", "tax", "discount", 
          "totalAmount", "requiresShipping", "createdAt", "updatedAt"
        ) VALUES (
          :cartId, :userId, 'active', 0, 0, 0, 
          0, true, NOW(), NOW()
        )
      `,
				{
					replacements: { cartId, userId },
					transaction,
				}
			);

			console.log(`New cart created with ID: ${cartId}`);

			// Get businesses to create chat sessions with
			const businesses = await sequelize.query(
				`
        SELECT b.id, b.name, b."userId" 
        FROM "Businesses" b
        JOIN "Users" u ON b."userId" = u.id
        LIMIT 2
      `,
				{
					type: sequelize.QueryTypes.SELECT,
					transaction,
				}
			);

			console.log(
				`Found ${businesses.length} businesses to create chat sessions with`
			);

			// Create chat sessions for each business
			for (const business of businesses) {
				console.log(`Creating chat session with business: ${business.name}`);

				// Create chat session
				const sessionId = uuidv4();
				const chatSession = await sequelize.query(
					`INSERT INTO "ChatSessions" (
						"id", "buyerId", "businessId", "cartId", "status", "lastMessageAt", "createdAt", "updatedAt"
					) VALUES (
						:sessionId, :buyerId, :businessId, :cartId, 'active', NOW(), NOW(), NOW()
					) RETURNING *`,
					{
						replacements: {
							sessionId: uuidv4(),
							buyerId: userId,
							businessId: business.id,
							cartId: cartId,
						},
						type: QueryTypes.INSERT,
					}
				);

				// Create welcome message (unread)
				const welcomeMessageId = uuidv4();
				await sequelize.query(
					`
          INSERT INTO "Messages" (
            "id", "chatSessionId", "senderId", "receiverId", "content",
            "messageType", "status", "createdAt", "updatedAt"
          ) VALUES (
            :messageId, :sessionId, :senderId, :receiverId, :content,
            'system', 'sent', NOW(), NOW()
          )
        `,
					{
						replacements: {
							messageId: welcomeMessageId,
							sessionId: sessionId,
							senderId: business.userId,
							receiverId: userId,
							content: `Welcome to ${business.name}! How can we help you today?`,
						},
						transaction,
					}
				);

				// Create a second message (read status)
				const secondMessageId = uuidv4();
				const secondMessageTime = new Date(Date.now() + 60000); // 1 minute later

				await sequelize.query(
					`
          INSERT INTO "Messages" (
            "id", "chatSessionId", "senderId", "receiverId", "content",
            "messageType", "status", "createdAt", "updatedAt"
          ) VALUES (
            :messageId, :sessionId, :senderId, :receiverId, :content,
            'text', 'read', :createdAt, :updatedAt
          )
        `,
					{
						replacements: {
							messageId: secondMessageId,
							sessionId,
							senderId: business.userId,
							receiverId: userId,
							content: "We have some special offers just for you!",
							createdAt: secondMessageTime,
							updatedAt: secondMessageTime,
						},
						transaction,
					}
				);

				console.log(
					`Created chat session with ID: ${sessionId} and 2 messages`
				);
			}

			// Commit transaction
			await transaction.commit();

			console.log(
				`Successfully created cart and ${businesses.length} chat sessions`
			);
			return {
				cartId,
				businessCount: businesses.length,
			};
		} catch (error) {
			// Rollback transaction on error
			await transaction.rollback();
			console.error("Error during initialization:", error);
			throw error;
		}
	} catch (error) {
		console.error("Fatal error:", error);
		throw error;
	}
}

// Execute the function if this script is run directly
if (require.main === module) {
	// Get userId from command line
	const userId = process.argv[2];

	if (!userId) {
		console.error("Please provide a userId as an argument");
		process.exit(1);
	}

	initializeCartWithChats(userId)
		.then((result) => {
			console.log(
				"Cart and chat sessions initialization completed successfully"
			);
			console.log(`New cart ID: ${result.cartId}`);
			console.log(`Chat sessions created: ${result.businessCount}`);
			process.exit(0);
		})
		.catch((error) => {
			console.error("Initialization failed:", error);
			process.exit(1);
		});
}

module.exports = initializeCartWithChats;
