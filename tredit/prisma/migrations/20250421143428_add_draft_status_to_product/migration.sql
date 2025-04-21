/*
  Warnings:

  - You are about to drop the column `youtubeVideoId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `ProductImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "ProductStatus" ADD VALUE 'DRAFT';

-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "youtubeVideoId";

-- DropTable
DROP TABLE "ProductImage";
