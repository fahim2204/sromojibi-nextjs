-- AlterTable: Convert experience to INTEGER
ALTER TABLE "worker_profile" ALTER COLUMN "experience" TYPE INTEGER USING (COALESCE(NULLIF(regexp_replace(experience, '[^0-9]', '', 'g'), '')::integer, 1));
ALTER TABLE "worker_profile" ALTER COLUMN "experience" SET DEFAULT 1;

-- DropIndex
DROP INDEX IF EXISTS "worker_profile_city_idx";
DROP INDEX IF EXISTS "worker_profile_zilla_idx";
DROP INDEX IF EXISTS "worker_profile_upazila_idx";

-- AlterTable: Drop redundant text location columns
ALTER TABLE "worker_profile" DROP COLUMN IF EXISTS "city",
DROP COLUMN IF EXISTS "zilla",
DROP COLUMN IF EXISTS "upazila",
DROP COLUMN IF EXISTS "village";
