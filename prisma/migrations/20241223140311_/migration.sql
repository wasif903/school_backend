/*
  Warnings:

  - You are about to drop the column `classNumber` on the `Class` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[className]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `className` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Class_classNumber_key` ON `Class`;

-- AlterTable
ALTER TABLE `Class` DROP COLUMN `classNumber`,
    ADD COLUMN `className` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Class_className_key` ON `Class`(`className`);
