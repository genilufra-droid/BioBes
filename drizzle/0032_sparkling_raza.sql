ALTER TABLE `warehouses` ADD `unitType` enum('WAREHOUSE','POINT_OF_SALE','OFFICE','OTHER') DEFAULT 'WAREHOUSE' NOT NULL;--> statement-breakpoint
ALTER TABLE `warehouses` ADD `active` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `warehouses` ADD `unitType` enum('WAREHOUSE','POINT_OF_SALE','OFFICE','OTHER') DEFAULT 'WAREHOUSE' NOT NULL;--> statement-breakpoint
ALTER TABLE `warehouses` ADD `address` varchar(255);--> statement-breakpoint
ALTER TABLE `warehouses` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `warehouses` ADD `contact` varchar(255);--> statement-breakpoint
ALTER TABLE `warehouses` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `warehouses` ADD `inventoryMethod` enum('INTERMEDIATE','CONTINUOUS','INVENTORY') DEFAULT 'INTERMEDIATE' NOT NULL;--> statement-breakpoint
ALTER TABLE `warehouses` ADD `supplyPointOfSale` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `warehouses` ADD `allowNegativeStock` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `warehouses` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;
