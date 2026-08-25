ALTER TABLE `companies` ADD `accountingPlan` varchar(20) DEFAULT 'PKP' NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `postingMode` varchar(20) DEFAULT 'INDIRECT' NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `customerDueEnabled` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `supplierDueEnabled` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `salesPriceMode` varchar(20) DEFAULT 'NET' NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `itemDetailing` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `allowDocumentEditAfterSave` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `archiveEnabled` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `automaticBackupReminder` int DEFAULT 0 NOT NULL;