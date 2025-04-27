-- AlterTable
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

-- CreateIndex
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

-- AlterTable
ALTER TABLE "Escrow" ADD COLUMN IF NOT EXISTS "blockchainTxHash" TEXT;
ALTER TABLE "Escrow" ADD COLUMN IF NOT EXISTS "paystackRef" TEXT UNIQUE;
ALTER TABLE "Escrow" ADD COLUMN IF NOT EXISTS "paystackId" TEXT;

-- CreateIndex
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

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paystackRef" TEXT UNIQUE;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paystackId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "blockchainTxHash" TEXT;

-- CreateIndex
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