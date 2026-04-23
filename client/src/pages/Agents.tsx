import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bot, Package, Scale, Send,
  Sparkles, Globe, RotateCcw, ExternalLink, Loader2, Car,
  Copy, Check, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";

// ─── Session token for anonymous users ───────────────────────────────────────
function getAnonToken(): string {
  const key = "msc_agents_anon_token";
  let token = localStorage.getItem(key);
  if (!token) {
    token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, token);
  }
  return token;
}

// ─── Typing indicator component ──────────────────────────────────────────────
function TypingIndicator({ agentName, agentAvatar, gradient }: {
  agentName: string;
  agentAvatar: string;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start gap-3"
    >
      <div className="relative flex-shrink-0">
        <img src={agentAvatar} alt={agentName} className="w-8 h-8 rounded-xl object-cover mt-1" />
        <motion.div
          className={`absolute -inset-1 rounded-xl bg-gradient-to-r ${gradient} opacity-40`}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.15, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        />
      </div>
      <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-[#0c1629]/80 border border-slate-800/60 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`}
              animate={{ y: [0, -5, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.18, ease: "easeInOut" }}
            />
          ))}
        </div>
        <span className="text-xs text-slate-500 font-medium select-none">
          {agentName} is thinking…
        </span>
      </div>
    </motion.div>
  );
}

// ─── Copy button ─────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);
  return (
    <button
      onClick={copy}
      title={copied ? "Copied!" : "Copy response"}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 flex-shrink-0"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ─── Agent definitions ───────────────────────────────────────────────────────
const AGENTS = [
  {
    id: "arquimedes",
    name: "Arquimedes",
    tagline: "Interactive Math Agent",
    description: "LLM + TTS + SSE Streaming + Adaptive exercises. Teaches addition, subtraction, division, fractions, sets, percentages and rule of three.",
    avatar: "/manus-storage/Arquimedes_f63227f7.webp",
    gradient: "from-blue-500 via-cyan-500 to-blue-600",
    glow: "shadow-blue-500/30",
    border: "border-blue-500/40",
    activeBg: "bg-blue-500/10",
    textColor: "text-blue-400",
    icon: Bot,
    available: true,
    chatHref: "/arquimedes/chat",
    endpoint: "/api/chat/stream",
    bodyField: "content",
    placeholder: "Ask Arquimedes a math question...",
    stack: ["LangChain", "React", "tRPC", "SSE", "TTS", "MySQL"],
    suggestedPrompts: [
      "Explain fractions with a simple example",
      "How do I calculate 15% of 200?",
      "What is the rule of three?",
      "Help me understand sets",
    ],
  },
  {
    id: "atlas",
    name: "Atlas",
    tagline: "DTIC Asset Management — Detran-RJ",
    description: "Agent for DTIC asset management at Detran-RJ. Asset control, tracking and automated reporting. Powered by LangGraph + PostgreSQL.",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663548238703/KFrFYg84PBb8CrQscNDMJb/atlas_avatar_v2-7i7xiDPiuVvvtmb4YQmRbp.webp",
    gradient: "from-emerald-500 via-teal-500 to-emerald-600",
    glow: "shadow-emerald-500/30",
    border: "border-emerald-500/40",
    activeBg: "bg-emerald-500/10",
    textColor: "text-emerald-400",
    icon: Package,
    available: true,
    chatHref: null,
    endpoint: "/api/atlas/stream",
    bodyField: "message",
    placeholder: "Ask Atlas about DTIC asset management...",
    stack: ["LangGraph", "FastAPI", "PostgreSQL", "Supabase", "PGvector"],
    suggestedPrompts: [
      "How many IT assets does DTIC have in 2025?",
      "What is the total asset value?",
      "Which assets are not located?",
      "What equipment is at external posts?",
    ],
  },
  {
    id: "artemis",
    name: "Artemis",
    tagline: "Brazilian Bar Exam Prep (OAB)",
    description: "Specialized agent for Brazilian Bar Exam (OAB) 2nd Phase preparation. Questions, mock exams and contextualized explanations on Constitutional Law.",
    avatar: "/manus-storage/ArtemisPrincipal_e1733188.png",
    gradient: "from-amber-500 via-orange-500 to-amber-600",
    glow: "shadow-amber-500/30",
    border: "border-amber-500/40",
    activeBg: "bg-amber-500/10",
    textColor: "text-amber-400",
    icon: Scale,
    available: true,
    chatHref: null,
    endpoint: "/api/artemis/stream",
    bodyField: "message",
    placeholder: "Ask Artemis about OAB / Constitutional Law...",
    stack: ["RAG", "LangChain", "PGvector", "React", "FastAPI"],
    suggestedPrompts: [
      "What are the fundamental rights in the Brazilian Constitution?",
      "Explain the principle of human dignity",
      "What is habeas corpus and when to use it?",
      "How to structure a constitutional law petition?",
    ],
  },
  {
    id: "detran",
    name: "Detran-RJ",
    tagline: "Citizen Support — Detran-RJ",
    description: "Agente virtual especializado em todos os serviços do Detran-RJ: CNH, CRLV, IPVA, transferências, multas, endereços e procedimentos.",
    avatar: "/manus-storage/detran-logo-horizontal_e5be66da.png",
    gradient: "from-green-500 via-teal-500 to-green-600",
    glow: "shadow-green-500/30",
    border: "border-green-500/40",
    activeBg: "bg-green-500/10",
    textColor: "text-green-400",
    icon: Car,
    available: true,
    chatHref: null,
    endpoint: "/api/detran/stream",
    bodyField: "message",
    placeholder: "Pergunte sobre CNH, CRLV, IPVA, multas...",
    stack: ["LangChain", "RAG", "Express", "SSE", "MySQL"],
    suggestedPrompts: [
      "Como renovar minha CNH?",
      "Como emitir o CRLV digital?",
      "Como consultar e pagar multas?",
      "Quais os endereços das ciretrans do RJ?",
    ],
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  latencyMs?: number;
}

// ─── SSE streaming helper ────────────────────────────────────────────────────
async function streamSSE(
  endpoint: string,
  bodyField: string,
  text: string,
  history: { role: string; content: string }[],
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const body: Record<string, unknown> = { history };
  body[bodyField] = text;
  if (bodyField === "content") delete body.history;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) throw new Error(`Stream failed: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") return accumulated;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.token ?? parsed.content ?? null;
          if (delta) { accumulated += delta; onToken(accumulated); }
        } catch { /* ignore */ }
      }
    }
  }
  return accumulated;
}

// ─── Single agent chat panel ─────────────────────────────────────────────────
function AgentChat({ agent, sessionId, initialMessages }: {
  agent: typeof AGENTS[0];
  sessionId: number | null;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<number | null>(sessionId);

  // Keep sessionIdRef in sync
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // Sync initial messages when agent changes
  useEffect(() => { setMessages(initialMessages); }, [agent.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamContent]);

  const saveMsg = trpc.agentsChat.saveMessage.useMutation();

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setStreamContent("");

    // Persist user message
    if (sessionIdRef.current) {
      saveMsg.mutate({ sessionId: sessionIdRef.current, role: "user", content: text });
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const startTime = Date.now();

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const accumulated = await streamSSE(
        agent.endpoint, agent.bodyField, text, history,
        (partial) => setStreamContent(partial),
        abortRef.current.signal
      );

      const latencyMs = Date.now() - startTime;
      const assistantMsg: Message = {
        role: "assistant",
        content: accumulated || "Sorry, I could not generate a response. Please try again.",
        timestamp: Date.now(),
        latencyMs,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamContent("");

      // Persist assistant message with latency
      if (sessionIdRef.current) {
        saveMsg.mutate({
          sessionId: sessionIdRef.current,
          role: "assistant",
          content: assistantMsg.content,
          latencyMs,
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      }]);
      setStreamContent("");
    } finally {
      setIsLoading(false);
    }
  }, [agent, messages, isLoading, saveMsg]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setStreamContent("");
    setInput("");
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="relative mb-4">
              <div className={`absolute -inset-2 bg-gradient-to-r ${agent.gradient} rounded-2xl blur opacity-30`} />
              <img src={agent.avatar} alt={agent.name} className="relative w-20 h-20 rounded-2xl object-cover shadow-xl" />
            </div>
            <h3 className="text-white font-display font-bold text-lg mb-1">{agent.name}</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-sm">{agent.tagline}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {agent.suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left px-4 py-3 rounded-xl bg-white/5 border border-slate-700/40 text-slate-300 text-sm hover:bg-white/10 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.timestamp} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
            {msg.role === "assistant" && (
              <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-xl object-cover flex-shrink-0 mt-1" />
            )}
            <div className="flex flex-col gap-1 max-w-[80%]">
              <div className={`group relative rounded-2xl px-5 py-3.5 text-base leading-relaxed ${
                msg.role === "user"
                  ? `bg-gradient-to-br ${agent.gradient} text-white rounded-br-sm`
                  : "bg-[#0c1629]/80 border border-slate-800/60 text-slate-200 rounded-bl-sm"
              }`}>
                {msg.role === "assistant" ? (
                  <>
                    {/* Copy button — top right, visible on hover */}
                    <div className="absolute top-2 right-2">
                      <CopyButton text={msg.content} />
                    </div>
                    <div className="prose prose-invert prose-base max-w-none prose-p:my-1.5 prose-headings:my-2 prose-code:text-cyan-300 prose-code:bg-slate-800/80 prose-code:px-1.5 prose-code:rounded prose-a:text-blue-400 prose-li:my-0.5 pr-6">
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  </>
                ) : msg.content}
              </div>
              {/* Latency badge — only for assistant messages */}
              {msg.role === "assistant" && msg.latencyMs !== undefined && (
                <div className="flex items-center gap-1 text-[11px] text-slate-600 pl-1">
                  <Clock className="w-3 h-3" />
                  <span>Responded in {(msg.latencyMs / 1000).toFixed(1)}s</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isLoading && !streamContent && (
            <TypingIndicator agentName={agent.name} agentAvatar={agent.avatar} gradient={agent.gradient} />
          )}
        </AnimatePresence>

        {/* Streaming content */}
        <AnimatePresence>
          {isLoading && streamContent && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex justify-start gap-3"
            >
              <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-xl object-cover flex-shrink-0 mt-1" />
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-5 py-3.5 text-base bg-[#0c1629]/80 border border-slate-800/60 text-slate-200">
                <div className="prose prose-invert prose-base max-w-none prose-p:my-1.5 prose-code:text-cyan-300 prose-code:bg-slate-800/80 prose-code:px-1.5 prose-code:rounded prose-a:text-blue-400 prose-li:my-0.5">
                  <Streamdown>{streamContent}</Streamdown>
                </div>
                <motion.span
                  className="inline-block w-0.5 h-3.5 bg-slate-400 ml-0.5 align-middle"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-800/60 p-3 bg-[#060d1b]/80">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={agent.placeholder}
              rows={1}
              className="resize-none bg-slate-800/60 border-slate-700/60 text-slate-200 placeholder-slate-500 focus:border-blue-500/60 rounded-xl text-base min-h-[48px] max-h-[140px] pr-2"
              style={{ height: "auto" }}
            />
          </div>
          {messages.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={reset}
              className="border-slate-700/60 text-slate-500 hover:text-white h-[48px] px-3 rounded-xl"
              title="Clear conversation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className={`bg-gradient-to-r ${agent.gradient} text-white border-0 h-[48px] px-5 rounded-xl shadow-lg disabled:opacity-60 transition-all`}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-slate-600 mt-1.5 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function Agents() {
  const [activeAgent, setActiveAgent] = useState(0);
  const agent = AGENTS[activeAgent];
  const [anonToken] = useState(() => {
    if (typeof window !== "undefined") return getAnonToken();
    return "";
  });

  // Load session + history for the active agent
  const sessionQuery = trpc.agentsChat.getSession.useQuery(
    { agentId: agent.id, sessionToken: anonToken },
    { staleTime: 60_000, refetchOnWindowFocus: false }
  );

  const sessionId = sessionQuery.data?.sessionId ?? null;
  const initialMessages: Message[] = (sessionQuery.data?.messages ?? []).map((m) => ({
    role: m.role,
    content: m.content,
    timestamp: m.timestamp,
    latencyMs: m.latencyMs,
  }));

  return (
    <div className="min-h-screen bg-[#060d1b] text-white flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800/60 bg-[#060d1b]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">MSc Academy</span>
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-bold text-white">AI Agents</span>
          </div>
          <a href="https://www.linkedin.com/in/moises-costa-rj/" target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="border-slate-700/60 text-slate-400 hover:text-white gap-1.5 text-xs">
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">by Moises Costa</span>
            </Button>
          </a>
        </div>
      </div>

      {/* ── Agent selector tabs ──────────────────────────────────────────── */}
      <div className="border-b border-slate-800/60 bg-[#060d1b]/80 backdrop-blur-sm overflow-x-auto">
        <div className="container">
          <div className="flex gap-0 min-w-max">
            {AGENTS.map((a, i) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.id}
                  onClick={() => setActiveAgent(i)}
                  className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                    activeAgent === i
                      ? `${a.textColor} border-current bg-white/5`
                      : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img src={a.avatar} alt={a.name} className="w-6 h-6 rounded-lg object-cover" />
                  </div>
                  <span>{a.name}</span>
                  {activeAgent === i && (
                    <motion.div
                      layoutId="agent-tab-indicator"
                      className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${a.gradient}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="flex-1 container py-4">
        <div className="grid lg:grid-cols-4 gap-5 h-full" style={{ minHeight: "calc(100vh - 180px)" }}>

          {/* Left: Agent info panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-slate-800/60 bg-[#0c1629]/60 backdrop-blur-sm overflow-hidden h-full"
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${agent.gradient}`} />
                <div className="p-4">
                  <div className="relative mb-4">
                    <div className={`absolute -inset-2 bg-gradient-to-r ${agent.gradient} rounded-2xl blur opacity-20`} />
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="relative w-full max-w-[140px] mx-auto aspect-square rounded-2xl object-cover shadow-2xl border border-slate-700/40"
                    />
                  </div>
                  <h2 className="text-lg font-display font-extrabold text-white mb-1">{agent.name}</h2>
                  <p className={`text-xs font-semibold mb-2 ${agent.textColor}`}>{agent.tagline}</p>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">{agent.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {agent.stack.map((tech) => (
                      <span key={tech} className="px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400 text-[10px] border border-slate-700/40 font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${agent.border} ${agent.activeBg} mb-3`}>
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${agent.gradient} animate-pulse`} />
                    <span className={`text-xs font-semibold ${agent.textColor}`}>Online · Ready</span>
                  </div>
                  {/* Session indicator */}
                  {sessionId && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>History saved · Session #{sessionId}</span>
                    </div>
                  )}
                  {agent.available && agent.chatHref && (
                    <Link href={agent.chatHref}>
                      <Button className={`w-full mt-3 bg-gradient-to-r ${agent.gradient} text-white border-0 gap-2 shadow-lg`}>
                        <Sparkles className="h-4 w-4" />
                        Full Experience
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Chat panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-slate-800/60 bg-[#0c1629]/60 backdrop-blur-sm overflow-hidden flex flex-col"
                style={{ height: "calc(100vh - 175px)", minHeight: "560px" }}
              >
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60 bg-[#060d1b]/40">
                  <div className="relative">
                    <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-xl object-cover" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#060d1b] bg-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{agent.name}</p>
                    <p className="text-xs text-emerald-400">Online · Ready to chat</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${agent.gradient}`} />
                  </div>
                </div>

                {/* Chat body */}
                {sessionQuery.isLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                  </div>
                ) : (
                  <AgentChat
                    key={agent.id}
                    agent={agent}
                    sessionId={sessionId}
                    initialMessages={initialMessages}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
