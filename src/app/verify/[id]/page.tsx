// Public passport verifier — green checkmark or red X
import { readFileSync } from "fs";
import path from "path";
import Link from "next/link";
import { ArabicMark } from "@/components/sanad/arabic-mark";

interface PassportMeta {
  id: string;
  companyName?: string;
  issuedAt: string;
  expiresAt: string;
  creditScore: number;
  scoreLabel: string;
  signature?: string;
}

function loadPassportMeta(id: string): PassportMeta | null {
  try {
    const filePath = path.join(process.cwd(), "public", "demo", "canned-trace.json");
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as { passport?: PassportMeta };
    if (data.passport && data.passport.id === id) return data.passport;
    return null;
  } catch {
    return null;
  }
}

export default function VerifyPage({ params }: { params: { id: string } }) {
  const meta = loadPassportMeta(params.id);

  if (!meta) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl">
          {/* Red X */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <svg
              className="h-10 w-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mt-6 font-instrument text-2xl leading-tight text-slate-800">Passport Not Found</h1>
          <p className="mt-2 text-sm text-slate-500">
            No passport with ID <span className="font-mono text-slate-700">{params.id}</span> was
            found in the registry.
          </p>
          <p className="mt-4 text-xs text-slate-400">
            The passport may have expired, been revoked, or the ID is incorrect.
          </p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
            <ArabicMark size={48} color="oklch(0.3 0.02 260)" />
            Back to Sanad
          </Link>
        </div>
      </main>
    );
  }

  const issuedDate = new Date(meta.issuedAt).toLocaleDateString("fr-TN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const expiresDate = new Date(meta.expiresAt).toLocaleDateString("fr-TN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const isExpired = new Date(meta.expiresAt) < new Date();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl">
        {/* Green checkmark */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
          <svg
            className="h-10 w-10 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mt-6 font-instrument text-2xl leading-tight text-slate-800">
          {isExpired ? "Passport Expired" : "Passport Verified"}
        </h1>

        <div className="mt-4 space-y-2 rounded-xl bg-slate-50 px-6 py-4 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Company</span>
            <span className="font-medium text-slate-700">{meta.companyName ?? meta.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Issued</span>
            <span className="font-medium text-slate-700">{issuedDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Expires</span>
            <span className={`font-medium ${isExpired ? "text-red-600" : "text-slate-700"}`}>
              {expiresDate}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Credit Score</span>
            <span className="font-bold text-emerald-600">
              {meta.creditScore}/100 — {meta.scoreLabel}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-medium text-emerald-600">Signature verified (demo)</span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          Production version verifies the Ed25519 signature client-side against the Sanad public
          key. No personal data is transmitted during verification.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href={`/passport/${meta.id}`}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            View Full Passport →
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600">
            <ArabicMark size={36} color="oklch(0.5 0.01 260)" />
            Back to Sanad
          </Link>
        </div>
      </div>
    </main>
  );
}
