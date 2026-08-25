ALTER TABLE `salesInvoices` ADD `invoiceFormat` varchar(20) DEFAULT 'DOMESTIC' NOT NULL;--> statement-breakpoint
ALTER TABLE `salesInvoices` ADD `exportDetails` text;