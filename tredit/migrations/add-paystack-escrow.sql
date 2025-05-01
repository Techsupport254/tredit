-- Add Paystack escrow integration fields
DO $$ 
BEGIN
    -- Add Paystack fields to Order table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Order' 
        AND column_name = 'paystackRef'
    ) THEN
        ALTER TABLE "Order" ADD COLUMN "paystackRef" text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Order' 
        AND column_name = 'paystackId'
    ) THEN
        ALTER TABLE "Order" ADD COLUMN "paystackId" text;
    END IF;

    -- Add Paystack fields to Payment table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Payment' 
        AND column_name = 'paystackRef'
    ) THEN
        ALTER TABLE "Payment" ADD COLUMN "paystackRef" text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Payment' 
        AND column_name = 'paystackId'
    ) THEN
        ALTER TABLE "Payment" ADD COLUMN "paystackId" text;
    END IF;

    -- Add unique constraints
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'Order' 
        AND indexname = 'Order_paystackRef_key'
    ) THEN
        ALTER TABLE "Order" ADD CONSTRAINT "Order_paystackRef_key" UNIQUE ("paystackRef");
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'Payment' 
        AND indexname = 'Payment_paystackRef_key'
    ) THEN
        ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paystackRef_key" UNIQUE ("paystackRef");
    END IF;

    -- Add indexes
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'Order' 
        AND indexname = 'Order_paystackRef_idx'
    ) THEN
        CREATE INDEX "Order_paystackRef_idx" ON "Order"("paystackRef");
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'Payment' 
        AND indexname = 'Payment_paystackRef_idx'
    ) THEN
        CREATE INDEX "Payment_paystackRef_idx" ON "Payment"("paystackRef");
    END IF;
END $$; 