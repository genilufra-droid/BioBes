ALTER TABLE `purchaseOrderItems` ADD `plantType` varchar(100);--> statement-breakpoint
ALTER TABLE `purchaseOrderItems` ADD `productCode` varchar(100);--> statement-breakpoint
ALTER TABLE `purchaseOrderItems` ADD `sackCount` int;--> statement-breakpoint
ALTER TABLE `purchaseOrderItems` ADD `grossWeightKg` int;--> statement-breakpoint
ALTER TABLE `purchaseOrderItems` ADD `netWeightKg` int;--> statement-breakpoint
ALTER TABLE `purchaseOrderItems` ADD `loadedQuantity` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `purchaseOrderItems` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `purchaseOrders` ADD `customerReference` varchar(100);--> statement-breakpoint
ALTER TABLE `purchaseOrders` ADD `preparationResponsible` varchar(255);--> statement-breakpoint
ALTER TABLE `purchaseOrders` ADD `loadingResponsible` varchar(255);--> statement-breakpoint
ALTER TABLE `purchaseOrders` ADD `documentationResponsible` varchar(255);--> statement-breakpoint
ALTER TABLE `purchaseOrders` ADD `verifierName` varchar(255);