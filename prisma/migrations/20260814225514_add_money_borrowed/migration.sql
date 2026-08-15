-- CreateEnum
CREATE TYPE "BorrowStatus" AS ENUM ('PENDING', 'PAID');

-- CreateTable
CREATE TABLE "MoneyBorrowed" (
    "id" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "borrowedDate" TIMESTAMP(3) NOT NULL,
    "expectedReturnDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" "BorrowStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoneyBorrowed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MoneyBorrowed_userId_idx" ON "MoneyBorrowed"("userId");

-- CreateIndex
CREATE INDEX "MoneyBorrowed_status_idx" ON "MoneyBorrowed"("status");

-- AddForeignKey
ALTER TABLE "MoneyBorrowed" ADD CONSTRAINT "MoneyBorrowed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
