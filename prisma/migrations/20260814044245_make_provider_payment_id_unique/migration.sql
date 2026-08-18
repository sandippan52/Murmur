/*
  Warnings:

  - A unique constraint covering the columns `[providerPaymentId]` on the table `paymenttransactions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "paymenttransactions_providerPaymentId_key" ON "paymenttransactions"("providerPaymentId");
