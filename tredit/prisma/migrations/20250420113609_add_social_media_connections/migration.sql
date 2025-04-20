-- CreateTable
CREATE TABLE "SocialMediaConnection" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT false,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "channelId" TEXT,
    "channelName" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMediaConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialMediaConnection_businessId_idx" ON "SocialMediaConnection"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaConnection_businessId_platform_key" ON "SocialMediaConnection"("businessId", "platform");

-- AddForeignKey
ALTER TABLE "SocialMediaConnection" ADD CONSTRAINT "SocialMediaConnection_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
