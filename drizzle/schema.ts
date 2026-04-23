import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Math topics table
export const topics = mysqlTable("topics", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 64 }),
  color: varchar("color", { length: 32 }),
  order: int("displayOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = typeof topics.$inferInsert;

// Exercises table
export const exercises = mysqlTable("exercises", {
  id: int("id").autoincrement().primaryKey(),
  topicId: int("topicId").notNull(),
  level: mysqlEnum("level", ["facil", "medio", "dificil"]).notNull(),
  question: text("question").notNull(),
  options: json("options"),
  correctAnswer: text("correctAnswer").notNull(),
  explanation: text("explanation"),
  hint: text("hint"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = typeof exercises.$inferInsert;

// Chat sessions
export const chatSessions = mysqlTable("chat_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topicSlug: varchar("topicSlug", { length: 64 }),
  title: varchar("title", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

// Chat messages
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// User progress per topic
export const userProgress = mysqlTable("user_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topicId: int("topicId").notNull(),
  exercisesCompleted: int("exercisesCompleted").notNull().default(0),
  exercisesCorrect: int("exercisesCorrect").notNull().default(0),
  currentStreak: int("currentStreak").notNull().default(0),
  bestStreak: int("bestStreak").notNull().default(0),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

// Contact leads (formulário de contato da Home)
export const contactLeads = mysqlTable("contact_leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  message: text("message").notNull(),
  source: varchar("source", { length: 64 }).default("home_form"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactLead = typeof contactLeads.$inferSelect;
export type InsertContactLead = typeof contactLeads.$inferInsert;

// Agents page chat sessions (Arquimedes, Atlas, Artemis, Detran-RJ)
export const agentsChatSessions = mysqlTable("agents_chat_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),                          // NULL for anonymous users
  sessionToken: varchar("sessionToken", { length: 64 }), // for anonymous users
  agentId: varchar("agentId", { length: 32 }).notNull().default("arquimedes"),
  messageCount: int("messageCount").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentsChatSession = typeof agentsChatSessions.$inferSelect;
export type InsertAgentsChatSession = typeof agentsChatSessions.$inferInsert;

// Agents page chat messages
export const agentsChatMessages = mysqlTable("agents_chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  latencyMs: int("latencyMs"),                    // response time in ms (assistant only)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentsChatMessage = typeof agentsChatMessages.$inferSelect;
export type InsertAgentsChatMessage = typeof agentsChatMessages.$inferInsert;
