CREATE TABLE `employee_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`employee_id` int NOT NULL,
	`document_type` varchar(50) NOT NULL,
	`document_name` varchar(255) NOT NULL,
	`file_url` text NOT NULL,
	`file_key` varchar(255) NOT NULL,
	`uploaded_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employee_documents_id` PRIMARY KEY(`id`)
);
