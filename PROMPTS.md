# PROMPTS.md — Sanad, ready to paste into Claude Code

> Every prompt is self-contained. Paste into Claude Code (terminal, in the repo root) — do not edit in the moment unless the spec book forces it.
>
> **Order of operations:** §0 → §1 → §2 → §3 → §4 → §5 → §6 → §7 → §8 → §9 → §10 → §11 → §12 → §13 → §14 → §15.
>
> **Three-layer model (read before executing anything):** see `docs/ARCHITECTURE.md` and `docs/sanad-architecture.excalidraw`. Every prompt below assumes the agent has read those first.
>
> **Golden rule:** one prompt = one bounded scope. Don't stuff multiple goals into one message.

---

## Text-only fast mode (token saver)

Use these one-liners when you trust the context is loaded. Escalate to the full prompt below if output drifts.

```
§0  Install deps + scaffold dirs per docs/ARCHITECTURE.md "Repo layout".
§1  Rebrand Finnovo → Sanad. Daiyn is now the name of Layer 2 (SME product).
§2  Drizzle schema for all tables in docs/ARCHITECTURE.md (Layer 1+2+3 + infra). Migration ready.
§3  Seed: 3 SME packs + 3 individual WhatsApp conversation fixtures + 2 sample bank criteria rows.
§4  Rewrite src/lib/ai/agents into the 5-node LangGraph pipeline (Formatter, Orchestrator, Executor, Reviewer, Finalizer) + HITL interrupts. Executor uses tool calling (computeKPI, queryPeerBenchmarks, flagRisk, renderPassportSection).
§5  Layer 2 UI: /dashboard upload + /dashboard/pipeline/[runId] live view with HITL panel per node.
§6  Sanad Passport: Ed25519 signing in src/lib/signing/passport.ts, /passport/[id] printable, /verify/[id] public verifier.
§7  Layer 1 simulator: /chat — a WhatsApp-style UI. Drive it with the conversational agent. Profile state visible on the side for demo.
§8  Layer 1 backend: conversational agent + profile slot extractor + suggester + escalation detector. Webhook stubbed for real Meta Cloud API behind WHATSAPP_LIVE=1 flag.
§9  Layer 3: /bank dashboard + matching engine + lead queue + action dispatcher (stub outbound, show the toast).
§10 Rewrite landing / — 3-layer story, single screen.
§11 8-slide Marp deck at /deck/sanad.md per IDEAS.md.
§12 Demo video script /deck/demo-video.md — 120s covering all 3 layers.
§13 Reviewer pass — blockers, polish, hostile Qs.
§14 Pre-flight: build, tsc, curl every route.
§15 Submission checklist: upload, Drive ownership, form.
```

---

## §0 — Pre-flight installs (first thing in the terminal)

**When:** once, at hour 0. Run this BEFORE §1.

**Paste:**
```
Read docs/ARCHITECTURE.md end to end, then do the following:

1) Install these dependencies (pnpm add), grouped:
   Runtime:
     - pg drizzle-orm drizzle-kit
     - @clerk/nextjs
     - @upstash/redis
     - pg-boss
     - zod
   AI + LangGraph:
     - @langchain/langgraph @langchain/anthropic @langchain/openai @langchain/core
     - @ai-sdk/anthropic @ai-sdk/openai ai
   WhatsApp + email (can be stubbed behind flags — still install so imports type-check):
     - axios
     - resend
   Signing + parsing:
     - pdf-parse mammoth
   Dev:
     - @types/pg @types/pdf-parse tsx

2) Create the directory tree under src/ exactly as listed in docs/ARCHITECTURE.md "Repo layout", with empty placeholder files (or one-line TODO comments) so Claude can populate them in later steps without needing mkdir at every turn. Specifically:
   - src/lib/ai/agents/{conversational,formatter,orchestrator,executor,reviewer,finalizer,pipeline}.ts
   - src/lib/ai/tools/{kpi,benchmarks,risk}.ts
   - src/lib/db/{schema,queries}.ts
   - src/lib/signing/passport.ts
   - src/lib/matching/engine.ts
   - src/lib/whatsapp/{client,router}.ts
   - src/components/{pipeline-graph,hitl-panel,passport-card,whatsapp-chat}.tsx

3) Extend .env.example with the new slots — keep BYOK-friendly structure:
   ANTHROPIC_API_KEY, OPENAI_API_KEY, OPENAI_BASE_URL (optional, OpenRouter)
   DATABASE_URL (Neon)
   CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
   WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_VERIFY_TOKEN, WHATSAPP_LIVE (0|1)
   SANAD_SIGNING_PRIVATE_KEY, SANAD_SIGNING_PUBLIC_KEY (hex-encoded Ed25519)
   R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET, R2_BUCKET
   RESEND_API_KEY

4) Print a one-line generator command I can run to produce the Ed25519 keypair: `node -e "const c=require('crypto'); const k=c.generateKeyPairSync('ed25519'); console.log('PRIV', k.privateKey.export({type:'pkcs8',format:'der'}).toString('hex')); console.log('PUB', k.publicKey.export({type:'spki',format:'der'}).toString('hex'));"`

5) Run `pnpm -s tsc --noEmit` and report the last 15 lines. It must be green — fix any immediate errors caused by the new stubs (empty .ts files usually need an `export {}` line).

Do NOT write real logic yet in any agent/component. This step is purely install + scaffold + env.
```

**Verify after:** `pnpm -s tsc --noEmit` clean. Directory tree matches ARCHITECTURE.md.

---

## §1 — Rebrand Finnovo → Sanad (Daiyn becomes Layer 2 name)

**When:** after §0.

**Paste:**
```
Rebrand this repo.

Brand hierarchy (use consistently):
- Sanad = platform / company / public brand
- Sanad Chat = Layer 1 surface (WhatsApp bot + /chat simulator)
- Daiyn = Layer 2 product name (SME dashboard + pipeline + passport)  ← keep "Daiyn" as the SME-facing sub-brand inside Sanad
- Sanad for Banks = Layer 3 surface

Global tagline: "One passport. Every bank. Instant credit."
Sub-tagline (FR): "Votre sanad. Votre crédit. Votre identité."

Find-and-replace scope (case-sensitive where noted):
- "Finnovo" → "Sanad" everywhere
- "finnovo" (package names, urls) → "sanad"
- Standalone occurrences of "Daiyn" used as the PLATFORM name → "Sanad"; occurrences of "Daiyn" that refer specifically to the SME sub-product stay as "Daiyn"
- "Daiyn Passport" / "Credit Passport" → "Sanad Passport" (the artifact is a Sanad thing, not a Daiyn thing)

Files to touch: package.json, README.md, CLAUDE.md, IDEAS.md, PLAYBOOK.md, GITHUB_SETUP.md, docs/ARCHITECTURE.md, all files under src/**/*.{ts,tsx}, all files under public/**.

Do NOT rename the repo directory or git remote.

Also update:
- src/app/layout.tsx metadata title → "Sanad — Credit Passport for Tunisia"
- Favicon: swap for a simple letter-S monogram SVG if there isn't one.

At the end: git diff --stat, then run `pnpm -s build`. Paste last 20 lines of build output.
```

**Verify after:** `pnpm dev` loads, page title reads Sanad.

---

## §2 — Database schema (all 3 layers, one Drizzle schema file)

**When:** after §1. Before any server logic.

**Paste:**
```
Write src/lib/db/schema.ts with the complete Drizzle schema for all 3 layers + infra. Mirror the table list in docs/ARCHITECTURE.md exactly.

Tables (with every column I'll list — use correct Postgres types):

// Layer 1 — individuals
users { id uuid pk, whatsapp_id text unique, created_at timestamp default now }
profiles {
  user_id uuid pk references users,
  slots jsonb not null default '{}',     // identity, employment, banking, credit_history, goals
  score integer,                          // 0-1000
  sme_signal_count integer default 0,
  escalated_at timestamp,
  updated_at timestamp
}
conversations { id uuid pk, user_id uuid fk, started_at timestamp }
messages {
  id uuid pk, conversation_id uuid fk,
  role text ('user'|'assistant'|'system'|'tool'),
  text text not null,
  lang text ('ar'|'fr'|'mixed'|'other'),
  meta jsonb,                              // model, latency_ms, cost_usd, tool_calls[]
  created_at timestamp default now
}

// Layer 2 — SMEs
sme_accounts {
  id uuid pk, user_id uuid fk nullable,    // nullable because bank officers create SMEs too
  company_name text, sector text, city text, created_at timestamp
}
documents {
  id uuid pk, sme_id uuid fk,
  kind text ('invoice'|'bank_statement'|'receipt'|'tax_form'|'screenshot'|'other'),
  storage_key text,                        // R2 object key
  mime text, bytes integer,
  origin_channel text ('web'|'whatsapp'),
  uploaded_at timestamp default now
}
pipeline_runs {
  id uuid pk, sme_id uuid fk,
  status text ('running'|'awaiting_human'|'completed'|'failed'),
  started_at timestamp default now, ended_at timestamp
}
run_nodes {
  id uuid pk, run_id uuid fk,
  node_key text ('a_formatter'|'b_orchestrator'|'c_executor'|'d_reviewer'|'e_finalizer'),
  input jsonb, output jsonb,
  hitl_mode text ('ai'|'ai_refined'|'manual') default 'ai',
  operator_user_id uuid nullable,
  started_at timestamp, ended_at timestamp
}
passports {
  id uuid pk, sme_id uuid fk nullable, subject_user_id uuid fk nullable,   // one or the other
  run_id uuid fk,
  body jsonb not null,                    // the full passport doc
  signature text not null,                // hex Ed25519 signature of canonical(body)
  issued_at timestamp default now,
  expires_at timestamp,                   // default issued_at + 90 days
  revoked_at timestamp
}

// Layer 3 — banks
banks {
  id uuid pk, name text,
  criteria jsonb not null default '{}',   // sectors:[], regions:[], ticket_min, ticket_max, max_pd12m
  api_key text,
  webhook_url text
}
leads {
  id uuid pk, bank_id uuid fk,
  subject_kind text ('individual'|'sme'),
  subject_id uuid not null,
  score integer,                          // match strength 0-100
  status text ('new'|'contacted'|'converted'|'rejected') default 'new',
  surfaced_at timestamp default now
}
lead_events { id uuid pk, lead_id uuid fk, actor_id uuid, action text, meta jsonb, ts timestamp default now }
billing_events { id uuid pk, bank_id uuid fk, lead_id uuid fk, amount_eur numeric(10,2), billed_at timestamp default now }

Also:
- Write src/lib/db/index.ts exporting a Drizzle client configured from DATABASE_URL. If DATABASE_URL is missing, export a warning stub that throws on first use — don't block the app from booting.
- Configure drizzle.config.ts to point at schema.ts and write migrations to drizzle/.
- Run `pnpm drizzle-kit generate` and paste the generated SQL filename.
- Do NOT run migrations against a remote DB; I'll do that manually.

Add src/lib/db/queries.ts with stubs for the 10 most-used queries (comments with TODO — actual impls added as each layer is built). Examples: getProfileByUserId, upsertProfileSlot, createRun, appendRunNode, insertPassport, surfaceLeads, etc.
```

**Verify after:** `pnpm drizzle-kit generate` produces a migration SQL file under drizzle/. tsc clean.

---

## §3 — Seed data (SME packs + WhatsApp conversations + bank criteria)

**When:** after §2. Parallelizable with §4.

**Paste:**
```
Create realistic Tunisian fixtures under public/demo/.

A) SME packs (already partially in place from earlier work). Ensure these three exist under public/demo/packs/:
  - cafe-el-wafa/      (clean — approvable)
  - atelier-mediterranea/   (messy — needs Reviewer loop)
  - souq-digital/      (growing e-commerce — approvable with conditions)

Each pack contains:
  invoices/*.json (3-6 files each), bank_statement.csv, open_banking_feed.json, whatsapp_receipt.png.meta.json, summary.md.
Amounts in TND, dates 2025-2026, data internally consistent.

Also create public/demo/packs/index.json listing the three.

B) Individual WhatsApp conversation fixtures under public/demo/conversations/:
  - yassine.json       (26yo gig worker — Uber + Jumia deliveries; evolves into SME signal mid-conversation)
  - amira.json         (42yo domestic worker — cash income; escalation never triggers)
  - karim.json         (31yo diaspora in Paris — wants to finance a house in Tunis)

Each file shape:
{
  "persona": { "name", "age", "city", "lang_mix": "ar-fr" | "fr" | ... },
  "turns": [
    { "role": "user", "text": "...", "lang": "ar" | "fr" | "mixed" },
    { "role": "assistant", "text": "...", "expected_profile_delta": { /* slots set by this turn */ } },
    ...
  ],
  "terminal_state": { /* full profile slots expected at end */, "escalated": boolean }
}

Conversations should be 12-18 turns each. Language mix for Yassine: Darija-French. Amira: mostly Darija. Karim: French. Write Darija in Latin script (3arabizi) for this hackathon — e.g. "chnouwa lezmni na3mel", not Arabic script. This matches how real Tunisians type.

C) Bank criteria seed under public/demo/banks/seed.json:
  Two banks — "BIAT Pilot" and "Microfinance TN" — each with:
  { id, name, criteria: { sectors: [], regions: [], ticket_min_eur, ticket_max_eur, max_pd12m, risk_appetite: "low"|"medium"|"high" } }
  Make BIAT conservative (SMEs, ticket 5k-50k EUR, max PD 6%, sectors ["food","retail","services"]). Make Microfinance TN aggressive (individuals+SMEs, ticket 200-5k EUR, max PD 15%, all regions).

D) Canned trace already exists at public/demo/canned-trace.json — UPDATE it to reflect the new 5-node pipeline (formatter, orchestrator, executor, reviewer [with one revise event], finalizer). Keep the old schema shape compatible with the existing replay code.

No application code in this step. Fixtures only.
```

**Verify after:** open one of each fixture category, spot-check realism.

---

## §4 — Layer 2: the 5-node LangGraph pipeline

**When:** after §2. The single most important code change.

**Paste:**
```
Rewrite src/lib/ai/agents/pipeline.ts + the five node files to implement the Layer 2 5-node pipeline per docs/ARCHITECTURE.md "Layer 2 — Daiyn".

State shape (Annotation.Root):
  input: { smeId, goal }
  docs: Array<{ id, kind, storageKey, mime, bytes }>
  corpus: FormattedCorpus | null              // output of a_formatter
  plan: Array<Task> | null                     // output of b_orchestrator
  draft: DraftPassport | null                  // output of c_executor
  review: { verdict: 'APPROVED'|'NEEDS_REVISION', reasons: string[] } | null
  passport: SanadPassport | null               // output of e_finalizer
  trace: Array<{ node, at, kind, summary, tool_calls?, cost_usd? }>
  hitl_interrupts: Record<NodeKey, { mode: 'ai'|'ai_refined'|'manual', feedback?: string, override?: any }>

Nodes:
  a_formatter → Haiku. Read each doc, classify, OCR/parse, produce FormattedCorpus { lineItems, transactions, documents[] }. Every line item cites source_doc_id.
  b_orchestrator → Sonnet. Read corpus + goal, emit Plan[]. Plan items drive Executor's tool budget.
  c_executor → Sonnet, bound to tools:
     - computeKPI({ metric, window_months })
     - queryPeerBenchmarks({ sector, size_band })
     - flagRisk({ kind, severity, evidence })
     - renderPassportSection({ section, data })
     Executor loops: call tool → integrate result → next call → eventually emit DraftPassport.
  d_reviewer → Sonnet. Walks DraftPassport. EVERY numeric claim must reference a source_doc_id or transaction_id. Also checks P&L reconciles to bank flows within ±5%. Returns verdict.
  e_finalizer → Haiku. Signs body with Ed25519 (call src/lib/signing/passport.ts), renders explainability log (prose: what each node did, why the score is what it is, any HITL overrides).

Wiring:
  START → a_formatter → b_orchestrator → c_executor → d_reviewer
  d_reviewer conditional:
    if APPROVED → e_finalizer → END
    if NEEDS_REVISION → c_executor (max 1 loop; second NEEDS_REVISION forces e_finalizer with warnings)

HITL interrupts:
  Use LangGraph's interrupt-after-node mechanism. Each node, on completion, pauses IF state.hitl_interrupts[node_key]?.mode is waiting. The pipeline surfaces the pause via the Postgres checkpointer (install @langchain/langgraph-checkpoint-postgres if not already).
  A pause exposes the node's output; the dashboard can resume with:
    - Approve (continue with same output)
    - Refine with AI (re-run node with feedback appended to prompt)
    - Take over (override output with human-supplied value)

Constraints:
  - Lazy model factories (getSmart/getFast) — never instantiate at module scope.
  - Every agent emits at least one trace event with { node, at, kind: 'in'|'out'|'tool', summary, ... }.
  - Temperature 0.2 for Executor and Reviewer. 0 for Formatter. 0.3 for Finalizer (explainability gets a touch of warmth).
  - Cost estimate per tool call written to trace (compute from token usage if available; else skip).

Also write src/app/api/pipeline/run/route.ts:
  POST { smeId, goal } → starts pipeline, returns { runId }. Streams SSE with trace events + interrupt notifications.

And src/app/api/pipeline/hitl/route.ts:
  POST { runId, nodeKey, mode: 'approve'|'refine'|'takeover', feedback?, override? } → resumes pipeline.

At the end: `pnpm -s tsc --noEmit` must be clean. Do not touch UI yet.
```

**Verify after:** curl the run endpoint with a fixture SME, verify SSE events flow + the pipeline pauses if you set hitl_interrupts.

---

## §5 — Layer 2 UI: upload + live pipeline with HITL

**When:** after §4.

**Paste:**
```
Build the SME-facing Layer 2 UI.

Pages:
1) /dashboard (src/app/dashboard/page.tsx) — landing inside the app. Shows the SME's in-flight runs + past Passports + a big "Start new credit file" CTA.

2) /dashboard/upload (src/app/dashboard/upload/page.tsx)
   Multi-file drop zone. Accepts PDF, PNG, JPG, CSV, TXT, XLSX.
   On drop: POST /api/upload (create in this step too) → stores bytes in object storage (during hackathon, write to public/demo/uploads/<smeId>/ and return the path; do NOT wire R2 unless R2_BUCKET is set in env).
   Progressive list of uploaded docs with kind-guess and bytes.
   "Start pipeline" button → POST /api/pipeline/run → redirect to /dashboard/pipeline/[runId].

3) /dashboard/pipeline/[runId] (src/app/dashboard/pipeline/[runId]/page.tsx)
   This is the wow-factor screen. Two columns:
   LEFT — pipeline-graph component (new src/components/pipeline-graph.tsx):
     Renders 5 node boxes (a→b→c→d→e with the d→c loop arrow). Each box shows:
       • status: pending | running | completed | awaiting_human | failed
       • latency, cost (if trace has it)
       • pulsing indicator if running
       • a highlight when awaiting_human
     Uses Framer Motion.
   RIGHT — hitl-panel component (new src/components/hitl-panel.tsx):
     When any node is awaiting_human, shows:
       • The node's output (pretty-printed JSON or rendered prose for c/e)
       • Three buttons: [Approve] [Refine with AI] [Take over manually]
       • Approve → POST /api/pipeline/hitl { mode: 'approve' }
       • Refine → opens textarea for feedback → POST { mode: 'refine', feedback }
       • Take over → opens a Monaco or simple textarea editor with the JSON output → POST { mode: 'takeover', override }
     When no node is awaiting, shows the live trace log.
   A bottom strip: "View Sanad Passport" (enabled once e_finalizer completes) → link to /passport/[id].

4) Keep the old /playground page but rename it /debug and mark as internal.

Consume SSE via EventSource. Offline replay (?offline=1) reads public/demo/canned-trace.json.

Constraints:
  - "use client" on pages with interactivity; server components elsewhere.
  - Tailwind + shadcn only. No CSS files.
  - Every interactive element is keyboard-accessible.
  - No more than 250 LoC per file.
```

**Verify after:** upload 3 fixture docs, start pipeline, watch the graph animate, trigger each HITL mode once.

---

## §6 — Sanad Passport (signing + public verifier + PDF)

**When:** after §4. Parallelizable with §5.

**Paste:**
```
Implement the Sanad Passport artifact layer.

src/lib/signing/passport.ts:
  - canonicalize(body): deterministic JSON stringify (sort keys, no whitespace).
  - sign(body): Ed25519 sign using SANAD_SIGNING_PRIVATE_KEY (PKCS8 hex). Returns hex signature.
  - verify(body, signature): Ed25519 verify using SANAD_SIGNING_PUBLIC_KEY (SPKI hex). Returns boolean.
  - issuePassport(body, opts): returns { body, signature, issued_at, expires_at (default +90d), id, verify_url }

src/app/passport/[id]/page.tsx:
  Server component. Reads passport from DB (or from a JSON file under public/demo/passports/ if DB not wired).
  Layout: header (Sanad monogram + SME name + issued date + QR code linking to /verify/[id]), executive summary, P&L table, score dial (PD 12m, credit score, limit), risk register (Reviewer findings), source-trace list (every doc + transaction cited), signature footer (hex, short-form), HITL audit (which nodes were approved vs refined vs taken-over).
  "Print / Save PDF" button — calls window.print(). @media print CSS strips the site chrome, fits 1-2 A4 pages.

src/app/verify/[id]/page.tsx:
  Public. Reads passport, re-verifies signature client-side if possible (publish the public key in a static <script>), shows:
    • big green checkmark if valid, big red X if tampered/revoked
    • passport core claims (subject name, score, PD, ticket range, sector, issue date, expiry)
    • "signed by Sanad" + hex fingerprint (first 12 chars)
    • link to the full passport at /passport/[id]

Both pages must look bank-grade. Serif headings via Tailwind (font-serif). Muted palette, teal primary. No marketing fluff.

Add a "Sanad Passport" result widget to /dashboard/pipeline/[runId] that appears when e_finalizer completes.
```

**Verify after:** generate a passport, visit /verify/[id] in a private window (not logged in), confirm it validates.

---

## §7 — Layer 1: /chat WhatsApp-style simulator

**When:** after §2 and §3. Parallelizable with §5/§6.

**Paste:**
```
Build the demo-day WhatsApp simulator at /chat.

This is a browser UI that looks like WhatsApp but drives the same backend logic that the real Meta webhook will. Keep it so later we can plug real WhatsApp without touching the agents.

src/components/whatsapp-chat.tsx:
  WhatsApp-styled container (green header with "Sanad", user avatar, timestamps, tick marks). Chat bubbles: user on right (light), assistant on left (white). Support RTL-ish alignment for Arabic content. Typing indicator dots while the agent is thinking. Quick-reply button chips (for the escalation prompt).

src/app/chat/page.tsx:
  Left column (2/3 width): the chat surface.
  Right column (1/3 width): a "Profile in progress" live panel showing the slots being filled in real time — identity, employment, banking, credit_history, goals, sme_signal_count. Each filled slot fades in with Framer Motion.
  Top-right: persona switcher (Yassine / Amira / Karim) that loads that persona's conversation fixture as a starter.
  Bottom: input box + send button.
  When escalation fires, a colored banner slides down with "You qualify for Daiyn — upgrade" and a CTA that links to /dashboard?onboard=<persona>.

Wiring:
  POST /api/chat/turn { conversationId, userText, persona? } → returns { assistantText, profile, suggestions, escalation }
  Implemented in src/app/api/chat/turn/route.ts, delegating to src/lib/ai/agents/conversational.ts (stub only in this step — §8 fills in the real logic).
  For §7 standalone: have the endpoint echo the fixture assistant turn if a persona is set, so the UI can be demo-ready before the agent is finished.

Offline mode: /chat?offline=1 replays yassine.json turn-by-turn with realistic delays (800-1500ms). This is what we record for the demo video.

Do NOT implement the real WhatsApp webhook in this step.
```

**Verify after:** /chat?offline=1&persona=yassine plays the full conversation cleanly, profile panel fills, escalation banner triggers.

---

## §8 — Layer 1 backend: conversational agent + profile + suggester + escalation

**When:** after §7.

**Paste:**
```
Implement the real Layer 1 conversational agent and supporting services.

src/lib/ai/agents/conversational.ts:
  - getConv() factory (lazy ChatAnthropic with claude-sonnet-4-6, temp 0.5)
  - System prompt: concise. Defines the agent as Sanad, a Tunisian financial coach over WhatsApp. Responds in the language of the incoming message (Darija 3arabizi, French, or a mix). Keeps turns short (WhatsApp friendly). Never invents numbers.
  - Tools (function-calling):
    - updateProfile({ slot_path, value, confidence }) — writes to profiles.slots via queries
    - logIntent({ kind: 'buy_phone'|'get_loan'|'open_business'|'save'|'send_money'|..., note })
    - suggestProduct({ kind: 'bnpl'|'loan'|'wallet'|'savings'|'daiyn_upgrade', rationale })
    - raiseSMESignal({ evidence }) — increments sme_signal_count on profile
  - After each user turn, runs a mini analysis pass (Haiku, cheap) that decides which tools to invoke, then produces the reply.

src/lib/ai/agents/suggester.ts:
  Rule-based first pass (profile slots → eligible products), LLM refinement for rationale. Returns up to 2 suggestions per turn.

src/lib/ai/agents/escalator.ts:
  Triggers when sme_signal_count >= 2 AND escalated_at is null. Returns a structured prompt that the conversational agent surfaces on next reply ("You seem to sell regularly. Want to unlock Daiyn?"). Sets escalated_at on acceptance.

src/app/api/chat/turn/route.ts:
  Replaces the §7 stub. Validates input with Zod. Loads profile + last 20 messages. Runs conversational agent. Persists message + profile delta + any suggestions. Returns { assistantText, profileSnapshot, suggestions, escalation? }.

Real WhatsApp (behind WHATSAPP_LIVE=1):
  src/app/api/whatsapp/webhook/route.ts — verifies Meta HMAC, parses incoming message, resolves user by whatsapp_id (create on first contact), delegates to /api/chat/turn semantics, sends reply via src/lib/whatsapp/client.ts.
  src/lib/whatsapp/client.ts — minimal axios wrapper around Meta Cloud API: sendText, sendButtons, sendTemplate.
  All WhatsApp calls are no-ops when WHATSAPP_LIVE !== "1", logged to console instead. This is by design — real Meta setup is a post-hackathon task.

Run an end-to-end sanity pass on yassine.json: start a fresh conversation, feed the fixture's user turns one at a time to /api/chat/turn, assert the final profile state matches the fixture's terminal_state within 80% slot agreement.
```

**Verify after:** /chat (not offline) actually drives live agents. Profile builds. Escalation triggers by turn ~14 on Yassine.

---

## §9 — Layer 3: bank dashboard, matching, action dispatcher

**When:** after §8 (needs Layer 1 + 2 data present).

**Paste:**
```
Implement Layer 3 — Sanad for Banks — per docs/ARCHITECTURE.md.

src/lib/matching/engine.ts:
  Input: bank.criteria + subject (individual profile or SME passport). Output: { score: 0..100, reasons: string[] }.
  Rule filter first (sector match, ticket band, region, max_pd12m). Soft-score by: profile completeness, freshness (days since last activity), income stability, Passport expiry window. Breakdown reasons as human-readable strings for UI.

src/app/api/leads/route.ts:
  GET?bank_id= → returns ranked leads for that bank (calls surfaceLeads query, which scans recent profiles + passports, runs matching engine, upserts into leads table).
  POST { lead_id, action: 'contact'|'reject'|'request_info' } → writes lead_events and either:
    - contact → enqueues outbound WhatsApp (for individuals) or email (for SMEs) via action dispatcher
    - reject → updates lead.status
    - request_info → adds a note; SME sees it in /dashboard inbox next login

src/app/bank/page.tsx:
  Bank officer landing. Bank switcher (dev-mode picks between BIAT Pilot / Microfinance TN). Shows KPIs: new leads 7d, hot leads, conversion, est. revenue unlocked.

src/app/bank/leads/page.tsx:
  Leads table: score, subject kind (👤 individual / 🏢 SME), name/company, sector, ticket, match reasons, status, surfaced_at. Filters: status, score ≥, subject kind. Row click → /bank/leads/[id].

src/app/bank/leads/[id]/page.tsx:
  Two columns:
  Left: full subject profile or passport (linked to /passport/[id] if SME).
  Right: match reasons, action buttons [Contact] [Reject] [Request info], notes thread.
  Contact action: for individuals, opens a dialog with a pre-filled WhatsApp message ("Bonjour {name}, c'est {BankName}, votre profil nous intéresse — souhaitez-vous discuter d'un prêt ?"); on confirm, POSTs to /api/leads with a toast confirmation. In dev, no real send; log to console and write the event.

Auth: Clerk role `bank_officer` required. Dev bypass: set ?dev=1 in URL to skip auth locally.

Add a small commission tracker strip at the bottom of /bank: "Commission ce mois: €{sum of billing_events for current month}". Stub calculation by counting successful 'contact' events × €15.
```

**Verify after:** navigate /bank/leads, click a lead, trigger Contact — confirm the event is logged and the lead status updates.

---

## §10 — Landing page (the 3-layer story, one screen)

**When:** after §5, §7, §9 all exist (we need real URLs for the CTAs).

**Paste:**
```
Rewrite src/app/page.tsx as the public landing. Goal: a Tunisian judge can read it in 8 seconds and understand what Sanad is.

Above the fold (must fit 1920×1080 without scrolling):
  H1: "Le passeport de crédit des Tunisiens."
  Sub: "Sanad connecte les personnes, les PME et les banques autour d'une identité financière portable — signée, vérifiable, universelle."
  3 pill-shaped CTAs inline, each with an icon:
    🗣️  "Sanad Chat"  → /chat?offline=1&persona=yassine
    🏢  "Daiyn (PME)"  → /dashboard/upload
    🏦  "Sanad for Banks"  → /bank
  Below the CTAs, a compact 3-step visual: "Le particulier parle · La PME téléverse · La banque contacte."
  Top-right: "Open Banking Sandbox" amber badge.

Below the fold (scrollable but optional):
  - A condensed architecture diagram (inline SVG) showing the 3 layers + shared data
  - A single-row KPI strip: "4M sous-bancarisés · 650k PME · 15% obtiennent un prêt"
  - Footer with team name, hackathon, GitHub link

Constraints:
  - Tailwind + shadcn. One hero visual (gradient card). No stock photos.
  - Every line earns its place. No marketing fluff.
  - Server component where possible; "use client" only on animated bits.
  - Mobile: graceful degrade; demo will be 1920×1080.
```

**Verify after:** full-screen at 1920×1080 in Chrome. All 3 CTAs work.

---

## §11 — 8-slide Marp deck (unchanged structure, updated for 3 layers)

**When:** hour 14-16.

**Paste:**
```
Generate an 8-slide Marp deck at /deck/sanad.md per the Finnovo spec.

Same 8-section structure as before (Titre, Problème, Solution, Produit, Taille du marché, Concurrents, Impact, Équipe+Besoins) but updated for the 3-layer product:

- Slide 3 (Solution): the 3-layer story. Visual: three horizontal cards — Sanad Chat (WhatsApp), Daiyn (SME dashboard), Sanad for Banks. One line each. Center insight: "Un graphe de données partagé. Trois surfaces. Un Passport signé qui circule."
- Slide 4 (Produit): split into two sub-panels. Left: the Daiyn 5-node LangGraph with the HITL overlay — emphasize the critic loop + human-in-the-loop as the differentiator. Right: Sanad Passport mockup (signed, verifiable). Spoken note: mention the WhatsApp escalation-into-Daiyn flow as the "wow" moment.
- Slide 5 (Taille du marché): TAM €120M/yr Tunisie (€39M SME + €80M individuals × ~4 verifications/yr). SAM €25M. SOM Y1 €180k ARR.
- Slide 6 (Concurrents): pull from IDEAS.md Concurrents table. Add Plaid (infra, not vertical), Sanad Fund for MSME (a fund, not a product — namespace disambiguation).
- Slide 7 (Impact): individuals + SMEs, with the gig-worker / diaspora / female-informal framings from IDEAS.md.
- Slide 8 (Équipe + Besoins): ask includes "1 banque pilote", "€150k pré-seed", "BCT sandbox access".

Marp front-matter: theme: default, paginate: true, class: lead on slide 1.
Cap each slide at ~45 words of body text. Speaker notes (<!-- --> comments) contain the exact French sentence to say — target ~650 words total for 5 minutes at ~130 wpm.

Append an ## Export section with:
  npx @marp-team/marp-cli deck/sanad.md --pdf --allow-local-files -o deck/sanad.pdf
```

**Verify after:** `npx @marp-team/marp-cli deck/sanad.md --preview`. Time it with speaker notes out loud — must land 4:50–5:00.

---

## §12 — 2-minute demo video (covers all 3 layers)

**When:** hour 16-18.

**Paste:**
```
Produce /deck/demo-video.md — complete shot list and voiceover script for a 2-minute recorded video of Sanad. I record with OBS (screen+mic) on my laptop, then edit in CapCut. Hard cap 120s.

Scenes (scene-by-scene; timestamps, shot, on-screen action, VO in French professional register):

[0:00-0:15] HOOK — Layer 1
  Shot: /chat?offline=1&persona=yassine full-screen. First 3 turns play.
  VO: "Yassine, 26 ans. Livreur Jumia. Uber. 800 euros par mois. Sa banque le refuse — pas parce qu'il n'est pas solvable, mais parce qu'il n'a pas de preuve."

[0:15-0:38] PROFILE BUILDS + ESCALATION
  Shot: conversation continues; profile panel on the right fills slot by slot. At turn 12, the escalation banner slides down: "Vous qualifiez pour Daiyn".
  VO: "Sept agents IA construisent son profil financier en parlant avec lui. Darija, français, peu importe. Quand ils détectent une activité de PME — il vend, il facture, il gère des flux — Sanad l'escalade."

[0:38-1:15] LAYER 2 — DAIYN PIPELINE + HITL (the central wow)
  Shot: click escalation CTA → /dashboard/upload with pack cafe-el-wafa preloaded → click "Start pipeline" → /dashboard/pipeline/[runId].
  On-screen: the 5-node graph animates. At node (c) Executor, the HITL panel highlights, human clicks "Refine with AI" and types a short feedback. At node (e) Finalizer, clicks "Approve".
  VO (narrate the architecture, not each node):
    [0:38-0:55] "Cinq agents orchestrés par LangGraph. Formatter lit les docs. Orchestrator planifie."
    [0:55-1:05] "Executor construit le dossier avec tool calling. Reviewer vérifie chaque chiffre, chaque source."
    [1:05-1:15] "Humain dans la boucle à chaque étape. L'IA propose. L'humain approuve, affine, ou reprend la main."

[1:15-1:40] PASSPORT + VERIFY
  Shot: click "View Sanad Passport" → /passport/[id] → scroll → click QR → /verify/[id] loads in a new tab with green checkmark.
  VO: "Sanad Passport: signé cryptographiquement, portable, vérifiable par toute banque en une seconde. L'utilisateur le possède. C'est sa pièce d'identité financière."

[1:40-1:58] LAYER 3 — BANK DASHBOARD LOOP CLOSES
  Shot: cut to /bank/leads. Yassine + Café el Wafa appear in BIAT Pilot's feed. Officer clicks "Contact" on Yassine. Toast: "Message WhatsApp envoyé."
  VO: "La banque voit le lead. Clique. Et Yassine reçoit un message WhatsApp — de sa future banque."

[1:58-2:00] CLOSE
  Shot: Sanad monogram + tagline.
  VO: "Un passeport. Toute banque. Crédit instantané. Sanad."

Deliverables alongside the script:
1. OBS setup section (1920×1080, 60fps, CRF 18, AAC 192k, cursor-highlight plugin, fullscreen Chrome, notifications muted).
2. 5-item "Do not" list (no hedging VO, no typing on-camera — pre-fill, no dev-tools visible, no stock music over -18dB, no captions from auto-caption without review).
3. A priority cut list: if the raw recording runs 125-135s, which 5-10s chunks to trim first while preserving the HITL moment and the /verify checkmark.
4. /deck/demo-video.srt — French subtitles, ≤42 chars per line, max 3 words per subtitle line for readability on Drive playback.

End with ffmpeg verification command: `ffmpeg -i deck/demo-video.mp4 2>&1 | grep Duration`.

Do NOT produce the MP4 itself — script + setup doc + SRT only.
```

**Verify after:** read VO out loud with a stopwatch — must land 115-120s. Any scene that jitters gets re-recorded, not hedged around.

---

## §13 — Reviewer pass (hour 19-20)

**When:** hour 19-20. Final sweep.

**Paste:**
```
Act as senior eng + senior VC reviewing Sanad the night before the Finnovo pitch. Read the full repo + docs/ARCHITECTURE.md + /deck/sanad.md + /deck/demo-video.md.

Produce 4 sections:

A. Critical bugs (ship-blocking). Actually navigate each of these flows in dev mode and list what breaks:
   - / → /chat?offline=1&persona=yassine full conversation
   - /chat → escalation → /dashboard/upload → pipeline run with all 3 HITL modes exercised
   - /passport/[id] renders and prints to 1-2 A4 pages
   - /verify/[id] validates
   - /bank/leads → contact action fires
   For each bug: file path, reproduction steps, minimal fix suggestion. Do NOT fix yourself.

B. Polish items (≤15min each): copy fluff, spacing, typography, favicons, missing alt text, console errors, metadata, inconsistent casing.

C. Judging-criteria risk map: given the Finnovo weights (Innovation 15, Faisabilité 15, Problème 10, Économique 10, IA 10, Impact 10, UX 10, Entrepreneuriat 10, Prototype 5, Pitch 5), identify the TWO weakest areas in the current state and propose one concrete 30-min fix per area.

D. Hostile-judge Q&A check: list the 3 toughest questions a hostile juror could ask that are NOT in IDEAS.md "Shark-Tank defense bank". For each, draft a 2-sentence crisp rebuttal I can memorize tonight.

Cap total report at 700 words.
```

**Verify after:** fix every A-item. Fix B-items if time. Memorize C and D.

---

## §14 — Pre-flight sanity check (morning of submission)

**When:** 07:00 Sunday. 1h before 08:00 deadline.

**Paste:**
```
Pre-flight, one-line status per item:

1) pnpm -s build — paste last 15 lines.
2) pnpm -s tsc --noEmit — must be clean.
3) Start pnpm dev, curl-check with status codes:
   GET /, /chat?offline=1&persona=yassine, /chat?offline=1&persona=amira, /chat?offline=1&persona=karim,
   /dashboard, /dashboard/upload, /dashboard/pipeline/demo-run, /passport/demo-passport, /verify/demo-passport,
   /bank, /bank/leads, /bank/leads/demo-lead
4) POST /api/chat/turn with a small body → returns a JSON { assistantText, ... }
5) POST /api/pipeline/run with a demo pack → returns a runId and streams at least 5 SSE trace events
6) POST /api/pipeline/hitl with { mode:'approve' } → returns 200
7) Visual smoke — no console errors on any page in dev mode
8) All env defaults sensible — the app must boot without DATABASE_URL (fall back to in-memory fixtures)
9) /deck/sanad.pdf exists (print reminder to generate it if not)
10) /deck/demo-video.mp4 exists in deck/ or on Drive (print reminder if not)

If ANY check fails, STOP and report. Do not attempt fixes at this hour.
```

**Verify after:** every check green, or a conscious decision not to care.

---

## §15 — Submission (07:00 Sunday, 1h buffer before 08:00 cutoff)

**When:** 07:00 Sunday.

**Paste:** (not a Claude prompt — a human checklist; keep this section as the hand-off.)
```
HUMAN CHECKLIST — not for Claude Code.

[ ] Final commit pushed to GitHub (main branch).
[ ] Repo visibility correct per spec (public OR collaborator access for judges).
[ ] deck/sanad.pdf uploaded to team's Drive folder.
[ ] deck/demo-video.mp4 uploaded to team's Drive folder (with subtitles track or .srt attached).
[ ] OWNERSHIP TRANSFERRED on each Drive file to aiesec.tunisie.carthage@gmail.com (mandatory per spec).
[ ] Submission form filled: https://forms.gle/Vv9GpgZL3PAc25VB8
    — GitHub repo link
    — Drive link to deck
    — Drive link to video
[ ] Screenshot confirmation of form submission (proof of timestamp <08:00).
[ ] Backup USB with deck + video + local copy of repo, taped inside laptop lid.
[ ] Deck rehearsed twice more with teammate. Q&A defense bank open on phone.
[ ] Eat. Water. 30-min rest before 09:00 pitch.
```

---

## Appendix — single-purpose utility prompts (reuse during the 24h)

### New page
```
Create /app/<path>/page.tsx that does <one sentence>. Use shadcn/ui + Tailwind. ≤150 LoC. Accessible. Match existing palette (teal primary, amber accent).
```

### Add a new tool to the Executor
```
Add a tool `<toolName>` to src/lib/ai/agents/executor.ts. Signature: `<zod schema>`. Behavior: <one sentence>. Bind it to the Executor model. Return type JSON-serializable.
```

### Fix a build error
```
`pnpm build` fails with: <paste error>. Find the root cause — do not patch symptoms. Show me the fix as a diff before applying.
```

### Tighten copy
```
Rewrite <copy pasted verbatim> for a pitch audience. Constraints: under <N> words, active voice, no hedging, French. Produce 3 variants.
```

### Extend matching engine
```
Add a new criterion <name> to src/lib/matching/engine.ts. Semantics: <one sentence>. Weight: <1-10>. Include a unit test with 2 positive + 2 negative cases.
```
