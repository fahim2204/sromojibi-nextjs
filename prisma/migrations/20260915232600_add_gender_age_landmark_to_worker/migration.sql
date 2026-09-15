-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "worker_profile" ADD COLUMN "gender" "Gender" NOT NULL DEFAULT 'MALE',
ADD COLUMN "age" INTEGER,
ADD COLUMN "landmark" TEXT;

-- CreateIndex
CREATE INDEX "worker_profile_gender_idx" ON "worker_profile"("gender");
