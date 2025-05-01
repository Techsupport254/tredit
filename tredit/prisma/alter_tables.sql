-- Drop existing constraints if they exist
DO $$ 
BEGIN
    -- Drop foreign key constraints
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'EscrowPayment_orderId_fkey') THEN
        ALTER TABLE "EscrowPayment" DROP CONSTRAINT "EscrowPayment_orderId_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'EscrowPayment_buyerId_fkey') THEN
        ALTER TABLE "EscrowPayment" DROP CONSTRAINT "EscrowPayment_buyerId_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'EscrowPayment_sellerId_fkey') THEN
        ALTER TABLE "EscrowPayment" DROP CONSTRAINT "EscrowPayment_sellerId_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Order_escrowPaymentId_fkey') THEN
        ALTER TABLE "Order" DROP CONSTRAINT "Order_escrowPaymentId_fkey";
    END IF;
END $$;

-- Add EscrowPayment table if it doesn't exist
CREATE TABLE IF NOT EXISTS "EscrowPayment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "conditions" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,

    CONSTRAINT "EscrowPayment_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint on orderId if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'EscrowPayment_orderId_key') THEN
        ALTER TABLE "EscrowPayment" ADD CONSTRAINT "EscrowPayment_orderId_key" UNIQUE ("orderId");
    END IF;
END $$;

-- Add foreign key constraints
ALTER TABLE "EscrowPayment" ADD CONSTRAINT "EscrowPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EscrowPayment" ADD CONSTRAINT "EscrowPayment_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EscrowPayment" ADD CONSTRAINT "EscrowPayment_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add indexes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'EscrowPayment_orderId_idx') THEN
        CREATE INDEX "EscrowPayment_orderId_idx" ON "EscrowPayment"("orderId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'EscrowPayment_buyerId_idx') THEN
        CREATE INDEX "EscrowPayment_buyerId_idx" ON "EscrowPayment"("buyerId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'EscrowPayment_sellerId_idx') THEN
        CREATE INDEX "EscrowPayment_sellerId_idx" ON "EscrowPayment"("sellerId");
    END IF;
END $$;

-- Add escrowPayment relation to Order table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Order' AND column_name = 'escrowPaymentId') THEN
        ALTER TABLE "Order" ADD COLUMN "escrowPaymentId" TEXT;
    END IF;
END $$;

-- Add foreign key constraint for Order.escrowPaymentId
ALTER TABLE "Order" ADD CONSTRAINT "Order_escrowPaymentId_fkey" FOREIGN KEY ("escrowPaymentId") REFERENCES "EscrowPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for Order.escrowPaymentId if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Order_escrowPaymentId_idx') THEN
        CREATE INDEX "Order_escrowPaymentId_idx" ON "Order"("escrowPaymentId");
    END IF;
END $$; 