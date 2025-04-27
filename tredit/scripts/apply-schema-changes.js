import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function applySchemaChanges() {
	try {
		// Add columns to Order table
		await prisma.$executeRawUnsafe(`
			ALTER TABLE "Order" 
				ADD COLUMN IF NOT EXISTS "paystackRef" TEXT,
				ADD COLUMN IF NOT EXISTS "paystackId" TEXT,
				ADD COLUMN IF NOT EXISTS "blockchainTxHash" TEXT,
				ADD COLUMN IF NOT EXISTS "shippingAddress" TEXT,
				ADD COLUMN IF NOT EXISTS "shippingMethod" "ShippingMethod",
				ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT,
				ADD COLUMN IF NOT EXISTS "estimatedDeliveryDate" TIMESTAMP(3),
				ADD COLUMN IF NOT EXISTS "actualDeliveryDate" TIMESTAMP(3),
				ADD COLUMN IF NOT EXISTS "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
				ADD COLUMN IF NOT EXISTS "confirmationDate" TIMESTAMP(3);
		`);
		console.log("Added columns to Order table");

		// Add unique constraint to Order table
		await prisma.$executeRawUnsafe(`
			DO $$
			BEGIN
				IF NOT EXISTS (
					SELECT 1
					FROM pg_constraint
					WHERE conname = 'Order_paystackRef_key'
				) THEN
					ALTER TABLE "Order" ADD CONSTRAINT "Order_paystackRef_key" UNIQUE ("paystackRef");
				END IF;
			END $$;
		`);
		console.log("Added unique constraint to Order table");

		// Add indexes to Order table
		await prisma.$executeRawUnsafe(`
			CREATE INDEX IF NOT EXISTS "Order_paystackRef_idx" ON "Order"("paystackRef");
		`);
		await prisma.$executeRawUnsafe(`
			CREATE INDEX IF NOT EXISTS "Order_blockchainTxHash_idx" ON "Order"("blockchainTxHash");
		`);
		console.log("Added indexes to Order table");

		// Add columns to Escrow table
		await prisma.$executeRawUnsafe(`
			ALTER TABLE "Escrow" 
				ADD COLUMN IF NOT EXISTS "blockchainTxHash" TEXT,
				ADD COLUMN IF NOT EXISTS "paystackRef" TEXT,
				ADD COLUMN IF NOT EXISTS "paystackId" TEXT;
		`);
		console.log("Added columns to Escrow table");

		// Add unique constraint to Escrow table
		await prisma.$executeRawUnsafe(`
			DO $$
			BEGIN
				IF NOT EXISTS (
					SELECT 1
					FROM pg_constraint
					WHERE conname = 'Escrow_paystackRef_key'
				) THEN
					ALTER TABLE "Escrow" ADD CONSTRAINT "Escrow_paystackRef_key" UNIQUE ("paystackRef");
				END IF;
			END $$;
		`);
		console.log("Added unique constraint to Escrow table");

		// Add indexes to Escrow table
		await prisma.$executeRawUnsafe(`
			CREATE INDEX IF NOT EXISTS "Escrow_blockchainTxHash_idx" ON "Escrow"("blockchainTxHash");
		`);
		await prisma.$executeRawUnsafe(`
			CREATE INDEX IF NOT EXISTS "Escrow_paystackRef_idx" ON "Escrow"("paystackRef");
		`);
		console.log("Added indexes to Escrow table");

		// Add columns to Payment table
		await prisma.$executeRawUnsafe(`
			ALTER TABLE "Payment" 
				ADD COLUMN IF NOT EXISTS "paystackRef" TEXT,
				ADD COLUMN IF NOT EXISTS "paystackId" TEXT,
				ADD COLUMN IF NOT EXISTS "blockchainTxHash" TEXT;
		`);
		console.log("Added columns to Payment table");

		// Add unique constraint to Payment table
		await prisma.$executeRawUnsafe(`
			DO $$
			BEGIN
				IF NOT EXISTS (
					SELECT 1
					FROM pg_constraint
					WHERE conname = 'Payment_paystackRef_key'
				) THEN
					ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paystackRef_key" UNIQUE ("paystackRef");
				END IF;
			END $$;
		`);
		console.log("Added unique constraint to Payment table");

		// Add indexes to Payment table
		await prisma.$executeRawUnsafe(`
			CREATE INDEX IF NOT EXISTS "Payment_paystackRef_idx" ON "Payment"("paystackRef");
		`);
		await prisma.$executeRawUnsafe(`
			CREATE INDEX IF NOT EXISTS "Payment_blockchainTxHash_idx" ON "Payment"("blockchainTxHash");
		`);
		console.log("Added indexes to Payment table");

		console.log("Schema changes applied successfully");
	} catch (error) {
		console.error("Error applying schema changes:", error);
	} finally {
		await prisma.$disconnect();
	}
}

applySchemaChanges();
