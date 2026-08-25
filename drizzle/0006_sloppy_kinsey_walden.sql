CREATE TABLE `stockBalances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`warehouseId` int NOT NULL,
	`locationId` int NOT NULL DEFAULT 0,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stockBalances_id` PRIMARY KEY(`id`),
	CONSTRAINT `stockBalances_company_warehouse_location_product_unique` UNIQUE(`companyId`,`warehouseId`,`locationId`,`productId`)
);
