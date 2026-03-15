-- CreateEnum
CREATE TYPE "FinanceCategory" AS ENUM ('tecnologia', 'marketing', 'atendimento', 'comercial', 'outros');

-- Convert existing data: set NULL/unknown values to 'outros'
UPDATE "finance_entries" SET "category" = 'outros' WHERE "category" IS NULL OR "category" = '';

-- AlterTable: change column type from String? to FinanceCategory (NOT NULL)
ALTER TABLE "finance_entries"
  ALTER COLUMN "category" SET NOT NULL,
  ALTER COLUMN "category" SET DEFAULT 'outros',
  ALTER COLUMN "category" TYPE "FinanceCategory" USING "category"::"FinanceCategory";

-- Remove default after migration
ALTER TABLE "finance_entries" ALTER COLUMN "category" DROP DEFAULT;
