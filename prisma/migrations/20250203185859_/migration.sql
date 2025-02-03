/*
  Warnings:

  - Added the required column `permissionId` to the `Roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Roles` ADD COLUMN `permissionId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Roles` ADD CONSTRAINT `Roles_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `AdminSchema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Roles` ADD CONSTRAINT `Roles_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Roles` ADD CONSTRAINT `Roles_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
