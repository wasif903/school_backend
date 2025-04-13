-- CreateTable
CREATE TABLE `DeductionPolicy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `policyName` VARCHAR(191) NOT NULL,
    `policyType` VARCHAR(191) NOT NULL,
    `policyDescription` VARCHAR(191) NULL,
    `deductionAmountType` ENUM('fixed', 'Percentage') NOT NULL,
    `applicableType` VARCHAR(191) NOT NULL,
    `deductedType` VARCHAR(191) NOT NULL,
    `selectedAllowance` VARCHAR(191) NOT NULL,
    `chKSalary` BOOLEAN NOT NULL,
    `chKOther` BOOLEAN NOT NULL,
    `chKHour` BOOLEAN NOT NULL,
    `chKMint` BOOLEAN NOT NULL,
    `chKSpecificTime` BOOLEAN NOT NULL,
    `deductionAmount` INTEGER NOT NULL,
    `validFrom` VARCHAR(191) NOT NULL,
    `validTo` VARCHAR(191) NOT NULL,
    `gracePeriod` INTEGER NOT NULL,
    `lateCount` INTEGER NOT NULL,
    `startTime` JSON NOT NULL,
    `endTime` JSON NOT NULL,
    `graceTime` JSON NOT NULL,
    `exceptions` VARCHAR(191) NOT NULL,
    `chkSpecificEvent` VARCHAR(191) NOT NULL,
    `selectedClass` VARCHAR(191) NOT NULL,
    `aplicableClass` VARCHAR(191) NOT NULL,
    `aplicableTeachers` VARCHAR(191) NOT NULL,
    `studentCheck` BOOLEAN NOT NULL,
    `sectionCheck` BOOLEAN NOT NULL,
    `staffCheck` BOOLEAN NOT NULL,
    `aplicableStaff` VARCHAR(191) NOT NULL,
    `selectedStaff` VARCHAR(191) NOT NULL,
    `aplicableHr` VARCHAR(191) NOT NULL,
    `aplicableFinance` VARCHAR(191) NOT NULL,
    `selectedTeacher` VARCHAR(191) NOT NULL,
    `selectedHr` VARCHAR(191) NOT NULL,
    `selectedFinance` VARCHAR(191) NOT NULL,
    `aplicableSection` VARCHAR(191) NOT NULL,
    `selectedSection` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NOT NULL,
    `lastUpdatedBy` VARCHAR(191) NOT NULL,
    `lastUpdatedDate` VARCHAR(191) NOT NULL,
    `branchId` INTEGER NULL,
    `adminId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventName` VARCHAR(191) NOT NULL,
    `eventDescription` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExceptionsList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `exceptionType` VARCHAR(191) NOT NULL,
    `exceptionDetails` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PolicyEvent` (
    `policyId` INTEGER NOT NULL,
    `eventId` INTEGER NOT NULL,

    PRIMARY KEY (`policyId`, `eventId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PolicyException` (
    `policyId` INTEGER NOT NULL,
    `exceptionId` INTEGER NOT NULL,

    PRIMARY KEY (`policyId`, `exceptionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DeductionPolicy` ADD CONSTRAINT `DeductionPolicy_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeductionPolicy` ADD CONSTRAINT `DeductionPolicy_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `AdminSchema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PolicyEvent` ADD CONSTRAINT `PolicyEvent_policyId_fkey` FOREIGN KEY (`policyId`) REFERENCES `DeductionPolicy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PolicyEvent` ADD CONSTRAINT `PolicyEvent_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PolicyException` ADD CONSTRAINT `PolicyException_policyId_fkey` FOREIGN KEY (`policyId`) REFERENCES `DeductionPolicy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PolicyException` ADD CONSTRAINT `PolicyException_exceptionId_fkey` FOREIGN KEY (`exceptionId`) REFERENCES `ExceptionsList`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
