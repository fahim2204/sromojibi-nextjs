-- AlterTable
ALTER TABLE "raw_collection_log" ADD COLUMN IF NOT EXISTS "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "raw_collection_log_is_verified_idx" ON "raw_collection_log"("is_verified");
