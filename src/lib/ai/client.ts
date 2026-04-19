import { createOpenAI } from "@ai-sdk/openai";
import { ChatOpenAI } from "@langchain/openai";

/**
 * Central AI client factory — powered by Groq (free, no billing required).
 *
 * Env vars:
 *   GROQ_API_KEY  — Groq API key (free at console.groq.com)
 *
 * Free models used:
 *   llama-3.1-8b-instant   — fast/cheap (6000 req/min free)
 *   llama-3.3-70b-versatile — smart/strong (600 req/min free)
 */

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY ?? "",
  compatibility: "compatible",
});

export const models = {
  /** Fast, cheap — classifiers, routers, quick responses. */
  fast: groq("llama-3.1-8b-instant"),
  /** Smart default — most agent steps. */
  smart: groq("llama-3.3-70b-versatile"),
  /** Maximum capability — critic/reviewer loops. */
  strong: groq("llama-3.3-70b-versatile"),
  /** Lightweight fallback. */
  fallback: groq("llama-3.1-8b-instant"),
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
    openAIApiKey: process.env.GROQ_API_KEY ?? "",
    configuration: {
      baseURL: "https://api.groq.com/openai/v1",
    },
  });
}
