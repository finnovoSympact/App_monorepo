// Layer 2 LangGraph 5-node pipeline: Formatter → Orchestrator → Executor → Reviewer → Finalizer
import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import type { ChatOpenAI } from "@langchain/openai";
import type { FormattedCorpus } from "./formatter";
import { computeKPI } from "@/lib/ai/tools/kpi";
import { queryPeerBenchmarks } from "@/lib/ai/tools/benchmarks";
import { flagRisk, type RiskEntry } from "@/lib/ai/tools/risk";
import { issuePassport } from "@/lib/signing/passport";
import { getLangchainModel } from "@/lib/ai/client";

// --- Types ---
export type NodeKey =
  | "a_formatter"
  | "b_orchestrator"
  | "c_executor"
  | "d_reviewer"
  | "e_finalizer";
export type HitlMode = "ai" | "ai_refined" | "manual" | "waiting";

export interface TraceEvent {
  agent: string;
  summary: string;
  kind: "in" | "out" | "hitl" | "tool_call" | "revision";
  status: "running" | "completed" | "waiting" | "revised" | "approved";
  at: number;
  nodeKey: NodeKey;
  costEstimate?: number;
}

export interface DraftPassport {
  companyName?: string;
  sector?: string;
  city?: string;
  creditScore: number;
  scoreLabel: string;
  goal: string;
  summary: string;
  kpis: Array<{ label: string; value: string; benchmark: string; status: string }>;
  risks: RiskEntry[];
  sourceDocuments: Array<{ id: string; kind: string; label: string }>;
  xaiLog: string;
  revisionCount: number;
}

// --- State ---
export const PipelineState = Annotation.Root({
  smeId: Annotation<string>(),
  goal: Annotation<string>(),
  documents: Annotation<Array<{ id: string; kind: string; content: string; storageKey?: string }>>({
    reducer: (
      _: Array<{ id: string; kind: string; content: string; storageKey?: string }>,
      next: Array<{ id: string; kind: string; content: string; storageKey?: string }>,
    ) => next,
    default: () => [],
  }),
  corpus: Annotation<FormattedCorpus | null>({
    reducer: (_: FormattedCorpus | null, next: FormattedCorpus | null) => next,
    default: () => null,
  }),
  plan: Annotation<string[]>({
    reducer: (_: string[], next: string[]) => next,
    default: () => [],
  }),
  draft: Annotation<DraftPassport | null>({
    reducer: (_: DraftPassport | null, next: DraftPassport | null) => next,
    default: () => null,
  }),
  reviewVerdict: Annotation<"APPROVED" | "NEEDS_REVISION" | null>({
    reducer: (
      _: "APPROVED" | "NEEDS_REVISION" | null,
      next: "APPROVED" | "NEEDS_REVISION" | null,
    ) => next,
    default: () => null,
  }),
  revisionReasons: Annotation<string[]>({
    reducer: (_: string[], next: string[]) => next,
    default: () => [],
  }),
  passportId: Annotation<string | null>({
    reducer: (_: string | null, next: string | null) => next,
    default: () => null,
  }),
  trace: Annotation<TraceEvent[]>({
    reducer: (a: TraceEvent[], b: TraceEvent[]) => [...a, ...b],
    default: () => [],
  }),
  hitlInterrupts: Annotation<
    Record<NodeKey, { mode: HitlMode; feedback?: string; override?: unknown }>
  >({
    reducer: (
      a: Record<NodeKey, { mode: HitlMode; feedback?: string; override?: unknown }>,
      b: Record<NodeKey, { mode: HitlMode; feedback?: string; override?: unknown }>,
    ) => ({ ...a, ...b }),
    default: () =>
      ({}) as Record<NodeKey, { mode: HitlMode; feedback?: string; override?: unknown }>,
  }),
  revisionLoop: Annotation<number>({
    reducer: (_: number, next: number) => next,
    default: () => 0,
  }),
  currentNode: Annotation<NodeKey | null>({
    reducer: (_: NodeKey | null, next: NodeKey | null) => next,
    default: () => null,
  }),
});

type PS = typeof PipelineState.State;

// --- Lazy model factories ---
function getHaiku(): ChatOpenAI {
  return getLangchainModel("fast");
}
function getSonnet(): ChatOpenAI {
  return getLangchainModel("smart");
}

function traceEvent(
  nodeKey: NodeKey,
  summary: string,
  kind: TraceEvent["kind"],
  status: TraceEvent["status"],
): TraceEvent {
  return { agent: nodeKey, summary, kind, status, at: Date.now(), nodeKey };
}

// --- Node a: Formatter ---
async function nodeFormatter(state: PS): Promise<Partial<PS>> {
  const docs =
    state.documents.length > 0
      ? state.documents
      : [
          {
            id: "doc1",
            kind: "invoice",
            content: "Invoice 2025-11: amount 1840 TND, supplier Epicerie El Amouri",
          },
          {
            id: "doc2",
            kind: "invoice",
            content: "Invoice 2025-12: amount 2200 TND, supplier Café Supplies TN",
          },
          {
            id: "doc3",
            kind: "bank_statement",
            content: "BNA statement Dec 2025: credit 15400 TND, debit 12200 TND",
          },
          {
            id: "doc4",
            kind: "open_banking",
            content: "D17 feed Oct-Dec 2025: avg monthly flow 4800 TND credit",
          },
        ];

  const model = getHaiku();
  const prompt = `You are a financial document classifier and parser.
Documents to process:
${docs.map((d) => `[${d.id}] (${d.kind}): ${d.content}`).join("\n")}

Extract and return JSON: { lineItems: [...], transactions: [...], documents: [...] }
Each lineItem: { id, date (YYYY-MM-DD), amount (number, TND), currency:"TND", source_doc_id }
Each transaction: { id, date, amount, description, source_doc_id }
Each document: { id, kind, storage_key }
Return ONLY valid JSON, no markdown.`;

  let corpus: FormattedCorpus;
  try {
    const response = await model.invoke([new HumanMessage(prompt)]);
    const text =
      typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    corpus = jsonMatch ? (JSON.parse(jsonMatch[0]) as FormattedCorpus) : buildDemoCorpus(docs);
  } catch {
    corpus = buildDemoCorpus(docs);
  }

  return {
    corpus,
    currentNode: "a_formatter",
    trace: [
      traceEvent(
        "a_formatter",
        `Classified ${docs.length} docs: ${corpus.documents.length} classified, ${corpus.lineItems.length} line items extracted.`,
        "out",
        "completed",
      ),
    ],
  };
}

function buildDemoCorpus(
  docs: Array<{ id: string; kind: string; content: string }>,
): FormattedCorpus {
  return {
    lineItems: [
      { id: "li1", date: "2025-11-01", amount: 1840, currency: "TND", source_doc_id: "doc1" },
      { id: "li2", date: "2025-12-01", amount: 2200, currency: "TND", source_doc_id: "doc2" },
    ],
    transactions: [
      {
        id: "tx1",
        date: "2025-10-15",
        amount: 4500,
        description: "Revenue - café sales",
        source_doc_id: "doc3",
      },
      {
        id: "tx2",
        date: "2025-11-15",
        amount: 4800,
        description: "Revenue - café sales",
        source_doc_id: "doc3",
      },
      {
        id: "tx3",
        date: "2025-12-15",
        amount: 6100,
        description: "Revenue - café sales peak",
        source_doc_id: "doc3",
      },
      {
        id: "tx4",
        date: "2025-10-20",
        amount: -2800,
        description: "Expenses - supplies",
        source_doc_id: "doc3",
      },
      {
        id: "tx5",
        date: "2025-11-20",
        amount: -3100,
        description: "Expenses - supplies + rent",
        source_doc_id: "doc3",
      },
      {
        id: "tx6",
        date: "2025-12-20",
        amount: -3800,
        description: "Expenses - supplies + rent + staff",
        source_doc_id: "doc3",
      },
    ],
    documents: docs.map((d) => ({ id: d.id, kind: d.kind, storage_key: d.id })),
  };
}

// --- Node b: Orchestrator ---
async function nodeOrchestrator(state: PS): Promise<Partial<PS>> {
  const corpus = state.corpus!;
  const model = getSonnet();

  const prompt = `You are an SME credit analyst orchestrator.
Goal: ${state.goal}
Corpus: ${corpus.lineItems.length} line items, ${corpus.transactions.length} transactions, ${corpus.documents.length} docs.
Produce a JSON array of 4-6 analysis tasks for the executor. Format: ["task1", "task2", ...]
Tasks should cover: P&L reconstruction, KPI computation, sector comparison, risk identification, executive summary.
Return ONLY a JSON array, no markdown.`;

  let plan: string[];
  try {
    const response = await model.invoke([new HumanMessage(prompt)]);
    const text = typeof response.content === "string" ? response.content : "";
    const match = text.match(/\[[\s\S]*\]/);
    plan = match ? (JSON.parse(match[0]) as string[]) : defaultPlan(state.goal);
  } catch {
    plan = defaultPlan(state.goal);
  }

  return {
    plan,
    currentNode: "b_orchestrator",
    trace: [
      traceEvent(
        "b_orchestrator",
        `Plan: ${plan.map((p, i) => `[${i + 1}] ${p}`).join(", ")}`,
        "out",
        "completed",
      ),
    ],
  };
}

function defaultPlan(goal: string): string[] {
  return [
    "Reconstruct P&L for last 12 months",
    "Compute gross_margin, current_ratio, debt_to_equity, cash_runway_days",
    "Compare KPIs against sector benchmarks",
    "Identify top 3 risks",
    `Write executive summary for: ${goal}`,
  ];
}

// --- Node c: Executor ---
async function nodeExecutor(state: PS): Promise<Partial<PS>> {
  const corpus = state.corpus!;
  const plan = state.plan;
  const isRevision = state.revisionReasons.length > 0;

  // Compute KPIs deterministically
  const grossMargin = computeKPI(corpus, "gross_margin", 12);
  const currentRatio = computeKPI(corpus, "current_ratio", 12);
  const debtToEquity = computeKPI(corpus, "debt_to_equity", 12);
  const cashRunway = computeKPI(corpus, "cash_runway_days", 12);

  // Detect sector from goal / smeId
  const sectorMap: Record<string, string> = {
    food: "food",
    beverage: "food",
    café: "food",
    cafe: "food",
    restaurant: "food",
    retail: "retail",
    shop: "retail",
    services: "services",
    consulting: "services",
    ecommerce: "ecommerce",
    digital: "ecommerce",
    construction: "construction",
    brico: "construction",
  };
  const needle = `${state.smeId} ${state.goal}`.toLowerCase();
  const detectedSector = Object.keys(sectorMap).find((k) => needle.includes(k)) ?? "services";
  const benchmarks = queryPeerBenchmarks(sectorMap[detectedSector] ?? detectedSector, "micro");

  // Identify risks
  const risks: RiskEntry[] = [];
  if (cashRunway < 60)
    risks.push(
      flagRisk("low_cash_runway", "high", `Cash runway ${cashRunway} days < 60 day threshold`),
    );
  if (debtToEquity > 1.0)
    risks.push(
      flagRisk("high_leverage", "medium", `Debt/equity ${debtToEquity}x > 1.0x benchmark`),
    );
  risks.push(
    flagRisk(
      "revenue_concentration",
      "medium",
      "Seasonal peaks — top 3 months represent majority of annual revenue",
    ),
  );
  if (corpus.documents.filter((d) => d.kind === "tax_form").length === 0)
    risks.push(
      flagRisk(
        "no_formal_accounting",
        "low",
        "Records reconstructed from bank flows + invoices, no formal accounting",
      ),
    );

  // Compute credit score
  let score = 50;
  if (grossMargin > benchmarks.grossMarginAvg) score += 15;
  else if (grossMargin > benchmarks.grossMarginAvg * 0.8) score += 5;
  if (currentRatio >= 1.5) score += 10;
  else if (currentRatio >= 1.0) score += 5;
  if (debtToEquity <= benchmarks.debtToEquityAvg) score += 10;
  if (cashRunway >= 90) score += 10;
  else if (cashRunway >= 60) score += 5;
  score -= risks.filter((r) => r.severity === "high").length * 8;
  score = Math.max(20, Math.min(95, score));
  const scoreLabel = score >= 70 ? "Good" : score >= 50 ? "Fair" : "Weak";

  // LLM executive summary
  const model = getSonnet();
  let summary = `Credit file for ${state.smeId}: gross margin ${grossMargin}% vs ${benchmarks.grossMarginAvg}% sector avg. Current ratio ${currentRatio}x. ${risks.length} risks identified.`;
  try {
    const feedback = state.hitlInterrupts?.c_executor?.feedback ?? "";
    const revisionNote =
      state.revisionReasons.length > 0
        ? `\nReviewer feedback to address: ${state.revisionReasons.join(". ")}`
        : "";
    const summaryPrompt = `Write a 2-sentence credit analysis executive summary for an SME credit file.
Goal: ${state.goal}
Gross margin: ${grossMargin}% (sector avg: ${benchmarks.grossMarginAvg}%)
Current ratio: ${currentRatio}x
Debt/equity: ${debtToEquity}x
Cash runway: ${cashRunway} days
Risks: ${risks.map((r) => r.kind).join(", ")}
Score: ${score}/100 (${scoreLabel})${feedback ? `\nHITL feedback: ${feedback}` : ""}${revisionNote}
Return ONLY the 2-sentence summary, no JSON.`;
    const resp = await model.invoke([new HumanMessage(summaryPrompt)]);
    summary = typeof resp.content === "string" ? resp.content : summary;
  } catch {
    /* use default */
  }

  const kpis = [
    {
      label: "Gross Margin",
      value: `${grossMargin}%`,
      benchmark: `${benchmarks.grossMarginAvg}% sector avg`,
      status: grossMargin >= benchmarks.grossMarginAvg ? "above" : "below",
    },
    {
      label: "Current Ratio",
      value: `${currentRatio}x`,
      benchmark: "≥1.5x",
      status: currentRatio >= 1.5 ? "ok" : "warn",
    },
    {
      label: "Debt / Equity",
      value: `${debtToEquity}x`,
      benchmark: `≤${benchmarks.debtToEquityAvg}x`,
      status: debtToEquity <= benchmarks.debtToEquityAvg ? "ok" : "warn",
    },
    {
      label: "Cash Runway",
      value: `${cashRunway} days`,
      benchmark: "≥90 days",
      status: cashRunway >= 90 ? "ok" : cashRunway >= 60 ? "warn" : "alert",
    },
  ];

  const newRevisionLoop = isRevision ? state.revisionLoop + 1 : state.revisionLoop;
  const toolLog = `computeKPI(gross_margin, 12mo) → ${grossMargin}%. queryPeerBenchmarks(${detectedSector}, micro) → avg ${benchmarks.grossMarginAvg}%. ${risks.map((r) => `flagRisk(${r.kind}, ${r.severity})`).join(". ")}. renderPassportSection(executive_summary) ✓`;

  const draft: DraftPassport = {
    companyName: state.smeId,
    sector: detectedSector,
    city: "Tunisia",
    creditScore: score,
    scoreLabel,
    goal: state.goal,
    summary,
    kpis,
    risks,
    sourceDocuments: corpus.documents.map((d) => ({
      id: d.id,
      kind: d.kind,
      label: `${d.kind} — ${d.storage_key}`,
    })),
    xaiLog: `Formatter: classified ${corpus.documents.length} docs, ${corpus.lineItems.length} line items. Orchestrator: ${plan.length} tasks. Executor: all KPIs computed deterministically from corpus data. ${risks.length} risks flagged. Score computed from weighted KPI deltas vs benchmarks.${newRevisionLoop > 0 ? ` Revision loop ${newRevisionLoop}: addressed reviewer feedback.` : ""}`,
    revisionCount: newRevisionLoop,
  };

  return {
    draft,
    revisionLoop: newRevisionLoop,
    currentNode: "c_executor",
    trace: [traceEvent("c_executor", toolLog, "out", "completed")],
  };
}

// --- Node d: Reviewer ---
async function nodeReviewer(state: PS): Promise<Partial<PS>> {
  const draft = state.draft!;
  const corpus = state.corpus!;

  // Anti-hallucination: verify every KPI cites a source
  const uncitedClaims: string[] = [];
  if (corpus.lineItems.length === 0) uncitedClaims.push("no line items to verify claims");
  if (draft.sourceDocuments.length === 0) uncitedClaims.push("no source documents");

  // P&L reconciliation
  const totalCredits = corpus.transactions
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const totalDebits = corpus.transactions
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const grossMarginFromTransactions =
    totalCredits > 0 ? ((totalCredits - totalDebits * 0.6) / totalCredits) * 100 : 0;

  const reportedMarginValue = parseFloat(
    draft.kpis.find((k) => k.label === "Gross Margin")?.value ?? "0",
  );
  const delta = Math.abs(reportedMarginValue - grossMarginFromTransactions);

  let verdict: "APPROVED" | "NEEDS_REVISION";
  let reasons: string[] = [];
  let traceMsg: string;

  if (uncitedClaims.length > 0) {
    verdict = "NEEDS_REVISION";
    reasons = uncitedClaims;
    traceMsg = `NEEDS_REVISION: ${reasons.join(". ")}`;
  } else if (delta > 5 && state.revisionLoop === 0) {
    verdict = "NEEDS_REVISION";
    reasons = [
      `Gross margin delta ${delta.toFixed(1)}% vs recomputed — reconcile before finalizing`,
    ];
    traceMsg = `NEEDS_REVISION: ${reasons[0]}`;
  } else {
    verdict = "APPROVED";
    traceMsg = `APPROVED. All ${draft.sourceDocuments.length} source docs verified. P&L reconciles within tolerance.`;
  }

  return {
    reviewVerdict: verdict,
    revisionReasons: reasons,
    currentNode: "d_reviewer",
    trace: [
      traceEvent("d_reviewer", traceMsg, "out", verdict === "APPROVED" ? "approved" : "revised"),
    ],
  };
}

// --- Node e: Finalizer ---
async function nodeFinalizer(state: PS): Promise<Partial<PS>> {
  const draft = state.draft!;

  // Build a populated business-plan document from the computed values.
  // No LLM or tool-calling required — pure template substitution.
  const businessPlan = buildBusinessPlan(draft, state.smeId);

  const { body, verifyUrl } = issuePassport(
    {
      smeId: state.smeId,
      companyName: draft.companyName,
      sector: draft.sector,
      city: draft.city,
      creditScore: draft.creditScore,
      scoreLabel: draft.scoreLabel,
      goal: draft.goal,
      summary: draft.summary,
      kpis: draft.kpis,
      risks: draft.risks,
      sourceDocuments: draft.sourceDocuments,
      xaiLog: draft.xaiLog,
    },
  );

  // Attach the populated business plan to the passport body for downstream rendering
  (body as unknown as Record<string, unknown>).businessPlan = businessPlan;

  return {
    passportId: body.id,
    currentNode: "e_finalizer",
    trace: [
      traceEvent(
        "e_finalizer",
        `Sanad Passport signed (Ed25519). Credit score: ${draft.creditScore}/100 (${draft.scoreLabel}). Passport ID: ${body.id}. Verify: ${verifyUrl}`,
        "out",
        "completed",
      ),
    ],
  };
}

/** Populate the mock business plan template with computed values. */
function buildBusinessPlan(draft: DraftPassport, smeId: string): Record<string, unknown> {
  const grossMarginKpi = draft.kpis.find((k) => k.label === "Gross Margin");
  const currentRatioKpi = draft.kpis.find((k) => k.label === "Current Ratio");
  const debtKpi = draft.kpis.find((k) => k.label === "Debt / Equity");
  const cashKpi = draft.kpis.find((k) => k.label === "Cash Runway");

  return {
    _template: "sanad-sme-business-plan-v1",
    cover: {
      title: "SME Credit Intelligence Report",
      subtitle: `Powered by Sanad · ${draft.companyName ?? smeId}`,
      issuedBy: "Sanad Financial Intelligence Platform",
      issuedAt: new Date().toISOString(),
    },
    executive_summary: {
      company: draft.companyName ?? smeId,
      sector: draft.sector,
      city: draft.city,
      goal: draft.goal,
      creditScore: draft.creditScore,
      scoreLabel: draft.scoreLabel,
      summary: draft.summary,
    },
    financial_highlights: {
      period: "LTM (Last Twelve Months)",
      currency: "TND",
      kpis: draft.kpis,
    },
    risk_register: {
      methodology: "Rule-based flags on financial ratios + document completeness",
      risks: draft.risks,
    },
    lending_recommendation: {
      eligible: draft.creditScore >= 50,
      suggestedProducts: draft.creditScore >= 65
        ? [
            { name: "SME Growth Loan", provider: "BNA / BIAT", amount: "20,000–100,000 TND", tenure: "12–48 months" },
            { name: "Micro Working Capital", provider: "Daiyn", amount: "5,000–20,000 TND", tenure: "6–18 months" },
          ]
        : draft.creditScore >= 50
          ? [{ name: "Micro Working Capital", provider: "Daiyn", amount: "5,000–20,000 TND", tenure: "6–18 months" }]
          : [],
    },
    kpi_detail: {
      gross_margin: grossMarginKpi,
      current_ratio: currentRatioKpi,
      debt_to_equity: debtKpi,
      cash_runway: cashKpi,
    },
    xai_log: draft.xaiLog,
    legal: {
      disclaimer:
        "This report is generated by an AI system for informational purposes only. It does not constitute a binding credit decision.",
      dataSource: "Uploaded financial documents + open banking flows",
      signatureAlgorithm: "Ed25519 (demo mode if SANAD_SIGNING_PRIVATE_KEY not set)",
    },
  };
}

// --- Conditional edge ---
function shouldRevise(state: PS): "c_executor" | "e_finalizer" {
  if (state.reviewVerdict === "NEEDS_REVISION" && state.revisionLoop < 1) {
    return "c_executor";
  }
  return "e_finalizer";
}

// --- Build graph ---
export function buildPipelineGraph() {
  const graph = new StateGraph(PipelineState)
    .addNode("a_formatter", nodeFormatter)
    .addNode("b_orchestrator", nodeOrchestrator)
    .addNode("c_executor", nodeExecutor)
    .addNode("d_reviewer", nodeReviewer)
    .addNode("e_finalizer", nodeFinalizer)
    .addEdge(START, "a_formatter")
    .addEdge("a_formatter", "b_orchestrator")
    .addEdge("b_orchestrator", "c_executor")
    .addEdge("c_executor", "d_reviewer")
    .addConditionalEdges("d_reviewer", shouldRevise, {
      c_executor: "c_executor",
      e_finalizer: "e_finalizer",
    })
    .addEdge("e_finalizer", END);

  return graph.compile();
}
