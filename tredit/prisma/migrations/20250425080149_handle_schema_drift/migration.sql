-- AlterTable
ALTER TABLE "Cart" ADD COLUMN IF NOT EXISTS "shippingFee" INTEGER;

-- AlterTable
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'ChatSession_userId_businessId_key'
    ) THEN
        ALTER TABLE "ChatSession" DROP CONSTRAINT "ChatSession_userId_businessId_key";
    END IF;
END $$;

ALTER TABLE "ChatSession" ADD COLUMN IF NOT EXISTS "cartId" TEXT UNIQUE;
ALTER TABLE "ChatSession" ADD COLUMN IF NOT EXISTS "orderId" TEXT UNIQUE;

-- CreateIndex
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'ChatSession_cartId_idx'
    ) THEN
        CREATE INDEX "ChatSession_cartId_idx" ON "ChatSession"("cartId");
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'ChatSession_orderId_idx'
    ) THEN
        CREATE INDEX "ChatSession_orderId_idx" ON "ChatSession"("orderId");
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'ChatSession_userId_businessId_idx'
    ) THEN
        CREATE INDEX "ChatSession_userId_businessId_idx" ON "ChatSession"("userId", "businessId");
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'ChatSession_cartId_fkey'
    ) THEN
        ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_cartId_fkey" 
        FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'ChatSession_orderId_fkey'
    ) THEN
        ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_orderId_fkey" 
        FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AlterTable
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'Message_conversationId_fkey'
    ) THEN
        ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'Message_receiverId_fkey'
    ) THEN
        ALTER TABLE "Message" DROP CONSTRAINT "Message_receiverId_fkey";
    END IF;
END $$;

ALTER TABLE "Message" ALTER COLUMN "receiverId" DROP NOT NULL;
ALTER TABLE "Message" ALTER COLUMN "conversationId" DROP NOT NULL;

ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" 
FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" 
FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "youtubeVideoId" TEXT; 