-- CreateTable
CREATE TABLE `AdminSchema` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `picture` VARCHAR(191) NOT NULL DEFAULT 'https://res.cloudinary.com/dhuhpslek/image/upload/fl_preserve_transparency/v1712595866/profile_demo_image_g57r6t.jpg?_s=public-apps',
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `AdminSchema_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleName` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `adminId` INTEGER NOT NULL,
    `branchId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Branch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `adminId` INTEGER NOT NULL,

    INDEX `Branch_adminId_fkey`(`adminId`),
    UNIQUE INDEX `Branch_name_address_key`(`name`, `address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Class` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NOT NULL,
    `className` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Class_className_key`(`className`),
    INDEX `Class_branchId_fkey`(`branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Grade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gradeLetter` VARCHAR(191) NOT NULL,
    `studentCapacity` INTEGER NOT NULL,
    `classId` INTEGER NOT NULL,

    INDEX `Grade_classId_fkey`(`classId`),
    UNIQUE INDEX `Grade_gradeLetter_classId_key`(`gradeLetter`, `classId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Parent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `branchId` INTEGER NOT NULL,
    `area` VARCHAR(191) NOT NULL,
    `block` VARCHAR(191) NOT NULL,
    `buildingName` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `cnic` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `houseNumber` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `occupation` VARCHAR(191) NOT NULL,
    `salary` INTEGER NOT NULL,
    `picture` VARCHAR(191) NULL,

    UNIQUE INDEX `Parent_email_key`(`email`),
    INDEX `Parent_branchId_fkey`(`branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `age` INTEGER NOT NULL,
    `parentId` INTEGER NOT NULL,
    `classId` INTEGER NOT NULL,
    `dob` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `hasSiblingsEnrolled` BOOLEAN NOT NULL DEFAULT false,
    `lastName` VARCHAR(191) NOT NULL,
    `noOfSibling` INTEGER NOT NULL,
    `prevClass` VARCHAR(191) NULL,
    `prevSchool` VARCHAR(191) NULL,
    `gradeId` INTEGER NOT NULL,
    `picture` VARCHAR(191) NULL,

    INDEX `Student_classId_fkey`(`classId`),
    INDEX `Student_gradeId_fkey`(`gradeId`),
    INDEX `Student_parentId_fkey`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Document` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,

    INDEX `Document_studentId_fkey`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeeCard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,

    INDEX `FeeCard_studentId_fkey`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeeItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `feeType` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `feeCardId` INTEGER NOT NULL,
    `dueDate` VARCHAR(191) NOT NULL,
    `paymentType` VARCHAR(191) NOT NULL,

    INDEX `FeeItem_feeCardId_fkey`(`feeCardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Branch` ADD CONSTRAINT `Branch_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `AdminSchema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Class` ADD CONSTRAINT `Class_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grade` ADD CONSTRAINT `Grade_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Parent` ADD CONSTRAINT `Parent_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_gradeId_fkey` FOREIGN KEY (`gradeId`) REFERENCES `Grade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Parent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeeCard` ADD CONSTRAINT `FeeCard_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeeItem` ADD CONSTRAINT `FeeItem_feeCardId_fkey` FOREIGN KEY (`feeCardId`) REFERENCES `FeeCard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
