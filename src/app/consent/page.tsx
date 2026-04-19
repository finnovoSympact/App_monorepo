// Open-banking consent & data rights page — Tunisian Law 2004-63 compliance
"use client";

import * as React from "react";
import { ShieldCheck, Eye, MapPin, UserX, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConsentPage() {
  const [deleted, setDeleted] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    // In production: POST /api/gdpr/delete — wipes user record + passport
    setDeleted(true);
    setConfirming(false);
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-14">
      <h1 className="mb-1 font-instrument text-3xl font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
        Privacy &amp; Data Rights
      </h1>
      <p className="mb-10 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Finnovo complies with <strong>Tunisian Law 2004-63</strong> on personal data protection
        and the <strong>INPDP</strong> data localization rules.
      </p>

      {/* Fair Lending section */}
      <section className="mb-8 rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-800">
          <ShieldCheck className="size-4" />
          Algorithmic Fairness — Fair Lending Policy
        </div>
        <ul className="space-y-1.5 text-sm text-emerald-900/80">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
            Age, gender and postal code are <strong>excluded</strong> from your credit score.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
            Scoring is based solely on cashflow, bilan ratios and repayment history.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
            In compliance with BCT financial inclusion requirements.
          </li>
        </ul>
      </section>

      {/* Data we collect */}
      <section className="mb-8 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
          What we collect
        </h2>
        {[
          { icon: Eye, label: "Financial intent (salary ranges, loan brackets)", note: "Anonymized on WhatsApp — only ranges, never exact figures" },
          { icon: MapPin, label: "Business registration (Matricule Fiscal)", note: "Verified against RNE API — never stored raw" },
          { icon: ShieldCheck, label: "Uploaded documents (bilan, invoices)", note: "Stored on Tunisian-hosted servers only — never via WhatsApp" },
        ].map(({ icon: Icon, label, note }) => (
          <div key={label} className="flex items-start gap-3 rounded-lg border border-border/50 bg-card p-4">
            <Icon className="mt-0.5 size-4 shrink-0" style={{ color: "var(--primary)" }} />
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{note}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Data rights */}
      <section className="mb-10 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
          Your rights
        </h2>
        <div className="rounded-lg border border-border/50 bg-card p-4 text-sm space-y-1" style={{ color: "var(--foreground)" }}>
          <p>Under Law 2004-63, you have the right to <strong>access</strong>, <strong>correct</strong>, and <strong>delete</strong> your personal data at any time.</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Requests are processed within 72 hours. Deletion is permanent and cannot be undone.
          </p>
        </div>
      </section>

      {/* Delete my data — right to be forgotten */}
      <section className="rounded-xl border border-red-200/70 bg-red-50/50 p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-800">
          <UserX className="size-4" />
          Right to be Forgotten (Art. 19, Law 2004-63)
        </div>

        {deleted ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle2 className="size-4" />
            Your data deletion request has been submitted. You will receive a confirmation within 72 hours.
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-red-900/80">
              This will permanently delete your credit passport, uploaded documents, and all
              personal data from Finnovo servers. Your application will be withdrawn from all
              partner banks.
            </p>
            {confirming && (
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-300/60 bg-red-100 p-3 text-xs text-red-800">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                Are you sure? This action is <strong>irreversible</strong>. Click again to confirm.
              </div>
            )}
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-full sm:w-auto"
            >
              <UserX className="mr-2 size-4" />
              {confirming ? "Confirm — Delete My Data" : "Delete My Data & Withdraw Application"}
            </Button>
          </>
        )}
      </section>
    </main>
  );
}
