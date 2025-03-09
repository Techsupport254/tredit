require("dotenv").config();
const { User, Store } = require("../models");
const { sequelize } = require("../config/database");

const TEST_WALLET = "0x742d35cc6634c0532925a3b844bc454e4438f44e";

const createTestUser = async () => {
	try {
		await sequelize.authenticate();
		console.log("Connected to database");

		const [user, created] = await User.findOrCreate({
			where: { walletAddress: TEST_WALLET.toLowerCase() },
			defaults: {
				role: "vendor",
				name: "Test User",
				email: "test@example.com",
				isVerified: true,
			},
		});

		if (created) {
			console.log("Created test user:", user.toJSON());

			// Create a default store for the user
			const store = await Store.create({
				ownerAddress: user.walletAddress,
				name: "Test Store",
				description: "A test store",
				category: "digital",
				settings: {
					youtube: {
						enabled: false,
						autoSync: false,
					},
				},
			});
			console.log("Created test store:", store.toJSON());
		} else {
			console.log("Test user already exists:", user.toJSON());
		}

		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
};

createTestUser();
