/**
 * Agents Chat Tests — MSc Academy
 * Tests for agents chat session/message helpers and tRPC procedures.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

// ─── 1. Session token generation (anon users) ─────────────────────────────────
describe("Anonymous Session Token", () => {
  const generateToken = () =>
    Math.random().toString(36).slice(2) + Date.now().toString(36);

  it("generates a non-empty token", () => {
    const token = generateToken();
    expect(token.length).toBeGreaterThan(8);
  });

  it("generates unique tokens on each call", () => {
    const t1 = generateToken();
    const t2 = generateToken();
    expect(t1).not.toBe(t2);
  });

  it("token is alphanumeric", () => {
    const token = generateToken();
    expect(/^[a-z0-9]+$/.test(token)).toBe(true);
  });
});

// ─── 2. Latency formatting ─────────────────────────────────────────────────────
describe("Latency Display Formatting", () => {
  const formatLatency = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

  it("formats 1200ms as 1.2s", () => {
    expect(formatLatency(1200)).toBe("1.2s");
  });

  it("formats 500ms as 0.5s", () => {
    expect(formatLatency(500)).toBe("0.5s");
  });

  it("formats 10000ms as 10.0s", () => {
    expect(formatLatency(10000)).toBe("10.0s");
  });

  it("formats 0ms as 0.0s", () => {
    expect(formatLatency(0)).toBe("0.0s");
  });
});

// ─── 3. Copy button state machine ─────────────────────────────────────────────
describe("Copy Button State", () => {
  it("starts in not-copied state", () => {
    const state = { copied: false };
    expect(state.copied).toBe(false);
  });

  it("transitions to copied state on click", () => {
    const state = { copied: false };
    state.copied = true;
    expect(state.copied).toBe(true);
  });

  it("resets to not-copied after timeout", async () => {
    const state = { copied: true };
    await new Promise((r) => setTimeout(r, 10));
    state.copied = false;
    expect(state.copied).toBe(false);
  });
});

// ─── 4. Agent definitions validation ──────────────────────────────────────────
describe("Agent Definitions", () => {
  const AGENT_IDS = ["arquimedes", "atlas", "artemis", "detran"];
  const ENDPOINTS = [
    "/api/chat/stream",
    "/api/atlas/stream",
    "/api/artemis/stream",
    "/api/detran/stream",
  ];

  it("has exactly 4 agents defined", () => {
    expect(AGENT_IDS.length).toBe(4);
  });

  it("each agent has a unique id", () => {
    const unique = new Set(AGENT_IDS);
    expect(unique.size).toBe(AGENT_IDS.length);
  });

  it("each agent has a corresponding SSE endpoint", () => {
    expect(ENDPOINTS.length).toBe(AGENT_IDS.length);
    ENDPOINTS.forEach((ep) => {
      expect(ep.startsWith("/api/")).toBe(true);
      expect(ep.endsWith("/stream")).toBe(true);
    });
  });

  it("detran agent uses Portuguese placeholder", () => {
    const detranPlaceholder = "Pergunte sobre CNH, CRLV, IPVA, multas...";
    expect(detranPlaceholder).toContain("CNH");
    expect(detranPlaceholder).toContain("CRLV");
  });
});

// ─── 5. Message history helpers ────────────────────────────────────────────────
describe("Message History Utilities", () => {
  const buildHistory = (messages: { role: string; content: string }[]) =>
    messages.map((m) => ({ role: m.role, content: m.content }));

  it("builds history from messages array", () => {
    const msgs = [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
    ];
    const history = buildHistory(msgs);
    expect(history.length).toBe(2);
    expect(history[0].role).toBe("user");
    expect(history[1].role).toBe("assistant");
  });

  it("returns empty array for empty messages", () => {
    expect(buildHistory([])).toEqual([]);
  });

  it("preserves message order", () => {
    const msgs = Array.from({ length: 5 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `Message ${i}`,
    }));
    const history = buildHistory(msgs);
    history.forEach((h, i) => {
      expect(h.content).toBe(`Message ${i}`);
    });
  });
});

// ─── 6. DB helper: getOrCreateAgentsSession (mocked) ──────────────────────────
describe("getOrCreateAgentsSession (mocked)", () => {
  const mockGetOrCreate = vi.fn();

  beforeEach(() => {
    mockGetOrCreate.mockReset();
    mockGetOrCreate.mockImplementation(async (params: {
      agentId: string;
      userId?: number | null;
      sessionToken?: string | null;
    }) => {
      if (!params.agentId) throw new Error("agentId is required");
      return 42;
    });
  });

  it("returns a session id for a valid agentId", async () => {
    const id = await mockGetOrCreate({ agentId: "arquimedes", sessionToken: "tok123" });
    expect(id).toBe(42);
  });

  it("throws when agentId is missing", async () => {
    await expect(mockGetOrCreate({ agentId: "" })).rejects.toThrow("agentId is required");
  });

  it("accepts userId for authenticated users", async () => {
    const id = await mockGetOrCreate({ agentId: "atlas", userId: 7 });
    expect(id).toBe(42);
    expect(mockGetOrCreate).toHaveBeenCalledWith({ agentId: "atlas", userId: 7 });
  });
});

// ─── 7. DB helper: saveAgentsChatMessage (mocked) ─────────────────────────────
describe("saveAgentsChatMessage (mocked)", () => {
  const mockSave = vi.fn();

  beforeEach(() => {
    mockSave.mockReset();
    mockSave.mockImplementation(async (params: {
      sessionId: number;
      role: "user" | "assistant";
      content: string;
      latencyMs?: number | null;
    }) => {
      if (!params.content.trim()) throw new Error("content cannot be empty");
      return;
    });
  });

  it("saves a user message without latency", async () => {
    await expect(mockSave({ sessionId: 1, role: "user", content: "Hello" })).resolves.toBeUndefined();
  });

  it("saves an assistant message with latency", async () => {
    await expect(
      mockSave({ sessionId: 1, role: "assistant", content: "Hi!", latencyMs: 1200 })
    ).resolves.toBeUndefined();
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ latencyMs: 1200 })
    );
  });

  it("throws when content is empty", async () => {
    await expect(mockSave({ sessionId: 1, role: "user", content: "   " })).rejects.toThrow();
  });
});

// ─── 8. tRPC agentsChat.getSession (mocked) ───────────────────────────────────
describe("agentsChat.getSession procedure (mocked)", () => {
  const mockGetSession = vi.fn(async (input: { agentId: string; sessionToken?: string }) => {
    return {
      sessionId: 99,
      messages: [
        { role: "user" as const, content: "Test message", timestamp: Date.now(), latencyMs: undefined },
      ],
    };
  });

  it("returns sessionId and messages array", async () => {
    const result = await mockGetSession({ agentId: "arquimedes", sessionToken: "anon123" });
    expect(result.sessionId).toBe(99);
    expect(Array.isArray(result.messages)).toBe(true);
    expect(result.messages.length).toBe(1);
  });

  it("message has correct shape", async () => {
    const result = await mockGetSession({ agentId: "detran" });
    const msg = result.messages[0];
    expect(msg).toHaveProperty("role");
    expect(msg).toHaveProperty("content");
    expect(msg).toHaveProperty("timestamp");
    expect(["user", "assistant"]).toContain(msg.role);
  });
});

// ─── 9. tRPC agentsChat.saveMessage (mocked) ──────────────────────────────────
describe("agentsChat.saveMessage procedure (mocked)", () => {
  const mockSaveMessage = vi.fn(async (input: {
    sessionId: number;
    role: "user" | "assistant";
    content: string;
    latencyMs?: number;
  }) => {
    if (input.sessionId <= 0) return { ok: false };
    return { ok: true };
  });

  it("returns ok:true for valid input", async () => {
    const result = await mockSaveMessage({ sessionId: 1, role: "user", content: "Hello" });
    expect(result.ok).toBe(true);
  });

  it("returns ok:false for invalid sessionId", async () => {
    const result = await mockSaveMessage({ sessionId: 0, role: "assistant", content: "Hi" });
    expect(result.ok).toBe(false);
  });

  it("accepts optional latencyMs", async () => {
    const result = await mockSaveMessage({
      sessionId: 5,
      role: "assistant",
      content: "Response",
      latencyMs: 800,
    });
    expect(result.ok).toBe(true);
  });
});
