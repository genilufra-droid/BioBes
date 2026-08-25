CREATE TABLE `inventoryAdjustmentItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inventoryAdjustmentId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`countedQuantity` int NOT NULL,
	`systemQuantity` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventoryAdjustmentItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventoryAdjustments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`docNumber` varchar(50) NOT NULL,
	`adjustmentDate` timestamp NOT NULL,
	`warehouseId` int,
	`status` enum('DRAFT','VALIDATED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventoryAdjustments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockLocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`warehouseId` int NOT NULL,
	`code` varchar(50),
	`name` varchar(255) NOT NULL,
	`locationType` enum('INTERNAL','INPUT','OUTPUT','VIRTUAL') NOT NULL DEFAULT 'INTERNAL',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stockLocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockMovements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`docNumber` varchar(50) NOT NULL,
	`movementDate` timestamp NOT NULL,
	`movementType` enum('IN','OUT','TRANSFER','ADJUSTMENT') NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`warehouseId` int,
	`sourceLocationId` int,
	`destinationLocationId` int,
	`referenceType` varchar(50),
	`referenceId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stockMovements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockTransferItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockTransferId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unit` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stockTransferItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockTransfers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`docNumber` varchar(50) NOT NULL,
	`transferDate` timestamp NOT NULL,
	`sourceWarehouseId` int NOT NULL,
	`destinationWarehouseId` int NOT NULL,
	`status` enum('DRAFT','VALIDATED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stockTransfers_id` PRIMARY KEY(`id`)
);
