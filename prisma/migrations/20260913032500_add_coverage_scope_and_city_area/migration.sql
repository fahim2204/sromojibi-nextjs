-- CreateEnum
CREATE TYPE "CoverageScope" AS ENUM ('SPECIFIC_AREA', 'ALL_UPAZILA', 'ALL_DISTRICT', 'ALL_DIVISION', 'NATIONWIDE');

-- AlterTable
ALTER TABLE "worker_profile" ADD COLUMN     "coverage_scope" "CoverageScope" NOT NULL DEFAULT 'SPECIFIC_AREA',
ADD COLUMN     "fk_city_area_id" TEXT;

-- CreateTable
CREATE TABLE "city_area" (
    "id" TEXT NOT NULL,
    "bbs_code" TEXT,
    "loc_division_id" TEXT NOT NULL,
    "loc_district_id" TEXT NOT NULL,
    "loc_upazila_id" TEXT,
    "title_bn" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "parent_thana" TEXT,
    "postal_code" TEXT,
    "row_status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "city_area_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "city_area_loc_division_id_idx" ON "city_area"("loc_division_id");

-- CreateIndex
CREATE INDEX "city_area_loc_district_id_idx" ON "city_area"("loc_district_id");

-- CreateIndex
CREATE INDEX "city_area_loc_upazila_id_idx" ON "city_area"("loc_upazila_id");

-- CreateIndex
CREATE INDEX "city_area_parent_thana_idx" ON "city_area"("parent_thana");

-- CreateIndex
CREATE INDEX "city_area_row_status_idx" ON "city_area"("row_status");

-- CreateIndex
CREATE INDEX "worker_profile_fk_city_area_id_idx" ON "worker_profile"("fk_city_area_id");

-- CreateIndex
CREATE INDEX "worker_profile_coverage_scope_idx" ON "worker_profile"("coverage_scope");

-- AddForeignKey
ALTER TABLE "worker_profile" ADD CONSTRAINT "worker_profile_fk_city_area_id_fkey" FOREIGN KEY ("fk_city_area_id") REFERENCES "city_area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_area" ADD CONSTRAINT "city_area_loc_division_id_fkey" FOREIGN KEY ("loc_division_id") REFERENCES "division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_area" ADD CONSTRAINT "city_area_loc_district_id_fkey" FOREIGN KEY ("loc_district_id") REFERENCES "district"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_area" ADD CONSTRAINT "city_area_loc_upazila_id_fkey" FOREIGN KEY ("loc_upazila_id") REFERENCES "upazila"("id") ON DELETE SET NULL ON UPDATE CASCADE;
