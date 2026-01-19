CREATE TABLE `judges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courtId` varchar(64) NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`title` enum('judge','commissioner','magistrate','magistrate_judge') NOT NULL DEFAULT 'judge',
	`department` varchar(64),
	`division` varchar(64),
	`specialRole` varchar(255),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `judges_id` PRIMARY KEY(`id`)
);
