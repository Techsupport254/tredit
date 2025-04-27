import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function applySchemaChanges() {
	try {
		// Add columns to Order table
		await prisma.$executeRaw`
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paystackRef" TEXT UNIQUE;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paystackId" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "blockchainTxHash" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingAddress" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingMethod" "ShippingMethod";
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "estimatedDeliveryDate" TIMESTAMP(3);
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "actualDeliveryDate" TIMESTAMP(3);
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "isConfirmed" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "confirmationDate" TIMESTAMP(3);
    `;

		// Create indexes for Order table
		await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 
              FROM pg_indexes 
              WHERE indexname = 'Order_paystackRef_idx'
          ) THEN
              CREATE INDEX "Order_paystackRef_idx" ON "Order"("paystackRef");
          END IF;
          
          IF NOT EXISTS (
              SELECT 1 
              FROM pg_indexes 
              WHERE indexname = 'Order_blockchainTxHash_idx'
          ) THEN
              CREATE INDEX "Order_blockchainTxHash_idx" ON "Order"("blockchainTxHash");
          END IF;
      END $$;
    `;

		// Add columns to Escrow table
		await prisma.$executeRaw`
      ALTER TABLE "Escrow" ADD COLUMN IF NOT EXISTS "blockchainTxHash" TEXT;
      ALTER TABLE "Escrow" ADD COLUMN IF NOT EXISTS "paystackRef" TEXT UNIQUE;
      ALTER TABLE "Escrow" ADD COLUMN IF NOT EXISTS "paystackId" TEXT;
    `;

		// Create indexes for Escrow table
		await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 
              FROM pg_indexes 
              WHERE indexname = 'Escrow_blockchainTxHash_idx'
          ) THEN
              CREATE INDEX "Escrow_blockchainTxHash_idx" ON "Escrow"("blockchainTxHash");
          END IF;
          
          IF NOT EXISTS (
              SELECT 1 
              FROM pg_indexes 
              WHERE indexname = 'Escrow_paystackRef_idx'
          ) THEN
              CREATE INDEX "Escrow_paystackRef_idx" ON "Escrow"("paystackRef");
          END IF;
      END $$;
    `;

		// Add columns to Payment table
		await prisma.$executeRaw`
      ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paystackRef" TEXT UNIQUE;
      ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paystackId" TEXT;
      ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "blockchainTxHash" TEXT;
    `;

		// Create indexes for Payment table
		await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 
              FROM pg_indexes 
              WHERE indexname = 'Payment_paystackRef_idx'
          ) THEN
              CREATE INDEX "Payment_paystackRef_idx" ON "Payment"("paystackRef");
          END IF;
          
          IF NOT EXISTS (
              SELECT 1 
              FROM pg_indexes 
              WHERE indexname = 'Payment_blockchainTxHash_idx'
          ) THEN
              CREATE INDEX "Payment_blockchainTxHash_idx" ON "Payment"("blockchainTxHash");
          END IF;
      END $$;
    `;

		console.log("Schema changes applied successfully");
	} catch (error) {
		console.error("Error applying schema changes:", error);
	} finally {
		await prisma.$disconnect();
	}
}

applySchemaChanges();
