ALTER TABLE `purchaseInvoices` ADD `vatAmount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `purchaseInvoices` ADD `carrierName` varchar(255);--> statement-breakpoint
ALTER TABLE `purchaseInvoices` ADD `vehiclePlate` varchar(50);--> statement-breakpoint
ALTER TABLE `purchaseInvoices` ADD `inventoryReference` varchar(100);