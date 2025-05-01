-- Handle schema drift by ensuring all columns exist and are of correct type
DO $$ 
BEGIN
    -- Handle ChatSession table changes
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ChatSession' 
        AND column_name = 'cartId'
    ) THEN
        ALTER TABLE "ChatSession" ADD COLUMN "cartId" text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ChatSession' 
        AND column_name = 'orderId'
    ) THEN
        ALTER TABLE "ChatSession" ADD COLUMN "orderId" text;
    END IF;

    -- Add indexes if they don't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'ChatSession' 
        AND indexname = 'ChatSession_cartId_key'
    ) THEN
        ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_cartId_key" UNIQUE ("cartId");
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'ChatSession' 
        AND indexname = 'ChatSession_orderId_key'
    ) THEN
        ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_orderId_key" UNIQUE ("orderId");
    END IF;

    -- Handle Cart table changes
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Cart' 
        AND column_name = 'shippingFee'
    ) THEN
        ALTER TABLE "Cart" ADD COLUMN "shippingFee" integer;
    END IF;

    -- Handle Escrow table changes
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Escrow' 
        AND column_name = 'blockchainTxHash'
    ) THEN
        ALTER TABLE "Escrow" ADD COLUMN "blockchainTxHash" text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Escrow' 
        AND column_name = 'paystackRef'
    ) THEN
        ALTER TABLE "Escrow" ADD COLUMN "paystackRef" text;
    END IF;

    -- Add indexes for Escrow
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'Escrow' 
        AND indexname = 'Escrow_blockchainTxHash_idx'
    ) THEN
        CREATE INDEX "Escrow_blockchainTxHash_idx" ON "Escrow"("blockchainTxHash");
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'Escrow' 
        AND indexname = 'Escrow_paystackRef_idx'
    ) THEN
        CREATE INDEX "Escrow_paystackRef_idx" ON "Escrow"("paystackRef");
    END IF;

    -- Handle Product table changes
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Product' 
        AND column_name = 'youtubeVideoId'
    ) THEN
        ALTER TABLE "Product" ADD COLUMN "youtubeVideoId" text;
    END IF;
END $$; 