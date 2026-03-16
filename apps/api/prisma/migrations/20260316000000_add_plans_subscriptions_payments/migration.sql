-- CreateEnum
CREATE TYPE "PlanPeriod" AS ENUM ('monthly', 'quarterly', 'yearly', 'free');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('paid', 'pending');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'overdue', 'completed', 'cancelled');

-- CreateTable: plans
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "durationMonths" INTEGER NOT NULL DEFAULT 1,
    "period" "PlanPeriod" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- AlterTable: clients - remove old columns, add planId
ALTER TABLE "clients"
    DROP COLUMN IF EXISTS "contractMonths",
    DROP COLUMN IF EXISTS "paid",
    ADD COLUMN "planId" TEXT;

-- AddForeignKey: clients.planId -> plans.id
ALTER TABLE "clients" ADD CONSTRAINT "clients_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: payments
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "referenceMonth" DATE NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payments_clientId_referenceMonth_key" UNIQUE ("clientId", "referenceMonth")
);

-- AddForeignKey: payments.clientId -> clients.id
ALTER TABLE "payments" ADD CONSTRAINT "payments_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: client_subscriptions
CREATE TABLE "client_subscriptions" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_subscriptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: client_subscriptions.clientId -> clients.id
ALTER TABLE "client_subscriptions" ADD CONSTRAINT "client_subscriptions_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: client_subscriptions.planId -> plans.id
ALTER TABLE "client_subscriptions" ADD CONSTRAINT "client_subscriptions_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: subscription_payments
CREATE TABLE "subscription_payments" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "dueDate" DATE NOT NULL,
    "paidAt" TIMESTAMP(3),
    "amount" INTEGER NOT NULL,
    "notes" TEXT,
    "financeEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: subscription_payments.financeEntryId unique
CREATE UNIQUE INDEX "subscription_payments_financeEntryId_key" ON "subscription_payments"("financeEntryId");

-- AddForeignKey: subscription_payments.subscriptionId -> client_subscriptions.id
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_subscriptionId_fkey"
    FOREIGN KEY ("subscriptionId") REFERENCES "client_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: subscription_payments.financeEntryId -> finance_entries.id
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_financeEntryId_fkey"
    FOREIGN KEY ("financeEntryId") REFERENCES "finance_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
