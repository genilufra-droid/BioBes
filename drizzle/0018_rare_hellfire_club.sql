CREATE TABLE `payrollLeaveAbsences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`payrollEmployeeId` int NOT NULL,
	`leaveType` varchar(40) NOT NULL,
	`startDate` varchar(10) NOT NULL,
	`endDate` varchar(10) NOT NULL,
	`notes` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payrollLeaveAbsences_id` PRIMARY KEY(`id`)
);
