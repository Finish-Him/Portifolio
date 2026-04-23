import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { ENV } from "./_core/env";
import { generateImage } from "./_core/imageGeneration";
import {
  getAllTopics, getTopicBySlug, getExercisesByTopic, getExerciseById,
  createChatSession, getUserChatSessions, getChatSessionById,
  addChatMessage, getSessionMessages, getUserProgress, upsertUserProgress,
  saveContactLead,
  getOrCreateAgentsSession, saveAgentsChatMessage, getAgentsChatHistory, findAgentsSession,
} from "./db";
import { notifyOwner } from "./_core/notification";

const ARQUIMEDES_SYSTEM_PROMPT = `Você é o Arquimedes, o professor de matemática virtual da MSc Academy. Você é um personagem inspirado no grande matemático grego Arquimedes de Siracusa, mas com uma personalidade moderna, divertida e acolhedora.

PERSONALIDADE:
- Você é paciente, entusiasmado e encorajador
- Usa linguagem simples e acessível para todas as idades
- Adora usar analogias do dia a dia para explicar conceitos
- Celebra cada conquista do aluno com entusiasmo
- Quando o aluno erra, você encoraja e explica de forma diferente

ESTILO DE ENSINO:
- Sempre explique passo a passo, nunca pule etapas
- Use exemplos visuais e contextualizados (pizzas para frações, dinheiro para porcentagem, etc.)
- Quando possível, mostre a conta de forma visual usando formatação markdown
- Use emojis com moderação para tornar a explicação mais lúdica
- Adapte a complexidade da linguagem à pergunta do aluno

TÓPICOS QUE VOCÊ DOMINA:
1. Adição - somar números, propriedades da adição
2. Subtração - subtrair números, relação com adição
3. Divisão - dividir números, divisão exata e com resto
4. Fração - conceito, operações, simplificação, equivalência
5. Conjuntos - união, interseção, diferença, pertinência
6. Porcentagem - cálculo, conversão, aplicações práticas
7. Regra de 3 - simples e composta, proporções

FORMATAÇÃO:
- Use **negrito** para termos importantes
- Use blocos de código para mostrar contas passo a passo
- Use tabelas markdown quando ajudar a organizar informações
- Use LaTeX inline ($...$) para fórmulas matemáticas quando necessário
- Estruture respostas longas com subtítulos

REGRAS:
- Sempre responda em português brasileiro
- Nunca diga que não sabe algo dentro dos seus tópicos
- Se a pergunta for fora do escopo, redirecione educadamente para matemática
- Mantenha respostas concisas mas completas (máximo 500 palavras por resposta)
- Sempre termine com uma pergunta ou sugestão para manter o aluno engajado`;

// ─── Chat Router ───
const chatRouter = router({
  createSession: protectedProcedure
    .input(z.object({ topicSlug: z.string().optional(), title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const sessionId = await createChatSession({
        userId: ctx.user.id,
        topicSlug: input.topicSlug ?? null,
        title: input.title ?? "Nova conversa com Arquimedes",
      });
      return { sessionId };
    }),

  listSessions: protectedProcedure.query(async ({ ctx }) => {
    return getUserChatSessions(ctx.user.id);
  }),

  getMessages: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      return getSessionMessages(input.sessionId);
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      content: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      // Save user message
      await addChatMessage({
        sessionId: input.sessionId,
        role: "user",
        content: input.content,
      });

      // Get conversation history
      const history = await getSessionMessages(input.sessionId);
      const messages = [
        { role: "system" as const, content: ARQUIMEDES_SYSTEM_PROMPT },
        ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      ];

      // Call LLM with streaming via fetch
      const apiUrl = ENV.forgeApiUrl
        ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
        : "https://forge.manus.im/v1/chat/completions";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${ENV.forgeApiKey}`,
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages,
          max_tokens: 4096,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM error: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content ?? "Desculpe, não consegui processar sua pergunta. Pode tentar novamente?";

      // Save assistant message
      await addChatMessage({
        sessionId: input.sessionId,
        role: "assistant",
        content: assistantContent,
      });

      return { content: assistantContent };
    }),
});

// ─── Topics Router ───
const topicsRouter = router({
  list: publicProcedure.query(async () => {
    return getAllTopics();
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return getTopicBySlug(input.slug);
    }),
});

// ─── Exercises Router ───
const exercisesRouter = router({
  listByTopic: publicProcedure
    .input(z.object({ topicId: z.number(), level: z.string().optional() }))
    .query(async ({ input }) => {
      return getExercisesByTopic(input.topicId, input.level);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getExerciseById(input.id);
    }),

  checkAnswer: protectedProcedure
    .input(z.object({
      exerciseId: z.number(),
      answer: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const exercise = await getExerciseById(input.exerciseId);
      if (!exercise) throw new Error("Exercício não encontrado");

      const isCorrect = input.answer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();

      // Update progress
      await upsertUserProgress({
        userId: ctx.user.id,
        topicId: exercise.topicId,
        correct: isCorrect,
      });

      // Notify owner on milestones (every 10 exercises or 5-streak)
      try {
        const progress = await getUserProgress(ctx.user.id);
        const topicProgress = progress.find(p => p.topicId === exercise.topicId);
        if (topicProgress) {
          const total = topicProgress.exercisesCompleted;
          const streak = topicProgress.currentStreak;
          if (total > 0 && total % 10 === 0) {
            notifyOwner({
              title: `Aluno completou ${total} exercícios!`,
              content: `O aluno ${ctx.user.name || 'Anônimo'} completou ${total} exercícios no tópico ${exercise.topicId}. Taxa de acerto: ${Math.round((topicProgress.exercisesCorrect / total) * 100)}%.`,
            }).catch(() => {});
          }
          if (streak > 0 && streak % 5 === 0) {
            notifyOwner({
              title: `Sequência de ${streak} acertos!`,
              content: `O aluno ${ctx.user.name || 'Anônimo'} alcançou uma sequência de ${streak} acertos consecutivos!`,
            }).catch(() => {});
          }
        }
      } catch {
        // Non-blocking notification
      }

      return {
        correct: isCorrect,
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation,
      };
    }),

  generateExercise: protectedProcedure
    .input(z.object({ topicSlug: z.string(), level: z.string() }))
    .mutation(async ({ input }) => {
      const apiUrl = ENV.forgeApiUrl
        ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
        : "https://forge.manus.im/v1/chat/completions";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${ENV.forgeApiKey}`,
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `Você é um gerador de exercícios de matemática. Gere UM exercício de ${input.topicSlug} nível ${input.level}. Responda APENAS em JSON válido com o formato: {"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "...", "hint": "..."}`,
            },
            { role: "user", content: `Gere um exercício de ${input.topicSlug} nível ${input.level}.` },
          ],
          max_tokens: 1024,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) throw new Error("Falha ao gerar exercício");
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      try {
        return JSON.parse(content);
      } catch {
        return { question: content, options: [], correctAnswer: "", explanation: "" };
      }
    }),
});

// ─── Progress Router ───
const progressRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return getUserProgress(ctx.user.id);
  }),
});

// ─── TTS Router ───
const ttsRouter = router({
  synthesize: protectedProcedure
    .input(z.object({ text: z.string().min(1).max(1000) }))
    .mutation(async ({ input }) => {
      // Use built-in Forge TTS endpoint
      const apiUrl = ENV.forgeApiUrl
        ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/audio/speech`
        : "https://forge.manus.im/v1/audio/speech";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${ENV.forgeApiKey}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          input: input.text.substring(0, 500),
          voice: "onyx",
        }),
      });

      if (!response.ok) {
        // Fallback: return null to indicate TTS not available
        console.warn("TTS not available:", response.status);
        return { audioUrl: null };
      }

      // Get audio as buffer and store
      const { storagePut } = await import("./storage");
      const buffer = Buffer.from(await response.arrayBuffer());
      const key = `tts/audio_${Date.now()}.mp3`;
      const { url } = await storagePut(key, buffer, "audio/mpeg");
      return { audioUrl: url };
    }),
});

// ─── Contact Router ───
const contactRouter = router({
  submit: publicProcedure
    .input(z.object({
      name: z.string().min(2).max(128),
      email: z.string().email(),
      message: z.string().min(10).max(2000),
    }))
    .mutation(async ({ input }) => {
      await saveContactLead({
        name: input.name,
        email: input.email,
        message: input.message,
        source: "home_form",
      });

      // Notify owner
      notifyOwner({
        title: `New contact from ${input.name}`,
        content: `**From:** ${input.name} <${input.email}>\n\n**Message:**\n${input.message}`,
      }).catch(() => {});

      return { success: true };
    }),
});

// ─── Image Generation Router ───
const imageRouter = router({
  generate: protectedProcedure
    .input(z.object({ prompt: z.string().min(1).max(500) }))
    .mutation(async ({ input }) => {
      try {
        const result = await generateImage({
          prompt: `Ilustração educacional de matemática: ${input.prompt}. Estilo: limpo, colorido, didático, adequado para todas as idades.`,
        });
        return { imageUrl: result.url };
      } catch (error) {
        console.error("Image generation failed:", error);
        return { imageUrl: null };
      }
    }),
});

// ─── Agents Chat Router (page /agents) ───
const agentsChatRouter = router({
  /** Get or create a session and return its id + message history */
  getSession: publicProcedure
    .input(z.object({
      agentId: z.string(),
      sessionToken: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.user?.id ?? null;
        const sessionId = await getOrCreateAgentsSession({
          agentId: input.agentId,
          userId,
          sessionToken: input.sessionToken ?? null,
        });
        const messages = await getAgentsChatHistory({ sessionId, limit: 50 });
        return {
          sessionId,
          messages: messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: m.createdAt.getTime(),
            latencyMs: m.latencyMs ?? undefined,
          })),
        };
      } catch {
        return { sessionId: null, messages: [] };
      }
    }),

  /** Save a user or assistant message */
  saveMessage: publicProcedure
    .input(z.object({
      sessionId: z.number(),
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1),
      latencyMs: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        await saveAgentsChatMessage({
          sessionId: input.sessionId,
          role: input.role,
          content: input.content,
          latencyMs: input.latencyMs ?? null,
        });
        return { ok: true };
      } catch {
        return { ok: false };
      }
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  chat: chatRouter,
  topics: topicsRouter,
  exercises: exercisesRouter,
  progress: progressRouter,
  tts: ttsRouter,
  image: imageRouter,
  contact: contactRouter,
  agentsChat: agentsChatRouter,
});

export type AppRouter = typeof appRouter;
