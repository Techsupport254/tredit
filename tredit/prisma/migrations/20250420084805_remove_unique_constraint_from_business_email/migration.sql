-- DropIndex
DROP INDEX "Business_email_key";

-- CreateIndex
CREATE INDEX "Business_email_idx" ON "Business"("email");
