CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`code` varchar(50),
	`name` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int,
	`action` varchar(100),
	`entityType` varchar(100),
	`entityId` int,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nipt` varchar(50),
	`address` varchar(255),
	`city` varchar(100),
	`phone` varchar(50),
	`email` varchar(255),
	`bank` varchar(255),
	`iban` varchar(50),
	`currency` varchar(10) DEFAULT 'ALL',
	`invoiceFooter` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`code` varchar(50),
	`name` varchar(255) NOT NULL,
	`nipt` varchar(50),
	`phone` varchar(50),
	`email` varchar(255),
	`address` varchar(255),
	`city` varchar(100),
	`balance` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`code` varchar(50),
	`name` varchar(255) NOT NULL,
	`barcode` varchar(100),
	`categoryId` int,
	`baseUnit` varchar(50),
	`stock` int DEFAULT 0,
	`minStock` int DEFAULT 0,
	`avgPrice` int DEFAULT 0,
	`lastPrice` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseInvoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`docNumber` varchar(50) NOT NULL,
	`date` timestamp NOT NULL,
	`dueDate` timestamp,
	`supplierId` int,
	`supplierName` varchar(255),
	`totalAmount` int DEFAULT 0,
	`status` enum('DRAFT','POSTED','PAID','CANCELLED') DEFAULT 'DRAFT',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchaseInvoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseInvoiceId` int NOT NULL,
	`productId` int,
	`productName` varchar(255),
	`quantity` int DEFAULT 0,
	`unit` varchar(50),
	`unitPrice` int DEFAULT 0,
	`totalPrice` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchaseItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesInvoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`docNumber` varchar(50) NOT NULL,
	`date` timestamp NOT NULL,
	`dueDate` timestamp,
	`customerId` int,
	`customerName` varchar(255),
	`totalAmount` int DEFAULT 0,
	`status` enum('DRAFT','POSTED','PAID','CANCELLED') DEFAULT 'DRAFT',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salesInvoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`salesInvoiceId` int NOT NULL,
	`productId` int,
	`productName` varchar(255),
	`quantity` int DEFAULT 0,
	`unit` varchar(50),
	`unitPrice` int DEFAULT 0,
	`totalPrice` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `salesItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`code` varchar(50),
	`name` varchar(255) NOT NULL,
	`nipt` varchar(50),
	`phone` varchar(50),
	`email` varchar(255),
	`address` varchar(255),
	`city` varchar(100),
	`balance` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(50) NOT NULL,
	`abbreviation` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `units_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userCompanies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyId` int NOT NULL,
	`role` enum('owner','admin','user','viewer') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userCompanies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`code` varchar(50),
	`name` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `warehouses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weightFormLines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weightFormId` int NOT NULL,
	`bagCount` int,
	`sacks` int,
	`grossWeight` int,
	`netWeight` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weightFormLines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weightForms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`docNumber` varchar(50) NOT NULL,
	`date` timestamp NOT NULL,
	`supplierId` int,
	`productId` int,
	`supplierName` varchar(255),
	`productName` varchar(255),
	`grossWeightTotal` int DEFAULT 0,
	`netWeightAfterPercent` int DEFAULT 0,
	`totalBagCount` int DEFAULT 0,
	`status` enum('DRAFT','POSTED','CANCELLED') DEFAULT 'DRAFT',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weightForms_id` PRIMARY KEY(`id`)
);
