CREATE TABLE `purchaseOrderAttachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseOrderId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(700) NOT NULL,
	`mimeType` varchar(150),
	`fileSize` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchaseOrderAttachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `purchaseOrders` ADD `operationalStatus` enum('IN_PROGRESS','LOADED','SENT','COMPLETED') DEFAULT 'IN_PROGRESS' NOT NULL;