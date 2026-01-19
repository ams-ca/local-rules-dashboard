ALTER TABLE `court_urls` ADD `courtType` enum('federal','state') NOT NULL;--> statement-breakpoint
ALTER TABLE `pending_urls` ADD `courtType` enum('federal','state') NOT NULL;