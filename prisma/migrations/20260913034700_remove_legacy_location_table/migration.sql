-- DropForeignKey
ALTER TABLE "worker_profile" DROP CONSTRAINT IF EXISTS "worker_profile_fk_location_id_fkey";

-- DropIndex
DROP INDEX IF EXISTS "worker_profile_fk_location_id_idx";

-- AlterTable
ALTER TABLE "worker_profile" DROP COLUMN IF EXISTS "fk_location_id";

-- DropTable
DROP TABLE IF EXISTS "location";
