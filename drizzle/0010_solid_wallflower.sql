CREATE TABLE `bankTransfers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`transferNumber` varchar(50) NOT NULL,
	`transferDate` timestamp NOT NULL,
	`sourceBankAccountId` int NOT NULL,
	`destinationBankAccountId` int NOT NULL,
	`amount` int NOT NULL,
	`status` enum('DRAFT','POSTED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`reference` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bankTransfers_id` PRIMARY KEY(`id`),
	CONSTRAINT `bankTransfers_company_number_unique` UNIQUE(`companyId`,`transferNumber`)
);
