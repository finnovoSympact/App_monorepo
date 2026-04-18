# PROMPTS.md — Claude Code, ready to paste

> Every prompt below is self-contained. Paste into Claude Code (the terminal, in the `finnovo/` repo) — do not edit in the moment unless the spec book forces it. Prompts reference `IDEAS.md`, `CLAUDE.md`, and `PLAYBOOK.md` which already live at the repo root.
>
> **Order of operations:** §0 → §1 → §2 → §3 → §4 → §5 → §6 → §7 → §8 (parallel with §9) → §10 → §11 → §12. If spec book forces a pivot, do §1b immediately after §0.
>
> **Golden rule:** one prompt per task. Don't stuff multiple goals into one message — Claude Code performs much better with clean, bounded scopes.

---

## Text-only fast mode (token-saver)

If you want to burn fewer tokens tomorrow, skip the detailed prompts below and use these one-line text instructions. Claude Code will read IDEAS.md, CLAUDE.md, and PLAYBOOK.md itself. Less structure = less cost per turn, at the price of slightly less deterministic output — fine for the middle of the day, not for demo-critical steps.

```
§0  Read /spec/*.pdf, IDEAS.md, CLAUDE.md. Tell me if Daiyn still fits and list exact tweaks. No code.
§1  Rebrand this repo from Finnovo to Daiyn. Build after.
§2  Replace the agents in supervisor.ts with the 7 Daiyn agents from IDEAS.md. Keep lazy factories. Fanout Underwriter+Risk. Critic loops once.
§3  Seed 3 Tunisian SME packs under public/demo/packs/ per IDEAS.md.
§4  Wire real models behind DAIYN_LIVE_MODELS=1. Haiku for routine, Sonnet for Underwriter/Risk/Critic. Fallback to canned trace on failure.
§5  Build /consent — a mock BCT open-banking consent screen. Feeds into /playground?pack=.
§6  Render the ComposerAgent output as a printable PDF credit memo at /memo/[packId].
§7  Polish the trace panel: per-agent color+icon, pulsing dot when running, show critic loop visibly.
§8  Rebuild /  as a single-screen pitch landing. One H1, one CTA to /consent.
§9  Generate a 5-slide Marp deck at /deck/daiyn.md per IDEAS.md.
§10 Write /deck/demo-script.md — 3 min, timestamped, with offline fallback.
§11 Review the whole repo as senior eng + VC. List blockers, polish, hostile Qs.
§12 Pre-flight: build, tsc, curl every route, report one line per check.
```

**Rule for this mode:** if the output drifts, escalate to the full prompt in the matching section below. Don't argue with Claude Code mid-run — it's faster to re-paste the detailed version.

---

---

## §0 — Spec book intake (first thing Saturday morning)

**When:** the instant you receive the spec book PDF. Drop it in `/spec/` in the repo.

**Paste:**
```
Read /spec/*.pdf end to end. Then read IDEAS.md and CLAUDE.md.

Produce a report with exactly these sections, in this order:

1. Spec-book summary in 8 bullets (themes, tracks, any mandated tech, judging criteria, timing, final deliverables, forbidden tech, unknowns).
2. The exact judging criteria table (name + weight). If weights in the spec differ from the table in IDEAS.md, FLAG that explicitly.
3. Does Daiyn (our hero idea in IDEAS.md) still fit the spec? Answer yes / yes-with-tweaks / no, and justify in <=5 bullets.
4. If yes-with-tweaks: list the exact edits needed to Daiyn (agent changes, naming, UX angle), ranked by effort.
5. If no: propose the best alternative from IDEAS.md (#A Wasla, #B Sayada, #C Khazina) and justify.
6. A list of NEW constraints the spec introduces that we have not already planned for.
7. A TODO delta for PLAYBOOK.md — what hours need to shift.

Do not write code in this step. This is a read-and-plan pass.
```

**Verify after:** you have a clear GO/NO-GO on Daiyn. If GO, continue to §2. If NO-GO, run §1b.

---

## §1b — Pivot prompt (only if §0 says Daiyn doesn't fit)

**When:** §0 returned "no" or "pivot."

**Paste:**
```
Based on your §0 report, we are pivoting from Daiyn to <IDEA NAME from IDEAS.md or a new one you propose>.

Produce a vertical-slice plan for the new idea that RE-USES the existing scaffold maximally:

- Which agents in src/lib/ai/agents/supervisor.ts do we keep, rename, or replace?
- Which pages/components change?
- What seed data do we need?
- What new UX moments does the demo need? (cap at 2 new screens.)

Output as a checklist. No code yet. Cap at 400 words.
```

---

## §1 — Rebrand (Finnovo → Daiyn)

**When:** after §0 confirms Daiyn, before any feature work.

**Paste:**
```
Rebrand this repo from "Finnovo" to "Daiyn" across all files. Scope:

- package.json, README.md, CLAUDE.md, IDEAS.md, PLAYBOOK.md, GITHUB_SETUP.md
- All src/app/**/*.tsx page titles, metadata, visible copy
- Tailwind/theme tokens if any mention "finnovo"
- Do NOT rename the repo directory or git remote — I'll handle that via gh separately.

Show me the diff in a concise summary: list of files touched + one-line per file describing the change. Then apply the edits. Run `pnpm -s build` at the end and paste the last 20 lines of output to confirm.
```

**Verify after:** `pnpm dev` still loads. Page title says Daiyn.

---

## §2 — Agent swap (the 7-agent Daiyn crew)

**When:** after rebrand. This is the single most important code change of the day.

**Paste:**
```
Read IDEAS.md section "HERO — Daiyn" → "Agent architecture".

Replace the agents in src/lib/ai/agents/supervisor.ts with the 7 Daiyn agents:
OCRAgent, OBAgent, ReconcilerAgent, CategorizerAgent, UnderwriterAgent, RiskAgent, CriticAgent, ComposerAgent.

Requirements:
- Keep the LangGraph supervisor pattern. Keep lazy model factories (getSmart/getStrong) — the build breaks if we instantiate ChatAnthropic at module load.
- UnderwriterAgent and RiskAgent run in PARALLEL fanout (after Categorizer). Everything else is sequential.
- CriticAgent must hard-block: if it returns "revise", loop back to Composer with the critique (max 1 loop, then hand off anyway to stay within demo time).
- Every agent must emit a TraceEvent with { agent, kind, summary, at }. The summary is the one-line humans will read in the panel.
- The State shape needs: docs (array of {id, kind, text}), transactions (array), pnl (object), score (number), memoMarkdown (string), trace (array).
- Stub OCR/OB with deterministic text extraction — we will wire real models in §4. Keep stubs behind an `if (process.env.DAIYN_LIVE_MODELS !== "1")` branch so the demo runs deterministically offline.

Do NOT touch src/app/api/agents/route.ts yet. Do NOT touch the UI yet.

At the end: run `pnpm -s tsc --noEmit` and paste errors if any. Fix them.
```

**Verify after:** `pnpm -s tsc --noEmit` clean. Trace events still flow through the SSE route.

---

## §3 — Seed data (three SME packs + open-banking fixtures)

**When:** after §2. Can run in parallel with §4 if you have bandwidth.

**Paste:**
```
Create realistic Tunisian SME fixtures for the demo. Put everything under /public/demo/packs/.

Pack 1: "Café El Wafa" — clean, approvable. A small café in La Marsa, 8 months of data.
Pack 2: "Atelier Mediterranea" — messy, borderline. A textile workshop in Ksar Hellal, 12 months with a 6-week data gap.
Pack 3: "Souq Digital" — growing e-commerce, approvable with conditions. 10 months, Instagram + D17 + bank account.

For each pack, produce:
- 3-6 invoice JSONs with fields { id, issuer, buyer, date, currency: "TND", lines: [{sku, qty, unit, total}], total, notes }.
- A "bank_statement.csv" with 60-200 rows: date, description (Arabic+French mix), debit, credit, balance.
- An "open_banking_feed.json" mimicking a BCT-sandbox response: { accountId, iban, currency, balances, transactions: [{date, amount, currency, merchantName, mcc, counterpartyIban, reference}] }.
- A "whatsapp_receipt.png.meta.json" describing what the receipt would look like (we'll use an LLM to narrate it during OCR — no real image needed for hackathon).
- A "summary.md" — 6 lines of narrative context an agent would produce after reading the pack.

Also create /public/demo/packs/index.json listing the three packs with a short tagline each.

All amounts in TND, all dates within 2025-2026. Make them internally consistent (the open-banking feed should mostly match the invoices — that's the whole point).

No code generation yet — fixtures only.
```

**Verify after:** open `/public/demo/packs/index.json`, spot-check one pack.

---

## §4 — Live model wiring (optional if Wi-Fi holds)

**When:** after §2 and §3. Only if you're confident in the venue Wi-Fi.

**Paste:**
```
Wire the Daiyn agents to real models, behind the DAIYN_LIVE_MODELS=1 env flag.

- OCRAgent: use @ai-sdk/anthropic with claude-haiku-4-5 for text extraction from the pack's invoice JSONs (we're not doing real vision — we pass the invoice JSON as context and ask the model to produce normalized line-items). Cache the response to disk under /tmp/daiyn-ocr-cache/ keyed by pack+file so repeated demos are instant.
- OBAgent: read the open_banking_feed.json, no LLM call — it's already structured.
- ReconcilerAgent: Haiku, match invoice totals to bank credits, return { matched: [], unmatched: [] }.
- CategorizerAgent: Haiku, output a 12-month P&L in a strict JSON schema (define with zod, validate server-side).
- UnderwriterAgent: Sonnet. Write the credit memo. Temperature 0.2.
- RiskAgent: Sonnet. Return { pd12m: number, stressScenarios: [...] }.
- CriticAgent: Sonnet. Must cite source doc IDs for every numeric claim in the memo. If any claim lacks a source, return "revise" + reasons.
- ComposerAgent: Haiku. Assemble memo markdown + final JSON score.

Add a retry wrapper (max 2) around every call. On final failure, fall back to the canned response from /public/demo/canned-trace.json (we already have the offline replay infra).

Do NOT change the UI in this step.

At the end: run `DAIYN_LIVE_MODELS=1 pnpm dev`, submit Pack 1 from /playground, and paste the last trace panel events from the console.
```

**Verify after:** memo actually generates end-to-end with live models. If anything flakes, keep DAIYN_LIVE_MODELS off and demo the offline replay.

---

## §5 — Open-banking consent screen (the demo wow-moment)

**When:** after §2. This is a UI-only task; parallelizable with §4.

**Paste:**
```
Build /app/consent/page.tsx — a simulated BCT open-banking consent screen. This is the single most memorable UX moment of the demo.

Requirements:
- Styled to look like a real bank consent page (logo placeholder "Banque Centrale — Open Banking Sandbox").
- Lists the SME pack the user is about to share (pull from /public/demo/packs/index.json).
- Shows the data scopes being granted: ["Account balances", "12-month transaction history", "Outgoing transfers metadata"].
- A consent toggle + a bold "Autoriser Daiyn" primary button.
- On confirm: animate a checkmark, then redirect to /playground?pack=<id>.
- Use shadcn/ui Card, Checkbox, Button. Use Framer Motion for the checkmark reveal.
- Add a small "Sandbox — no real bank data" amber badge top-right for honesty.
- Darija + French microcopy where natural (e.g., button label in FR, helper text in a mix).

The /playground page should read the ?pack= param and auto-load that SME pack into the agent pipeline on first render. User click "Run" triggers the agents.

Cap the whole thing at 180 lines of code across both files.
```

**Verify after:** clicking "Autoriser Daiyn" flows into /playground with the pack pre-loaded.

---

## §6 — Credit memo PDF artifact (the tangible output)

**When:** after §2 and §3.

**Paste:**
```
Render the final ComposerAgent output as a printable PDF credit memo at /app/memo/[packId]/page.tsx.

- Server component. Read the latest agent run for the given packId from a simple in-memory store (create src/lib/store/runs.ts if it doesn't exist — Map keyed by packId, last-write-wins, no persistence).
- The memo has: a header (Daiyn logo placeholder + pack SME name + date), an executive summary (3 lines), a P&L table, a score box ("PD 12m: 4.3% — APPROVED WITH CONDITIONS"), a source-trace section listing every doc/transaction cited, and a footer with the human-in-the-loop approval stamp area.
- Add a "Print / Save PDF" button (client island) that calls window.print() with print-specific CSS that strips the site chrome.
- Use Tailwind for the print stylesheet: @media print { body { background: white; } .no-print { display: none; } } etc.
- The memo must look bank-grade. Serif heading font (font-serif via Tailwind). Neutral palette. No marketing fluff.

On the /playground page, after the agent run completes, add a "View credit memo" button that links to /memo/<packId>. This is the demo moment: judges see a real PDF open.
```

**Verify after:** Cmd+P on the memo page produces a clean 1-2 page PDF.

---

## §7 — Trace panel polish (visible innovation = judge points)

**When:** after §2, before demo day.

**Paste:**
```
Upgrade src/components/agent-trace.tsx to match the 7 Daiyn agents:

- Each agent gets a distinct color + lucide icon: OCR (FileText, blue), OB (Landmark, emerald), Reconciler (ArrowLeftRight, cyan), Categorizer (Tags, violet), Underwriter (FileSignature, amber), Risk (AlertTriangle, orange), Critic (ShieldCheck, rose), Composer (FileCheck, green).
- Show agents currently running with a subtle pulsing dot.
- When CriticAgent returns a "revise" event, the UI should briefly show a warning banner ("Critic requested revision") then clear as the composer retries. This sells the critic loop visually.
- When the pipeline finishes, show a "View credit memo" CTA inline in the trace panel (deep-link to /memo/<packId>).
- Keep the component a client island. No more than 220 lines of code.
- Use Framer Motion for the entrance of each new trace event (slide-in-from-right + fade).

Do not change the TraceEvent shape. Respect the existing type contract with supervisor.ts.
```

**Verify after:** run a pack end-to-end, eyeball the panel — it should feel alive.

---

## §8 — Landing page, one screen, pitch-grade

**When:** after §7. This is the first thing judges see if they visit the URL.

**Paste:**
```
Rebuild src/app/page.tsx as a single-screen landing page. No scrolling required to get the pitch.

Above the fold:
- H1: "Credit for the 650,000 SMEs Tunisian banks can't see."
- Subhead one line: "Daiyn turns messy documents and open-banking data into a bank-ready credit memo in under 5 minutes."
- Primary CTA: "Try the live demo →" (links to /consent).
- Secondary: "View architecture" (anchor-scrolls to a compact agent-graph SVG below).
- Top-right: the "Open Banking Sandbox" badge (amber, honest).

Below the fold (optional, judges may scroll):
- A 3-column how-it-works: Upload → Agents reason → Bank-ready memo. One sentence each. One lucide icon each.
- A compact architecture diagram — inline SVG or mermaid pre-rendered, showing the 7 agents with arrows.

Constraints:
- Use only shadcn/ui + Tailwind + one hero visual (a gradient card or a single SVG, no stock photos).
- No marketing fluff. Every line earns its place.
- Must look like something you'd actually invest in.
- Must render server-side where possible (add "use client" only where required by state/animations).
```

**Verify after:** full-screen the landing at 1920×1080 — that's the demo-day resolution. Fix any overflow.

---

## §9 — Seed a Shark-Tank deck (5 slides)

**When:** hour 18-20. While UI polish finalizes.

**Paste:**
```
Generate a 5-slide Shark-Tank deck for Daiyn as a Marp markdown file at /deck/daiyn.md.

Slides:
1. Hook — the headline stat (650k SMEs, <15% get a loan) + the one-liner from IDEAS.md + our tagline "Open banking is the rail. Inclusion is the destination."
2. The problem — one vivid customer portrait (fictional but realistic SME owner), the hidden pain, the failed status-quo.
3. The product — a single screenshot of the /memo page + the agent architecture thumbnail. 3 bullets max.
4. The business — TAM/SAM/SOM numbers from IDEAS.md, unit economics (€15/file, 96% GM, <1mo payback), go-to-market (start with 1 bank, land+expand).
5. The ask + the team — a specific ask (validation + a bank pilot partner, plus "€150k pre-seed to hire one credit risk analyst + one ML engineer, ship BIAT pilot Q4 2026"). Team names here (fill in).

Use Marp front-matter with theme: default, paginate: true. Cap each slide at ~40 words of body text. Speaker notes (marp's <!-- --> comments) should include the exact line to say out loud.

After you generate it, also produce a plain /deck/daiyn-backup.pdf instruction block — the command I should run to export the deck to PDF using `npx @marp-team/marp-cli deck/daiyn.md --pdf --allow-local-files`. Do not run it yourself; I'll run it manually.
```

**Verify after:** `npx @marp-team/marp-cli deck/daiyn.md --preview`. Read the speaker notes out loud — they must sound like a human, not a summary.

---

## §10 — The 3-minute live demo script

**When:** hour 20.

**Paste:**
```
Write /deck/demo-script.md — a timed, rehearsable live-demo script for the Daiyn product.

Budget: 3 minutes exactly. Mark timestamps [0:00], [0:20], etc.

Structure:
[0:00-0:15] Hook — deliver the one-liner while the landing page is on screen.
[0:15-0:40] Set up the SME — brief Café El Wafa persona, click "Try the demo".
[0:40-1:05] Open-banking consent — click through /consent, land on /playground. The moment the consent animation completes is the first "wow."
[1:05-2:15] The agents work — trigger the pipeline, narrate WHAT each agent is doing (not how), point to the trace panel. Specifically call out the critic loop — "notice the underwriter's claim got sent back once, because the critic couldn't find the source." This is the second "wow."
[2:15-2:45] The memo — click "View credit memo", let the PDF render, scroll to the score + source-trace section. Silence for 3 seconds here; let it land.
[2:45-3:00] The close — deliver the tagline + the ask.

Also include:
- Fallback plan: if the live agents flake, what do I do? (answer: URL-switch to /playground?offline=1, keep talking like nothing happened.)
- Fallback plan for no Wi-Fi at all: demo runs from localhost; consent + memo are static-renderable.
- A list of EXACTLY 4 things to NOT say (e.g., "it's just a prototype", "we didn't have time", "we used ChatGPT", "this is mocked"). Judges amplify hedges.
- A 15-second "elevator" version for if the moderator cuts us off.
```

**Verify after:** rehearse with a timer twice before sleeping. Cut anything that doesn't fit.

---

## §11 — Pre-pitch reviewer pass

**When:** hour 22-23. Final sweep.

**Paste:**
```
Act as a senior engineer + senior VC reviewing Daiyn the night before the pitch. Read the full repo.

Produce three sections:

A. Critical bugs (ship-blocking): list every broken flow you find by actually navigating the app. For each: file path, reproduction, fix suggestion. Do NOT fix them yourself — just list.

B. Pitch-grade polish items (would improve score, do-able in <15min each): copy that reads like marketing fluff, misaligned spacing, inconsistent capitalization, dead links, console errors, missing favicons/metadata, page-title inconsistencies.

C. Shark-Tank risk check: read IDEAS.md "Shark-Tank defense" section and /deck/daiyn.md. List the 3 toughest questions a hostile judge could ask that we do NOT currently have a crisp answer for. For each, draft a 2-sentence rebuttal I can memorize.

Cap the whole report at 500 words. Be honest — I'd rather hear it tonight than on stage.
```

**Verify after:** fix A-items. Fix B-items if time. Memorize C-rebuttals.

---

## §12 — Morning-of sanity check

**When:** 30 minutes before you walk in.

**Paste:**
```
Pre-flight check. Run these and report back:

1. `pnpm -s build` — paste last 15 lines.
2. `pnpm -s tsc --noEmit` — must be clean.
3. Start `pnpm dev`, then curl-check:
   - GET / → 200
   - GET /consent → 200
   - GET /playground → 200
   - GET /playground?offline=1 → 200
   - GET /memo/cafe-el-wafa → 200 (or whatever packId we use)
   - POST /api/agents with a small body → streams SSE events (verify at least 3 events arrive)
4. Visual smoke: open each page in the browser, confirm no console errors.
5. Verify `DAIYN_LIVE_MODELS` default: should be off. The offline path MUST work without any API keys configured.
6. Verify deck PDF exists at /deck/daiyn.pdf (if not, remind me to run the export).

Report: one-line status per check. If anything fails, stop and tell me.
```

**Verify after:** every check green, or you've made a conscious decision not to care.

---

## Appendix — single-purpose utility prompts

These are small, reusable. Paste whenever you hit the situation.

### New UX screen
```
Create a new page at <path> that does <one-sentence goal>. Use shadcn/ui + Tailwind. No more than 150 lines. Must be accessible (proper headings, aria-labels on icon-only buttons). Match the palette of the existing landing page.
```

### Add a new agent
```
Add a new agent <Name>Agent to src/lib/ai/agents/supervisor.ts. Role: <one sentence>. Place it <before/after/in parallel with> <existing agent>. Must emit trace events matching the existing TraceEvent shape. Respect the lazy model factory pattern. Do not change other agents.
```

### Fix a build error
```
`pnpm build` is failing with this error: <paste the exact error>. Find the root cause — do not patch symptoms. Show me the fix as a diff before applying.
```

### Refactor for clarity (only if time allows)
```
Read <file>. It has grown messy. Propose a refactor that improves readability WITHOUT changing behavior. Show me the plan first (bullet list of changes). Only apply after I say "go".
```

### Tighten a piece of copy
```
Rewrite <the copy, pasted verbatim> for a pitch audience. Constraints: under <N> words, active voice, zero marketing fluff, must stand on its own. Produce 3 variants.
```

### Write tests for a critical path (only if the jury emphasizes prototype quality)
```
Write vitest tests for <file/function>. Focus on the HAPPY PATH first, then ONE realistic failure mode. Do not test implementation details. Use the existing test harness if there is one; otherwise set up vitest minimally.
```