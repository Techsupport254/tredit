#!/usr/bin/env node

const { Sequelize } = require("sequelize");
require("dotenv").config();

const DATABASE_URL =
	process.env.DATABASE_URL || "postgres://postgres:@localhost:5432/tredit_test";

async function main() {
	console.log("Starting enum type fix process...");
	const sequelize = new Sequelize(DATABASE_URL, {
		logging: console.log,
		dialectOptions: {
			ssl:
				process.env.DB_SSL === "true"
					? {
							require: true,
							rejectUnauthorized: false,
					  }
					: false,
		},
	});

	try {
		await sequelize.authenticate();
		console.log("Database connection established successfully.");

		const transaction = await sequelize.transaction();

		try {
			// 1. First check if any of the old enum types exist
			console.log("Checking for existing enum types...");
			const enumTypes = await sequelize.query(
				`
        SELECT typname FROM pg_type 
        WHERE typname IN (
          'enum_carts_status', 'enum_carts_discounttype', 
          'enum_chatsessions_status', 'message_type', 'message_status',
          'enum_Carts_status', 'enum_Carts_discountType', 
          'enum_ChatSessions_status', 'enum_Messages_messageType', 'enum_Messages_status'
        )
      `,
				{ transaction, type: sequelize.QueryTypes.SELECT }
			);

			console.log(
				"Found enum types:",
				enumTypes.map((t) => t.typname).join(", ")
			);

			// 2. Create the new enum types if they don't exist
			console.log("Creating new enum types if needed...");

			// For Cart status
			await sequelize.query(
				`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Carts_status') THEN
            CREATE TYPE "enum_Carts_status" AS ENUM ('active', 'converted', 'abandoned');
          END IF;
        END
        $$;
      `,
				{ transaction }
			);

			// For Cart discountType
			await sequelize.query(
				`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Carts_discountType') THEN
            CREATE TYPE "enum_Carts_discountType" AS ENUM ('percentage', 'fixed');
          END IF;
        END
        $$;
      `,
				{ transaction }
			);

			// For ChatSession status
			await sequelize.query(
				`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_ChatSessions_status') THEN
            CREATE TYPE "enum_ChatSessions_status" AS ENUM ('active', 'pending_payment', 'completed', 'disputed', 'closed');
          END IF;
        END
        $$;
      `,
				{ transaction }
			);

			// For Message messageType
			await sequelize.query(
				`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Messages_messageType') THEN
            CREATE TYPE "enum_Messages_messageType" AS ENUM ('text', 'system', 'image', 'file', 'price_proposal', 'price_acceptance', 'delivery_details', 'security_key', 'dispute');
          END IF;
        END
        $$;
      `,
				{ transaction }
			);

			// For Message status
			await sequelize.query(
				`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Messages_status') THEN
            CREATE TYPE "enum_Messages_status" AS ENUM ('sent', 'delivered', 'read', 'stored_ipfs');
          END IF;
        END
        $$;
      `,
				{ transaction }
			);

			console.log("Enum types created or verified");

			// 3. Check for tables that need column updates
			console.log("Checking for tables that need column updates...");

			// Check Carts table
			const cartsStatusInfo = await sequelize.query(
				`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'Carts' AND column_name = 'status'
      `,
				{ transaction, type: sequelize.QueryTypes.SELECT }
			);

			const cartsDiscountTypeInfo = await sequelize.query(
				`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'Carts' AND column_name = 'discountType'
      `,
				{ transaction, type: sequelize.QueryTypes.SELECT }
			);

			// Check ChatSessions table
			const chatSessionsStatusInfo = await sequelize.query(
				`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'ChatSessions' AND column_name = 'status'
      `,
				{ transaction, type: sequelize.QueryTypes.SELECT }
			);

			// Check Messages table
			const messagesTypeInfo = await sequelize.query(
				`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'Messages' AND column_name = 'messageType'
      `,
				{ transaction, type: sequelize.QueryTypes.SELECT }
			);

			const messagesStatusInfo = await sequelize.query(
				`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'Messages' AND column_name = 'status'
      `,
				{ transaction, type: sequelize.QueryTypes.SELECT }
			);

			// 4. Now update columns if needed
			console.log("Updating columns to use correct enum types...");

			// Update Carts status column if needed
			if (
				cartsStatusInfo.length > 0 &&
				cartsStatusInfo[0].udt_name !== "enum_Carts_status"
			) {
				console.log(
					`Fixing Carts status column (current type: ${cartsStatusInfo[0].udt_name})`
				);

				// Convert to TEXT first
				await sequelize.query(
					`
          ALTER TABLE "Carts" 
          ALTER COLUMN "status" TYPE TEXT
        `,
					{ transaction }
				);

				// Then to the correct enum
				await sequelize.query(
					`
          ALTER TABLE "Carts" 
          ALTER COLUMN "status" TYPE "enum_Carts_status" 
          USING "status"::"enum_Carts_status"
        `,
					{ transaction }
				);

				// Set default again
				await sequelize.query(
					`
          ALTER TABLE "Carts" 
          ALTER COLUMN "status" SET DEFAULT 'active'
        `,
					{ transaction }
				);
			}

			// Update Carts discountType column if needed
			if (
				cartsDiscountTypeInfo.length > 0 &&
				cartsDiscountTypeInfo[0].udt_name !== "enum_Carts_discountType"
			) {
				console.log(
					`Fixing Carts discountType column (current type: ${cartsDiscountTypeInfo[0].udt_name})`
				);

				// Convert to TEXT first
				await sequelize.query(
					`
          ALTER TABLE "Carts" 
          ALTER COLUMN "discountType" TYPE TEXT
        `,
					{ transaction }
				);

				// Then to the correct enum
				await sequelize.query(
					`
          ALTER TABLE "Carts" 
          ALTER COLUMN "discountType" TYPE "enum_Carts_discountType" 
          USING 
            CASE 
              WHEN "discountType" IS NULL THEN NULL
              ELSE "discountType"::"enum_Carts_discountType"
            END
        `,
					{ transaction }
				);
			}

			// Update ChatSessions status column if needed
			if (
				chatSessionsStatusInfo.length > 0 &&
				chatSessionsStatusInfo[0].udt_name !== "enum_ChatSessions_status"
			) {
				console.log(
					`Fixing ChatSessions status column (current type: ${chatSessionsStatusInfo[0].udt_name})`
				);

				// Convert to TEXT first
				await sequelize.query(
					`
          ALTER TABLE "ChatSessions" 
          ALTER COLUMN "status" TYPE TEXT
        `,
					{ transaction }
				);

				// Then to the correct enum
				await sequelize.query(
					`
          ALTER TABLE "ChatSessions" 
          ALTER COLUMN "status" TYPE "enum_ChatSessions_status" 
          USING "status"::"enum_ChatSessions_status"
        `,
					{ transaction }
				);

				// Set default again
				await sequelize.query(
					`
          ALTER TABLE "ChatSessions" 
          ALTER COLUMN "status" SET DEFAULT 'active'
        `,
					{ transaction }
				);
			}

			// Update Messages messageType column if needed
			if (
				messagesTypeInfo.length > 0 &&
				messagesTypeInfo[0].udt_name !== "enum_Messages_messageType"
			) {
				console.log(
					`Fixing Messages messageType column (current type: ${messagesTypeInfo[0].udt_name})`
				);

				// Convert to TEXT first
				await sequelize.query(
					`
          ALTER TABLE "Messages" 
          ALTER COLUMN "messageType" TYPE TEXT
        `,
					{ transaction }
				);

				// Then to the correct enum
				await sequelize.query(
					`
          ALTER TABLE "Messages" 
          ALTER COLUMN "messageType" TYPE "enum_Messages_messageType" 
          USING "messageType"::"enum_Messages_messageType"
        `,
					{ transaction }
				);

				// Set default again
				await sequelize.query(
					`
          ALTER TABLE "Messages" 
          ALTER COLUMN "messageType" SET DEFAULT 'text'
        `,
					{ transaction }
				);
			}

			// Update Messages status column if needed
			if (
				messagesStatusInfo.length > 0 &&
				messagesStatusInfo[0].udt_name !== "enum_Messages_status"
			) {
				console.log(
					`Fixing Messages status column (current type: ${messagesStatusInfo[0].udt_name})`
				);

				// Convert to TEXT first
				await sequelize.query(
					`
          ALTER TABLE "Messages" 
          ALTER COLUMN "status" TYPE TEXT
        `,
					{ transaction }
				);

				// Then to the correct enum
				await sequelize.query(
					`
          ALTER TABLE "Messages" 
          ALTER COLUMN "status" TYPE "enum_Messages_status" 
          USING "status"::"enum_Messages_status"
        `,
					{ transaction }
				);

				// Set default again
				await sequelize.query(
					`
          ALTER TABLE "Messages" 
          ALTER COLUMN "status" SET DEFAULT 'sent'
        `,
					{ transaction }
				);
			}

			await transaction.commit();
			console.log("Successfully fixed enum types in the database");
		} catch (error) {
			await transaction.rollback();
			console.error("Error fixing enum types:", error);
			throw error;
		}
	} catch (error) {
		console.error("Error:", error);
		throw error;
	} finally {
		await sequelize.close();
	}
}

// Run the script
main()
	.then(() => {
		console.log("Script completed successfully");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Script failed:", error);
		process.exit(1);
	});
