# Finnovo

A multi-agent finance copilot, built for the Finnovo hackathon at INSAT (2026-04-18).

**Core idea.** A supervisor agent dispatches specialist agents (fundamentals, news, risk, critic, composer) that collaborate to answer financial questions. The UI streams their reasoning trace live — the transparency *is* the product.

## Quick start

```bash
# Requires Node 20+ and pnpm 10+.
pnpm install
cp .env.example .env.local   # then fill in ANTHROPIC_API_KEY
pnpm dev                     # http://localhost:3000
```

Open `/` for the landing, `/playground` for the live agent demo, `/dashboard` for the finance UI shell.

## The stack

| Layer            | Choice                                              |
| ---------------- | --------------------------------------------------- |
| Framework        | Next.js 16 (App Router, React 19, Turbopack)        |
| Language         | TypeScript (`strict: true`)                         |
| Styling          | Tailwind CSS v4 + shadcn/ui (New York, neutral)     |
| Agents           | LangGraph supervisor pattern                        |
| LLMs             | Anthropic (`@ai-sdk/anthropic`, `@langchain/anthropic`) |
| DB (optional)    | Postgres + Drizzle ORM                              |
| Charts           | Recharts                                            |
| Motion           | Framer Motion                                       |
| Deploy           | Vercel                                              |

## Layout

```
src/
├── app/
│   ├── page.tsx                # marketing landing
│   ├── playground/page.tsx     # live agent demo (SSE)
│   ├── dashboard/page.tsx      # finance UI shell
│   └── api/agents/route.ts     # streaming agent endpoint
├── components/
│   ├── agent-trace.tsx         # live reasoning panel — the wow factor
│   ├── hero.tsx
│   ├── site-nav.tsx
│   ├── number-ticker.tsx
│   ├── finance-chart.tsx
│   └── ui/                     # shadcn primitives
└── lib/
    ├── ai/
    │   ├── client.ts           # model registry (fast / smart / strong)
    │   └── agents/
    │       └── supervisor.ts   # LangGraph multi-agent graph
    ├── db/
    │   ├── client.ts           # Drizzle client (optional)
    │   └── schema.ts
    └── utils.ts                # cn, formatTND, formatCompact
```

## Scripts

- `pnpm dev` — dev server with Turbopack
- `pnpm build` — production build
- `pnpm check` — typecheck + lint + format-check (run before every commit)
- `pnpm db:generate && pnpm db:migrate` — if you touch the schema

## Documentation

- `IDEAS.md` — the shortlist of hackathon concepts. Read this before you plan.
- `PLAYBOOK.md` — hour-by-hour plan for the 24h run.
- `GITHUB_SETUP.md` — one-time org + repo creation commands.
- `CLAUDE.md` — conventions loaded by Claude Code automatically.
- `.claude/` — subagents, slash commands, hooks, and MCP config.

## License

MIT — built for the Finnovo 2026 hackathon.
