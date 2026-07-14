-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('DIRECT', 'REFERRAL', 'JOB_BOARD', 'LINKEDIN', 'OTHER');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "source" "ApplicationSource" NOT NULL DEFAULT 'DIRECT';
