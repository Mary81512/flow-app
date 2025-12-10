CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`kind` text NOT NULL,
	`filename` text NOT NULL,
	`url` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`code` text NOT NULL,
	`customer_name` text NOT NULL,
	`address` text NOT NULL,
	`order_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`status_data_complete` integer DEFAULT false NOT NULL,
	`status_report_generated` integer DEFAULT false NOT NULL,
	`status_invoice_written` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`time` text NOT NULL,
	`text` text NOT NULL,
	`source` text NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade
);
