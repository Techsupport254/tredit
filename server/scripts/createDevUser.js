require("dotenv").config();
const { sequelize } = require("../config/config");
const { db } = require("../models");
const { v4: uuidv4 } = require("uuid");

async function createDevUser() {
	try {
		await sequelize.authenticate();
		console.log("Database connection authenticated successfully.");

		// Create development user with generated UUID
		const devUser = await db.User.create({
			id: uuidv4(),
			name: "Development User",
			email: "dev@example.com",
			walletAddress: "0xe91388a436659f2c0b42bcea6f7a9b7004f2f265",
			role: "superadmin",
			status: "active",
			profileImage: "",
			bio: "",
			gender: "prefer_not_to_say",
			dob: new Date(),
			phoneNumber: "+1234567890",
			location: {
				country: "",
				state: "",
				city: "",
				address: "",
				postalCode: "",
				coordinates: {
					latitude: null,
					longitude: null,
				},
			},
			preferences: {
				theme: "light",
				notifications: {
					email: true,
					push: true,
				},
				language: "en",
			},
			metadata: {
				businesses: [],
			},
		});

		console.log("Development user created successfully:", devUser.toJSON());
	} catch (error) {
		console.error("Error creating development user:", error);
	} finally {
		await sequelize.close();
	}
}

createDevUser();
