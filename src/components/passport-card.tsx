// Compact Sanad Passport summary card — used in bank leads + dashboard
// TODO §6: full passport page at /passport/[id]
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  passportId: string;
  smeId: string;
  score: number;
  pd12m: number;
  issuedAt: string;
  verified: boolean;
}

export function PassportCard({ passportId, smeId, score, pd12m, issuedAt, verified }: Props) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Finnovo Passport</CardTitle>
          <Badge variant={verified ? "default" : "destructive"} className="text-xs">
            {verified ? "Verified" : "Invalid"}
          </Badge>
        </div>
        <p className="text-muted-foreground font-mono text-xs">{passportId}</p>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">SME</span>
          <span>{smeId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Score</span>
          <span className="font-semibold">{score}/1000</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">PD 12m</span>
          <span>{(pd12m * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Issued</span>
          <span>{new Date(issuedAt).toLocaleDateString("fr-TN")}</span>
        </div>

        {/* Fair Lending badge — per UI/UX compliance spec */}
        <div className="pt-2">
          <FairLendingBadge />
        </div>
      </CardContent>
    </Card>
  );
}

function FairLendingBadge() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex items-center gap-1.5 rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
        aria-describedby="fair-lending-tooltip"
      >
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Fair Lending Certified
      </button>
      {open && (
        <div
          id="fair-lending-tooltip"
          role="tooltip"
          className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-lg border border-border/60 bg-white p-3 text-xs leading-relaxed shadow-lg"
          style={{ color: "var(--foreground)" }}
        >
          <strong className="block mb-1 text-emerald-700">Algorithmic Fairness</strong>
          Your score is calculated purely on financial data. Age, gender, and geographic
          location are excluded to ensure 100% equal opportunity — in compliance with BCT
          fair lending policy.
        </div>
      )}
    </div>
  );
}
