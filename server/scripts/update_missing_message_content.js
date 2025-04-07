#!/usr/bin/env node

const { Sequelize } = require("sequelize");
require("dotenv").config();

const DATABASE_URL =
	process.env.DATABASE_URL || "postgres://postgres:@localhost:5432/tredit_test";

async function main() {
	console.log("Starting to update messages with missing content...");
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
			// Get messages with null content
			const messagesWithNullContent = await sequelize.query(
				`SELECT id, "chatSessionId", "createdAt" FROM "Messages" WHERE content IS NULL ORDER BY "createdAt"`,
				{ transaction, type: sequelize.QueryTypes.SELECT }
			);

			console.log(
				`Found ${messagesWithNullContent.length} messages with null content.`
			);

			if (messagesWithNullContent.length > 0) {
				// Define sample messages for our chat
				const messages = [
					{
						id: "9fa01224-e1ee-4b9b-9528-aaa8239baf6b",
						content:
							"I'm interested in your latest smartphones. Do you have the iPhone 15 Pro in stock? What's your best price?",
					},
					{
						id: "5157e9bf-d805-4e5e-a034-948aa6a65854",
						content:
							"Yes, we have the iPhone 15 Pro in stock in all colors. Our regular price is $999, but we're currently offering a special discount of 10% off, making it $899. We also include a free case and screen protector. Would you like me to reserve one for you?",
					},
					{
						id: "9a83e1dd-02d7-4a25-a311-0ae2a19ec956",
						content:
							"That sounds like a great offer. Can you confirm if it comes with a warranty? And do you have it in black color?",
					},
					{
						id: "b940cc03-1ba0-4fe0-8491-02b4dd6a1984",
						content:
							"Yes, absolutely! The iPhone 15 Pro comes with Apple's standard 1-year warranty, and we offer an additional 6-month warranty from our store. We have it in black, blue, silver, and gold colors. The black is our most popular model and we have plenty in stock. Would you like to proceed with the purchase?",
					},
				];

				for (const message of messagesWithNullContent) {
					const matchingMessage = messages.find((m) => m.id === message.id);

					if (matchingMessage) {
						// Update the message with the corresponding content
						await sequelize.query(
							`UPDATE "Messages" SET content = :content WHERE id = :id`,
							{
								transaction,
								replacements: {
									id: message.id,
									content: matchingMessage.content,
								},
							}
						);
						console.log(`Updated message ${message.id} with content`);
					} else {
						// If no matching message found, set a default message based on position
						let defaultContent = "Message content was not saved properly";

						await sequelize.query(
							`UPDATE "Messages" SET content = :content WHERE id = :id`,
							{
								transaction,
								replacements: {
									id: message.id,
									content: defaultContent,
								},
							}
						);
						console.log(`Updated message ${message.id} with default content`);
					}
				}
			}

			await transaction.commit();
			console.log("Successfully updated messages with missing content.");
		} catch (error) {
			await transaction.rollback();
			console.error("Error updating messages:", error);
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
