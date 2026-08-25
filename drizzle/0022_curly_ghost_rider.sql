ALTER TABLE `payrollEmployees` ADD `bankPaymentCents` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `payrollEmployees` ADD `cashPaymentCents` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `payrollEntries` ADD `bankPaymentCents` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `payrollEntries` ADD `cashPaymentCents` int DEFAULT 0 NOT NULL;