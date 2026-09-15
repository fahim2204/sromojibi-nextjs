-- AlterTable
ALTER TABLE "worker_profile" ADD COLUMN IF NOT EXISTS "is_field_collected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "is_published" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "worker_profile_is_published_idx" ON "worker_profile"("is_published");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "worker_profile_is_field_collected_idx" ON "worker_profile"("is_field_collected");
