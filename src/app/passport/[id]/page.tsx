// Sanad Passport — printable, bank-grade layout
import { readFileSync } from "fs";
import path from "path";
import { PrintButton } from "./print-button";
import { ArabicMark } from "@/components/sanad/arabic-mark";

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
  try {
    const filePath = path.join(process.cwd(), "public", "demo", "canned-trace.json");
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as { passport?: Passport };
    if (data.passport && data.passport.id === id) return data.passport;
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

export default function PassportPage({ params }: { params: { id: string } }) {
  const passport = loadPassport(params.id);

  if (!passport) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">Passport not found</p>
          <p className="mt-1 text-sm text-slate-400">ID: {params.id}</p>
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
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">Sanad Credit Passport</p>
              <p className="mt-1 font-mono text-xs text-slate-400">{passport.id}</p>
              <p className="text-xs text-slate-400">Issued {issuedDate}</p>
              <p className="text-xs text-slate-400">Expires {expiresDate}</p>
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

          {/* XAI log */}
          <div className="border-b border-slate-100 px-8 py-6">
            <details>
              <summary className="cursor-pointer text-xs font-semibold tracking-widest text-slate-400 uppercase select-none">
                Explainability Log (XAI) ▸
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">{passport.xaiLog}</p>
            </details>
          </div>

          {/* Signature footer */}
          <div className="flex items-center justify-between px-8 py-5">
            <div className="text-xs text-slate-400">
              <p className="font-semibold text-slate-500">Ed25519 Signature</p>
              <p className="mt-0.5 font-mono">{sigShort}</p>
              {passport.verifyUrl && (
                <a
                  href={passport.verifyUrl}
                  className="mt-1 inline-block text-blue-500 hover:underline"
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
