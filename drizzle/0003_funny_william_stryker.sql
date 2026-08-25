CREATE TABLE `deliveryItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deliveryNoteId` int NOT NULL,
	`productId` int,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`unit` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deliveryItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliveryNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`docNumber` varchar(50) NOT NULL,
	`deliveryDate` timestamp NOT NULL,
	`salesOrderId` int,
	`customerId` int,
	`customerName` varchar(255),
	`warehouseId` int,
	`status` enum('DRAFT','VALIDATED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveryNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesOrderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`salesOrderId` int NOT NULL,
	`productId` int,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`deliveredQuantity` int NOT NULL DEFAULT 0,
	`unit` varchar(50),
	`unitPrice` int NOT NULL DEFAULT 0,
	`totalPrice` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `salesOrderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`docNumber` varchar(50) NOT NULL,
	`orderDate` timestamp NOT NULL,
	`expectedDate` timestamp,
	`customerId` int,
	`customerName` varchar(255),
	`quotationId` int,
	`totalAmount` int NOT NULL DEFAULT 0,
	`status` enum('DRAFT','CONFIRMED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salesOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesQuotationItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`salesQuotationId` int NOT NULL,
	`productId` int,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`unit` varchar(50),
	`unitPrice` int NOT NULL DEFAULT 0,
	`totalPrice` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `salesQuotationItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesQuotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`docNumber` varchar(50) NOT NULL,
	`quotationDate` timestamp NOT NULL,
	`validityDate` timestamp,
	`customerId` int,
	`customerName` varchar(255),
	`totalAmount` int NOT NULL DEFAULT 0,
	`status` enum('DRAFT','SENT','ACCEPTED','EXPIRED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salesQuotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesReturnItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`salesReturnId` int NOT NULL,
	`productId` int,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`unit` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `salesReturnItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesReturns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`docNumber` varchar(50) NOT NULL,
	`returnDate` timestamp NOT NULL,
	`customerId` int,
	`customerName` varchar(255),
	`deliveryNoteId` int,
	`status` enum('DRAFT','VALIDATED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salesReturns_id` PRIMARY KEY(`id`)
);
