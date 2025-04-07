require("dotenv").config();
const { db } = require("../models");

async function main() {
	try {
		const orders = await db.Order.findAll({
			include: [
				{
					model: db.User,
					attributes: ["id", "name", "email"],
				},
				{
					model: db.Business,
					attributes: ["id", "name"],
				},
			],
			order: [["createdAt", "DESC"]],
		});

		console.log("\nOrders:");
		orders.forEach((order) => {
			console.log("\nOrder ID:", order.id);
			console.log("Status:", order.status);
			console.log("Buyer:", order.User.name);
			console.log("Business:", order.Business.name);
			console.log("Created:", order.createdAt);
			console.log("-------------------");
		});

		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

main();
