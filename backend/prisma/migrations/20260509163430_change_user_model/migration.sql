/*
  Warnings:

  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "password",
ADD COLUMN     "code_expires_at" TIMESTAMP(3),
ADD COLUMN     "verification_code" TEXT;
