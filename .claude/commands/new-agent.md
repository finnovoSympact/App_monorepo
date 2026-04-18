---
description: Scaffold a new LangGraph specialist agent end-to-end
argument-hint: <agent-name> <one-line-purpose>
---

Delegate to the `ai-agent-architect` subagent.

Tell the subagent:

- Add a new specialist named `$1` to `src/lib/ai/agents/supervisor.ts`.
- Purpose: `$2`.
- Follow the existing `Specialist` contract.
- Emit a `trace` event when it runs.
- Add a color entry for it in `src/components/agent-trace.tsx` `agentColor` map.
- Run `pnpm typecheck` after.
- Produce a one-paragraph summary of what was added.
