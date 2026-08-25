ALTER TABLE `inventoryAdjustments` ADD `locationId` int;--> statement-breakpoint
ALTER TABLE `stockTransfers` ADD `sourceLocationId` int;--> statement-breakpoint
ALTER TABLE `stockTransfers` ADD `destinationLocationId` int;