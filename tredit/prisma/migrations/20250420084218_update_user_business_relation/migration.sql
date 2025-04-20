-- DropIndex
DROP INDEX "Business_userId_key";

-- CreateIndex
CREATE INDEX "Business_userId_idx" ON "Business"("userId");
