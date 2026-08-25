CREATE TABLE `cargoLoads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`loadNumber` varchar(50) NOT NULL,
	`loadDate` timestamp NOT NULL,
	`customerId` int,
	`customerName` varchar(255),
	`driverId` int,
	`vehicleId` int,
	`origin` varchar(255),
	`destination` varchar(255),
	`weightKg` int DEFAULT 0,
	`status` enum('DRAFT','ASSIGNED','IN_TRANSIT','DELIVERED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cargoLoads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`plateNumber` varchar(50) NOT NULL,
	`vehicleType` varchar(100),
	`makeModel` varchar(255),
	`capacityKg` int DEFAULT 0,
	`driverId` int,
	`status` enum('ACTIVE','MAINTENANCE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agents` ADD `phone` varchar(50);--> statement-breakpoint
ALTER TABLE `agents` ADD `licenseNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `agents` ADD `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE' NOT NULL;