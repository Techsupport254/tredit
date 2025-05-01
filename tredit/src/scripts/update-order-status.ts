import { prisma } from "@/lib/prisma";

async function updateOrderStatus() {
	try {
		// Add currentStatus column
		await prisma.$executeRaw`
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "currentStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING';
    `;

		// Update existing status data to new format
		await prisma.$executeRaw`
      UPDATE "Order"
      SET "status" = jsonb_build_array(
        jsonb_build_object(
          'status', COALESCE("status"->>'status', 'PENDING'),
          'note', COALESCE("status"->>'note', 'Order placed'),
          'timestamp', COALESCE("status"->>'timestamp', NOW()::text)
        )
      )
      WHERE "status" IS NOT NULL;
    `;

		// Set currentStatus based on latest status
		await prisma.$executeRaw`
      UPDATE "Order"
      SET "currentStatus" = (
        CASE 
          WHEN "status"->0->>'status' IS NOT NULL THEN ("status"->0->>'status')::"OrderStatus"
          ELSE 'PENDING'
        END
      );
    `;

		console.log("Successfully updated order status structure");
	} catch (error) {
		console.error("Error updating order status:", error);
	} finally {
		await prisma.$disconnect();
	}
}

updateOrderStatus();
