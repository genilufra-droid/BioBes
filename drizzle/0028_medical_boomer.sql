ALTER TABLE `purchaseInvoices` ADD `currency` varchar(10) DEFAULT 'ALL' NOT NULL;--> statement-breakpoint
ALTER TABLE `purchaseInvoices` ADD `exchangeRate` decimal(14,6) DEFAULT '1.000000' NOT NULL;--> statement-breakpoint
ALTER TABLE `salesInvoices` ADD `currency` varchar(10) DEFAULT 'ALL' NOT NULL;--> statement-breakpoint
ALTER TABLE `salesInvoices` ADD `exchangeRate` decimal(14,6) DEFAULT '1.000000' NOT NULL;