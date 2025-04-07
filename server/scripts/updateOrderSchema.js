const { sequelize } = require("../config/config");

async function updateOrderSchema() {
	try {
		console.log("Starting Order schema update...");

		// Begin transaction
		const transaction = await sequelize.transaction();

		try {
			// Update the billingAddress column to be nullable
			await sequelize.query(
				`ALTER TABLE "Orders" ALTER COLUMN "billingAddress" DROP NOT NULL;`,
				{ transaction }
			);

			console.log("✅ Order schema updated successfully");
			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	} catch (error) {
		console.error("❌ Error updating Order schema:", error);
		throw error;
	} finally {
		await sequelize.close();
	}
}

updateOrderSchema();
