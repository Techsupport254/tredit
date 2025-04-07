const { sequelize } = require("../config/config");

async function syncDatabase() {
	try {
		console.log("Starting database sync...");
		await sequelize.sync({ force: true });
		console.log("✅ Database synchronized successfully");
	} catch (error) {
		console.error("❌ Error synchronizing database:", error);
		throw error;
	} finally {
		await sequelize.close();
	}
}

syncDatabase();
