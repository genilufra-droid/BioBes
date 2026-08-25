CREATE TABLE `bankAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`bankName` varchar(255),
	`iban` varchar(64),
	`currency` varchar(10) NOT NULL DEFAULT 'EUR',
	`openingBalance` int NOT NULL DEFAULT 0,
	`currentBalance` int NOT NULL DEFAULT 0,
	`accountType` enum('BANK','CASH') NOT NULL DEFAULT 'BANK',
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bankAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bankStatements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`bankAccountId` int NOT NULL,
	`statementNumber` varchar(50) NOT NULL,
	`dateFrom` timestamp NOT NULL,
	`dateTo` timestamp NOT NULL,
	`openingBalance` int NOT NULL DEFAULT 0,
	`closingBalance` int NOT NULL DEFAULT 0,
	`status` enum('DRAFT','RECONCILED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bankStatements_id` PRIMARY KEY(`id`),
	CONSTRAINT `bankStatements_company_number_unique` UNIQUE(`companyId`,`statementNumber`)
);
--> statement-breakpoint
CREATE TABLE `bankTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`bankStatementId` int NOT NULL,
	`transactionDate` timestamp NOT NULL,
	`reference` varchar(100),
	`description` varchar(500) NOT NULL,
	`transactionType` enum('CREDIT','DEBIT') NOT NULL,
	`amount` int NOT NULL,
	`status` enum('UNRECONCILED','RECONCILED') NOT NULL DEFAULT 'UNRECONCILED',
	`paymentId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bankTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crmActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`leadId` int NOT NULL,
	`activityType` enum('CALL','EMAIL','MEETING','TODO') NOT NULL,
	`subject` varchar(255) NOT NULL,
	`dueDate` timestamp NOT NULL,
	`status` enum('PLANNED','DONE','CANCELLED') NOT NULL DEFAULT 'PLANNED',
	`notes` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crmActivities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crmLeads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`leadNumber` varchar(50) NOT NULL,
	`leadType` enum('LEAD','OPPORTUNITY') NOT NULL DEFAULT 'LEAD',
	`name` varchar(255) NOT NULL,
	`companyName` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`source` varchar(100),
	`stage` enum('NEW','QUALIFIED','PROPOSAL','WON','LOST') NOT NULL DEFAULT 'NEW',
	`expectedRevenue` int NOT NULL DEFAULT 0,
	`probability` int NOT NULL DEFAULT 0,
	`assignedUserId` int,
	`customerId` int,
	`nextActivityDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crmLeads_id` PRIMARY KEY(`id`),
	CONSTRAINT `crmLeads_company_number_unique` UNIQUE(`companyId`,`leadNumber`)
);
