CREATE TABLE `pending_urls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courtId` varchar(64) NOT NULL,
	`courtName` varchar(255) NOT NULL,
	`circuit` varchar(64),
	`category` varchar(64) NOT NULL,
	`url` text NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`confidenceScore` int,
	`discoveredAt` timestamp NOT NULL DEFAULT (now()),
	`discoveredBy` varchar(255) NOT NULL DEFAULT 'AI Agent',
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewedBy` varchar(255),
	`reviewedAt` timestamp,
	CONSTRAINT `pending_urls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `url_change_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courtUrlId` int NOT NULL,
	`oldUrl` text,
	`newUrl` text,
	`changedBy` varchar(255) NOT NULL,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	`reason` text,
	CONSTRAINT `url_change_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `url_verification_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courtUrlId` int NOT NULL,
	`checkedAt` timestamp NOT NULL DEFAULT (now()),
	`statusCode` int,
	`isAccessible` int NOT NULL,
	`redirectUrl` text,
	`errorMessage` text,
	`responseTime` int,
	CONSTRAINT `url_verification_log_id` PRIMARY KEY(`id`)
);
