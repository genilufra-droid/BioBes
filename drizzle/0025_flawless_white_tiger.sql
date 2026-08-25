CREATE TABLE `cargoLoadDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`cargoLoadId` int NOT NULL,
	`purchaseOrderId` int,
	`purchaseInvoiceId` int,
	`salesOrderId` int,
	`salesInvoiceId` int,
	`documentType` varchar(80) NOT NULL DEFAULT 'OTHER',
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(700) NOT NULL,
	`fileUrl` varchar(900) NOT NULL,
	`mimeType` varchar(180),
	`fileSize` int NOT NULL DEFAULT 0,
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cargoLoadDocuments_id` PRIMARY KEY(`id`),
	CONSTRAINT `cargoLoadDocuments_company_key_unique` UNIQUE(`companyId`,`fileKey`)
);
