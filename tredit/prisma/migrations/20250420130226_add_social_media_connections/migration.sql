/*
  Warnings:

  - You are about to drop the column `channelId` on the `SocialMediaConnection` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `SocialMediaConnection` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SocialMediaConnection" DROP CONSTRAINT "SocialMediaConnection_businessId_fkey";

-- DropIndex
DROP INDEX "SocialMediaConnection_businessId_idx";

-- AlterTable
ALTER TABLE "SocialMediaConnection" DROP COLUMN "channelId",
DROP COLUMN "expiresAt";

-- AddForeignKey
ALTER TABLE "SocialMediaConnection" ADD CONSTRAINT "SocialMediaConnection_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
