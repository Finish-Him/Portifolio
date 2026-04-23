/**
 * Integration Tests — MSc Academy
 * Tests for tRPC procedures, SSE endpoints, and auth flows.
 * Requires the dev server running on port 3000.
 */
import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Context Factories ────────────────────────────────────────────────────────
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "moises@mscacademy.dev",
    name: "Moisés Costa",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Auth Procedures ──────────────────────────────────────────────────────────
describe("Auth Procedures", () => {
  it("auth.me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const me = await caller.auth.me();
    expect(me).toBeNull();
  });

  it("auth.me returns user object for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const me = await caller.auth.me();
    expect(me).not.toBeNull();
    expect(me?.name).toBe("Moisés Costa");
    expect(me?.email).toBe("moises@mscacademy.dev");
    expect(me?.role).toBe("user");
  });

  it("auth.me returns admin role for admin user", async () => {
    const caller = appRouter.createCaller(createAuthContext({ role: "admin" }));
    const me = await caller.auth.me();
    expect(me?.role).toBe("admin");
  });

  it("auth.logout clears session cookie", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});

// ─── Contact Procedure ────────────────────────────────────────────────────────
describe("Contact Procedure", () => {
  it("contact.submit rejects empty name", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.contact.submit({ name: "A", email: "test@test.com", message: "Hello world this is a test" })
    ).rejects.toThrow();
  });

  it("contact.submit rejects invalid email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.contact.submit({ name: "Test User", email: "not-an-email", message: "Hello world this is a test" })
    ).rejects.toThrow();
  });

  it("contact.submit rejects message too short", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.contact.submit({ name: "Test User", email: "test@test.com", message: "Short" })
    ).rejects.toThrow();
  });

  it("contact.submit succeeds with valid input", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.contact.submit({
      name: "Recruiter Test",
      email: "recruiter@company.com",
      message: "Hi Moisés, I found your portfolio and would like to discuss a role.",
    });
    expect(result.success).toBe(true);
  });
});

// ─── Topics Procedures ────────────────────────────────────────────────────────
describe("Topics Procedures", () => {
  it("topics.list returns all 7 math topics", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const topics = await caller.topics.list();
    expect(Array.isArray(topics)).toBe(true);
    expect(topics.length).toBeGreaterThanOrEqual(7);
  });

  it("topics.list items have required fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const topics = await caller.topics.list();
    const topic = topics[0];
    expect(topic).toHaveProperty("id");
    expect(topic).toHaveProperty("slug");
    expect(topic).toHaveProperty("name");
    expect(topic).toHaveProperty("description");
    expect(topic).toHaveProperty("order");
  });

  it("topics.getBySlug returns topic for valid slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const topic = await caller.topics.getBySlug({ slug: "adicao" });
    expect(topic).toBeDefined();
    expect(topic?.slug).toBe("adicao");
  });

  it("topics.getBySlug returns undefined for unknown slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const topic = await caller.topics.getBySlug({ slug: "nonexistent-topic" });
    expect(topic).toBeUndefined();
  });
});

// ─── Exercises Procedures ─────────────────────────────────────────────────────
describe("Exercises Procedures", () => {
  it("exercises.listByTopic returns exercises for topic 1", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const exercises = await caller.exercises.listByTopic({ topicId: 1 });
    expect(Array.isArray(exercises)).toBe(true);
    expect(exercises.length).toBeGreaterThan(0);
  });

  it("exercises.listByTopic items have required fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const exercises = await caller.exercises.listByTopic({ topicId: 1 });
    const ex = exercises[0];
    expect(ex).toHaveProperty("question");
    expect(ex).toHaveProperty("correctAnswer");
    expect(ex).toHaveProperty("options");
  });

  it("exercises.getById returns exercise for id 1", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const ex = await caller.exercises.getById({ id: 1 });
    expect(ex).toBeDefined();
    expect(ex?.id).toBe(1);
  });

  it("exercises.checkAnswer returns correct=true for right answer", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.exercises.checkAnswer({ exerciseId: 1, answer: "B" });
    expect(result.correct).toBe(true);
  });

  it("exercises.checkAnswer returns correct=false for wrong answer", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.exercises.checkAnswer({ exerciseId: 1, answer: "A" });
    expect(result.correct).toBe(false);
    expect(result.correctAnswer).toBeDefined();
  });

  it("exercises.checkAnswer throws for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.exercises.checkAnswer({ exerciseId: 1, answer: "B" })
    ).rejects.toThrow();
  });
});

// ─── Progress Procedures ──────────────────────────────────────────────────────
describe("Progress Procedures", () => {
  it("progress.get returns array for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const progress = await caller.progress.get();
    expect(Array.isArray(progress)).toBe(true);
  });

  it("progress.get throws for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.progress.get()).rejects.toThrow();
  });
});

// ─── HTTP Endpoints (SSE + Auth) ──────────────────────────────────────────────
describe("HTTP Endpoints", () => {
  const BASE = "http://localhost:3000";

  it("POST /api/auth/login returns 401 for wrong credentials", async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "hacker", password: "wrong" }),
    });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("POST /api/auth/login returns 200 for admin credentials", async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.name).toBe("Admin");
  });

  it("POST /api/auth/login returns 200 for Moises credentials", async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Moises", password: "admin" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user.name).toBe("Moises Costa");
  });

  it("POST /api/chat/stream returns 400 without content", async () => {
    const res = await fetch(`${BASE}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/atlas/stream returns 400 without message", async () => {
    const res = await fetch(`${BASE}/api/atlas/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/artemis/stream returns 200 with SSE content-type", async () => {
    const res = await fetch(`${BASE}/api/artemis/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "What is habeas corpus?" }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    res.body?.cancel();
  });

  it("POST /api/artemis/stream returns SSE error without message", async () => {
    const res = await fetch(`${BASE}/api/artemis/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("error");
  });

  it("POST /api/detran/stream returns 200 with SSE content-type", async () => {
    const res = await fetch(`${BASE}/api/detran/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Como renovar a CNH?" }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    res.body?.cancel();
  });

  it("POST /api/detran/stream returns SSE error without message", async () => {
    const res = await fetch(`${BASE}/api/detran/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("error");
  });

  it("GET /api/trpc/auth.me returns valid JSON", async () => {
    const res = await fetch(`${BASE}/api/trpc/auth.me`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("result");
  });

  it("server health check returns 200", async () => {
    const res = await fetch(`${BASE}/`);
    expect(res.status).toBe(200);
  });
});
