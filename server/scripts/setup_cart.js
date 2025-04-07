const { sequelize } = require("../models");
const {
	ProductCart,
	ProductCartItem,
	Product,
	ProductVariant,
	User,
	Business,
} = require("../models");
const { v4: uuidv4 } = require("uuid");

async function setupCart() {
	try {
		console.log("Setting up database connection...");
		await sequelize.authenticate();
		console.log("Database connection established successfully.");

		// Create or find test user
		const [user] = await User.findOrCreate({
			where: { id: "f00dde05-0d04-4175-9fa4-5109dcba11f4" },
			defaults: {
				name: "Test User",
				email: "test@example.com",
				walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
			},
		});

		// Create or find test business
		const [business] = await Business.findOrCreate({
			where: { id: "920c819a-eaa3-45c1-b1ad-01f1d72844b2" },
			defaults: {
				name: "Test Business",
				category: "electronics",
				type: "retail",
			},
		});

		// Create or find test product
		const productId = uuidv4();
		const [product] = await Product.findOrCreate({
			where: { id: productId },
			defaults: {
				name: "Test Product",
				description: "A test product",
				category: "electronics",
				brand: "Test Brand",
				businessId: business.id,
			},
		});

		// Create or find test variant
		const variantId = uuidv4();
		const [variant] = await ProductVariant.findOrCreate({
			where: { id: variantId },
			defaults: {
				productId: product.id,
				name: "Test Variant",
				price: 100,
				stock: 10,
			},
		});

		// Create cart
		const cart = await ProductCart.create({
			id: "e9f63772-cec8-4ea6-a218-f9f7d476f170",
			userId: user.id,
			businessId: business.id,
			status: "active",
		});

		// Add item to cart
		await ProductCartItem.create({
			cartId: cart.id,
			productId: product.id,
			variantId: variant.id,
			quantity: 1,
			price: variant.price,
		});

		console.log("\nCart created successfully:");
		console.log(JSON.stringify(cart.toJSON(), null, 2));
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await sequelize.close();
	}
}

setupCart();
