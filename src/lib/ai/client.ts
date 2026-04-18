import { createOpenAI } from "@ai-sdk/openai";
import { ChatOpenAI } from "@langchain/openai";

/**
 * Central AI client factory — powered by Groq (OpenAI-compatible).
 *
 * Env vars:
 *   GROQ_API_KEY      — required
 *   OPENAI_BASE_URL   — defaults to https://api.groq.com/openai/v1
 */

function groqBaseURL(): string {
  return process.env.OPENAI_BASE_URL ?? "https://api.groq.com/openai/v1";
}

// AI SDK client (for streaming routes / generateText)
const groq = createOpenAI({
  baseURL: groqBaseURL(),
  apiKey: process.env.GROQ_API_KEY ?? "",
});

export const models = {
  /** Fast, cheap — classifiers, routers, cheap agents. */
  fast: groq("llama-3.1-8b-instant"),
  /** Smart default — most agent steps. */
  smart: groq("llama-3.3-70b-versatile"),
  /** Maximum capability — critic/reviewer loops. */
  strong: groq("llama-3.3-70b-versatile"),
  /** Lightweight fallback. */
  fallback: groq("gemma2-9b-it"),
} as const;

export type ModelKey = keyof typeof models;

/**
 * LangChain model factory for agents that use @langchain/core messages.
 * Must be called inside a request handler (not at module load time).
 */
export function getLangchainModel(
  tier: "fast" | "smart" | "strong" = "smart",
): ChatOpenAI {
  const modelName =
    tier === "fast" ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile";
  return new ChatOpenAI({
    modelName,
    temperature: tier === "fast" ? 0.1 : 0.2,
    configuration: {
      baseURL: groqBaseURL(),
      apiKey: process.env.GROQ_API_KEY ?? "",
    },
  });
}
