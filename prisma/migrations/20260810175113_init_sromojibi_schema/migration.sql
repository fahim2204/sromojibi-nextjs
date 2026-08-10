-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "WorkerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'WORKER', 'ADMIN');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "password" TEXT,
    "last_login" TIMESTAMP(3),
    "is_superuser" BOOLEAN NOT NULL DEFAULT false,
    "username" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT NOT NULL,
    "is_staff" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "date_joined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "full_name" TEXT,
    "phone" TEXT,
    "image" TEXT,
    "cover_image" TEXT,
    "bio" TEXT,
    "city" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_session" (
    "id" SERIAL NOT NULL,
    "fk_user_id" INTEGER,
    "session_id" TEXT,
    "refresh_token_hash" TEXT,
    "user_agent" TEXT NOT NULL,
    "device_fingerprint" TEXT,
    "ip" TEXT,
    "device_type" TEXT,
    "os" TEXT,
    "browser" TEXT,
    "login_method" TEXT NOT NULL,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "login_success" BOOLEAN NOT NULL DEFAULT true,
    "error_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "user_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_oauth_account" (
    "id" SERIAL NOT NULL,
    "fk_user_id" INTEGER NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "email" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "avatar_url" TEXT,
    "raw_profile" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_oauth_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_otp" (
    "id" SERIAL NOT NULL,
    "fk_user_id" INTEGER NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" SERIAL NOT NULL,
    "fk_user_id" INTEGER NOT NULL,
    "fk_session_id" INTEGER,
    "type" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "name_bn" TEXT,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "name_bn" TEXT,
    "slug" TEXT NOT NULL,
    "division" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_profile" (
    "id" SERIAL NOT NULL,
    "fk_user_id" INTEGER,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "fk_category_id" INTEGER,
    "city" TEXT NOT NULL,
    "fk_location_id" INTEGER,
    "experience" TEXT NOT NULL,
    "details" TEXT,
    "status" "WorkerStatus" NOT NULL DEFAULT 'PENDING',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "rating" DECIMAL(3,2) DEFAULT 0.00,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_review" (
    "id" SERIAL NOT NULL,
    "fk_worker_id" INTEGER NOT NULL,
    "fk_user_id" INTEGER,
    "reviewer_name" TEXT NOT NULL,
    "reviewer_phone" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE INDEX "user_status_idx" ON "user"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_session_session_id_key" ON "user_session"("session_id");

-- CreateIndex
CREATE INDEX "user_session_fk_user_id_idx" ON "user_session"("fk_user_id");

-- CreateIndex
CREATE INDEX "user_session_session_id_idx" ON "user_session"("session_id");

-- CreateIndex
CREATE INDEX "user_session_created_at_idx" ON "user_session"("created_at");

-- CreateIndex
CREATE INDEX "user_session_last_seen_at_idx" ON "user_session"("last_seen_at");

-- CreateIndex
CREATE INDEX "user_oauth_account_fk_user_id_idx" ON "user_oauth_account"("fk_user_id");

-- CreateIndex
CREATE INDEX "user_oauth_account_email_idx" ON "user_oauth_account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_oauth_account_provider_provider_user_id_key" ON "user_oauth_account"("provider", "provider_user_id");

-- CreateIndex
CREATE INDEX "email_verification_otp_fk_user_id_idx" ON "email_verification_otp"("fk_user_id");

-- CreateIndex
CREATE INDEX "email_verification_otp_expires_at_idx" ON "email_verification_otp"("expires_at");

-- CreateIndex
CREATE INDEX "activity_log_fk_user_id_created_at_idx" ON "activity_log"("fk_user_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_log_fk_session_id_idx" ON "activity_log"("fk_session_id");

-- CreateIndex
CREATE INDEX "activity_log_type_idx" ON "activity_log"("type");

-- CreateIndex
CREATE INDEX "activity_log_created_at_idx" ON "activity_log"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "location_slug_key" ON "location"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "worker_profile_fk_user_id_key" ON "worker_profile"("fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "worker_profile_slug_key" ON "worker_profile"("slug");

-- CreateIndex
CREATE INDEX "worker_profile_fk_user_id_idx" ON "worker_profile"("fk_user_id");

-- CreateIndex
CREATE INDEX "worker_profile_fk_category_id_idx" ON "worker_profile"("fk_category_id");

-- CreateIndex
CREATE INDEX "worker_profile_fk_location_id_idx" ON "worker_profile"("fk_location_id");

-- CreateIndex
CREATE INDEX "worker_profile_status_idx" ON "worker_profile"("status");

-- CreateIndex
CREATE INDEX "worker_profile_city_idx" ON "worker_profile"("city");

-- CreateIndex
CREATE INDEX "worker_profile_service_type_idx" ON "worker_profile"("service_type");

-- CreateIndex
CREATE INDEX "worker_review_fk_worker_id_idx" ON "worker_review"("fk_worker_id");

-- CreateIndex
CREATE INDEX "worker_review_fk_user_id_idx" ON "worker_review"("fk_user_id");

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_oauth_account" ADD CONSTRAINT "user_oauth_account_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_otp" ADD CONSTRAINT "email_verification_otp_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_fk_session_id_fkey" FOREIGN KEY ("fk_session_id") REFERENCES "user_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_profile" ADD CONSTRAINT "worker_profile_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_profile" ADD CONSTRAINT "worker_profile_fk_category_id_fkey" FOREIGN KEY ("fk_category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_profile" ADD CONSTRAINT "worker_profile_fk_location_id_fkey" FOREIGN KEY ("fk_location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_review" ADD CONSTRAINT "worker_review_fk_worker_id_fkey" FOREIGN KEY ("fk_worker_id") REFERENCES "worker_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_review" ADD CONSTRAINT "worker_review_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
