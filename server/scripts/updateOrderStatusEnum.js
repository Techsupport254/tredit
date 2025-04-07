const { sequelize } = require("../config/config");

async function updateOrderStatusEnum() {
	console.log("Starting Order status enum update...");
	const t = await sequelize.transaction();

	try {
		// Create new enum type
		await sequelize.query(
			`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Orders_status_new') THEN
                    CREATE TYPE "enum_Orders_status_new" AS ENUM (
                        'pending',
                        'processing',
                        'shipped',
                        'delivered',
                        'cancelled',
                        'disputed',
                        'resolved'
                    );
                END IF;
            END $$;
            `,
			{ transaction: t }
		);

		// Remove default value first
		await sequelize.query(
			`
            ALTER TABLE "Orders" ALTER COLUMN status DROP DEFAULT;
            `,
			{ transaction: t }
		);

		// Alter column type
		await sequelize.query(
			`
            ALTER TABLE "Orders" 
            ALTER COLUMN status TYPE "enum_Orders_status_new" 
            USING status::text::"enum_Orders_status_new";
            `,
			{ transaction: t }
		);

		// Set new default value
		await sequelize.query(
			`
            ALTER TABLE "Orders" ALTER COLUMN status SET DEFAULT 'pending'::"enum_Orders_status_new";
            `,
			{ transaction: t }
		);

		// Drop old enum type
		await sequelize.query(
			`
            DROP TYPE IF EXISTS "enum_Orders_status";
            `,
			{ transaction: t }
		);

		// Rename new enum type
		await sequelize.query(
			`
            ALTER TYPE "enum_Orders_status_new" RENAME TO "enum_Orders_status";
            `,
			{ transaction: t }
		);

		await t.commit();
		console.log("✅ Successfully updated Order status enum");
	} catch (error) {
		await t.rollback();
		console.error("❌ Error updating Order status enum:", error);
		throw error;
	}
}

// Run the update
updateOrderStatusEnum().catch(console.error);
