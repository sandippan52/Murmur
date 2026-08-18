/*
  Warnings:

  - Added the required column `updatedAt` to the `communitysubscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "communitysubscription" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "providerCustomerId" TEXT,
ADD COLUMN     "providerSubscriptionId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "paymenttransactions" (
    "id" TEXT NOT NULL,
    "subscriptionId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "grossAmount" DECIMAL(10,2) NOT NULL,
    "platformFee" DECIMAL(10,2) NOT NULL,
    "creatorAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "provider" TEXT,
    "providerPaymentId" TEXT,
    "status" "PaymentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paymenttransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creatorpayouts" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PayoutStatus" NOT NULL,
    "provider" TEXT,
    "providerTransferId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creatorpayouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "paymenttransactions_subscriptionId_idx" ON "paymenttransactions"("subscriptionId");

-- CreateIndex
CREATE INDEX "paymenttransactions_userId_idx" ON "paymenttransactions"("userId");

-- CreateIndex
CREATE INDEX "paymenttransactions_communityId_idx" ON "paymenttransactions"("communityId");

-- CreateIndex
CREATE INDEX "paymenttransactions_providerPaymentId_idx" ON "paymenttransactions"("providerPaymentId");

-- CreateIndex
CREATE INDEX "creatorpayouts_creatorId_idx" ON "creatorpayouts"("creatorId");

-- CreateIndex
CREATE INDEX "creatorpayouts_communityId_idx" ON "creatorpayouts"("communityId");

-- CreateIndex
CREATE INDEX "creatorpayouts_providerTransferId_idx" ON "creatorpayouts"("providerTransferId");

-- CreateIndex
CREATE INDEX "communitysubscription_communityId_idx" ON "communitysubscription"("communityId");

-- CreateIndex
CREATE INDEX "communitysubscription_userId_idx" ON "communitysubscription"("userId");

-- AddForeignKey
ALTER TABLE "paymenttransactions" ADD CONSTRAINT "paymenttransactions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "communitysubscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paymenttransactions" ADD CONSTRAINT "paymenttransactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paymenttransactions" ADD CONSTRAINT "paymenttransactions_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creatorpayouts" ADD CONSTRAINT "creatorpayouts_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creatorpayouts" ADD CONSTRAINT "creatorpayouts_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
