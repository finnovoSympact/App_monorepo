import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";

/**
 * Central AI client factory. All model calls in the app should go through here
 * so we can swap providers, add observability, or inject guardrails in one place.
 *
 * Env vars:
 *   ANTHROPIC_API_KEY — required for Claude
 *   OPENAI_API_KEY    — optional, used as fallback
 */

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const models = {
  /** Fast, cheap — use for classifiers, routers, cheap agents. */
  fast: anthropic("claude-haiku-4-5-20251001"),
  /** Smart default — use for most agent steps. */
  smart: anthropic("claude-sonnet-4-6"),
  /** Maximum capability — reserve for critic/reviewer loops and tough tasks. */
  strong: anthropic("claude-opus-4-6"),
  /** Fallback if Anthropic is down. */
  fallback: openai("gpt-4.1-mini"),
} as const;

export type ModelKey = keyof typeof models;
