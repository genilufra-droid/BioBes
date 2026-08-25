CREATE TABLE `chartOfAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`code` varchar(30) NOT NULL,
	`name` varchar(255) NOT NULL,
	`accountType` enum('ASSET','LIABILITY','EQUITY','INCOME','EXPENSE') NOT NULL,
	`parentId` int,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chartOfAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `chartOfAccounts_company_code_unique` UNIQUE(`companyId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `journalEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`journalId` int NOT NULL,
	`entryNumber` varchar(50) NOT NULL,
	`entryDate` timestamp NOT NULL,
	`reference` varchar(100),
	`status` enum('DRAFT','POSTED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`totalDebit` int NOT NULL DEFAULT 0,
	`totalCredit` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journalEntries_id` PRIMARY KEY(`id`),
	CONSTRAINT `journalEntries_company_number_unique` UNIQUE(`companyId`,`entryNumber`)
);
--> statement-breakpoint
CREATE TABLE `journalEntryLines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`journalEntryId` int NOT NULL,
	`accountId` int NOT NULL,
	`description` varchar(500),
	`debit` int NOT NULL DEFAULT 0,
	`credit` int NOT NULL DEFAULT 0,
	`partnerType` enum('SUPPLIER','CUSTOMER'),
	`partnerId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journalEntryLines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`journalType` enum('SALE','PURCHASE','BANK','CASH','GENERAL') NOT NULL,
	`defaultDebitAccountId` int,
	`defaultCreditAccountId` int,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journals_id` PRIMARY KEY(`id`),
	CONSTRAINT `journals_company_code_unique` UNIQUE(`companyId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`paymentNumber` varchar(50) NOT NULL,
	`paymentDate` timestamp NOT NULL,
	`paymentType` enum('INBOUND','OUTBOUND') NOT NULL,
	`partnerType` enum('SUPPLIER','CUSTOMER'),
	`partnerId` int,
	`partnerName` varchar(255),
	`journalId` int,
	`amount` int NOT NULL,
	`method` enum('CASH','BANK','CARD','OTHER') NOT NULL DEFAULT 'CASH',
	`reference` varchar(100),
	`status` enum('DRAFT','POSTED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_company_number_unique` UNIQUE(`companyId`,`paymentNumber`)
);
--> statement-breakpoint
CREATE TABLE `taxRates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`code` varchar(30) NOT NULL,
	`name` varchar(255) NOT NULL,
	`rate` int NOT NULL,
	`taxType` enum('SALE','PURCHASE','BOTH') NOT NULL DEFAULT 'BOTH',
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `taxRates_id` PRIMARY KEY(`id`),
	CONSTRAINT `taxRates_company_code_unique` UNIQUE(`companyId`,`code`)
);
