const express = require("express");
const cors = require("cors");
require("dotenv").config();
const {
	connectDB,
	createDatabaseIfNotExists,
	sequelize,
} = require("./config/database");
const User = require("./models/User"); // Import the User model

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// Ensure database is created, then sync models and start server
const startServer = async () => {
	try {
		await createDatabaseIfNotExists();
		await connectDB();

		// Ensure the User table is created before running the server
		await sequelize.sync({ alter: true });
		console.log("✅ Database synchronized. User table should now exist.");

		app.use("/api/users", require("./routes/userRoutes"));
		app.use("/api/stores", require("./routes/storeRoutes"));
		app.use("/api/products", require("./routes/productRoutes"));

		app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
	} catch (error) {
		console.error("❌ Server startup error:", error);
	}
};

startServer();
