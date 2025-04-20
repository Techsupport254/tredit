-- AlterTable
ALTER TABLE "User" ALTER COLUMN "preferences" SET DEFAULT '{"notifications":{"channels":["EMAIL"],"types":[],"emailNotifications":true,"pushNotifications":true,"inAppNotifications":true,"smsNotifications":false,"webhookNotifications":false}}';

-- CreateTable
CREATE TABLE "VerificationCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerificationCode_email_idx" ON "VerificationCode"("email");

-- CreateIndex
CREATE INDEX "VerificationCode_code_idx" ON "VerificationCode"("code");
