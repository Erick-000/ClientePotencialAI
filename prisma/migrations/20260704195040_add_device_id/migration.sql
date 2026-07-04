-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "deviceId" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "deviceId" TEXT;

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "deviceId" TEXT;
