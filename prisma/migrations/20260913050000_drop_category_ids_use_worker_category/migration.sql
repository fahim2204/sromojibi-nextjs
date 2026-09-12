-- Ensure all category_ids are backfilled to worker_category
INSERT INTO "worker_category" ("fk_worker_id", "fk_category_id")
SELECT wp.id, cat_id
FROM "worker_profile" wp,
LATERAL unnest(wp.category_ids) AS cat_id
WHERE NOT EXISTS (
  SELECT 1 FROM "worker_category" wc
  WHERE wc.fk_worker_id = wp.id AND wc.fk_category_id = cat_id
)
ON CONFLICT ("fk_worker_id", "fk_category_id") DO NOTHING;

-- Drop GIN Index
DROP INDEX IF EXISTS "worker_profile_category_ids_idx";

-- Drop redundant category_ids column
ALTER TABLE "worker_profile" DROP COLUMN IF EXISTS "category_ids";
