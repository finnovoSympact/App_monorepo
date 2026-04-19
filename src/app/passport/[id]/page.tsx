// Sanad Passport — printable, bank-grade layout
import Image from "next/image";
import { readFileSync } from "fs";
import path from "path";
import { PrintButton } from "./print-button";
import { ArabicMark } from "@/components/sanad/arabic-mark";
import { getPassport } from "@/lib/passport-store";

interface KPI {
  label: string;
  value: string;
  benchmark: string;
  status: string;
}

interface Risk {
  kind: string;
  severity: string;
  evidence: string;
}

interface SourceDoc {
  id: string;
  kind: string;
  label: string;
  amount?: number | null;
  currency?: string;
}

interface Passport {
  id: string;
  smeId?: string;
  companyName?: string;
  city?: string;
  sector?: string;
  issuedAt: string;
  expiresAt: string;
  creditScore: number;
  scoreLabel: string;
  scoreColor?: string;
  goal: string;
  summary: string;
  kpis: KPI[];
  risks: Risk[];
  sourceDocuments: SourceDoc[];
  xaiLog: string;
  signature?: string;
  verifyUrl?: string;
}

function loadPassport(id: string): Passport | null {
  // First try the live in-memory store (populated by the pipeline on live runs)
  const live = getPassport(id);
  if (live) return live as Passport;

  // Fall back to the canned demo fixture
  try {
    const filePath = path.join(process.cwd(), "public", "demo", "canned-trace.json");
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as { passport?: Passport };
    if (data.passport && data.passport.id === id) return data.passport;

    // Also check demo packs
    const packsDir = path.join(process.cwd(), "public", "demo", "packs");
    try {
      const index = JSON.parse(readFileSync(path.join(packsDir, "index.json"), "utf-8")) as Array<{ id: string }>;
      for (const entry of index) {
        const packPath = path.join(packsDir, `${entry.id}.json`);
        const pack = JSON.parse(readFileSync(packPath, "utf-8")) as { passport?: Passport };
        if (pack.passport && pack.passport.id === id) return pack.passport;
      }
    } catch { /* no packs */ }

    return null;
  } catch {
    return null;
  }
}

function scoreStyle(score: number): { color: string; ringColor: string; bg: string } {
  if (score >= 70) return { color: "text-emerald-600", ringColor: "#10b981", bg: "bg-emerald-50" };
  if (score >= 50) return { color: "text-amber-600", ringColor: "#f59e0b", bg: "bg-amber-50" };
  return { color: "text-red-600", ringColor: "#ef4444", bg: "bg-red-50" };
}

function severityColor(severity: string): string {
  if (severity === "high") return "bg-red-100 text-red-700";
  if (severity === "medium") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

function docKindColor(kind: string): string {
  if (kind === "invoice") return "bg-blue-100 text-blue-700";
  if (kind === "bank_statement") return "bg-purple-100 text-purple-700";
  if (kind === "open_banking") return "bg-teal-100 text-teal-700";
  return "bg-slate-100 text-slate-600";
}

function kpiStatusColor(status: string): string {
  if (status === "above") return "text-emerald-600";
  if (status === "ok") return "text-emerald-600";
  if (status === "below") return "text-red-600";
  return "text-slate-500";
}

function kpiStatusLabel(status: string): string {
  if (status === "above") return "↑ Above benchmark";
  if (status === "ok") return "✓ Within target";
  if (status === "below") return "↓ Below benchmark";
  return status;
}

// CSS-only circular score dial using SVG
function ScoreDial({ score, style }: { score: number; style: ReturnType<typeof scoreStyle> }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const gap = circumference - filled;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        {/* Track */}
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        {/* Progress */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={style.ringColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${gap}`}
        />
      </svg>
      <div className="absolute inset-0 flex rotate-0 flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${style.color}`}>{score}</span>
        <span className="text-xs font-medium text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

// ── Balance-sheet style financial summary ─────────────────────────────────────
// Inspired by the attached PDF balance sheet (Passif) format
function FinancialSummary({
  kpis,
  risks,
  score,
}: {
  kpis: KPI[];
  risks: Risk[];
  score: number;
}) {
  const highRisks = risks.filter((r) => r.severity === "high").length;
  const medRisks = risks.filter((r) => r.severity === "medium").length;
  const aboveKpis = kpis.filter((k) => k.status === "above" || k.status === "ok").length;

  // Build a balance-sheet-like table from KPIs split into "strengths" (actif) and "risks" (passif)
  const strengths = kpis.filter((k) => k.status === "above" || k.status === "ok");
  const weaknesses = kpis.filter((k) => k.status === "below" || k.status === "at_risk");

  return (
    <div className="border-b border-slate-100 px-8 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Financial Position Summary
        </h2>
        <div className="flex items-center gap-1.5 rounded-full bg-[#26397A]/8 px-3 py-1">
          <Image src="/logo.svg" alt="Finnovo" width={56} height={32} className="h-4 w-auto opacity-70" />
          <span className="font-mono text-[9px] text-[#26397A]/70 tracking-wider uppercase">Certified</span>
        </div>
      </div>

      {/* Two-column balance sheet layout */}
      <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-xl border border-slate-200 text-xs">

        {/* Column headers */}
        <div className="border-b border-r border-slate-200 bg-emerald-50 px-4 py-2.5">
          <p className="font-semibold text-emerald-700 uppercase tracking-wide text-[10px]">Strengths (Actif)</p>
        </div>
        <div className="border-b border-slate-200 bg-red-50 px-4 py-2.5">
          <p className="font-semibold text-red-700 uppercase tracking-wide text-[10px]">Risk Factors (Passif)</p>
        </div>

        {/* Rows */}
        {Array.from({ length: Math.max(strengths.length, weaknesses.length, 3) }).map((_, i) => {
          const s = strengths[i];
          const w = weaknesses[i];
          return (
            <div key={i} className="contents">
              <div className={`border-r border-slate-100 px-4 py-2.5 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                {s ? (
                  <div>
                    <p className="text-slate-600">{s.label}</p>
                    <p className="font-bold text-slate-800">{s.value}</p>
                    <p className="text-[10px] text-emerald-600">↑ {s.benchmark}</p>
                  </div>
                ) : (
                  <p className="text-slate-200">—</p>
                )}
              </div>
              <div className={`px-4 py-2.5 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                {w ? (
                  <div>
                    <p className="text-slate-600">{w.label}</p>
                    <p className="font-bold text-slate-800">{w.value}</p>
                    <p className="text-[10px] text-red-500">↓ {w.benchmark}</p>
                  </div>
                ) : (
                  <p className="text-slate-200">—</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Totals row */}
        <div className="border-r border-t border-slate-200 bg-emerald-50 px-4 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Total Positive Signals</p>
          <p className="text-lg font-black text-emerald-600">{aboveKpis} / {kpis.length}</p>
        </div>
        <div className="border-t border-slate-200 bg-red-50 px-4 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-red-700">Total Risk Flags</p>
          <p className="text-lg font-black text-red-600">{highRisks}H + {medRisks}M</p>
        </div>
      </div>

      {/* Score summary row — like "Total Capitaux Propres" in the PDF */}
      <div className="mt-3 flex items-center justify-between rounded-xl border border-[#26397A]/20 bg-[#26397A]/5 px-5 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#26397A]/70">
            TOTAL CREDIT POSITION · Finnovo Score
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Balance of financial strengths vs risk factors — as assessed by Finnovo AI pipeline
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black" style={{ color: score >= 70 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626" }}>
            {score}
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">/ 100</p>
        </div>
      </div>
    </div>
  );
}

export default async function PassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const passport = loadPassport(id);

  if (!passport) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">Passport not found</p>
          <p className="mt-1 text-sm text-slate-400">ID: {id}</p>
        </div>
      </main>
    );
  }

  const style = scoreStyle(passport.creditScore);
  const issuedDate = new Date(passport.issuedAt).toLocaleDateString("fr-TN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const expiresDate = new Date(passport.expiresAt).toLocaleDateString("fr-TN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const sigShort = passport.signature ? `${passport.signature.slice(0, 16)}...` : "unsigned";

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          nav, .print\\:hidden { display: none !important; }
          body { background: white; }
          .passport-page { box-shadow: none !important; }
        }
        @page { size: A4; margin: 16mm; }
      `}</style>

      <main className="min-h-screen bg-slate-100 px-4 py-10 print:bg-white print:p-0">
        <div className="passport-page mx-auto max-w-3xl rounded-2xl bg-white shadow-xl print:rounded-none print:shadow-none">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 px-8 py-6">
            <div>
              <ArabicMark size={64} color="oklch(0.2 0.02 260)" />
              <p className="mt-1 text-sm text-slate-500">
                {passport.companyName ?? passport.smeId}
              </p>
              <p className="text-xs text-slate-400">
                {passport.city} · {passport.sector}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {/* Finnovo logo top-right */}
              <Image src="/logo.svg" alt="Finnovo" width={96} height={54} className="h-7 w-auto opacity-90" />
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-700">Credit Passport</p>
                <p className="mt-0.5 font-mono text-xs text-slate-400">{passport.id}</p>
                <p className="text-xs text-slate-400">Issued {issuedDate}</p>
                <p className="text-xs text-slate-400">Expires {expiresDate}</p>
              </div>
            </div>
          </div>

          {/* Score + summary */}
          <div className="flex items-center gap-8 border-b border-slate-100 px-8 py-6">
            {/* Score dial */}
            <div
              className={`relative flex h-36 w-36 shrink-0 flex-col items-center justify-center rounded-full ${style.bg}`}
            >
              <ScoreDial score={passport.creditScore} style={style} />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${style.color}`}>{passport.scoreLabel}</span>
                <span className="text-sm text-slate-400">credit rating</span>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-600">{passport.goal}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{passport.summary}</p>
            </div>
          </div>

          {/* KPI grid 2x2 */}
          <div className="border-b border-slate-100 px-8 py-6">
            <h2 className="mb-4 text-xs font-semibold tracking-widest text-slate-400 uppercase">
              Key Performance Indicators
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {passport.kpis.map((kpi) => (
                <div key={kpi.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-800">{kpi.value}</p>
                  <p className="text-xs text-slate-400">{kpi.benchmark}</p>
                  <p className={`mt-1 text-xs font-medium ${kpiStatusColor(kpi.status)}`}>
                    {kpiStatusLabel(kpi.status)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk register */}
          <div className="border-b border-slate-100 px-8 py-6">
            <h2 className="mb-4 text-xs font-semibold tracking-widest text-slate-400 uppercase">
              Risk Register
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400">
                  <th className="pb-2 font-medium">Risk</th>
                  <th className="pb-2 font-medium">Severity</th>
                  <th className="pb-2 font-medium">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {passport.risks.map((risk) => (
                  <tr key={risk.kind} className="border-t border-slate-50">
                    <td className="py-2 pr-4 font-mono text-xs text-slate-600">
                      {risk.kind.replace(/_/g, " ")}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${severityColor(risk.severity)}`}
                      >
                        {risk.severity}
                      </span>
                    </td>
                    <td className="py-2 text-xs text-slate-500">{risk.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Source documents */}
          <div className="border-b border-slate-100 px-8 py-6">
            <h2 className="mb-4 text-xs font-semibold tracking-widest text-slate-400 uppercase">
              Source Documents
            </h2>
            <ul className="space-y-2">
              {passport.sourceDocuments.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 text-sm">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${docKindColor(doc.kind)}`}
                  >
                    {doc.kind.replace(/_/g, " ")}
                  </span>
                  <span className="text-slate-600">{doc.label}</span>
                  {doc.amount != null && (
                    <span className="ml-auto text-xs text-slate-400">
                      {doc.amount.toLocaleString()} {doc.currency}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Financial Summary (balance-sheet style) ── */}
          <FinancialSummary kpis={passport.kpis} risks={passport.risks} score={passport.creditScore} />

          {/* XAI log */}
          <div className="border-b border-[#e2d9c8] px-8 py-6">            <details>
              <summary className="cursor-pointer text-xs font-semibold tracking-widest text-[#8faabe] uppercase select-none">
                Explainability Log (XAI) ▸
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[#5a7299]">{passport.xaiLog}</p>
            </details>
          </div>

          {/* Signature footer */}
          <div className="flex items-center justify-between px-8 py-5">
            <div className="text-xs text-[#8faabe]">
              <p className="font-semibold text-[#5a7299]">Ed25519 Signature</p>
              <p className="mt-0.5 font-mono">{sigShort}</p>
              {passport.verifyUrl && (
                <a
                  href={passport.verifyUrl}
                  className="mt-1 inline-block text-blue-600 hover:underline"
                >
                  Verify this passport →
                </a>
              )}
            </div>
            <PrintButton />
          </div>
        </div>
      </main>
    </>
  );
}
