const {
	sequelize,
	ProductCart,
	ProductCartItem,
	Product,
	Business,
	User,
	ChatSession,
	Message,
} = require("../models");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");

async function recreateCart(userId) {
	try {
		console.log(`Starting cart recreation for user: ${userId}`);

		// Begin transaction
		const transaction = await sequelize.transaction();

		try {
			// 1. Delete existing active cart for the user
			console.log("Deleting existing cart...");
			await ProductCart.destroy({
				where: {},
				transaction,
			});

			// 2. Create new cart
			console.log("Creating new cart...");
			const newCart = await ProductCart.create(
				{
					userId: userId,
					status: "active",
					subtotal: 0,
					tax: 0,
					shippingCost: 0,
					discount: 0,
					totalAmount: 0,
					currency: "KES",
					requiresShipping: true,
					lastActivity: new Date(),
				},
				{ transaction }
			);

			console.log(`New cart created with ID: ${newCart.id}`);

			// 3. Get all businesses for creating chat sessions
			const businesses = await Business.findAll({
				include: [
					{
						model: User,
						as: "owner",
						attributes: ["id", "name", "email"],
					},
				],
				limit: 2, // Only create sessions with two businesses for testing
				transaction,
			});

			console.log(
				`Found ${businesses.length} businesses to create chat sessions with`
			);

			// 4. Initialize chat sessions for each business
			const chatSessions = [];

			for (const business of businesses) {
				console.log(`Creating chat session with business: ${business.name}`);

				// Create chat session
				const sessionId = uuidv4();
				const chatSession = await ChatSession.create(
					{
						id: sessionId,
						buyerId: userId,
						businessId: business.id,
						cartId: newCart.id,
						status: "active",
						lastMessageAt: new Date(),
					},
					{ transaction }
				);

				// Create welcome message (status: unread)
				const welcomeMessage = await Message.create(
					{
						chatSessionId: sessionId,
						content: `Welcome to ${business.name}! How can we help you today?`,
						messageType: "system",
						senderId: userId,
						receiverId: userId,
						status: "sent",
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					{ transaction }
				);

				// Create a second message from the business (status: read)
				const secondMessage = await Message.create(
					{
						chatSessionId: sessionId,
						content: `We have some special offers just for you!`,
						messageType: "text",
						senderId: business.id,
						receiverId: userId,
						status: "read",
						createdAt: new Date(Date.now() + 60000),
						updatedAt: new Date(Date.now() + 60000),
					},
					{ transaction }
				);

				chatSessions.push({
					...chatSession.toJSON(),
					messages: [welcomeMessage.toJSON(), secondMessage.toJSON()],
				});

				console.log(`Created chat session with ID: ${sessionId}`);
			}

			// Commit transaction
			await transaction.commit();

			console.log(
				`Cart and ${chatSessions.length} chat sessions created successfully`
			);
			return { cart: newCart, chatSessions };
		} catch (error) {
			// Rollback transaction on error
			await transaction.rollback();
			throw error;
		}
	} catch (error) {
		console.error("Error recreating cart:", error);
		throw error;
	}
}

// Run the function if this script is executed directly
if (require.main === module) {
	// You need to pass the userId when running this script
	const userId = process.argv[2];

	if (!userId) {
		console.error("Please provide a userId as an argument");
		process.exit(1);
	}

	recreateCart(userId)
		.then((result) => {
			console.log("Script completed successfully");
			console.log(`New cart ID: ${result.cart.id}`);
			console.log(`Chat sessions created: ${result.chatSessions.length}`);
			process.exit(0);
		})
		.catch((err) => {
			console.error("Script failed:", err);
			process.exit(1);
		});
}

module.exports = recreateCart;
