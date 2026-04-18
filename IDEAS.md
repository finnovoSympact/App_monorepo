# Sanad — Finnovo 2026 product bible (3-layer platform)

> Read this once before execution. We have one hero platform — **Sanad** — with three layers stacked on a single data graph. Daiyn is the Layer 2 sub-brand, preserved because the word is known in-room and it anchors the SME credit story.
>
> **Themes locked:** Open Banking + Financial Inclusion (we bridge both; we do not pick).
> **Primary surfaces:** WhatsApp-style chat (Layer 1), SME dashboard "Daiyn" (Layer 2), Bank dashboard "Sanad for Banks" (Layer 3).
> **Pitch format per spec:** 5-min deck (8 sections) + 2-min recorded demo video + 20-min Q&A.
> **Winning the jury (total 100):** Innovation 15 · Doability+IT inclusion 15 · Problem 10 · Economic model 10 · AI integration 10 · Impact 10 · UX 10 · Entrepreneurship 10 · Prototype 5 · Pitch 5.

## The platform in one paragraph

Innovation and Doability are tied at the top (15 each). Judges reward _new_ AND _demonstrably working_. Sanad wins Innovation through a three-layer stack that turns a conversational onboarding into a signed, portable credit credential and a monetizable lead for banks — none of the three exists together anywhere in MENA today. Sanad wins Doability through a single Next.js codebase with one Postgres database shared by all three layers, plus an offline canned-trace fallback so nothing depends on network quality at 09:00 Sunday. AI integration (10 pts) is dominated by the Layer 2 5-node LangGraph pipeline with HITL on every node. We spend ~90% of the 24h on the product and 10% on the deck; the 2-min recorded video is the deliverable that actually wins the jury.

## Theme bridge (memorize this line)

> "Open banking is the rail. Financial inclusion is the destination. Today it's just a regulation. Sanad turns it into credit for 650,000 Tunisian SMEs and the millions of individuals they employ — on the phones they already own."

---

# THE HERO — Sanad, a platform in three layers

**One-liner (use this on slide 1):** _Sanad is the AI platform that takes a Tunisian from a WhatsApp message to a bank-approved credit file — with the user in control at every step._

## Layer 1 — Sanad Chat (individuals, WhatsApp-first)

**What the user sees.** A WhatsApp conversation in Darija (Latin-script 3arabizi) or French. An AI assistant asks a handful of friendly questions, understands informal answers, and quietly builds a structured profile: who the person is, what they earn, which banks/wallets they use, what they owe, and what they want. It then suggests products that genuinely fit — a savings goal, a microloan, a salary-advance, a co-signed facility — with the reasoning visible and editable.

**The SME signal (this is the bridge to Layer 2).** If the conversation reveals that the user owns or runs a business ("I sell at the Medina", "I have two employees"), the assistant offers a one-tap escalation to Daiyn. A signed magic link promotes the account to an SME dashboard with the profile pre-seeded. **The chat is the funnel for the SME product.**

**Why this wins points.**

- _Problem (10):_ 8M+ Tunisians are banked in name but invisible to credit. WhatsApp is the universal surface.
- _Inclusion (15):_ Darija + French support. No app install. Works on any phone.
- _UX (10):_ Conversational > forms. Every suggestion shows why.
- _Impact (10):_ Onboarding at zero marginal cost, in the language of the user.

**Tech in one line.** Next.js `/chat` route with a faithful WhatsApp simulator; a conversational agent (Claude Sonnet 4.6) with four tools (`updateProfile`, `logIntent`, `suggestProduct`, `raiseSMESignal`); persona switcher for the demo; real Meta WhatsApp Cloud API behind a `WHATSAPP_LIVE=1` flag (stubbed by default — the simulator is the primary demo surface).

## Layer 2 — Daiyn (SME credit copilot, dashboard)

**What the user sees.** An SME owner uploads invoices, bank statements, and a simulated open-banking consent screen. A 5-node LangGraph pipeline runs visibly: **Formatter → Orchestrator → Executor → Reviewer → Finalizer**. Every node is a human-in-the-loop gate — the SME can _approve_, _refine with AI_ (reply with what to change and the node re-runs), or _take over manually_. Output: a bank-ready credit memo PDF + a signed **Sanad Passport** (Ed25519-signed JSON+JWS) the SME owns and can share with any bank.

**Why this wins points.**

- _Innovation (15):_ HITL on every node of a multi-agent pipeline is rare even in frontier products.
- _AI integration (10):_ LangGraph + Postgres checkpointer + SSE streaming + tool-calling Executor. Beyond "GPT wrapper".
- _Economic model (10):_ Banks pay €15 per verified Passport vs €80-120 internal underwriting cost.
- _Entrepreneurship (10):_ Two-sided marketplace — SME owns the artifact, bank pays to verify.

**Tech in one line.** LangGraph state graph with 5 nodes + interrupts on every node; Drizzle ORM over Postgres stores `pipeline_runs` and `run_nodes` (complete audit trail); Ed25519 signing via Node `crypto`; a public `/verify/[id]` endpoint that lets anyone re-verify a Passport without an account.

## Layer 3 — Sanad for Banks (monetization, dashboard)

**What the user sees.** A bank credit officer logs in and sees a ranked feed of leads: verified Sanad Passports from Layer 2 plus pre-qualified individuals from Layer 1, matched against the bank's own criteria (sector, ticket size, risk appetite, region). One-click "Contact borrower" opens a templated outreach (email via Resend; SMS/WhatsApp template if live API is on) and opens a commission event in the ledger.

**Why this wins points.**

- _Economic model (10):_ This is where revenue comes from — €15/Passport contact + tiered commissions on funded loans.
- _Impact (10):_ Every contact closed is a Tunisian SME or individual getting formal credit.
- _Entrepreneurship (10):_ Real monetization path on stage, not aspirational.

**Tech in one line.** Matching engine as a deterministic scorer + optional Sonnet rerank; action dispatcher with per-bank rate limits; commission ledger in Postgres as append-only event stream.

## The data graph — why one database matters

All three layers share a single Postgres (Drizzle ORM) so that:

- A chat message in Layer 1 can promote the same `user_id` into Layer 2 with zero re-onboarding.
- A `passport_id` signed in Layer 2 is the same token Layer 3 shows to the bank.
- `lead_events` in Layer 3 are linkable back to the exact `pipeline_run_id` that produced them — full provenance.

**Judges love this answer:** "Why one database?" → _"Because the Passport is the unit of value. It has to be the same row read by all three layers."_

---

## Market sizing (defensible numbers for the deck)

| Layer           | TAM                                                            | SAM                               | SOM Y1                                              |
| --------------- | -------------------------------------------------------------- | --------------------------------- | --------------------------------------------------- |
| L1 individuals  | 8M TN banked adults × €0.20/month AI handling ≈ **€19M/yr TN** | 1M active banking-app users       | 20k paying-via-bank users → **€48k ARR**            |
| L2 SMEs         | 650k TN SMEs × 4 files/yr × €15 ≈ **€39M/yr TN**               | 120k SMEs with bank relationships | 3 bank partners × 3k files/yr × €15 → **€135k ARR** |
| L3 banks        | 29 TN banks × €50k platform seat ≈ **€1.5M/yr TN**             | 10 lending-active banks           | 3 banks × €50k → **€150k ARR**                      |
| **Total TN Y1** | —                                                              | —                                 | **≈ €333k ARR**                                     |

Expansion: Maghreb (Morocco 3×, Algeria 2×, Egypt 8×). Same stack, swap rules layer per country.

## Unit economics (one slide, memorize)

| Line             | L1 chat                       | L2 file       | L3 lead contact              |
| ---------------- | ----------------------------- | ------------- | ---------------------------- |
| Revenue          | €0.20/user-month (enterprise) | €15/file      | €15 + funded-loan commission |
| LLM cost         | ~€0.02/turn × 8 turns = €0.16 | ~€0.40        | ~€0.10 rerank                |
| Ops cost         | negligible                    | €0.10 storage | negligible                   |
| **Gross margin** | ~80%                          | **~96%**      | **~99%**                     |
| Payback          | <1 month                      | <1 month      | <1 week                      |

---

## Moat (what compounds)

1. **Portable Passport standard.** If Sanad Passports become the thing banks trust, we are the issuer — every SME in Tunisia eventually holds one. Layer 2 alone is the bridge between the data and the artifact; Layer 1 is how the issuance scales.
2. **Two-sided data flywheel.** Layer 1 turns every conversation into a labeled profile; Layer 3 turns every bank outcome into a signal that tunes Layer 2's Reviewer node. No one-sided competitor gets both.
3. **Language + informal-economy specificity.** Darija-Arabic-French mixed docs + Latin-script chat + Tunisian tax categories + local bank naming conventions. Generic foundation models fail here.
4. **Regulatory integration.** First team to ship a working BCT open-banking consent flow wins the bank partnership pipeline.
5. **Codebase leverage.** One Next.js repo, one DB. Every new layer feature ships to all three surfaces. Competitors with separate apps/backends per surface will be 3× slower.

## Agent architecture — the Layer 2 slide (this IS the innovation visual)

```
Upload (docs + open-banking consent)
   │
   ▼
┌──────────────────────────────────────────────────────┐
│  LangGraph pipeline with HITL on every node           │
│                                                        │
│  Formatter (a) ──► Orchestrator (b) ──► Executor (c) │
│                            │                           │
│                            ▼                           │
│                      Reviewer (d)                      │
│                            │                           │
│                            ▼                           │
│                      Finalizer (e)                     │
│                                                        │
│   Every node ⤵ interrupts. SME can:                   │
│     · Approve                                          │
│     · Refine with AI (free-text instruction re-runs)   │
│     · Take over manually (edit outputs directly)       │
└──────────────────────────────────────────────────────┘
   │
   ▼
Ed25519-signed Sanad Passport (JSON + JWS)
   │
   ▼
/verify/[id]   ◄── any bank, anywhere, no account needed
```

- **Formatter (a)** — Normalizes all uploaded docs (OCR, schema extraction, Darija-aware doc classifier) into a common `documents[]` typed structure.
- **Orchestrator (b) — the god-node.** Plans what downstream work is needed, fans out work, and chooses which tools the Executor should call.
- **Executor (c)** — Calls tools: open-banking mock, tax-category mapper, P&L reconciler, sector PD lookup, FX-adjuster. Multi-step tool-calling with provider fallback.
- **Reviewer (d)** — The critic. Blocks any claim in the memo without a source citation (`doc_id` or `transaction_id`). We demo this block happening live.
- **Finalizer (e)** — Composes the PDF memo + the signed Passport JSON+JWS. Emits a `passport_issued` event Layer 3 consumes.

**HITL on every node** is the moment that wins judges. It is an answer to every single responsible-AI question before they ask it.

## MVP cut for 18-20h (ruthless)

- **L1:** One `/chat` route (WhatsApp-style simulator). Persona switcher with 3 canned conversations. 4 tool calls wired. Offline replay. Real Meta API lives behind `WHATSAPP_LIVE=1` (not demoed).
- **L2:** Full 5-node pipeline fully working. HITL on every node. One `/playground` upload flow. 3 curated SME packs with canned traces. Signed Passport + `/verify/[id]` fully working.
- **L3:** Minimal dashboard: lead feed (real DB rows from canned trace + demo seeds) with matching badges; one-click contact writes a `lead_event`; commission ledger chart renders from the same table. No live email send in the demo.
- **Shared:** Landing page tells the 3-layer story with 3 CTAs. Offline fallback (`?offline=1`) for everything demo-critical.

## Concurrents (Slide 6 source material + Q&A ammo)

| Solution                                               | L1 chat             | L2 credit                | L3 bank feed          | OB-native | Portable output           | Where they fall short vs Sanad                         |
| ------------------------------------------------------ | ------------------- | ------------------------ | --------------------- | --------- | ------------------------- | ------------------------------------------------------ |
| **Kudwa** (EG, MENA)                                   | No                  | Accounting only          | No                    | No        | No                        | No credit decision, no portability                     |
| **Credable** (KE)                                      | No                  | Single-bank              | No                    | Partial   | No                        | One-bank-locked; no Maghreb/Darija                     |
| **Plaid / TrueLayer / Yapily**                         | No                  | Infra only               | No                    | Yes       | No                        | Pure plumbing; no vertical; not in Tunisia             |
| **Flouci / Konnect / Paymee / D17** (TN)               | No                  | No                       | No                    | No        | No                        | Wallets/payments rails, not credit                     |
| **Wave / Orange Money / Ooredoo Money**                | No                  | No                       | No                    | No        | No                        | Mobile money only                                      |
| **CreditInfo / Experian-TN**                           | No                  | Score aggregator         | Partial               | No        | No                        | Score but no memo, no Passport, no UX                  |
| **WhatsApp banking pilots** (e.g. local bank chatbots) | Basic FAQ           | No                       | No                    | No        | No                        | Scripted, no profile building, no escalation           |
| **Bank internal underwriting tools**                   | No                  | Per-bank silo            | Internal only         | No        | No                        | Not portable; 4-8h/file manual; re-done per bank       |
| **ChatGPT / generic LLM tools**                        | Yes, generic        | No                       | No                    | No        | No                        | No Darija nuance, no source-traceable memo, no signing |
| **Sanad**                                              | **Yes (Darija+FR)** | **5-node HITL pipeline** | **Yes, matched feed** | **Yes**   | **Yes (signed Passport)** | —                                                      |

**The killer line for the slide:** _"Everyone else builds one surface. We built the rail from the WhatsApp message to the bank's loan book — and the credential the user carries between them."_

## Shark-Tank defense bank (20-min Q&A prep — memorize all)

### On scope ("why three layers?")

- _"Isn't three layers too much for a hackathon?"_ — Not three products; one platform. One Next.js repo, one Postgres, one auth system. Each layer is ~500 LOC of new UI over a shared backend. We built the expensive parts (LangGraph pipeline, Passport signing) once, and the other two layers consume them.
- _"Why not just pick the SME layer and do it really well?"_ — Because the SME-only version has a funnel problem: how do SMEs find us? Layer 1 is the funnel. Layer 3 is the monetization. Cutting any layer breaks the business model. The technical work to add them is marginal once the data graph is unified.
- _"Which layer is the real product?"_ — All three, but the Passport (Layer 2 output) is the _unit of value_. Layer 1 creates demand, Layer 3 monetizes demand, Layer 2 is the reason both exist.

### On Layer 1 (chat)

- _"Why WhatsApp and not an app?"_ — 90%+ of Tunisians use WhatsApp daily. Zero install. Reaches the unbanked. An app would filter out our target user.
- _"What about WhatsApp privacy / Meta policies?"_ — The Meta Cloud API is the sanctioned channel. We store only what the user consents to; consent is explicit at each profile step; they can type "delete my profile" and it's gone. We demo the simulator because Meta approval takes weeks; the real integration is wired behind a flag.
- _"What if users lie in chat?"_ — The profile is a starting point, not a decision. The moment it matters (loan, Passport), we reconcile against open-banking data and documents. Layer 1 is top-of-funnel, not the truth source.
- _"Darija is hard — how good is your handling?"_ — Sonnet 4.6 handles Latin-script 3arabizi well; we prompt-engineer the system message to stay in register and we eval against 20 realistic dialogues. For production we'd fine-tune.

### On Layer 2 (Daiyn pipeline + HITL)

- _"How do you prevent hallucinations in the credit memo?"_ — The Reviewer (d) blocks any numeric claim that can't be traced to a source doc or transaction ID. Zero unsourced claims. We demo the block live.
- _"Why HITL on every node instead of once at the end?"_ — Because the SME is the owner of the file, not just a reviewer at the end. Every node is a negotiation. "Refine with AI" lets them stay non-technical; "Take over manually" respects that sometimes they know a fact we can't see.
- _"Won't that slow things down?"_ — On the demo it takes <60s total because approvals are one-click. The user only intervenes when a node's output is actually wrong. In practice most runs are 4 approvals + 1 refinement.
- _"Why multi-agent instead of one big model?"_ — Separation of concerns: each node is simpler, cheaper (Haiku for routine, Sonnet for the Orchestrator and Reviewer), testable in isolation, replaceable. €0.40/file is a direct consequence.
- _"Why LangGraph specifically?"_ — Postgres checkpointer gives us free HITL, time-travel debugging, and a durable audit log that doubles as regulatory evidence.

### On Layer 3 (banks)

- _"What if no bank signs up?"_ — Our Y1 SOM (€150k) is 3 banks out of 29. We have warm intros via AIESEC alumni + INSAT industry network. Even if banks are slow, the Passport is usable in microfinance and BNP leasing, which move faster.
- _"Aren't you just a middleman banks can cut out?"_ — Only if the Passport becomes issued by the banks themselves — which is fine, we'd license the stack. Short term, banks pay us because we save €65 per file versus internal underwriting.
- _"How do you prevent banks from cherry-picking borrowers and leaving us with adverse selection?"_ — The Passport is the SME's property. We don't de-list anyone; the bank chooses whom to contact. If a bank's funnel underperforms market rates, we surface that to the SME and surface other banks.
- _"Commission vs subscription?"_ — Hybrid: platform seat (€50k/bank/yr) + €15/contact + performance commission on funded loans. The commission aligns incentives so we're not incentivized to flood banks with bad leads.

### On cross-layer / data / regulatory

- _"One database for everything — is that safe?"_ — Row-level security per role (sme_owner, bank_officer, admin). Banks only see leads they're allowed to see (contract + region). All data Tunisia-region. Audit log on every read/write to `passports` and `leads`.
- _"Can a SME revoke a Passport after it's been shared?"_ — Yes. Each Passport has a validity window (default 90 days) + a public revocation endpoint banks must check. Straight out of the verifiable-credentials playbook.
- _"GDPR / INPDP compliance?"_ — SME data stays in Tunisia-region infrastructure; we're the data processor; raw docs deleted 30 days after decision; audit trail on every step.
- _"What if BCT open banking rolls out slowly?"_ — We work with CSV uploads from existing bank portals today. OB compresses time-to-value from days to minutes, but we're not blocked. Already have the fallback path in the demo.

### On tech risk

- _"What if Anthropic raises prices 10×?"_ — BYOK, model-agnostic. The LangGraph layer is provider-independent. Groq, Gemini, OpenAI pre-wired. We'd migrate in a day.
- _"What stops a competitor from copying the architecture?"_ — The architecture is deliberately simple and readable. The moat is the Passport network + Darija-specific training signal + bank integrations. All compound with users; code doesn't.
- _"Isn't this just a wrapper around Claude?"_ — A wrapper is one prompt. We're running a 5-node HITL pipeline, a Layer-1 conversational agent with 4 tools, a matching engine, Ed25519 signing, a public verifier, and an append-only commission ledger. The AI is the engine; the product is the rail around it.

### On business + team

- _"Who pays, and how much?"_ — Banks pay (€50k platform + €15/contact + commission). SMEs pay nothing. Individuals pay nothing. Freemium-by-design on the user side.
- _"What's your CAC?"_ — ~€5-10k per bank (B2B sales). The bank's portfolio becomes our user funnel for free. Organic SME-to-SME once the Passport becomes a norm.
- _"Why your team?"_ — [Talel: CS + INSAT + hackathon track record in AI pipelines. Finance teammates: [fill in domain]]. Key combination: tech that actually ships + domain credibility with bankers.
- _"What are you shipping post-hackathon?"_ — Pre-seed €200k, two hires (credit risk analyst, ML engineer), BIAT/Attijari pilot Q4 2026, 3 TN banks by Q2 2027, Morocco entry Q4 2027.
- _"What's the ask today?"_ — Bank pilot partner from the room + BCT sandbox introduction. That's it.

## Judging-criteria mapping (keep on your phone)

| Criterion                | Weight | How Sanad scores (explicit layer attribution)                                                      |
| ------------------------ | ------ | -------------------------------------------------------------------------------------------------- |
| Innovation               | 15     | 3-layer stack + HITL-on-every-node + Passport portability — none exist together in MENA            |
| Doability + IT inclusion | 15     | One Next.js repo runs live; Darija chat + zero-install WhatsApp UX; mobile-first                   |
| Problem understanding    | 10     | 650k SMEs + 8M banked-invisible individuals, both covered in one story                             |
| Economic model           | 10     | 3 revenue streams: seat (L3) + per-file (L2) + per-contact/commission (L3). 96% GM on L2           |
| AI integration           | 10     | LangGraph 5 nodes + HITL + SSE streaming + tool-calling; Layer-1 conversational agent with 4 tools |
| Impact                   | 10     | Individuals + SMEs + banks. Credit access expansion as a system, not a product                     |
| UX                       | 10     | WhatsApp-style chat + live pipeline graph + public Passport verifier — three tangible artifacts    |
| Entrepreneurship         | 10     | Two-sided marketplace, clear wedge (L2), clear funnel (L1), clear monetization (L3)                |
| Prototype quality        | 5      | Vertical slice runs flawlessly; offline replay never fails                                         |
| Pitch                    | 5      | 5-min deck + 2-min demo video — rehearsed, subtitled, under spec limits                            |

---

# The demo arc (this is what the 2-min video must show)

1. **0:00-0:15 — Yassine on WhatsApp.** Open `/chat`, select persona Yassine. He says "3andi makla f'el medina" → the assistant builds his profile → raises SME signal → shows the escalation CTA.
2. **0:15-0:25 — Magic-link promotion.** One click → land in the Daiyn dashboard with Yassine's café pre-seeded.
3. **0:25-1:15 — The 5-node pipeline with HITL.** Open `/playground`, upload the café pack. Watch Formatter → Orchestrator → Executor run. Orchestrator pauses — we hit "Refine with AI" and type "also flag sector concentration risk". Reviewer blocks a claim without a source. Finalizer emits the memo + signed Passport.
4. **1:15-1:30 — Passport + verifier.** Open `/passport/[id]`, show the QR code. Open `/verify/[id]` in an incognito tab → shows ✓ signature valid, issuer, validity window.
5. **1:30-1:50 — Bank dashboard.** Login as a bank officer. Yassine's Passport appears at top of the feed. Click "Contact borrower" → lead event logged, commission row added, cost+latency HUD shows the whole demo cost €0.52.
6. **1:50-2:00 — Close.** Tagline card: "Open banking is the rail. Inclusion is the destination. Sanad is the product."

---

# Insurance policies (only if spec book or live feedback forces a pivot)

These are compatible with the same scaffold. Swap names, tune the agents; do NOT rebuild.

## #A — Wasla (L1-heavy consumer pivot)

If the jury pushes hard on "consumer financial inclusion": rename Layer 1 "Wasla", de-emphasize Layer 2/3 in the pitch (still demo them), and lead with the "every Tunisian gets a portable credit footprint from their WhatsApp history + mobile-money data" framing.

## #B — Sayada (alternative-credit pivot)

If the jury pushes "community finance" or "alternative credit scoring": reframe Layer 1 as an AI-moderated _tontine_ and route the trust score into Layer 2's Reviewer as an alternative-data signal. Rest of the stack unchanged.

## #C — Khazina (autonomous-agent pivot)

If the jury is heavy on agentic autonomy: lead with Layer 1 as an agent that _acts_ on the user's behalf (move money, pay bills). Keep L2/L3 as the credit story. Risky; keep as Plan C.

---

# Explicitly NOT building

- Budgeting app with GPT in it. Too done.
- Crypto / NFT. Grey zone; career-limiting.
- Bank API integrations we can't demo — we MOCK open banking with realistic fixtures and call it out upfront. Judges respect honesty over vaporware.
- Fine-tuned models. Prompting + tool use + careful Sonnet/Haiku mix is enough for the 24h.
- More than three screens per layer. UX is 10 points; we win them on polish.

---

# Final bets (whiteboard these at hour 0)

1. **The product is Sanad, in three layers.** Daiyn is preserved as Layer 2 sub-brand. Do not relitigate.
2. **The demo arc is the 6-step sequence above.** Everything serves it.
3. **The pitch line is "Open banking is the rail. Inclusion is the destination."**
4. **Cut scope, not corners.** If it doesn't serve the 2-minute video, delete it.
5. **Feature freeze at hour 13.** Record the video at hour 16-19. Submit by 07:00 Sunday.
