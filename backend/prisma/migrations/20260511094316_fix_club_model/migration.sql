-- DropForeignKey
ALTER TABLE "clubs" DROP CONSTRAINT "clubs_default_teacher_id_fkey";

-- AlterTable
ALTER TABLE "clubs" ADD COLUMN     "day_classes" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "default_teacher_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_default_teacher_id_fkey" FOREIGN KEY ("default_teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
