-- AlterTable
ALTER TABLE "worker_category" ADD COLUMN IF NOT EXISTS "is_primary" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "worker_category" ADD COLUMN IF NOT EXISTS "display_order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "worker_category_fk_worker_id_is_primary_idx" ON "worker_category"("fk_worker_id", "is_primary");
