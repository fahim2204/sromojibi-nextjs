-- DropForeignKey
ALTER TABLE "fc_collected_worker" DROP CONSTRAINT IF EXISTS "fc_collected_worker_session_id_fkey";

-- DropForeignKey
ALTER TABLE "fc_collection_session" DROP CONSTRAINT IF EXISTS "fc_collection_session_fk_collector_id_fkey";

-- AlterTable
ALTER TABLE "worker_profile" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE IF EXISTS "fc_collected_worker";

-- DropTable
DROP TABLE IF EXISTS "fc_collection_session";

-- DropEnum
DROP TYPE IF EXISTS "FcRecordStatus";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "worker_profile_is_active_idx" ON "worker_profile"("is_active");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "worker_profile_is_verified_idx" ON "worker_profile"("is_verified");
