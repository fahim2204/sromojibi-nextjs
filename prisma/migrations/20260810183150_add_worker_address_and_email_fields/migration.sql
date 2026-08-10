-- AlterTable
ALTER TABLE "worker_profile" ADD COLUMN     "email" TEXT,
ADD COLUMN     "upazila" TEXT,
ADD COLUMN     "village" TEXT,
ADD COLUMN     "zilla" TEXT;

-- CreateIndex
CREATE INDEX "worker_profile_zilla_idx" ON "worker_profile"("zilla");

-- CreateIndex
CREATE INDEX "worker_profile_upazila_idx" ON "worker_profile"("upazila");
