/*
  Warnings:

  - You are about to drop the column `age_from` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `age_to` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `club_id` on the `subscription_requests` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `subscription_requests` table. All the data in the column will be lost.
  - You are about to drop the column `freezed_lessons` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `total_lessons` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `used_lessons` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `users` table. All the data in the column will be lost.
  - Made the column `freezed_lessons` on table `club_services` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `family_name` to the `families` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "subscription_requests" DROP CONSTRAINT "subscription_requests_club_id_fkey";

-- AlterTable
ALTER TABLE "attendances" ALTER COLUMN "teacher_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "club_services" ALTER COLUMN "freezed_lessons" SET NOT NULL;

-- AlterTable
ALTER TABLE "clubs" DROP COLUMN "age_from",
DROP COLUMN "age_to",
DROP COLUMN "color";

-- AlterTable
ALTER TABLE "families" ADD COLUMN     "family_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "subscription_requests" DROP COLUMN "club_id",
DROP COLUMN "startDate";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "freezed_lessons",
DROP COLUMN "price",
DROP COLUMN "total_lessons",
DROP COLUMN "used_lessons",
ADD COLUMN     "remaining_lessons" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "state_update_date" TIMESTAMP(3),
ADD COLUMN     "used_freezes" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "start_date" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_active",
ADD COLUMN     "refresh_token" TEXT;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
