-- CreateTable
CREATE TABLE IF NOT EXISTS "raw_collection_log" (
    "id" SERIAL NOT NULL,
    "collection_uuid" TEXT NOT NULL,
    "parent_log_id" INTEGER,
    "entity_type" TEXT NOT NULL DEFAULT 'WORKER',
    "fk_worker_id" INTEGER,
    "fk_collector_id" INTEGER,
    "fk_fcadmin_user_id" INTEGER,
    "collector_username" TEXT,
    "collection_source" TEXT NOT NULL DEFAULT 'FIELD_COLLECTOR',
    "session_id" TEXT,
    "device_info" TEXT,
    "app_version" TEXT,
    "ip_address" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "accuracy_meters" DECIMAL(6,2),
    "captured_at" TIMESTAMP(3),
    "photos" JSONB,
    "raw_payload" JSONB,
    "ai_status" TEXT NOT NULL DEFAULT 'PENDING',
    "ai_started_at" TIMESTAMP(3),
    "ai_attempts" INTEGER NOT NULL DEFAULT 0,
    "ai_model" TEXT,
    "ai_prompt_version" TEXT,
    "ocr_raw_text" TEXT,
    "ai_extracted_json" JSONB,
    "ai_confidence" DECIMAL(4,3),
    "ai_error" TEXT,
    "ai_processed_at" TIMESTAMP(3),
    "normalization_status" TEXT NOT NULL DEFAULT 'PENDING',
    "normalized_json" JSONB,
    "normalization_error" TEXT,
    "normalized_at" TIMESTAMP(3),
    "matched_entity_type" TEXT,
    "matched_entity_id" INTEGER,
    "match_confidence" DECIMAL(4,3),
    "review_status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_collection_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "raw_collection_log_collection_uuid_key" ON "raw_collection_log"("collection_uuid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "raw_collection_log_collection_uuid_idx" ON "raw_collection_log"("collection_uuid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "raw_collection_log_entity_type_ai_status_idx" ON "raw_collection_log"("entity_type", "ai_status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "raw_collection_log_normalization_status_idx" ON "raw_collection_log"("normalization_status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "raw_collection_log_review_status_idx" ON "raw_collection_log"("review_status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "raw_collection_log_collection_source_idx" ON "raw_collection_log"("collection_source");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "raw_collection_log_fk_collector_id_idx" ON "raw_collection_log"("fk_collector_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "raw_collection_log_fk_fcadmin_user_id_idx" ON "raw_collection_log"("fk_fcadmin_user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "raw_collection_log_fk_worker_id_idx" ON "raw_collection_log"("fk_worker_id");

-- AddForeignKey
ALTER TABLE "raw_collection_log" DROP CONSTRAINT IF EXISTS "raw_collection_log_parent_log_id_fkey";
ALTER TABLE "raw_collection_log" ADD CONSTRAINT "raw_collection_log_parent_log_id_fkey" FOREIGN KEY ("parent_log_id") REFERENCES "raw_collection_log"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_collection_log" DROP CONSTRAINT IF EXISTS "raw_collection_log_fk_worker_id_fkey";
ALTER TABLE "raw_collection_log" ADD CONSTRAINT "raw_collection_log_fk_worker_id_fkey" FOREIGN KEY ("fk_worker_id") REFERENCES "worker_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_collection_log" DROP CONSTRAINT IF EXISTS "raw_collection_log_fk_collector_id_fkey";
ALTER TABLE "raw_collection_log" ADD CONSTRAINT "raw_collection_log_fk_collector_id_fkey" FOREIGN KEY ("fk_collector_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_collection_log" DROP CONSTRAINT IF EXISTS "raw_collection_log_fk_fcadmin_user_id_fkey";
ALTER TABLE "raw_collection_log" ADD CONSTRAINT "raw_collection_log_fk_fcadmin_user_id_fkey" FOREIGN KEY ("fk_fcadmin_user_id") REFERENCES "fcadmin_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
