CREATE TABLE `court_urls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courtId` varchar(64) NOT NULL,
	`courtName` varchar(255) NOT NULL,
	`circuit` varchar(64),
	`category` varchar(64) NOT NULL,
	`url` text NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`lastVerified` timestamp,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` varchar(255),
	CONSTRAINT `court_urls_id` PRIMARY KEY(`id`)
);
