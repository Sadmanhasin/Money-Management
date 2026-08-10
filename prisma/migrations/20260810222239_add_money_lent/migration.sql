-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'RECEIVED');

-- CreateTable
CREATE TABLE "MoneyLent" (
    "id" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "expectedReturnDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoneyLent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MoneyLent_userId_idx" ON "MoneyLent"("userId");

-- CreateIndex
CREATE INDEX "MoneyLent_status_idx" ON "MoneyLent"("status");

-- AddForeignKey
ALTER TABLE "MoneyLent" ADD CONSTRAINT "MoneyLent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
