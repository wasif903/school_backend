/*
  Warnings:

  - You are about to drop the column `name` on the `Parent` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the `FeePayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FeeStructure` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `area` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `block` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buildingName` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cnic` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `houseNumber` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `occupation` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dob` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `noOfSibling` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `FeePayment` DROP FOREIGN KEY `FeePayment_feeStructureId_fkey`;

-- DropForeignKey
ALTER TABLE `FeePayment` DROP FOREIGN KEY `FeePayment_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `FeeStructure` DROP FOREIGN KEY `FeeStructure_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_feeStructureId_fkey`;

-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_studentId_fkey`;

-- AlterTable
ALTER TABLE `Parent` DROP COLUMN `name`,
    ADD COLUMN `area` VARCHAR(191) NOT NULL,
    ADD COLUMN `block` VARCHAR(191) NOT NULL,
    ADD COLUMN `buildingName` VARCHAR(191) NOT NULL,
    ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `cnic` VARCHAR(191) NOT NULL,
    ADD COLUMN `companyName` VARCHAR(191) NOT NULL,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `houseNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `occupation` VARCHAR(191) NOT NULL,
    ADD COLUMN `salary` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Student` DROP COLUMN `name`,
    ADD COLUMN `dob` VARCHAR(191) NOT NULL,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `gender` VARCHAR(191) NOT NULL,
    ADD COLUMN `hasSiblingsEnrolled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `noOfSibling` INTEGER NOT NULL,
    ADD COLUMN `prevClass` VARCHAR(191) NULL,
    ADD COLUMN `prevSchool` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `FeePayment`;

-- DropTable
DROP TABLE `FeeStructure`;

-- DropTable
DROP TABLE `Payment`;

-- CreateTable
CREATE TABLE `FeeCard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeeItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `feeType` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `feeCardId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FeeCard` ADD CONSTRAINT `FeeCard_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeeItem` ADD CONSTRAINT `FeeItem_feeCardId_fkey` FOREIGN KEY (`feeCardId`) REFERENCES `FeeCard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
