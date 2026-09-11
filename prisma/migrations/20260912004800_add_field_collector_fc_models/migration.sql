-- CreateEnum
CREATE TYPE "FcAdminRole" AS ENUM ('COLLECTOR', 'LEAD', 'ADMIN');

-- CreateEnum
CREATE TYPE "FcRecordStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'VERIFIED', 'MERGED', 'REJECTED');

-- CreateTable
CREATE TABLE "fcadmin_user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "FcAdminRole" NOT NULL DEFAULT 'COLLECTOR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fcadmin_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fcadmin_session" (
    "id" SERIAL NOT NULL,
    "fk_user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "device_info" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fcadmin_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fcadmin_log" (
    "id" SERIAL NOT NULL,
    "fk_user_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fcadmin_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fc_collection_session" (
    "id" TEXT NOT NULL,
    "fk_collector_id" INTEGER,
    "collector_username" TEXT NOT NULL,
    "location_name" TEXT NOT NULL,
    "area" TEXT,
    "division_id" TEXT,
    "district_id" TEXT,
    "upazila_id" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "accuracy" DECIMAL(6,2),
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "total_collected" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fc_collection_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fc_collected_worker" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "category_id" INTEGER,
    "division_id" TEXT,
    "district_id" TEXT,
    "upazila_id" TEXT,
    "village" TEXT,
    "experience" TEXT,
    "details" TEXT,
    "status" "FcRecordStatus" NOT NULL DEFAULT 'DRAFT',
    "is_duplicate" BOOLEAN NOT NULL DEFAULT false,
    "duplicate_notes" TEXT,
    "photos" JSONB,
    "raw_metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fc_collected_worker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fcadmin_user_username_key" ON "fcadmin_user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "fcadmin_session_token_key" ON "fcadmin_session"("token");

-- CreateIndex
CREATE INDEX "fcadmin_session_fk_user_id_idx" ON "fcadmin_session"("fk_user_id");

-- CreateIndex
CREATE INDEX "fcadmin_session_expires_at_idx" ON "fcadmin_session"("expires_at");

-- CreateIndex
CREATE INDEX "fcadmin_log_fk_user_id_created_at_idx" ON "fcadmin_log"("fk_user_id", "created_at");

-- CreateIndex
CREATE INDEX "fc_collection_session_collector_username_idx" ON "fc_collection_session"("collector_username");

-- CreateIndex
CREATE INDEX "fc_collection_session_created_at_idx" ON "fc_collection_session"("created_at");

-- CreateIndex
CREATE INDEX "fc_collected_worker_session_id_idx" ON "fc_collected_worker"("session_id");

-- CreateIndex
CREATE INDEX "fc_collected_worker_phone_idx" ON "fc_collected_worker"("phone");

-- CreateIndex
CREATE INDEX "fc_collected_worker_status_idx" ON "fc_collected_worker"("status");

-- CreateIndex
CREATE INDEX "fc_collected_worker_created_at_idx" ON "fc_collected_worker"("created_at");

-- AddForeignKey
ALTER TABLE "fcadmin_session" ADD CONSTRAINT "fcadmin_session_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "fcadmin_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fcadmin_log" ADD CONSTRAINT "fcadmin_log_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "fcadmin_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fc_collection_session" ADD CONSTRAINT "fc_collection_session_fk_collector_id_fkey" FOREIGN KEY ("fk_collector_id") REFERENCES "fcadmin_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fc_collected_worker" ADD CONSTRAINT "fc_collected_worker_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "fc_collection_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

