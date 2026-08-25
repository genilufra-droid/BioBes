CREATE TABLE `purchaseOrderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseOrderId` int NOT NULL,
	`productId` int,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`receivedQuantity` int NOT NULL DEFAULT 0,
	`unit` varchar(50),
	`unitPrice` int NOT NULL DEFAULT 0,
	`totalPrice` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchaseOrderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`docNumber` varchar(50) NOT NULL,
	`orderDate` timestamp NOT NULL,
	`expectedDate` timestamp,
	`supplierId` int,
	`supplierName` varchar(255),
	`totalAmount` int NOT NULL DEFAULT 0,
	`status` enum('DRAFT','CONFIRMED','RECEIVED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchaseOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseReceiptItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseReceiptId` int NOT NULL,
	`productId` int,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`unit` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchaseReceiptItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseReceipts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`docNumber` varchar(50) NOT NULL,
	`receiptDate` timestamp NOT NULL,
	`purchaseOrderId` int,
	`supplierId` int,
	`supplierName` varchar(255),
	`warehouseId` int,
	`status` enum('DRAFT','VALIDATED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchaseReceipts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseReturnItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseReturnId` int NOT NULL,
	`productId` int,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`unit` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchaseReturnItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseReturns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`docNumber` varchar(50) NOT NULL,
	`returnDate` timestamp NOT NULL,
	`supplierId` int,
	`supplierName` varchar(255),
	`purchaseReceiptId` int,
	`status` enum('DRAFT','VALIDATED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchaseReturns_id` PRIMARY KEY(`id`)
);
