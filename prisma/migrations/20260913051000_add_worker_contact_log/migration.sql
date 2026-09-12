-- CreateTable
CREATE TABLE "worker_contact_log" (
    "id" SERIAL NOT NULL,
    "fk_worker_id" INTEGER NOT NULL,
    "fk_user_id" INTEGER,
    "channel" VARCHAR(20) NOT NULL DEFAULT 'PHONE',
    "ip_address" VARCHAR(100),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_contact_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "worker_contact_log_fk_worker_id_idx" ON "worker_contact_log"("fk_worker_id");

-- CreateIndex
CREATE INDEX "worker_contact_log_fk_user_id_idx" ON "worker_contact_log"("fk_user_id");

-- CreateIndex
CREATE INDEX "worker_contact_log_created_at_idx" ON "worker_contact_log"("created_at");

-- AddForeignKey
ALTER TABLE "worker_contact_log" ADD CONSTRAINT "worker_contact_log_fk_worker_id_fkey" FOREIGN KEY ("fk_worker_id") REFERENCES "worker_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_contact_log" ADD CONSTRAINT "worker_contact_log_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
