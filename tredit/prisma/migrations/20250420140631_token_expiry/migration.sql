/*
  Warnings:

  - A unique constraint covering the columns `[businessId,platform]` on the table `SocialMediaConnection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaConnection_businessId_platform_key" ON "SocialMediaConnection"("businessId", "platform");
