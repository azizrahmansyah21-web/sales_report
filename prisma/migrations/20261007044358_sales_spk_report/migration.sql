-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SPV', 'SALES');

-- CreateEnum
CREATE TYPE "SpkStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nip" TEXT,
    "username" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SALES',
    "title" TEXT,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_spk" (
    "id" TEXT NOT NULL,
    "sales_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT,
    "unit_name" TEXT NOT NULL,
    "plan_date" TIMESTAMP(3) NOT NULL,
    "spk_status" "SpkStatus" NOT NULL DEFAULT 'PENDING',
    "keterangan" TEXT,
    "is_duplicate" BOOLEAN NOT NULL DEFAULT false,
    "is_rejected_repeat" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_spk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nip_key" ON "users"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "plan_spk_sales_id_idx" ON "plan_spk"("sales_id");

-- CreateIndex
CREATE INDEX "plan_spk_plan_date_idx" ON "plan_spk"("plan_date");

-- CreateIndex
CREATE INDEX "plan_spk_customer_name_sales_id_idx" ON "plan_spk"("customer_name", "sales_id");

-- CreateIndex
CREATE INDEX "plan_spk_is_duplicate_idx" ON "plan_spk"("is_duplicate");

-- CreateIndex
CREATE INDEX "plan_spk_spk_status_idx" ON "plan_spk"("spk_status");

-- AddForeignKey
ALTER TABLE "plan_spk" ADD CONSTRAINT "plan_spk_sales_id_fkey" FOREIGN KEY ("sales_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
