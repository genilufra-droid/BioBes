CREATE TABLE `payrollPeriodBonuses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`payrollPeriodId` int NOT NULL,
	`payrollEmployeeId` int NOT NULL,
	`bonusCents` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payrollPeriodBonuses_id` PRIMARY KEY(`id`),
	CONSTRAINT `payrollPeriodBonuses_period_employee_unique` UNIQUE(`payrollPeriodId`,`payrollEmployeeId`)
);
