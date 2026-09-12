-- AlterTable
ALTER TABLE "worker_profile" ADD COLUMN "category_ids" INTEGER[] DEFAULT '{}'::INTEGER[],
ADD COLUMN "service_types" TEXT[] DEFAULT '{}'::TEXT[];

-- CreateIndex
CREATE INDEX "worker_profile_category_ids_idx" ON "worker_profile" USING GIN ("category_ids");

-- CreateTable
CREATE TABLE "worker_category" (
    "id" SERIAL NOT NULL,
    "fk_worker_id" INTEGER NOT NULL,
    "fk_category_id" INTEGER NOT NULL,

    CONSTRAINT "worker_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "worker_category_fk_worker_id_fk_category_id_key" ON "worker_category"("fk_worker_id", "fk_category_id");

-- CreateIndex
CREATE INDEX "worker_category_fk_worker_id_idx" ON "worker_category"("fk_worker_id");

-- CreateIndex
CREATE INDEX "worker_category_fk_category_id_idx" ON "worker_category"("fk_category_id");

-- AddForeignKey
ALTER TABLE "worker_category" ADD CONSTRAINT "worker_category_fk_worker_id_fkey" FOREIGN KEY ("fk_worker_id") REFERENCES "worker_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_category" ADD CONSTRAINT "worker_category_fk_category_id_fkey" FOREIGN KEY ("fk_category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
