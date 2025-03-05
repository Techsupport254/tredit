const { Sequelize } = require("sequelize");
const { Client } = require("pg"); // PostgreSQL client for database creation
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 5432;
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "tredit";
const USE_SSL = process.env.DB_SSL === "true"; // Enable SSL if needed

// Initialize Sequelize with configuration
const sequelize = new Sequelize({
	dialect: "postgres",
	host: DB_HOST,
	port: DB_PORT,
	username: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME,
	logging: false,
	dialectOptions: {
		ssl: USE_SSL
			? {
					require: true,
					rejectUnauthorized: false,
			  }
			: false,
	},
});

// Test the connection
sequelize
	.authenticate()
	.then(() => {
		console.log("Database connection has been established successfully.");
	})
	.catch((err) => {
		console.error("Unable to connect to the database:", err);
	});

// Ensure the database exists before connecting with Sequelize
async function createDatabaseIfNotExists() {
	try {
		console.log(`[DB] Checking if database "${DB_NAME}" exists...`);

		// Connect to PostgreSQL without specifying a database first
		const clientConfig = {
			host: DB_HOST,
			port: DB_PORT,
			user: DB_USER,
			password: DB_PASSWORD,
			database: "postgres", // Default PostgreSQL database
		};

		if (USE_SSL) {
			clientConfig.ssl = { rejectUnauthorized: false };
			console.log("[DB] SSL enabled for database existence check.");
		}

		const client = new Client(clientConfig);
		await client.connect();

		// Check if database exists
		const res = await client.query(
			`SELECT 1 FROM pg_database WHERE datname = $1`,
			[DB_NAME]
		);
		if (res.rowCount === 0) {
			console.log(`🛠️ Creating database: ${DB_NAME}`);
			await client.query(`CREATE DATABASE ${DB_NAME}`);
		} else {
			console.log(`✅ Database '${DB_NAME}' already exists.`);
		}

		await client.end();
	} catch (error) {
		console.error(
			`[DB ERROR] Failed to ensure database "${DB_NAME}" exists:`,
			error
		);
		throw error;
	}
}

async function connectDB() {
	try {
		await createDatabaseIfNotExists();
		await sequelize.authenticate();
		console.log("[DB] Connection to the database established successfully.");

		// Force sync all models
		console.log("[DB] Forcing database schema synchronization...");
		await sequelize.sync({ force: true });
		console.log("[DB] Database schema synchronized successfully.");

		return sequelize;
	} catch (error) {
		console.error("[DB ERROR] Unable to connect to the database:", error);
		throw error;
	}
}

// Export the Sequelize instance and functions
module.exports = { sequelize, connectDB, createDatabaseIfNotExists };
