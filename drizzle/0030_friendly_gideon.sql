ALTER TABLE `payments` ADD `currency` varchar(3) DEFAULT 'ALL' NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `exchangeRate` decimal(18,6) DEFAULT '1.000000' NOT NULL;