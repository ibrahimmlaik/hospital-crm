-- AlterTable
ALTER TABLE "RevenueRecord" ADD COLUMN "doctorId" TEXT;

-- CreateIndex
CREATE INDEX "RevenueRecord_doctorId_idx" ON "RevenueRecord"("doctorId");
