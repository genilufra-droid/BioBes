CREATE TABLE `payrollAttendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`payrollPeriodId` int NOT NULL,
	`payrollEmployeeId` int NOT NULL,
	`day` int NOT NULL,
	`attendanceCode` varchar(10) NOT NULL DEFAULT '8',
	`normalMinutes` int NOT NULL DEFAULT 0,
	`overtimeMinutes` int NOT NULL DEFAULT 0,
	`note` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payrollAttendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payrollEmployees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeNumber` varchar(50) NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100),
	`position` varchar(150),
	`regularRateCents` int NOT NULL DEFAULT 0,
	`overtimeRateCents` int NOT NULL DEFAULT 0,
	`baseSalaryCents` int NOT NULL DEFAULT 0,
	`advanceCents` int NOT NULL DEFAULT 0,
	`paymentMethod` enum('BANK','CASH') NOT NULL DEFAULT 'BANK',
	`bankName` varchar(150),
	`bankAccount` varchar(100),
	`isForeign` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payrollEmployees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payrollEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`payrollPeriodId` int NOT NULL,
	`payrollEmployeeId` int NOT NULL,
	`employeeNumber` varchar(50) NOT NULL,
	`employeeName` varchar(255) NOT NULL,
	`normalMinutes` int NOT NULL DEFAULT 0,
	`overtimeMinutes` int NOT NULL DEFAULT 0,
	`regularPayCents` int NOT NULL DEFAULT 0,
	`overtimePayCents` int NOT NULL DEFAULT 0,
	`bonusCents` int NOT NULL DEFAULT 0,
	`grossCents` int NOT NULL DEFAULT 0,
	`socialEmployeeCents` int NOT NULL DEFAULT 0,
	`socialEmployerCents` int NOT NULL DEFAULT 0,
	`taxableCents` int NOT NULL DEFAULT 0,
	`taxCents` int NOT NULL DEFAULT 0,
	`netCents` int NOT NULL DEFAULT 0,
	`advanceCents` int NOT NULL DEFAULT 0,
	`payableCents` int NOT NULL DEFAULT 0,
	`paymentMethod` enum('BANK','CASH') NOT NULL DEFAULT 'BANK',
	`status` enum('DRAFT','GENERATED','PAID','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payrollEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payrollPeriods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`year` int NOT NULL,
	`month` int NOT NULL,
	`status` enum('DRAFT','GENERATED','POSTED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`currency` varchar(10) NOT NULL DEFAULT 'EUR',
	`taxRulesJson` text,
	`socialEmployeeRateBp` int NOT NULL DEFAULT 0,
	`socialEmployerRateBp` int NOT NULL DEFAULT 0,
	`notes` text,
	`generatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payrollPeriods_id` PRIMARY KEY(`id`)
);
