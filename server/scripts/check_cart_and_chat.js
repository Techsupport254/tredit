const { sequelize } = require("../models");
const { ProductCart, ChatSession } = require("../models");

async function checkCartAndChat() {
	try {
		console.log("Setting up database connection...");
		await sequelize.authenticate();
		console.log("Database connection established successfully.");

		const cartId = "e9f63772-cec8-4ea6-a218-f9f7d476f170";
		console.log(`\nChecking cart with ID: ${cartId}`);

		// Get cart details
		const cart = await ProductCart.findByPk(cartId);
		if (!cart) {
			console.log("Cart not found");
			return;
		}

		console.log("\nCart details:");
		console.log(JSON.stringify(cart.toJSON(), null, 2));

		// Check for associated chat session
		const chatSession = await ChatSession.findOne({
			where: { cartId },
		});

		if (!chatSession) {
			console.log("\nNo chat session found for this cart");
			return;
		}

		console.log("\nChat session details:");
		console.log(JSON.stringify(chatSession.toJSON(), null, 2));
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await sequelize.close();
	}
}

checkCartAndChat();
