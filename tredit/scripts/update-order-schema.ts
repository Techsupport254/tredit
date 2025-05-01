import { PrismaClient } from "@prisma/client";

async function updateOrderSchema() {
	const prisma = new PrismaClient();

	try {
		// Execute raw SQL to add/modify columns
		await prisma.$executeRaw`
      DO $$ 
      BEGIN
        -- Add currentStatus column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Order' AND column_name = 'currentStatus') THEN
          ALTER TABLE "Order" ADD COLUMN "currentStatus" TEXT DEFAULT 'PENDING';
        END IF;

        -- Add statusHistory column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Order' AND column_name = 'statusHistory') THEN
          ALTER TABLE "Order" ADD COLUMN "statusHistory" JSONB DEFAULT '[]';
        END IF;

        -- Update existing records to have proper statusHistory if it's empty
        UPDATE "Order"
        SET "statusHistory" = jsonb_build_array(
          jsonb_build_object(
            'status', COALESCE("currentStatus"::text, 'PENDING'),
            'note', 'Initial status',
            'timestamp', CURRENT_TIMESTAMP
          )
        )
        WHERE "statusHistory" IS NULL OR "statusHistory" = '[]'::jsonb;

        -- Set currentStatus based on latest status if not set
        UPDATE "Order"
        SET "currentStatus" = 'PENDING'
        WHERE "currentStatus" IS NULL;

      END $$;
    `;

		console.log("Successfully updated Order schema");
	} catch (error) {
		console.error("Error updating Order schema:", error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

updateOrderSchema().catch((error) => {
	console.error("Failed to update Order schema:", error);
	process.exit(1);
});
