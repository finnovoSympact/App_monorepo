# Finnovo 2026 — Shortlist (Open Banking × Financial Inclusion)

> Read this once before the spec book drops. We have one hero idea and three insurance-policy alternatives, all mappable onto the same scaffold.
>
> **Themes locked:** Open Banking + Financial Inclusion (bridge both, don't pick one).
> **Primary user:** Tunisian SME owner / accountant.
> **Pitch format:** 2-3 min live demo → 5-slide Shark-Tank deck.
> **Winning the jury (total 100):** Innovation 15 · Doability+Inclusion 15 · Problem 10 · Economic model 10 · AI integration 10 · Impact 10 · UX 10 · Entrepreneurship 10 · Prototype 5 · Pitch 5.

## The playbook in one paragraph

Innovation + Doability are tied at the top (15 each). That means we must show **something genuinely new** AND **something that actually runs on stage** — not just mockups. AI integration is worth only 10, but we can dominate it easily because a live multi-agent pipeline in Tunisia is still rare. Prototype quality is only 5, so we do NOT over-engineer — we cut scope to a single vertical slice that runs flawlessly. Pitch is only 5, so we spend ~90% of the 24h on the product and 10% on the deck.

## Theme bridge (memorize this line)

> "Open banking is the rail. Financial inclusion is the destination. Today it's just a regulation. We're turning it into credit for 650,000 Tunisian SMEs who can't borrow."

---

# HERO — Daiyn

**One-liner:** *Daiyn is the AI underwriter that turns a Tunisian SME's messy documents and open-banking transactions into a bankable credit file in under five minutes.*

**Product in a sentence:** An SME uploads invoices, bank statements, and (via a simulated open-banking consent screen) a 12-month transaction feed. A crew of specialized AI agents reconstructs a clean P&L, computes a credit score, writes a bank-ready memo, and hands it to a loan officer with every number traceable back to source.

### The pain (why this hurts, in Tunisia, in 2026)

- ~650,000 SMEs in Tunisia. Fewer than 15% ever get a bank loan. Source of friction: **documentation**, not creditworthiness.
- Post-2025 BCT open-banking sandbox + Dec-2025 FX-account liberalization mean banks CAN access SME data — but nobody has built the agent layer that turns raw open-banking data into a loan decision.
- Loan officers spend 4-8 hours manually reconstructing financials per file. Backlogs push SMEs toward informal lenders at 40-60% APR.
- The SME owner is not a finance person. They have a WhatsApp-photo of a supplier invoice, a messy Excel, and a bank PDF. That is the real input.

### Customer & who pays

- **End user:** the SME owner (trust + usability).
- **Paying customer:** the bank or microfinance institution (pays per credit file processed, or a SaaS seat per underwriter).
- **Two-sided from day one, but the hackathon demo leads with the SME flow** — it's emotionally tangible and lets us show the agents working.

### Market sizing (defensible numbers for the deck)

- TAM: 650k Tunisian SMEs × €15/file × 4 files/yr average underwriting lifecycle ≈ **€39M/yr in Tunisia alone**.
- SAM: ~120k SMEs active with a bank relationship. **€7.2M/yr**.
- SOM (2027 target): 3 bank partners × 3,000 files/yr × €15 = **€135k ARR** in year one — a credible wedge, not a fairytale.
- Expansion: Maghreb SMEs + MENA. Morocco alone is 3× Tunisia.

### Unit economics (one slide, memorize)

- Revenue per file: €15 (bank pays).
- Cost per file: ~€0.40 in LLM inference (Haiku-tier for routine, Sonnet for the underwriter agent) + €0.10 storage/ops = **€0.50**.
- Gross margin: **~96%**.
- Payback per bank customer: < 1 month.

### Moat

1. **Data flywheel.** Every processed file improves our rubric and Darija-aware doc classifiers. By file 10,000 no competitor can catch up on edge cases.
2. **Regulatory integration.** First team to ship a working BCT open-banking consent flow wins the relationship.
3. **Two-sided trust.** SMEs see the underwriter reasoning ("these 3 transactions lowered your score"); banks see audit trail. Neither side will swap us out once wired in.
4. **Language + informal-economy specificity.** Darija OCR, Arabic-French mixed docs, handwritten receipts — generic foundation models fail here, and that failure is our defensibility.

### Agent architecture (this IS the innovation slide)

```
           ┌─ OCRAgent ──┐
UserUpload ─┤            │
           └─ OBAgent ───┤
                         ▼
                   ReconcilerAgent
                         │
                         ▼
                   CategorizerAgent ──► P&L draft
                         │
                 ┌───────┴───────┐
                 ▼               ▼
         UnderwriterAgent   RiskAgent  (run in parallel)
                 │               │
                 └──────┬────────┘
                        ▼
                   CriticAgent  (verifies every claim has a source)
                        │
                        ▼
                   ComposerAgent ──► PDF credit memo + JSON score
                        │
                        ▼
                  Human-in-the-loop (bank officer approves/rejects)
```

- **OCRAgent** — vision LLM for messy invoices/receipts/WhatsApp screenshots.
- **OBAgent** — ingests open-banking transactions (we mock BCT sandbox with realistic CSV/JSON fixtures).
- **ReconcilerAgent** — matches invoices to payments, flags gaps.
- **CategorizerAgent** — builds a 12-month P&L with Tunisian-tax-code categories.
- **UnderwriterAgent** — applies a transparent scorecard, writes prose narrative.
- **RiskAgent** — stress tests, computes sector-adjusted PD.
- **CriticAgent** — the anti-hallucination guardian. Every number in the memo must cite a source doc or transaction ID, or the critic sends it back.
- **ComposerAgent** — produces the final PDF + a JSON score object.
- **HITL checkpoint** — bank officer can approve, reject, or annotate before the file is finalized.

This is a LangGraph supervisor with parallel fanout + critic loop + HITL gate. A full-stack multi-agent system, not a prompt chain. **That is what judges haven't seen before in Tunisia.**

### MVP cut for 24h (ruthless)

- 3 hand-curated "SME packs" (one clean café, one messy textile shop with a gap in filings, one growing e-commerce seller) — each pack is a zip of 6-10 mixed files we pre-author.
- A mocked open-banking "Allow Daiyn to access your transactions" consent screen (key demo moment — judges see the UX of OB, not just the tech).
- Full agent pipeline streams live on stage via SSE, with a visible trace panel (we already have this scaffolded).
- Final output: an actual PDF credit memo that opens in the browser — tangible artifact beats a wall of JSON every time.
- Offline canned-trace fallback already built (`/playground?offline=1`).

### Shark-Tank defense (rehearse answers)

- *"Can't banks just build this internally?"* — They've had five years and haven't. Our moat is the Darija OCR + Tunisian informal-economy patterns. A generic internal tool will fail on 30% of real SMEs.
- *"Why won't SMEs lie on the documents?"* — Because the bank feed via open banking is the source of truth; the documents are reconciled against it. Lying becomes impossible, not just hard.
- *"What if BCT open banking is slow to roll out?"* — We work with CSV uploads from existing bank portals today. Open banking compresses time-to-value from days to minutes, but we're not blocked on it.
- *"Who else is doing this?"* — Kudwa (Egypt, accounting-only, no underwriting), Credable (Kenya, single-bank integration). Nobody is combining OCR + open banking + a critic-loop underwriter in the Maghreb. We have a 12-18 month head start.
- *"What's the ask?"* — For the hackathon: validation + a bank partner to pilot. Post-hackathon: pre-seed €150k to hire one credit risk analyst + one ML engineer and ship a BIAT pilot by Q4 2026.

### Judging-criteria mapping (keep on your phone)

| Criterion | Weight | How Daiyn scores |
|---|---|---|
| Innovation | 15 | Multi-agent critic-loop for credit underwriting — novel in MENA |
| Doability + IT inclusion | 15 | Runs live on stage; digitizes the most excluded segment (informal SMEs) |
| Problem understanding | 10 | 650k SMEs stat + loan-officer pain is visceral and specific |
| Economic model | 10 | €15/file, 96% gross margin, 1-month payback — all on one slide |
| AI integration | 10 | LangGraph, 7 agents, parallel fanout, critic gate, HITL — beyond "GPT wrapper" |
| Impact | 10 | Credit access for the bottom of the SME pyramid |
| UX | 10 | SME consent screen + live trace panel + PDF artifact |
| Entrepreneurship | 10 | Two-sided market, clear wedge, Maghreb expansion path |
| Prototype quality | 5 | Vertical slice runs flawlessly (we cut scope, not corners) |
| Pitch | 5 | Tight 5-slide deck, live demo, memorable line |

---

# INSURANCE POLICIES (only if spec book forces a pivot)

These are compatible with the same scaffold. If the spec book mandates a different angle (e.g., "must serve unbanked individuals, not SMEs"), swap names and tune the agents — do NOT rebuild.

## #A — Wasla: the Open-Banking super-view for the underbanked

**Pitch.** A Tunisian has money in D17, Flouci, Paymee, Ooredoo Money, one postal account, and maybe a bank. None talk to each other. Wasla is a consumer open-banking aggregator-as-an-agent that connects them all, shows one unified financial picture, and — critically — emits a **portable credit footprint** the user owns and can share with any lender.

**Why it wins.** Consumer-facing, emotional, and pure financial-inclusion narrative. The "portable credit passport" framing is novel.

**Agents.** Connector agents per provider (mocked in demo), ReconcilerAgent, InsightAgent (weekly summary in Darija), CreditFootprintAgent (generates a shareable score + source-list).

**Use if:** the spec book pushes "consumer financial inclusion" hard.

## #B — Sayada: AI-supervised savings circles (tontines) with a bankable trust score

**Pitch.** Tunisians already run informal savings circles (*sayada* / *tontine*). They work on trust and break on drama. Sayada is an AI moderator that runs the circle, enforces the schedule, mediates disputes, and silently computes a **trust score per participant** that banks can use as an alternative-data credit signal.

**Why it wins.** Takes an existing, universally understood informal mechanism and turns it into a credit-inclusion on-ramp. Very Shark-Tank: "we're not replacing bank loans, we're building the *data* that unlocks them."

**Agents.** ModeratorAgent, SchedulerAgent, DisputeAgent (Darija), TrustScoreAgent, BankHandoffAgent.

**Use if:** the spec book pushes "community finance" or "alternative credit scoring."

## #C — Khazina: the open-banking agent that banks on your behalf

**Pitch.** A personal-finance agent that — with user consent — actively moves money across accounts to optimize for savings, bill payment, and FX timing. Agent banking as a product, not a feature.

**Why it wins.** Feels futuristic on stage ("the agent moved 150 TND from D17 to my savings while the judges were watching") but is honestly riskier to build in 24h. Keep as plan C.

**Use if:** the jury is heavy on "autonomous AI" / agentic systems and we want to go maximal on the innovation axis.

---

# What we are explicitly NOT building

- Budgeting app with GPT in it. Too done.
- Crypto anything. Grey zone in TN.
- NFT anything. 2021 called.
- A bank API integration we can't demo. We MOCK open banking with realistic fixtures and call that out upfront — judges respect honesty more than vaporware.
- Anything requiring more than two new screens. UX is 10 points; we win those on polish, not surface area.

---

# Final bets (write this on the whiteboard at hour 0)

1. **The product is Daiyn.** Don't relitigate unless the spec book literally forbids SME lending.
2. **The demo is the PDF credit memo appearing live.** Everything else serves that moment.
3. **The pitch line is "Open banking is the rail. Inclusion is the destination."**
4. **Cut scope, not corners.** If it doesn't serve the 3-minute demo, delete it.
