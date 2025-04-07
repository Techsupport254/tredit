require("dotenv").config();
const { sequelize } = require("../config/config");
const { db } = require("../models");
const { USER_CONSTANTS } = require("../config/constants");

async function createSystemUser() {
	try {
		await sequelize.authenticate();
		console.log("Database connection authenticated successfully.");

		// Check if system user already exists
		const existingSystemUser = await db.User.findByPk(
			"00000000-0000-0000-0000-000000000000"
		);
		if (existingSystemUser) {
			console.log("System user already exists:", existingSystemUser.toJSON());
			return;
		}

		// Create system user
		const systemUser = await db.User.create({
			id: "00000000-0000-0000-0000-000000000000",
			name: "System",
			email: "system@tredit.com",
			walletAddress: "0x0000000000000000000000000000000000000000",
			role: USER_CONSTANTS.ROLES.SYSTEM,
			status: USER_CONSTANTS.STATUS.ACTIVE,
			profileImage: "",
			bio: "System user for automated messages",
			gender: "prefer_not_to_say",
			dob: new Date(),
			phoneNumber: "+10000000000",
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
					email: false,
					push: false,
				},
				language: "en",
			},
			metadata: {
				businesses: [],
			},
		});

		console.log("System user created successfully:", systemUser.toJSON());
	} catch (error) {
		console.error("Error creating system user:", error);
	} finally {
		await sequelize.close();
	}
}

createSystemUser();
