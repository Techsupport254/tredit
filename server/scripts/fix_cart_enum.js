const { sequelize } = require("../config/config");

async function fixCartEnumIssue() {
	try {
		console.log("Starting Cart table enum fix");

		// Begin transaction
		const transaction = await sequelize.transaction();

		try {
			// Check current table structure
			console.log("Checking enum_Carts_status values...");

			// Drop the CartItems that reference Cart first
			console.log("Dropping CartItems references...");
			await sequelize.query(
				`
        ALTER TABLE "CartItems" DROP CONSTRAINT IF EXISTS "CartItems_cartId_fkey";
      `,
				{ transaction }
			);

			// Alter the status columns without changing type
			console.log("Updating Carts table with compatible status values...");

			// Instead of altering the column type, let's drop and recreate data with the correct type
			console.log("Creating temporary table with old structure...");
			await sequelize.query(
				`
        CREATE TABLE "Carts_temp" (
          "id" UUID PRIMARY KEY,
          "userId" UUID NOT NULL,
          "subtotal" DECIMAL(10, 2) DEFAULT 0,
          "tax" DECIMAL(10, 2) DEFAULT 0,
          "discount" DECIMAL(10, 2) DEFAULT 0,
          "totalAmount" DECIMAL(10, 2) DEFAULT 0,
          "couponCode" VARCHAR(50),
          "discountType" VARCHAR(20),
          "discountValue" DECIMAL(10, 2) DEFAULT 0,
          "requiresShipping" BOOLEAN DEFAULT TRUE,
          "shippingMethod" VARCHAR(50),
          "shippingCost" DECIMAL(10, 2) DEFAULT 0,
          "shippingAddress" JSONB,
          "estimatedDeliveryDate" TIMESTAMP WITH TIME ZONE,
          "notes" TEXT,
          "metadata" JSONB,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "status" VARCHAR(20) NOT NULL
        );
      `,
				{ transaction }
			);

			// Copy data
			console.log("Copying data to temporary table...");
			await sequelize.query(
				`
        INSERT INTO "Carts_temp"
        SELECT * FROM "Carts";
      `,
				{ transaction }
			);

			// Drop old table
			console.log("Dropping original table...");
			await sequelize.query(
				`
        DROP TABLE "Carts";
      `,
				{ transaction }
			);

			// Create new table with enum_Carts_status
			console.log("Creating new Carts table with proper enum type...");
			await sequelize.query(
				`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_carts_status') THEN
            CREATE TYPE enum_carts_status AS ENUM ('active', 'converted', 'abandoned');
          END IF;
        END
        $$;
        
        CREATE TABLE "Carts" (
          "id" UUID PRIMARY KEY,
          "userId" UUID NOT NULL,
          "subtotal" DECIMAL(10, 2) DEFAULT 0,
          "tax" DECIMAL(10, 2) DEFAULT 0,
          "discount" DECIMAL(10, 2) DEFAULT 0,
          "totalAmount" DECIMAL(10, 2) DEFAULT 0,
          "couponCode" VARCHAR(50),
          "discountType" VARCHAR(20),
          "discountValue" DECIMAL(10, 2) DEFAULT 0,
          "requiresShipping" BOOLEAN DEFAULT TRUE,
          "shippingMethod" VARCHAR(50),
          "shippingCost" DECIMAL(10, 2) DEFAULT 0,
          "shippingAddress" JSONB,
          "estimatedDeliveryDate" TIMESTAMP WITH TIME ZONE,
          "notes" TEXT,
          "metadata" JSONB,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "status" enum_carts_status NOT NULL DEFAULT 'active'
        );
      `,
				{ transaction }
			);

			// Insert data with explicit casting
			console.log("Inserting data back with proper casting...");
			await sequelize.query(
				`
        INSERT INTO "Carts" ("id", "userId", "subtotal", "tax", "discount", "totalAmount", 
                            "couponCode", "discountType", "discountValue", "requiresShipping", 
                            "shippingMethod", "shippingCost", "shippingAddress", "estimatedDeliveryDate", 
                            "notes", "metadata", "createdAt", "updatedAt", "status")
        SELECT "id", "userId", "subtotal", "tax", "discount", "totalAmount", 
               "couponCode", "discountType", "discountValue", "requiresShipping", 
               "shippingMethod", "shippingCost", "shippingAddress", "estimatedDeliveryDate", 
               "notes", "metadata", "createdAt", "updatedAt", 
               CASE 
                 WHEN "status" = 'active' THEN 'active'::enum_carts_status
                 WHEN "status" = 'converted' THEN 'converted'::enum_carts_status
                 WHEN "status" = 'abandoned' THEN 'abandoned'::enum_carts_status
                 ELSE 'active'::enum_carts_status
               END
        FROM "Carts_temp";
      `,
				{ transaction }
			);

			// Drop temp table
			console.log("Dropping temporary table...");
			await sequelize.query(
				`
        DROP TABLE "Carts_temp";
      `,
				{ transaction }
			);

			// Re-add the foreign key constraint for CartItems
			console.log("Restoring CartItems references...");
			await sequelize.query(
				`
        ALTER TABLE "CartItems" 
        ADD CONSTRAINT "CartItems_cartId_fkey" 
        FOREIGN KEY ("cartId") REFERENCES "Carts"("id") ON DELETE CASCADE;
      `,
				{ transaction }
			);

			// Commit transaction
			await transaction.commit();
			console.log("Cart table enum fix completed successfully!");

			return true;
		} catch (error) {
			// Rollback transaction on error
			await transaction.rollback();
			console.error("Error during Cart table fix:", error);
			throw error;
		}
	} catch (error) {
		console.error("Fatal error:", error);
		throw error;
	}
}

// Execute the function if this script is run directly
if (require.main === module) {
	fixCartEnumIssue()
		.then(() => {
			console.log("Cart table enum fix completed successfully");
			process.exit(0);
		})
		.catch((error) => {
			console.error("Cart table enum fix failed:", error);
			process.exit(1);
		});
}

module.exports = fixCartEnumIssue;
