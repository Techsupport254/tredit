/*
  Warnings:

  - The values [MEMBER,VIEWER] on the enum `TeamRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `businessHours` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `productCategories` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `serviceCategories` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `socialMedia` on the `Business` table. All the data in the column will be lost.
  - The `paymentMethods` column on the `Business` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `content` on the `Message` table. All the data in the column will be lost.
  - Added the required column `city` to the `Business` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `businessModel` on the `Business` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `operationMode` on the `Business` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `BusinessTeamMember` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `permissions` on the `BusinessTeamMember` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `conversationId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direction` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BusinessOperationMode" AS ENUM ('ONLINE', 'PHYSICAL', 'HYBRID');

-- CreateEnum
CREATE TYPE "BusinessModel" AS ENUM ('B2B', 'B2C', 'D2C', 'MARKETPLACE');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('KES', 'USD', 'EUR', 'GBP');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MPESA', 'CARD', 'BANK_TRANSFER', 'CASH', 'CRYPTO');

-- CreateEnum
CREATE TYPE "BusinessSize" AS ENUM ('MICRO', 'SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "BusinessStage" AS ENUM ('STARTUP', 'GROWTH', 'ESTABLISHED', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "TaxCategory" AS ENUM ('VAT_REGISTERED', 'NON_VAT', 'TURNOVER_TAX');

-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('LOCAL_DELIVERY', 'NATIONWIDE', 'INTERNATIONAL', 'PICKUP_ONLY');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('BUSINESS_REGISTRATION', 'TAX_COMPLIANCE', 'IDENTITY_VERIFICATION', 'ADDRESS_VERIFICATION', 'BANK_ACCOUNT', 'MOBILE_MONEY');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('CONSULTATION', 'REPAIR', 'MAINTENANCE', 'INSTALLATION', 'TRAINING', 'SUPPORT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'DIGITAL', 'SUBSCRIPTION', 'RENTAL');

-- CreateEnum
CREATE TYPE "InventoryManagement" AS ENUM ('NONE', 'BASIC', 'ADVANCED', 'DROPSHIPPING');

-- CreateEnum
CREATE TYPE "ServiceDeliveryMode" AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "ServiceDurationUnit" AS ENUM ('MINUTES', 'HOURS', 'DAYS', 'WEEKS', 'MONTHS');

-- CreateEnum
CREATE TYPE "DigitalServiceType" AS ENUM ('SOFTWARE_DEVELOPMENT', 'WEB_DEVELOPMENT', 'MOBILE_APP_DEVELOPMENT', 'UI_UX_DESIGN', 'GRAPHIC_DESIGN', 'CONTENT_CREATION', 'SOCIAL_MEDIA_MANAGEMENT', 'DIGITAL_MARKETING', 'SEO_SERVICES', 'VIDEO_PRODUCTION', 'DATA_ANALYTICS', 'CLOUD_SERVICES', 'IT_CONSULTING', 'CYBERSECURITY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PaymentModel" AS ENUM ('ONE_TIME', 'RECURRING', 'SUBSCRIPTION', 'PAY_PER_USE', 'MILESTONE_BASED', 'TIME_BASED', 'VALUE_BASED');

-- CreateEnum
CREATE TYPE "PaymentFrequency" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "DeliverableStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED', 'REVISED');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('ACTIVE', 'RELEASED', 'REFUNDED', 'DISPUTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('USER_REGISTERED', 'USER_VERIFIED', 'USER_UPDATED', 'PASSWORD_CHANGED', 'EMAIL_CHANGED', 'PHONE_CHANGED', 'PROFILE_UPDATED', 'ACCOUNT_SUSPENDED', 'ACCOUNT_DELETED', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGIN_ATTEMPT', 'TWO_FACTOR_ENABLED', 'TWO_FACTOR_DISABLED', 'API_KEY_CREATED', 'API_KEY_REVOKED', 'BUSINESS_CREATED', 'BUSINESS_UPDATED', 'BUSINESS_VERIFIED', 'BUSINESS_SUSPENDED', 'BUSINESS_DELETED', 'BUSINESS_INVITATION', 'BUSINESS_ROLE_CHANGED', 'BUSINESS_PERMISSION_CHANGED', 'BUSINESS_SETTINGS_UPDATED', 'BUSINESS_ANALYTICS_READY', 'SERVICE_CREATED', 'SERVICE_UPDATED', 'SERVICE_DELETED', 'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED', 'PRODUCT_OUT_OF_STOCK', 'PRODUCT_BACK_IN_STOCK', 'INVENTORY_LOW', 'INVENTORY_CRITICAL', 'PRICE_CHANGED', 'DISCOUNT_ADDED', 'DISCOUNT_EXPIRED', 'ORDER_CREATED', 'ORDER_UPDATED', 'ORDER_COMPLETED', 'ORDER_CANCELLED', 'ORDER_DISPUTED', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED', 'PAYMENT_DISPUTED', 'INVOICE_GENERATED', 'INVOICE_PAID', 'INVOICE_OVERDUE', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_UPDATED', 'SUBSCRIPTION_CANCELLED', 'SUBSCRIPTION_RENEWED', 'SUBSCRIPTION_EXPIRED', 'AGREEMENT_CREATED', 'AGREEMENT_UPDATED', 'AGREEMENT_COMPLETED', 'AGREEMENT_CANCELLED', 'AGREEMENT_EXPIRED', 'DELIVERABLE_CREATED', 'DELIVERABLE_UPDATED', 'DELIVERABLE_COMPLETED', 'DELIVERABLE_APPROVED', 'DELIVERABLE_REJECTED', 'DELIVERABLE_REVISED', 'MILESTONE_REACHED', 'MILESTONE_APPROVED', 'MILESTONE_REJECTED', 'ESCROW_CREATED', 'ESCROW_RELEASED', 'ESCROW_REFUNDED', 'ESCROW_DISPUTED', 'DISPUTE_CREATED', 'DISPUTE_UPDATED', 'DISPUTE_RESOLVED', 'DISPUTE_ESCALATED', 'DISPUTE_MESSAGE_ADDED', 'DISPUTE_DOCUMENT_ADDED', 'MESSAGE_RECEIVED', 'MESSAGE_READ', 'MESSAGE_DELETED', 'CHAT_STARTED', 'CHAT_ENDED', 'CHAT_INVITATION', 'CHAT_LEFT', 'CHAT_MUTED', 'CHAT_UNMUTED', 'GROUP_CHAT_CREATED', 'GROUP_CHAT_UPDATED', 'GROUP_CHAT_DELETED', 'GROUP_MEMBER_ADDED', 'GROUP_MEMBER_REMOVED', 'GROUP_MEMBER_LEFT', 'VOICE_CALL_STARTED', 'VOICE_CALL_ENDED', 'VIDEO_CALL_STARTED', 'VIDEO_CALL_ENDED', 'CALL_MISSED', 'CALL_DECLINED', 'REVIEW_RECEIVED', 'REVIEW_UPDATED', 'REVIEW_DELETED', 'REVIEW_REPLIED', 'RATING_RECEIVED', 'RATING_UPDATED', 'FEEDBACK_RECEIVED', 'FEEDBACK_UPDATED', 'SYSTEM_UPDATE', 'SYSTEM_MAINTENANCE', 'SYSTEM_ERROR', 'SECURITY_ALERT', 'SUSPICIOUS_ACTIVITY', 'LOGIN_DEVICE_NEW', 'LOGIN_LOCATION_NEW', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED', 'ACCOUNT_RECOVERY_STARTED', 'ACCOUNT_RECOVERY_COMPLETED', 'DATA_EXPORT_REQUESTED', 'DATA_EXPORT_COMPLETED', 'DATA_DELETION_REQUESTED', 'DATA_DELETION_COMPLETED', 'PROMOTION_CREATED', 'PROMOTION_UPDATED', 'PROMOTION_EXPIRED', 'COUPON_CREATED', 'COUPON_REDEEMED', 'COUPON_EXPIRED', 'LOYALTY_POINTS_EARNED', 'LOYALTY_POINTS_REDEEMED', 'LOYALTY_TIER_CHANGED', 'REFERRAL_SENT', 'REFERRAL_ACCEPTED', 'REFERRAL_REWARDED', 'REPORT_GENERATED', 'REPORT_READY', 'REPORT_FAILED', 'ANALYTICS_READY', 'INSIGHT_GENERATED', 'TREND_DETECTED', 'ABNORMAL_ACTIVITY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'LOCATION', 'CONTACT', 'SYSTEM', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "MessageEncryption" AS ENUM ('NONE', 'END_TO_END', 'GROUP');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'LOCATION', 'CONTACT', 'SYSTEM', 'NOTIFICATION', 'RICH_TEXT', 'EMBED', 'POLL', 'FORM', 'BUTTON', 'CAROUSEL', 'PRODUCT', 'SERVICE', 'ORDER', 'PAYMENT', 'ESCROW', 'DISPUTE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'HELD_IN_ESCROW';
ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIALLY_RELEASED';
ALTER TYPE "PaymentStatus" ADD VALUE 'FULLY_RELEASED';
ALTER TYPE "PaymentStatus" ADD VALUE 'DISPUTED';
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
BEGIN;
CREATE TYPE "TeamRole_new" AS ENUM ('OWNER', 'ADMIN', 'STORE_MANAGER', 'FINANCE_MANAGER', 'CUSTOMER_SERVICE_LEAD', 'MARKETING_MANAGER', 'LOGISTICS_COORDINATOR', 'INVENTORY_MANAGER', 'CONTENT_CREATOR', 'SOCIAL_MEDIA_MANAGER', 'QUALITY_ASSURANCE', 'TECHNICAL_SUPPORT', 'SALES_REPRESENTATIVE', 'PROCUREMENT_OFFICER');
ALTER TABLE "BusinessTeamMember" ALTER COLUMN "role" TYPE "TeamRole_new" USING ("role"::text::"TeamRole_new");
ALTER TYPE "TeamRole" RENAME TO "TeamRole_old";
ALTER TYPE "TeamRole_new" RENAME TO "TeamRole";
DROP TYPE "TeamRole_old";
COMMIT;

-- DropIndex
DROP INDEX "Message_chatSessionId_idx";

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "businessHours",
DROP COLUMN "productCategories",
DROP COLUMN "serviceCategories",
DROP COLUMN "socialMedia",
ADD COLUMN     "acceptedCurrencies" "Currency"[] DEFAULT ARRAY['KES']::"Currency"[],
ADD COLUMN     "alternativePhone" TEXT,
ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "coordinates" JSONB,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Kenya',
ADD COLUMN     "employeeCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "insuranceInfo" JSONB,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY['en']::TEXT[],
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "privacyPolicy" TEXT,
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "returnPolicy" TEXT,
ADD COLUMN     "serviceAreas" TEXT[],
ADD COLUMN     "shippingPolicy" TEXT,
ADD COLUMN     "sla" JSONB,
ADD COLUMN     "subcategories" TEXT[],
ADD COLUMN     "supportEmail" TEXT,
ADD COLUMN     "supportPhone" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "teamRoles" JSONB[],
ADD COLUMN     "termsOfService" TEXT,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Africa/Nairobi',
DROP COLUMN "businessModel",
ADD COLUMN     "businessModel" "BusinessModel" NOT NULL,
DROP COLUMN "operationMode",
ADD COLUMN     "operationMode" "BusinessOperationMode" NOT NULL,
DROP COLUMN "paymentMethods",
ADD COLUMN     "paymentMethods" "PaymentMethod"[];

-- AlterTable
ALTER TABLE "BusinessTeamMember" ADD COLUMN     "responsibilities" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "permissions",
ADD COLUMN     "permissions" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "content",
ADD COLUMN     "conversationId" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "direction" "MessageDirection" NOT NULL,
ADD COLUMN     "editedAt" TIMESTAMP(3),
ADD COLUMN     "encryption" "MessageEncryption" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "forwardedFrom" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "replyTo" TEXT,
ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'TEXT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastNotificationAt" TIMESTAMP(3),
ADD COLUMN     "unreadCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "MessageAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT,
    "size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "thumbnail" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageReaction" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageRead" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'DIRECT',
    "title" TEXT,
    "description" TEXT,
    "avatar" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "lastMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "lastReadAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "initiatorId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "recordingUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallParticipant" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "joinTime" TIMESTAMP(3),
    "leaveTime" TIMESTAMP(3),
    "duration" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessVerification" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "status" "VerificationStatus" NOT NULL,
    "documentUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "verifierNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessSubscription" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "status" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "billingCycle" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "features" JSONB NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessHours" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT,
    "closeTime" TEXT,
    "breakStart" TEXT,
    "breakEnd" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "holidayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ServiceType" NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "prerequisites" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "digitalServiceType" "DigitalServiceType",
    "isDigital" BOOLEAN NOT NULL DEFAULT false,
    "requiresEscrow" BOOLEAN NOT NULL DEFAULT true,
    "minPaymentPercent" INTEGER,
    "paymentModels" "PaymentModel"[],
    "estimatedDuration" INTEGER,
    "complexity" TEXT,
    "deliverables" JSONB,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ProductType" NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "stockLevel" INTEGER NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER,
    "reorderQuantity" INTEGER,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "specifications" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceSchedule" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "serviceCategoryId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "maxBookings" INTEGER NOT NULL DEFAULT 1,
    "currentBookings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "productCategoryId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "lastRestocked" TIMESTAMP(3),
    "nextRestock" TIMESTAMP(3),
    "minimumQuantity" INTEGER NOT NULL DEFAULT 0,
    "maximumQuantity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceProvider" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceTypes" "ServiceType"[],
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "experience" INTEGER,
    "certifications" TEXT[],
    "schedule" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "products" TEXT[],
    "leadTime" INTEGER,
    "paymentTerms" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceAgreement" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "serviceCategoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "paymentModel" "PaymentModel" NOT NULL,
    "paymentFrequency" "PaymentFrequency",
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'KES',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "terms" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "DeliverableStatus" NOT NULL DEFAULT 'PENDING',
    "completionDate" TIMESTAMP(3),
    "approvalDate" TIMESTAMP(3),
    "feedback" TEXT,
    "revisions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Escrow" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'KES',
    "status" "EscrowStatus" NOT NULL DEFAULT 'ACTIVE',
    "releaseConditions" JSONB NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "disputeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Escrow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'KES',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionHash" TEXT,
    "paymentDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "frequency" "PaymentFrequency",
    "nextPaymentDate" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceReview" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "data" JSONB,
    "channels" "NotificationChannel"[],
    "recipientId" TEXT NOT NULL,
    "senderId" TEXT,
    "businessId" TEXT,
    "agreementId" TEXT,
    "deliverableId" TEXT,
    "paymentId" TEXT,
    "escrowId" TEXT,
    "disputeId" TEXT,
    "orderId" TEXT,
    "productId" TEXT,
    "serviceId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastRetryAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT,
    "isInteractive" BOOLEAN NOT NULL DEFAULT false,
    "isGrouped" BOOLEAN NOT NULL DEFAULT false,
    "isSilent" BOOLEAN NOT NULL DEFAULT false,
    "isPersistent" BOOLEAN NOT NULL DEFAULT false,
    "badgeCount" INTEGER,
    "deepLink" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "customData" JSONB,
    "archivedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT,
    "quietHours" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "variables" JSONB,
    "defaultChannels" "NotificationChannel"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "language" TEXT NOT NULL DEFAULT 'en',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "preview" TEXT,
    "validationRules" JSONB,
    "fallbackTemplate" TEXT,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationAction" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationGroup" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" "NotificationType",
    "channel" "NotificationChannel" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT,
    "quietHours" JSONB,
    "filters" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationAnalytics" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "actionCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "avgDeliveryTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "variables" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageQueue" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "nextAttemptAt" TIMESTAMP(3),
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAnalytics" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "totalAttachments" INTEGER NOT NULL DEFAULT 0,
    "totalCalls" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" INTEGER,
    "peakActivityTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "order" INTEGER NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "messageId" TEXT,
    "notificationId" TEXT,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT,
    "size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "thumbnail" TEXT,
    "metadata" JSONB,
    "contentBlockId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "isMultiChoice" BOOLEAN NOT NULL DEFAULT false,
    "endDate" TIMESTAMP(3),
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "contentBlockId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollOption" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollVote" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PollVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "contentBlockId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormField" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "placeholder" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" TEXT[],
    "validation" JSONB,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormResponse" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserNotificationGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserNotificationGroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "MessageAttachment_messageId_idx" ON "MessageAttachment"("messageId");

-- CreateIndex
CREATE INDEX "MessageReaction_messageId_idx" ON "MessageReaction"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReaction_messageId_userId_key" ON "MessageReaction"("messageId", "userId");

-- CreateIndex
CREATE INDEX "MessageRead_messageId_idx" ON "MessageRead"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageRead_messageId_userId_key" ON "MessageRead"("messageId", "userId");

-- CreateIndex
CREATE INDEX "Conversation_type_idx" ON "Conversation"("type");

-- CreateIndex
CREATE INDEX "Conversation_isArchived_idx" ON "Conversation"("isArchived");

-- CreateIndex
CREATE INDEX "Conversation_isMuted_idx" ON "Conversation"("isMuted");

-- CreateIndex
CREATE INDEX "ConversationParticipant_conversationId_idx" ON "ConversationParticipant"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Call_conversationId_idx" ON "Call"("conversationId");

-- CreateIndex
CREATE INDEX "Call_initiatorId_idx" ON "Call"("initiatorId");

-- CreateIndex
CREATE INDEX "Call_status_idx" ON "Call"("status");

-- CreateIndex
CREATE INDEX "CallParticipant_callId_idx" ON "CallParticipant"("callId");

-- CreateIndex
CREATE INDEX "CallParticipant_userId_idx" ON "CallParticipant"("userId");

-- CreateIndex
CREATE INDEX "BusinessVerification_type_status_idx" ON "BusinessVerification"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessVerification_businessId_type_key" ON "BusinessVerification"("businessId", "type");

-- CreateIndex
CREATE INDEX "BusinessSubscription_businessId_status_idx" ON "BusinessSubscription"("businessId", "status");

-- CreateIndex
CREATE INDEX "BusinessSubscription_tier_idx" ON "BusinessSubscription"("tier");

-- CreateIndex
CREATE INDEX "BusinessHours_businessId_isClosed_idx" ON "BusinessHours"("businessId", "isClosed");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessHours_businessId_dayOfWeek_key" ON "BusinessHours"("businessId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "ServiceCategory_businessId_idx" ON "ServiceCategory"("businessId");

-- CreateIndex
CREATE INDEX "ServiceCategory_type_idx" ON "ServiceCategory"("type");

-- CreateIndex
CREATE INDEX "ProductCategory_businessId_idx" ON "ProductCategory"("businessId");

-- CreateIndex
CREATE INDEX "ProductCategory_type_idx" ON "ProductCategory"("type");

-- CreateIndex
CREATE INDEX "ServiceSchedule_businessId_idx" ON "ServiceSchedule"("businessId");

-- CreateIndex
CREATE INDEX "ServiceSchedule_serviceCategoryId_idx" ON "ServiceSchedule"("serviceCategoryId");

-- CreateIndex
CREATE INDEX "ServiceSchedule_startTime_idx" ON "ServiceSchedule"("startTime");

-- CreateIndex
CREATE INDEX "Inventory_businessId_idx" ON "Inventory"("businessId");

-- CreateIndex
CREATE INDEX "Inventory_productCategoryId_idx" ON "Inventory"("productCategoryId");

-- CreateIndex
CREATE INDEX "ServiceProvider_serviceTypes_idx" ON "ServiceProvider"("serviceTypes");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProvider_businessId_userId_key" ON "ServiceProvider"("businessId", "userId");

-- CreateIndex
CREATE INDEX "Supplier_businessId_idx" ON "Supplier"("businessId");

-- CreateIndex
CREATE INDEX "Supplier_products_idx" ON "Supplier"("products");

-- CreateIndex
CREATE INDEX "ServiceAgreement_businessId_idx" ON "ServiceAgreement"("businessId");

-- CreateIndex
CREATE INDEX "ServiceAgreement_clientId_idx" ON "ServiceAgreement"("clientId");

-- CreateIndex
CREATE INDEX "ServiceAgreement_status_idx" ON "ServiceAgreement"("status");

-- CreateIndex
CREATE INDEX "Deliverable_agreementId_idx" ON "Deliverable"("agreementId");

-- CreateIndex
CREATE INDEX "Deliverable_status_idx" ON "Deliverable"("status");

-- CreateIndex
CREATE INDEX "Escrow_agreementId_idx" ON "Escrow"("agreementId");

-- CreateIndex
CREATE INDEX "Escrow_status_idx" ON "Escrow"("status");

-- CreateIndex
CREATE INDEX "Payment_agreementId_idx" ON "Payment"("agreementId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_transactionHash_idx" ON "Payment"("transactionHash");

-- CreateIndex
CREATE INDEX "ServiceReview_agreementId_idx" ON "ServiceReview"("agreementId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_idx" ON "Notification"("recipientId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_scheduledAt_idx" ON "Notification"("scheduledAt");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_type_channel_key" ON "NotificationPreference"("userId", "type", "channel");

-- CreateIndex
CREATE INDEX "NotificationTemplate_isActive_idx" ON "NotificationTemplate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_type_key" ON "NotificationTemplate"("type");

-- CreateIndex
CREATE INDEX "NotificationLog_notificationId_idx" ON "NotificationLog"("notificationId");

-- CreateIndex
CREATE INDEX "NotificationLog_status_idx" ON "NotificationLog"("status");

-- CreateIndex
CREATE INDEX "NotificationAction_notificationId_idx" ON "NotificationAction"("notificationId");

-- CreateIndex
CREATE INDEX "NotificationGroup_type_idx" ON "NotificationGroup"("type");

-- CreateIndex
CREATE INDEX "NotificationGroup_isRead_idx" ON "NotificationGroup"("isRead");

-- CreateIndex
CREATE INDEX "NotificationSettings_userId_idx" ON "NotificationSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSettings_userId_category_type_channel_key" ON "NotificationSettings"("userId", "category", "type", "channel");

-- CreateIndex
CREATE INDEX "NotificationAnalytics_notificationId_idx" ON "NotificationAnalytics"("notificationId");

-- CreateIndex
CREATE INDEX "NotificationAnalytics_channel_idx" ON "NotificationAnalytics"("channel");

-- CreateIndex
CREATE INDEX "MessageTemplate_isActive_idx" ON "MessageTemplate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "MessageTemplate_type_language_key" ON "MessageTemplate"("type", "language");

-- CreateIndex
CREATE UNIQUE INDEX "MessageQueue_messageId_key" ON "MessageQueue"("messageId");

-- CreateIndex
CREATE INDEX "MessageQueue_messageId_idx" ON "MessageQueue"("messageId");

-- CreateIndex
CREATE INDEX "MessageQueue_status_idx" ON "MessageQueue"("status");

-- CreateIndex
CREATE INDEX "MessageQueue_nextAttemptAt_idx" ON "MessageQueue"("nextAttemptAt");

-- CreateIndex
CREATE INDEX "MessageAnalytics_conversationId_idx" ON "MessageAnalytics"("conversationId");

-- CreateIndex
CREATE INDEX "ContentBlock_type_idx" ON "ContentBlock"("type");

-- CreateIndex
CREATE INDEX "ContentBlock_parentId_idx" ON "ContentBlock"("parentId");

-- CreateIndex
CREATE INDEX "ContentBlock_messageId_idx" ON "ContentBlock"("messageId");

-- CreateIndex
CREATE INDEX "ContentBlock_notificationId_idx" ON "ContentBlock"("notificationId");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");

-- CreateIndex
CREATE INDEX "Media_contentBlockId_idx" ON "Media"("contentBlockId");

-- CreateIndex
CREATE INDEX "Poll_contentBlockId_idx" ON "Poll"("contentBlockId");

-- CreateIndex
CREATE INDEX "PollOption_pollId_idx" ON "PollOption"("pollId");

-- CreateIndex
CREATE INDEX "PollVote_pollId_idx" ON "PollVote"("pollId");

-- CreateIndex
CREATE INDEX "PollVote_userId_idx" ON "PollVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PollVote_pollId_userId_key" ON "PollVote"("pollId", "userId");

-- CreateIndex
CREATE INDEX "Form_contentBlockId_idx" ON "Form"("contentBlockId");

-- CreateIndex
CREATE INDEX "FormField_formId_idx" ON "FormField"("formId");

-- CreateIndex
CREATE INDEX "FormSubmission_formId_idx" ON "FormSubmission"("formId");

-- CreateIndex
CREATE INDEX "FormSubmission_userId_idx" ON "FormSubmission"("userId");

-- CreateIndex
CREATE INDEX "FormResponse_submissionId_idx" ON "FormResponse"("submissionId");

-- CreateIndex
CREATE INDEX "FormResponse_fieldId_idx" ON "FormResponse"("fieldId");

-- CreateIndex
CREATE INDEX "_UserNotificationGroups_B_index" ON "_UserNotificationGroups"("B");

-- CreateIndex
CREATE INDEX "Business_type_idx" ON "Business"("type");

-- CreateIndex
CREATE INDEX "Business_category_idx" ON "Business"("category");

-- CreateIndex
CREATE INDEX "Business_city_idx" ON "Business"("city");

-- CreateIndex
CREATE INDEX "Business_verificationStatus_idx" ON "Business"("verificationStatus");

-- CreateIndex
CREATE INDEX "BusinessTeamMember_role_idx" ON "BusinessTeamMember"("role");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_status_idx" ON "Message"("status");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_lastMessageId_fkey" FOREIGN KEY ("lastMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallParticipant" ADD CONSTRAINT "CallParticipant_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallParticipant" ADD CONSTRAINT "CallParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessVerification" ADD CONSTRAINT "BusinessVerification_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessSubscription" ADD CONSTRAINT "BusinessSubscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessHours" ADD CONSTRAINT "BusinessHours_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCategory" ADD CONSTRAINT "ServiceCategory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceSchedule" ADD CONSTRAINT "ServiceSchedule_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceSchedule" ADD CONSTRAINT "ServiceSchedule_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProvider" ADD CONSTRAINT "ServiceProvider_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProvider" ADD CONSTRAINT "ServiceProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAgreement" ADD CONSTRAINT "ServiceAgreement_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAgreement" ADD CONSTRAINT "ServiceAgreement_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAgreement" ADD CONSTRAINT "ServiceAgreement_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "ServiceAgreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escrow" ADD CONSTRAINT "Escrow_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "ServiceAgreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "ServiceAgreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceReview" ADD CONSTRAINT "ServiceReview_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "ServiceAgreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "ServiceAgreement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "NotificationGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationAction" ADD CONSTRAINT "NotificationAction_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSettings" ADD CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationAnalytics" ADD CONSTRAINT "NotificationAnalytics_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageQueue" ADD CONSTRAINT "MessageQueue_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAnalytics" ADD CONSTRAINT "MessageAnalytics_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ContentBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_contentBlockId_fkey" FOREIGN KEY ("contentBlockId") REFERENCES "ContentBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_contentBlockId_fkey" FOREIGN KEY ("contentBlockId") REFERENCES "ContentBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PollOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_contentBlockId_fkey" FOREIGN KEY ("contentBlockId") REFERENCES "ContentBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormField" ADD CONSTRAINT "FormField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "FormField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserNotificationGroups" ADD CONSTRAINT "_UserNotificationGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "NotificationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserNotificationGroups" ADD CONSTRAINT "_UserNotificationGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
