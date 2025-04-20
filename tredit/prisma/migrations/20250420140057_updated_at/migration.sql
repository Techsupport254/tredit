/*
  Warnings:

  - You are about to drop the column `channelName` on the `SocialMediaConnection` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SocialMediaConnection" DROP CONSTRAINT "SocialMediaConnection_businessId_fkey";

-- DropIndex
DROP INDEX "SocialMediaConnection_businessId_platform_key";

-- AlterTable
ALTER TABLE "SocialMediaConnection" DROP COLUMN "channelName",
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "SocialMediaConnection_businessId_idx" ON "SocialMediaConnection"("businessId");

-- AddForeignKey
ALTER TABLE "SocialMediaConnection" ADD CONSTRAINT "SocialMediaConnection_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
