CREATE TABLE `agents_chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`latencyMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agents_chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents_chat_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionToken` varchar(64),
	`agentId` varchar(32) NOT NULL DEFAULT 'arquimedes',
	`messageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_chat_sessions_id` PRIMARY KEY(`id`)
);
