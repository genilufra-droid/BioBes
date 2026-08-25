CREATE TABLE `creditNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`creditNoteNumber` varchar(50) NOT NULL,
	`noteDate` timestamp NOT NULL,
	`sourceType` enum('PURCHASE','SALE') NOT NULL,
	`sourceInvoiceId` int,
	`sourceInvoiceNumber` varchar(50),
	`partnerName` varchar(255),
	`amount` int NOT NULL DEFAULT 0,
	`vatAmount` int NOT NULL DEFAULT 0,
	`reason` text,
	`status` enum('DRAFT','POSTED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creditNotes_id` PRIMARY KEY(`id`),
	CONSTRAINT `creditNotes_company_number_unique` UNIQUE(`companyId`,`creditNoteNumber`)
);
