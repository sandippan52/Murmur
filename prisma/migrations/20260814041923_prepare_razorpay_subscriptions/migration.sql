-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "communitysubscription" ALTER COLUMN "expiresAt" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "communitysubscription_providerSubscriptionId_idx" ON "communitysubscription"("providerSubscriptionId");
