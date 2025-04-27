-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paystackRef" TEXT UNIQUE;
ALTER TABLE "Order" ADD COLUMN "paystackId" TEXT;
ALTER TABLE "Order" ADD COLUMN "blockchainTxHash" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingAddress" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingMethod" "ShippingMethod";
ALTER TABLE "Order" ADD COLUMN "trackingNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN "estimatedDeliveryDate" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "actualDeliveryDate" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "isConfirmed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "confirmationDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Order_paystackRef_idx" ON "Order"("paystackRef");
CREATE INDEX "Order_blockchainTxHash_idx" ON "Order"("blockchainTxHash");

-- AlterTable
ALTER TABLE "Escrow" ADD COLUMN "blockchainTxHash" TEXT;
ALTER TABLE "Escrow" ADD COLUMN "paystackRef" TEXT UNIQUE;
ALTER TABLE "Escrow" ADD COLUMN "paystackId" TEXT;

-- CreateIndex
CREATE INDEX "Escrow_blockchainTxHash_idx" ON "Escrow"("blockchainTxHash");
CREATE INDEX "Escrow_paystackRef_idx" ON "Escrow"("paystackRef");

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "paystackRef" TEXT UNIQUE;
ALTER TABLE "Payment" ADD COLUMN "paystackId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "blockchainTxHash" TEXT;

-- CreateIndex
CREATE INDEX "Payment_paystackRef_idx" ON "Payment"("paystackRef");
CREATE INDEX "Payment_blockchainTxHash_idx" ON "Payment"("blockchainTxHash"); 