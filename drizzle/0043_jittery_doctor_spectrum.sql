ALTER TABLE `purchaseOrders` ADD CONSTRAINT `purchaseOrders_company_number_unique` UNIQUE(`companyId`,`docNumber`);--> statement-breakpoint
ALTER TABLE `purchaseReceipts` ADD CONSTRAINT `purchaseReceipts_company_number_unique` UNIQUE(`companyId`,`docNumber`);--> statement-breakpoint
ALTER TABLE `purchaseReturns` ADD CONSTRAINT `purchaseReturns_company_number_unique` UNIQUE(`companyId`,`docNumber`);--> statement-breakpoint
ALTER TABLE `salesInvoices` ADD CONSTRAINT `salesInvoices_company_number_unique` UNIQUE(`companyId`,`docNumber`);--> statement-breakpoint
ALTER TABLE `salesOrders` ADD CONSTRAINT `salesOrders_company_number_unique` UNIQUE(`companyId`,`docNumber`);--> statement-breakpoint
ALTER TABLE `salesQuotations` ADD CONSTRAINT `salesQuotations_company_number_unique` UNIQUE(`companyId`,`docNumber`);--> statement-breakpoint
ALTER TABLE `salesReturns` ADD CONSTRAINT `salesReturns_company_number_unique` UNIQUE(`companyId`,`docNumber`);