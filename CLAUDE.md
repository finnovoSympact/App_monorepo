@AGENTS.md

# Sanad — Claude Code project brief

> This file is loaded automatically by Claude Code. Keep it tight. Any setup that is not stack- or project-specific lives in `.claude/` instead. The `@AGENTS.md` reference above imports the Next.js 16 agent rules.

## What we're building

A **multi-agent credit passport platform** for the Sanad hackathon at INSAT (2026-04-18). The chosen idea is locked in `IDEAS.md` — read it before planning any feature. The core demo wow is a **visible live agent trace** that shows a supervisor + specialists + critic chain producing a grounded answer.

## Stack

- **Framework:** Next.js 16 (App Router, React 19, Turbopack)
- **Language:** TypeScript, `strict: true`
- **Styling:** Tailwind CSS v4 + shadcn/ui (New York, neutral base, CSS variables)
- **DB:** Postgres + Drizzle ORM (optional for demo — app must boot without `DATABASE_URL`)
- **Agents:** LangGraph (supervisor pattern) — source in `src/lib/ai/agents/`
- **LLM:** Anthropic via `@ai-sdk/anthropic` and `@langchain/anthropic`. Default models registered in `src/lib/ai/client.ts` (`models.fast`, `.smart`, `.strong`).
- **Package manager:** pnpm (10.x)

## Golden rules

1. **Never break the demo.** Before introducing a change, think: "will this still run end-to-end with only `ANTHROPIC_API_KEY` set?" If no — it needs a fallback or a feature flag.
2. **Agent traces are sacred.** Every agent must emit `trace` events through the LangGraph state so the UI can render them. A new agent without trace emission is an incomplete agent.
3. **No new top-level dependencies without asking.** The lockfile is committed; churn hurts demo-day reproducibility.
4. **Don't add auth, multi-tenancy, or RBAC.** Not in scope for the hackathon.
5. **Finance numbers** go through `formatTND` / `formatCompact` in `src/lib/utils.ts`.
6. **Prefer streaming.** Agent responses stream via SSE (`/api/agents`). If you build a new endpoint, mirror that pattern.
7. **Models are lazy.** `ChatAnthropic` instances must be created inside request handlers, not at module load — otherwise `next build` fails when keys aren't present.
8. **Server/client boundary.** Server components cannot pass functions (like formatters) to client components. If a page renders a client component that takes a function prop, the page must itself be `"use client"`.

## Commands

Run from the project root.

- `pnpm dev` — start dev server on :3000 (Turbopack).
- `pnpm check` — typecheck + lint + format-check. Run before every commit.
- `pnpm db:generate && pnpm db:migrate` — regenerate and apply migrations if the schema changes.

## Where things live

- `src/app/` — routes. `/` is the marketing/landing, `/playground` is the live demo, `/dashboard` is the finance UI shell.
- `src/app/api/agents/route.ts` — SSE streaming agent endpoint. Keep this thin; the logic lives in `src/lib/ai/agents/`.
- `src/lib/ai/agents/supervisor.ts` — the multi-agent graph. Add new specialists here.
- `src/lib/db/schema.ts` — Drizzle schema. Keep it generic so any IDEAS.md concept can adopt it.
- `src/components/` — reusable components; shadcn primitives in `src/components/ui/`.
- `src/components/agent-trace.tsx` — the live trace panel. **Do not replace this**; decorate it if needed.

## Style conventions

- Named exports preferred; default exports only for `page.tsx` / `layout.tsx`.
- Path alias `@/*` resolves to `src/*`.
- Tailwind classes over inline styles.
- Comments explain _why_, not _what_.
- Copy shadcn components by running `pnpm dlx shadcn@latest add <name>` — do not hand-author them.

## Subagents (in `.claude/agents/`)

- **ai-agent-architect** — use when adding specialists or reshaping the graph.
- **ui-polish** — use before demo rehearsal to elevate any rough screen.
- **reviewer** — use before every commit and before the pitch.
- **finance-advisor** — use when domain understanding blocks the code.

## Slash commands (in `.claude/commands/`)

- `/spec-to-tasks` — feed the specification book, get a 24h trimmed plan.
- `/ship` — pre-commit gate.
- `/demo-script` — produce a 4-minute judge-ready pitch with fallback lines.
- `/new-agent <name> <purpose>` — scaffold a new specialist end-to-end.

## When the spec book arrives tomorrow

1. Read the book, highlight judging criteria + any sponsor-mandated tracks.
2. Open `IDEAS.md` and pick the closest concept.
3. In a fresh Claude Code session, run `/spec-to-tasks` with the spec book as context — this produces a trimmed task list.
4. Swap the specialists in `src/lib/ai/agents/supervisor.ts` to match the chosen idea.
5. Rebrand copy in `src/components/hero.tsx` + metadata in `src/app/layout.tsx`.
6. Everything else stays.
