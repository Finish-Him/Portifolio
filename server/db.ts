import { eq, and, desc, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  topics, InsertTopic, Topic,
  exercises, InsertExercise, Exercise,
  chatSessions, InsertChatSession,
  chatMessages, InsertChatMessage,
  userProgress, InsertUserProgress,
  contactLeads, InsertContactLead,
  agentsChatSessions, InsertAgentsChatSession, AgentsChatSession,
  agentsChatMessages, InsertAgentsChatMessage, AgentsChatMessage,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Topics ───
export async function getAllTopics() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(topics).orderBy(asc(topics.order));
}

export async function getTopicBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(topics).where(eq(topics.slug, slug)).limit(1);
  return result[0];
}

export async function insertTopic(topic: InsertTopic) {
  const db = await getDb();
  if (!db) return;
  await db.insert(topics).values(topic);
}

// ─── Exercises ───
export async function getExercisesByTopic(topicId: number, level?: string) {
  const db = await getDb();
  if (!db) return [];
  if (level) {
    return db.select().from(exercises)
      .where(and(eq(exercises.topicId, topicId), eq(exercises.level, level as any)));
  }
  return db.select().from(exercises).where(eq(exercises.topicId, topicId));
}

export async function getExerciseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
  return result[0];
}

export async function insertExercise(exercise: InsertExercise) {
  const db = await getDb();
  if (!db) return;
  await db.insert(exercises).values(exercise);
}

export async function insertExercises(exerciseList: InsertExercise[]) {
  const db = await getDb();
  if (!db) return;
  if (exerciseList.length === 0) return;
  await db.insert(exercises).values(exerciseList);
}

// ─── Chat Sessions ───
export async function createChatSession(session: InsertChatSession) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(chatSessions).values(session);
  return result[0].insertId;
}

export async function getUserChatSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatSessions)
    .where(eq(chatSessions.userId, userId))
    .orderBy(desc(chatSessions.updatedAt));
}

export async function getChatSessionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(chatSessions).where(eq(chatSessions.id, id)).limit(1);
  return result[0];
}

// ─── Chat Messages ───
export async function addChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) return;
  await db.insert(chatMessages).values(message);
}

export async function getSessionMessages(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(asc(chatMessages.createdAt));
}

// ─── User Progress ───
export async function getUserProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userProgress).where(eq(userProgress.userId, userId));
}

// ─── Contact Leads ───
export async function saveContactLead(lead: InsertContactLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(contactLeads).values(lead);
}

export async function upsertUserProgress(data: { userId: number; topicId: number; correct: boolean }) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(userProgress)
    .where(and(eq(userProgress.userId, data.userId), eq(userProgress.topicId, data.topicId)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(userProgress).values({
      userId: data.userId,
      topicId: data.topicId,
      exercisesCompleted: 1,
      exercisesCorrect: data.correct ? 1 : 0,
      currentStreak: data.correct ? 1 : 0,
      bestStreak: data.correct ? 1 : 0,
    });
  } else {
    const p = existing[0];
    const newStreak = data.correct ? p.currentStreak + 1 : 0;
    const newBest = Math.max(p.bestStreak, newStreak);
    await db.update(userProgress)
      .set({
        exercisesCompleted: p.exercisesCompleted + 1,
        exercisesCorrect: p.exercisesCorrect + (data.correct ? 1 : 0),
        currentStreak: newStreak,
        bestStreak: newBest,
        lastActivityAt: new Date(),
      })
      .where(eq(userProgress.id, p.id));
  }
}

// ─── Agents Chat (page /agents) ───────────────────────────────────────────────

/** Create or reuse a session for a given agent + user/token combo */
export async function getOrCreateAgentsSession(params: {
  agentId: string;
  userId?: number | null;
  sessionToken?: string | null;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Try to find an existing session (last 24h)
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const where = params.userId
    ? and(
        eq(agentsChatSessions.agentId, params.agentId),
        eq(agentsChatSessions.userId, params.userId),
        sql`${agentsChatSessions.updatedAt} > ${cutoff}`
      )
    : params.sessionToken
    ? and(
        eq(agentsChatSessions.agentId, params.agentId),
        eq(agentsChatSessions.sessionToken, params.sessionToken),
        sql`${agentsChatSessions.updatedAt} > ${cutoff}`
      )
    : null;

  if (where) {
    const existing = await db
      .select({ id: agentsChatSessions.id })
      .from(agentsChatSessions)
      .where(where)
      .orderBy(desc(agentsChatSessions.updatedAt))
      .limit(1);
    if (existing.length > 0) return existing[0].id;
  }

  // Create a new session
  const [result] = await db.insert(agentsChatSessions).values({
    agentId: params.agentId,
    userId: params.userId ?? null,
    sessionToken: params.sessionToken ?? null,
    messageCount: 0,
  });
  return (result as any).insertId as number;
}

/** Save a single message to the agents chat */
export async function saveAgentsChatMessage(params: {
  sessionId: number;
  role: "user" | "assistant";
  content: string;
  latencyMs?: number | null;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(agentsChatMessages).values({
    sessionId: params.sessionId,
    role: params.role,
    content: params.content,
    latencyMs: params.latencyMs ?? null,
  });
  // Increment message count
  await db
    .update(agentsChatSessions)
    .set({ messageCount: sql`${agentsChatSessions.messageCount} + 1` })
    .where(eq(agentsChatSessions.id, params.sessionId));
}

/** Load the last N messages for a session */
export async function getAgentsChatHistory(params: {
  sessionId: number;
  limit?: number;
}): Promise<AgentsChatMessage[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(agentsChatMessages)
    .where(eq(agentsChatMessages.sessionId, params.sessionId))
    .orderBy(asc(agentsChatMessages.createdAt))
    .limit(params.limit ?? 50);
  return rows;
}

/** Find the most recent session for a given agent + user/token */
export async function findAgentsSession(params: {
  agentId: string;
  userId?: number | null;
  sessionToken?: string | null;
}): Promise<AgentsChatSession | null> {
  const db = await getDb();
  if (!db) return null;
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const where = params.userId
    ? and(
        eq(agentsChatSessions.agentId, params.agentId),
        eq(agentsChatSessions.userId, params.userId),
        sql`${agentsChatSessions.updatedAt} > ${cutoff}`
      )
    : params.sessionToken
    ? and(
        eq(agentsChatSessions.agentId, params.agentId),
        eq(agentsChatSessions.sessionToken, params.sessionToken),
        sql`${agentsChatSessions.updatedAt} > ${cutoff}`
      )
    : null;
  if (!where) return null;
  const rows = await db
    .select()
    .from(agentsChatSessions)
    .where(where)
    .orderBy(desc(agentsChatSessions.updatedAt))
    .limit(1);
  return rows[0] ?? null;
}
