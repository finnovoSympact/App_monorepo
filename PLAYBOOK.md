# Finnovo — hackathon day playbook

**Goal:** from spec-book drop to final pitch in 24h with zero wasted minutes. This document is the operating manual for tomorrow.

## Pre-event checklist (tonight)

- [ ] Clone this repo on the laptop you will demo from.
- [ ] `pnpm install` succeeds. `pnpm dev` loads `/`, `/playground`, `/dashboard` without errors.
- [ ] `.env.local` is populated with `ANTHROPIC_API_KEY`.
- [ ] Claude Code is installed. `claude` command works.
- [ ] GitHub CLI (`gh`) is authenticated (`gh auth status`).
- [ ] `docker ps` runs — you want Docker ready in case you need a local Postgres.
- [ ] Phone hotspot tested — venue Wi-Fi is not reliable.
- [ ] Two adapters, two chargers. Extension cord.

## Hour 0–1 — specification intake

The moment you receive the spec book:

1. One teammate reads it cover-to-cover, highlights three things:
   - **Judging criteria** (weighted if given)
   - **Mandatory track / theme**
   - **Sponsor-specific challenges** and which sponsor owns them
2. You open Claude Code in the project and run `/spec-to-tasks <paste of spec>`.
3. The output is a 24h plan. The rest of this doc assumes that plan is now your north star.

## Hour 1–2 — pick & brand

- Match the spec to the closest idea in `IDEAS.md`. Do **not** start from scratch.
- Change the product name in `src/app/layout.tsx` metadata + `src/components/hero.tsx` copy.
- Swap the specialist agent names in `src/lib/ai/agents/supervisor.ts` `exampleSpecialists` to match the new domain.
- Commit: `chore: rebrand as <ProductName>`.

## Hour 2–6 — vertical slice

Build **one path** that works end-to-end. No breadth yet.

- The chosen user question → agents run → trace streams → answer renders.
- If the idea requires seed data (transactions, invoices, etc.), write a `scripts/seed.ts` file. Don't spend time on a real ingestion pipeline.
- Stop when you can run the demo script once from memory without the app breaking.

## Hour 6–12 — depth

Add the one differentiating feature from `IDEAS.md` ("recurring patterns" section):

- Agent memory (if the idea benefits) — use pgvector or mem0.
- Graph viz (if the idea has graph-shaped data) — `react-force-graph`.
- Human-in-the-loop checkpoint (if agents take consequential actions).
- Multi-language UI toggle (FR ↔ AR) — almost always worth the 30 minutes for a Tunisian hackathon.

**Before hour 12 ends, freeze features.** What isn't built by hour 12 will not be built.

## Hour 12–16 — polish

Delegate to the `ui-polish` subagent. Its checklist is in `.claude/agents/ui-polish.md`.

Demo-critical screens, in order:
1. Landing `/` — must sell the idea in 10 seconds.
2. Playground `/playground` — trace panel must render smoothly with agents running.
3. Dashboard `/dashboard` — must look alive (charts rendering, KPIs populated).

Test both light and dark mode. Test on the laptop you'll demo from (do **not** polish on your dev machine and demo on a different screen).

## Hour 16–20 — pitch assets

- Open a new Claude Code session, run `/demo-script`. Edit the output.
- Record a 90-second fallback video of the happy path (OBS or QuickTime). This is your insurance.
- Build slides (5 slides max): problem, solution, live demo placeholder, architecture, ask.
- Rehearse the demo twice on the laptop you'll use, in the same lighting the venue will have.

## Hour 20–23 — harden

- Run the `reviewer` subagent. Fix every **Blocker**. Accept every **Risk** — too late to refactor.
- Put the app on Vercel as a second safety net (not the primary demo). `vercel --prod`.
- One more rehearsal. Time yourself.

## Hour 23–24 — submit & rest

- Push the final commit.
- Fill in the submission form.
- Shower. Eat. Do not keep coding.

## During the pitch

- **Laptop on the table. Mirror to the projector.** Never the other way around.
- **Open the app, then open the slides behind it.** Alt-tab is faster than anything else.
- **Run the demo first**, then talk. Judges remember the live thing.
- **If the live demo breaks:** "Here's the recording, let me walk through what's happening." Don't apologize. Continue.
- **Land with a concrete ask.** What prize track, what sponsor conversation, what next step.

## Anti-patterns (do not do these)

- **Refactoring at hour 14.** The code is not the product. The demo is.
- **Adding auth "because it's more realistic".** Judges don't care. Fake-log-in a single mock user.
- **Trying to use a real bank API.** Mock it. Always mock it.
- **Rewriting the landing page at hour 22.** The polish agent does this at hour 13. Do not revisit.
- **Demoing a feature you built but haven't rehearsed.** If you can't narrate it smoothly, cut it.

## Emergency plan (if the internet is down)

- Use your phone hotspot.
- If Anthropic is unreachable: swap to `models.fallback` (OpenAI). Key should already be in `.env.local`.
- If all LLM providers are down: run the playground in **cached mode** — return a pre-recorded trace sequence. Implement this with a `?demo=cached` query flag and a static JSON file in `public/demo/`.
