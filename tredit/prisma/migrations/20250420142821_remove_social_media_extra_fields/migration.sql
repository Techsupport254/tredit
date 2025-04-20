/*
  Warnings:

  - You are about to drop the column `tokenExpiresAt` on the `SocialMediaConnection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SocialMediaConnection" DROP COLUMN "tokenExpiresAt",
ADD COLUMN     "channelId" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3);
