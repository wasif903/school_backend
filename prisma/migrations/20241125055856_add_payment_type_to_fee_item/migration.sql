/*
  Warnings:

  - You are about to drop the column `status` on the `FeeItem` table. All the data in the column will be lost.
  - Added the required column `dueDate` to the `FeeItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentType` to the `FeeItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `FeeItem` DROP COLUMN `status`,
    ADD COLUMN `dueDate` VARCHAR(191) NOT NULL,
    ADD COLUMN `paymentType` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Student` ADD COLUMN `picture` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Document` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
